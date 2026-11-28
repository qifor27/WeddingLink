import assert from "node:assert/strict";
import { test } from "node:test";
import { esc } from "../../themes/skin.ts";

test("inisial monogram di-escape sebelum masuk ornamen HTML", () => {
  assert.equal(esc(`<&"'>`), "&lt;&amp;&quot;&#39;&gt;");
});
