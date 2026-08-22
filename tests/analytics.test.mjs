import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("GA4 측정 ID와 익명 학습 이벤트를 연결한다", async () => {
  const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(index, /G-5R56PZYZ6P/);
  for (const eventName of [
    "exam_start",
    "question_answered",
    "answer_revealed",
    "exam_complete",
    "wrong_review_start",
  ]) {
    assert.match(page, new RegExp(`"${eventName}"`));
  }
});

test("분석 이벤트에 사용자의 답안이나 문제 지문을 전송하지 않는다", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const eventBlocks = [...page.matchAll(/trackEvent\([\s\S]*?\);/g)].map(
    ([block]) => block,
  );

  assert.ok(eventBlocks.length >= 4);
  for (const block of eventBlocks) {
    assert.doesNotMatch(block, /\banswer\s*:/);
    assert.doesNotMatch(block, /\bquestion\s*:/);
    assert.doesNotMatch(block, /question\.question\b/);
  }
});
