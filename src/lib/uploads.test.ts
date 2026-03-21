import test from "node:test";
import assert from "node:assert/strict";

import { canAccessProtectedUploadByReference } from "@/lib/uploads";

const referenceOwners = {
  doctorUserIds: ["doctor-1"],
  ownerUserIds: ["client-1"],
};

test("admin roles can access protected uploads", () => {
  assert.equal(
    canAccessProtectedUploadByReference({ userId: "admin-1", role: "ADMIN" }, referenceOwners),
    true,
  );
  assert.equal(
    canAccessProtectedUploadByReference({ userId: "super-1", role: "SUPERADMIN" }, referenceOwners),
    true,
  );
});

test("doctor can access only own protected uploads", () => {
  assert.equal(
    canAccessProtectedUploadByReference({ userId: "doctor-1", role: "DOCTOR" }, referenceOwners),
    true,
  );
  assert.equal(
    canAccessProtectedUploadByReference({ userId: "doctor-2", role: "DOCTOR" }, referenceOwners),
    false,
  );
});

test("client can access only uploads tied to own pets", () => {
  assert.equal(
    canAccessProtectedUploadByReference({ userId: "client-1", role: "CLIENT" }, referenceOwners),
    true,
  );
  assert.equal(
    canAccessProtectedUploadByReference({ userId: "client-2", role: "CLIENT" }, referenceOwners),
    false,
  );
});

test("anonymous or unsupported roles cannot access protected uploads", () => {
  assert.equal(canAccessProtectedUploadByReference(null, referenceOwners), false);
  assert.equal(
    canAccessProtectedUploadByReference({ userId: "guest-1", role: null }, referenceOwners),
    false,
  );
});
