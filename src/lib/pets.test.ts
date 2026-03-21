import test from "node:test";
import assert from "node:assert/strict";

import { assertPetIsActive, buildPetArchivePayload, buildPetRestorePayload } from "@/lib/pets";

test("archive payload marks pet archived with timestamp", () => {
  const now = new Date("2026-03-20T10:00:00.000Z");

  assert.deepEqual(buildPetArchivePayload(now), {
    isArchived: true,
    archivedAt: now,
  });
});

test("restore payload clears archive state", () => {
  assert.deepEqual(buildPetRestorePayload(), {
    isArchived: false,
    archivedAt: null,
  });
});

test("active pet assertion rejects missing and archived records", () => {
  assert.throws(() => assertPetIsActive(null, "not-found"), /not-found/);
  assert.throws(() => assertPetIsActive({ isArchived: true }), /Архівовану тварину/);
  assert.doesNotThrow(() => assertPetIsActive({ isArchived: false }));
});
