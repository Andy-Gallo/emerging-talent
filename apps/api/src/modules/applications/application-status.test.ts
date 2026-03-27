import assert from "node:assert/strict";
import test from "node:test";
import { canTransitionApplicationStatus } from "./application-status";

test("allows valid application transitions", () => {
  assert.equal(canTransitionApplicationStatus("draft", "submitted"), true);
  assert.equal(canTransitionApplicationStatus("in_review", "audition_requested"), true);
  assert.equal(canTransitionApplicationStatus("audition_completed", "accepted"), true);
});

test("blocks invalid application transitions", () => {
  assert.equal(canTransitionApplicationStatus("submitted", "accepted"), false);
  assert.equal(canTransitionApplicationStatus("accepted", "in_review"), false);
  assert.equal(canTransitionApplicationStatus("unknown_state", "submitted"), false);
});
