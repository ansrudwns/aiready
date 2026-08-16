import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

async function loadQuestionBank() {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const result = await build({
    stdin: {
      contents: `${source}\nexport { questionBank, rawPracticeQuestionBank, explanationNotes };`,
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
  return await import(moduleUrl);
}

const { questionBank, rawPracticeQuestionBank, explanationNotes } = await loadQuestionBank();
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

test("기본 활성화 AI 6개 영역은 모든 유형에 상세 해설을 제공한다", () => {
  const activeCategories = new Set([...categories].slice(3));
  const activeQuestions = questionBank.filter((question) => activeCategories.has(question.category));
  const inactiveQuestions = questionBank.filter((question) => !activeCategories.has(question.category));
  assert.equal(activeQuestions.length, 156);
  assert.equal(inactiveQuestions.length, 72);
  assert.equal(Object.keys(explanationNotes).length, 156);
  assert.equal(new Set(Object.values(explanationNotes)).size, 156);
  assert.deepEqual(new Set(activeQuestions.map((question) => question.kind)), new Set(["객관식", "단답형", "서술형"]));
  for (const question of activeQuestions) {
    const rawQuestion = rawPracticeQuestionBank.find((item) => item.id === question.id);
    assert.ok(rawQuestion, `${question.id}: 원문 문항 누락`);
    assert.ok(explanationNotes[question.id], `${question.id}: 개별 보강 해설 누락`);
    assert.ok(explanationNotes[question.id].length >= 70, `${question.id}: 개별 보강 해설이 너무 짧음`);
    assert.match(question.explanation, new RegExp(rawQuestion.explanation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `${question.id}: 문항에 직접 작성된 해설이 유지되지 않음`);
    assert.match(question.explanation, new RegExp(explanationNotes[question.id].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `${question.id}: 개별 보강 해설이 결과에 포함되지 않음`);
    assert.doesNotMatch(question.explanation, /쉽게 말하면|선택지를 비교할 때는 아래 설명|같은 유형에서는 문제의 숫자|모범답안에서는 결론만/,
      `${question.id}: 공통 자동 문장이 남음`);
    assert.doesNotMatch(question.explanation, /정답과 직접 근거|풀이 과정|핵심 개념|헷갈리기 쉬운 점/,
      `${question.id}: 불필요한 세부 제목이 남음`);
    assert.ok(question.explanation.length >= 110, `${question.id}: 해설이 충분하지 않음`);
  }
  for (const question of inactiveQuestions) {
    assert.equal(explanationNotes[question.id], undefined, `${question.id}: 기본 비활성화 영역에 개별 보강이 적용됨`);
  }
});

test("겹치는 LLM 용어는 문항의 직접 주제에 맞는 해설로 연결한다", () => {
  const icl = questionBank.find((question) => question.id === "llm-12");
  const rag = questionBank.find((question) => question.id === "llm-20");
  assert.match(icl.explanation, /파라미터는 그대로/);
  assert.doesNotMatch(icl.explanation, /검색은 지식 공급/);
  assert.match(rag.explanation, /검색은 지식 공급/);
  assert.doesNotMatch(rag.explanation, /파라미터는 그대로/);
});

test("개별 채점 결과는 답안 현황에서 정답과 오답으로 구분되고 정답 상자는 초록색이다", async () => {
  const page = await readFile(pageUrl, "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(page, /itemGraded && itemCorrect \? "graded-correct"/);
  assert.match(page, /itemGraded && !itemCorrect \? "graded-wrong"/);
  assert.match(css, /\.number-grid button\.graded-wrong[^}]*#fff0ed[^}]*#b9362b/s);
  assert.match(css, /\.instant-feedback\.correct[^}]*#eef9f1[^}]*#2f6744/s);
});

test("객관식 오답 채점 후 선택한 오답과 실제 정답 선택지를 함께 표시한다", async () => {
  const page = await readFile(pageUrl, "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(page, /isRevealed && isCorrectChoice \? "choice-correct"/);
  assert.match(page, /isRevealed && isSelectedChoice && !isCorrectChoice \? "choice-wrong"/);
  assert.match(css, /\.choices button\.choice-correct[^}]*#e8f6ec[^}]*#235f38/s);
  assert.match(css, /\.choices button\.choice-wrong[^}]*#fff0ed[^}]*#9f332a/s);
});
const kinds = new Set(["객관식", "단답형", "서술형"]);
const difficulties = new Set(["기초", "핵심", "사고형", "고난도"]);

test("228개 변형 문항과 9개 영역이 모두 있다", () => {
  assert.equal(questionBank.length, 228);
  assert.deepEqual(new Set(questionBank.map((question) => question.category)), categories);
  assert.equal(new Set(questionBank.map((question) => question.id)).size, 228);
  for (const category of categories) {
    const expectedCount = ["ML 기초·검증", "회귀·신경망"].includes(category) ? 30 : 24;
    assert.equal(questionBank.filter((question) => question.category === category).length, expectedCount,
      `${category}: 영역별 ${expectedCount}문항이 아님`);
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

test("기계학습 기본 정의 보강 문항 25~30이 포함된다", () => {
  for (const prefix of ["ml", "nn"]) {
    for (let number = 25; number <= 30; number += 1) {
      assert.ok(questionBank.some((question) => question.id === `${prefix}-${number}`),
        `${prefix}-${number}: 기계학습 보강 문항 누락`);
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

test("객관식 정답 길이가 정답을 추측하게 만드는 편향을 제한한다", () => {
  const objectives = questionBank.filter((item) => item.kind === "객관식");
  const metrics = objectives.map((question) => {
    const answerLength = [...question.answer].length;
    const wrongLengths = question.choices
      .filter((choice) => choice !== question.answer)
      .map((choice) => [...choice].length);
    const wrongAverage = wrongLengths.reduce((sum, length) => sum + length, 0) / wrongLengths.length;
    return {
      id: question.id,
      uniqueLongest: answerLength > Math.max(...wrongLengths),
      ratio: answerLength / wrongAverage,
    };
  });
  const uniqueLongest = metrics.filter((item) => item.uniqueLongest);
  const ratio125 = metrics.filter((item) => item.ratio >= 1.25);
  const ratio150 = metrics.filter((item) => item.ratio >= 1.5);

  assert.ok(uniqueLongest.length <= 20,
    `정답만 가장 긴 문항이 ${uniqueLongest.length}개임: ${uniqueLongest.map((item) => item.id).join(", ")}`);
  assert.ok(ratio125.length <= 8,
    `정답이 오답 평균의 1.25배 이상인 문항이 ${ratio125.length}개임: ${ratio125.map((item) => item.id).join(", ")}`);
  assert.equal(ratio150.length, 0,
    `정답이 오답 평균의 1.5배 이상인 문항: ${ratio150.map((item) => item.id).join(", ")}`);
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
    const items = rawPracticeQuestionBank.filter((question) => question.category === category);
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
