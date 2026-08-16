import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

async function loadQuestionBank() {
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
  return (await import(moduleUrl)).questionBank;
}

const questionBank = await loadQuestionBank();
const pageUrl = new URL("../app/page.tsx", import.meta.url);
const categories = new Set([
  "Python·API·JSON",
  "NumPy·Pandas",
  "시각화·EDA",
  "ML 기초·검증",
  "회귀·신경망",
  "NLP·Transformer",
  "LLM·평가·안전",
  "CNN·이미지 모델",
  "ViT·학습 전략",
]);

test("초기 출제 범위는 AI 영역 6개만 선택한다", async () => {
  const page = await readFile(pageUrl, "utf8");
  assert.match(page, /const defaultCategories: Category\[\] = categories\.slice\(3\);/);
  assert.match(page, /useState<Category\[\]>\(defaultCategories\)/);
});
const kinds = new Set(["객관식", "단답형", "서술형"]);
const difficulties = new Set(["기초", "핵심", "사고형", "고난도"]);

test("216개 변형 문항과 9개 영역이 모두 있다", () => {
  assert.equal(questionBank.length, 216);
  assert.deepEqual(new Set(questionBank.map((question) => question.category)), categories);
  assert.equal(new Set(questionBank.map((question) => question.id)).size, 216);
  for (const category of categories) {
    assert.equal(questionBank.filter((question) => question.category === category).length, 24,
      `${category}: 영역별 24문항이 아님`);
  }
});

test("모든 영역의 보강 문항 21~24가 포함된다", () => {
  for (const prefix of ["py", "np", "viz", "ml", "nn", "nlp", "llm", "cnn", "vit"]) {
    for (const number of [21, 22, 23, 24]) {
      assert.ok(questionBank.some((question) => question.id === `${prefix}-${number}`),
        `${prefix}-${number}: 보강 문항 누락`);
    }
  }
});

test("모든 문항이 필수 내용과 충분한 해설을 갖는다", () => {
  for (const question of questionBank) {
    assert.ok(question.id.trim(), "빈 ID");
    assert.ok(question.question.trim(), `${question.id}: 빈 문제`);
    assert.ok(question.answer.trim(), `${question.id}: 빈 정답`);
    assert.ok(question.explanation.trim().length >= 55, `${question.id}: 해설이 짧음`);
    assert.equal("source" in question, false, `${question.id}: 공개하지 않을 출처 필드가 남음`);
    assert.ok(categories.has(question.category), `${question.id}: 불명한 영역`);
    assert.ok(kinds.has(question.kind), `${question.id}: 불명한 유형`);
    assert.ok(difficulties.has(question.difficulty), `${question.id}: 불명한 난이도`);
  }
});

test("객관식은 중복 없는 4개 보기와 정확히 하나의 정답을 갖는다", () => {
  for (const question of questionBank.filter((item) => item.kind === "객관식")) {
    assert.equal(question.choices?.length, 4, `${question.id}: 4지선다 아님`);
    assert.equal(new Set(question.choices).size, 4, `${question.id}: 보기 중복`);
    assert.equal(question.choices.filter((choice) => choice === question.answer).length, 1,
      `${question.id}: 정답이 보기에 정확히 하나가 아님`);
  }
});

test("서술형 지문에는 글자 수 조건이 없고 모범답안은 충분히 구체적이다", () => {
  const essays = questionBank.filter((question) => question.kind === "서술형");
  assert.ok(essays.length >= 7);
  for (const question of essays) {
    assert.doesNotMatch(question.question, /100자|글자 수/,
      `${question.id}: 지문에 글자 수 조건이 남음`);
    assert.ok(question.answer.trim().length >= 100, `${question.id}: 모범답안이 지나치게 짧음`);
    assert.equal(question.choices, undefined);
  }
});

test("문제 내용과 ID가 중복되지 않는다", () => {
  const normalized = questionBank.map((question) =>
    `${question.question}\n${question.code ?? ""}`.replace(/\s+/g, " ").trim());
  assert.equal(new Set(normalized).size, normalized.length);
});

test("같은 영역 안에서 문항 내용이 과도하게 겹치지 않는다", () => {
  const stopWords = new Set([
    "다음", "코드의", "출력", "결과를", "정확히", "작성하시오", "설명으로", "옳은", "것은",
    "대한", "사용하는", "일반적으로", "핵심", "메서드", "함수", "이름을", "표현식을",
  ]);
  const terms = (question) => new Set(
    `${question.question} ${question.code ?? ""} ${question.answer} ${question.explanation}`
      .toLowerCase()
      .split(/[^\p{L}\p{N}_]+/u)
      .filter((term) => term.length > 1 && !stopWords.has(term)),
  );
  for (const category of categories) {
    const items = questionBank.filter((question) => question.category === category);
    for (let i = 0; i < items.length; i += 1) {
      for (let j = i + 1; j < items.length; j += 1) {
        const left = terms(items[i]);
        const right = terms(items[j]);
        const intersection = [...left].filter((term) => right.has(term)).length;
        const union = new Set([...left, ...right]).size;
        const similarity = union ? intersection / union : 0;
        assert.ok(similarity < 0.8,
          `${items[i].id}·${items[j].id}: 문항 유사도 ${similarity.toFixed(2)}`);
      }
    }
  }
});
