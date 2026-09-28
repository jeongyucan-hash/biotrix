import test from "node:test";
import assert from "node:assert/strict";
import { safeNext, passwordIssue } from "../lib/auth-options.mjs";
test("only internal non-auth destinations", () => {
  for (const value of [null, "https://evil.test", "//evil.test", "/\\evil.test", "/%2fevil.test", "/ login", "/login", "/auth/callback"]) assert.equal(safeNext(value), "/");
  assert.equal(safeNext("/sourcing"), "/sourcing");
  assert.equal(safeNext("/account/security"), "/account/security");
});
test("password length and confirmation; never trim passwords", () => {
  assert.ok(passwordIssue("short", "short"));
  assert.ok(passwordIssue("a".repeat(129), "a".repeat(129)));
  assert.ok(passwordIssue("a".repeat(12), "b".repeat(12)));
  assert.equal(passwordIssue("correct horse battery", "correct horse battery"), "");
  assert.ok(passwordIssue("correct horse battery ", "correct horse battery"));
});
