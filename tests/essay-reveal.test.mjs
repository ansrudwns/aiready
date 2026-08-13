import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("서술형은 답안 글자 수와 관계없이 모범답안을 볼 수 있다", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(source, /question\.kind === "서술형"\s*\? true\s*:/);
  assert.doesNotMatch(source, /currentAnswer\.trim\(\)\.length\s*>=\s*100/);
  assert.match(source, /모범답안 확인에 글자 수 제한 없음/);
});
