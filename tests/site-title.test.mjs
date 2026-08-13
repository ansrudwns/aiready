import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("사이트 이름은 화면과 metadata에서 AIready로 통일된다", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /AI·Python 과목평가 연습|<span>AI<\/span>평가연습/);
  assert.match(page, /<h2>AIready<\/h2>/);
  assert.match(layout, /title: "AIready"/);
});
