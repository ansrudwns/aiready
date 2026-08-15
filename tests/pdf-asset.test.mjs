import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const pdfUrl = new URL("../public/ai-python-core-summary.pdf", import.meta.url);
const htmlUrl = new URL("../resources/ai-python-core-summary.html", import.meta.url);
const pageUrl = new URL("../app/page.tsx", import.meta.url);

test("핵심정리 PDF가 유효한 정적 다운로드 파일로 포함된다", async () => {
  const [info, bytes, page] = await Promise.all([
    stat(pdfUrl),
    readFile(pdfUrl),
    readFile(pageUrl, "utf8"),
  ]);
  assert.ok(info.size > 500_000, "PDF 크기가 비정상적으로 작음");
  assert.equal(bytes.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.match(page, /href=\{`\$\{import\.meta\.env\.BASE_URL\}ai-python-core-summary\.pdf`\}/);
  assert.match(page, /download="AI_Python_핵심정리\.pdf"/);
});

test("PDF 원고는 9개 영역을 포함하고 자료 식별자를 노출하지 않는다", async () => {
  const html = await readFile(htmlUrl, "utf8");
  for (const heading of [
    "Python · API · JSON",
    "NumPy · Pandas",
    "시각화 · EDA",
    "ML 기초 · 검증",
    "회귀 · 신경망",
    "NLP · Transformer",
    "LLM · 평가 · 안전",
    "CNN · 이미지 모델",
    "ViT · 학습 전략",
  ]) {
    assert.ok(html.includes(heading), `${heading}: 누락`);
  }
  for (const forbidden of ["AI_Machine_Learning", "1-1_AI", "1-2_AI", "2-1_", "2-2_", "참고문헌", "출처:"]) {
    assert.equal(html.includes(forbidden), false, `${forbidden}: 자료 식별자 노출`);
  }
  assert.ok(html.includes("216문항 연계 범위"), "문제은행 문항 수와 PDF 표지가 불일치");
  for (const concept of ["enumerate(iterable)", "다중공선성", "LeakyReLU", "N-gram 언어모델", "Jailbreaking", "재현 가능한 프로토콜"]) {
    assert.ok(html.includes(concept), `${concept}: 보강 개념 누락`);
  }
});
