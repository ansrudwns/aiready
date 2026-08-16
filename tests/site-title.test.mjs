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

test("사이트 기본 팔레트는 어두운 머스터드 계열이다", async () => {
  const [css, favicon] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/favicon.svg", import.meta.url), "utf8"),
  ]);

  assert.match(css, /--green: #8a650f;/i);
  assert.match(css, /--green-dark: #493812;/i);
  assert.match(css, /--lime: #e3b93e;/i);
  assert.match(favicon, /#8A650F/);
  assert.doesNotMatch(css, /#0b6b57|#084c40|#d8f17b/i);
});
