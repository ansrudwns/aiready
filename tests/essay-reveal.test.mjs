import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("서술형은 답안 글자 수와 관계없이 모범답안을 볼 수 있다", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(source, /question\.kind === "서술형"\s*\? true\s*:/);
  assert.doesNotMatch(source, /currentAnswer\.trim\(\)\.length\s*>=\s*100/);
  assert.doesNotMatch(source, /모범답안 확인에 글자 수 제한 없음/);
  assert.match(
    source,
    /if \(question\.kind === "서술형"\) \{\s*setRevealedIds\(\(before\) => \[\.\.\.before, question\.id\]\);/,
  );
  assert.doesNotMatch(source, /if \(!answer\.trim\(\) \|\| revealedIds\.includes\(question\.id\)\) return/);
});

test("서술형은 자동 채점할 수 없으므로 모두 오답 복습에 포함한다", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(source, /const newlyWrong = liveResults\s*\.filter\(\(item\) => !item\.graded \|\| !item\.correct\)/);
  assert.match(source, /const wrong = results\s*\.filter\(\(item\) => !item\.graded \|\| !item\.correct\)/);
  assert.match(
    source,
    /if \(question\.kind === "서술형"\)[\s\S]*?setWrongIds\(nextWrong\);[\s\S]*?localStorage\.setItem\("ai-eval-wrong", JSON\.stringify\(nextWrong\)\);[\s\S]*?return;/,
  );
  assert.match(source, /오답·서술형 \{wrong\.length\}문제 다시 풀기/);
});
