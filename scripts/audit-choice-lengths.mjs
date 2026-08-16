import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const result = await build({
  stdin: {
    contents: `${source}\nexport { questionBank };`,
    loader: "tsx",
    resolveDir: fileURLToPath(new URL("../app", import.meta.url)),
    sourcefile: "page.tsx",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].contents).toString("base64")}`;
const { questionBank } = await import(moduleUrl);
const questions = questionBank.filter((question) => question.kind === "객관식");
const rows = questions.map((question) => {
  const lengths = question.choices.map((choice) => [...choice].length);
  const answerIndex = question.choices.indexOf(question.answer);
  const answerLength = lengths[answerIndex];
  const wrongLengths = lengths.filter((_, index) => index !== answerIndex);
  const wrongAverage = wrongLengths.reduce((sum, length) => sum + length, 0) / wrongLengths.length;
  return {
    id: question.id,
    category: question.category,
    question: question.question,
    answer: question.answer,
    choices: question.choices,
    answerLength,
    wrongAverage: Number(wrongAverage.toFixed(1)),
    ratio: Number((answerLength / wrongAverage).toFixed(2)),
    uniqueLongest: answerLength > Math.max(...wrongLengths),
  };
});

const categories = [...new Set(questions.map((question) => question.category))];
const summary = {
  total: questions.length,
  uniqueLongest: rows.filter((row) => row.uniqueLongest).length,
  ratio125: rows.filter((row) => row.ratio >= 1.25).length,
  ratio150: rows.filter((row) => row.ratio >= 1.5).length,
  categories: categories.map((category) => {
    const items = rows.filter((row) => row.category === category);
    return {
      category,
      total: items.length,
      uniqueLongest: items.filter((row) => row.uniqueLongest).length,
      ratio150: items.filter((row) => row.ratio >= 1.5).length,
    };
  }),
};

const categoryArgument = process.argv.find((argument) => argument.startsWith("--category="));
const selectedCategory = categoryArgument?.slice("--category=".length);
if (process.argv.includes("--details")) {
  console.log(JSON.stringify({
    summary,
    rows: rows.filter((row) => row.uniqueLongest && (!selectedCategory || row.category === selectedCategory)),
  }, null, 2));
} else {
  console.log(JSON.stringify(summary, null, 2));
}
