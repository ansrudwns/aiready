import assert from "node:assert/strict";
import test from "node:test";
import { checkShortAnswer } from "../src/grading.js";

test("단답형은 앞뒤 여백만 제외하고 정확히 채점한다", () => {
  assert.equal(checkShortAnswer("Hello, World!", " Hello, World! "), true);
  assert.equal(checkShortAnswer("True", "true"), false);
  assert.equal(checkShortAnswer("None", "none"), false);
  assert.equal(checkShortAnswer("0.75", "0.750"), false);
  assert.equal(checkShortAnswer("[1, 2]", "[1,2]"), false);
});

test("줄바꿈은 운영체제 차이만 정규화한다", () => {
  assert.equal(checkShortAnswer("A\nB", "A\r\nB"), true);
  assert.equal(checkShortAnswer("A\nB", "A B"), false);
});

