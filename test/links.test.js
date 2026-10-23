import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { linkSeguro } from "../src/lib/links.js";

describe("linkSeguro", () => {
  it("deixa passar http e https", () => {
    assert.equal(linkSeguro("https://forms.gle/x"), "https://forms.gle/x");
    assert.equal(linkSeguro("http://exemplo.com"), "http://exemplo.com");
  });

  it("barra javascript:, data: e lixo", () => {
    assert.equal(linkSeguro("javascript:alert(1)"), null);
    assert.equal(linkSeguro("JaVaScRiPt:alert(1)"), null);
    assert.equal(linkSeguro("data:text/html,<script>"), null);
    assert.equal(linkSeguro("nao e link"), null);
    assert.equal(linkSeguro(null), null);
  });
});
