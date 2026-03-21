import test from "node:test";
import assert from "node:assert/strict";

import {
  assertAppointmentStatusTransition,
  blocksAppointmentAvailability,
  getAdminEditableAppointmentStatuses,
  isTerminalAppointmentStatus,
} from "@/lib/appointments";

test("admin can confirm pending appointment", () => {
  assert.doesNotThrow(() =>
    assertAppointmentStatusTransition({
      current: "PENDING",
      next: "CONFIRMED",
      actor: "ADMIN",
    }),
  );
});

test("admin cannot complete appointment directly", () => {
  assert.throws(
    () =>
      assertAppointmentStatusTransition({
        current: "CONFIRMED",
        next: "COMPLETED",
        actor: "ADMIN",
      }),
    /COMPLETED/,
  );
});

test("doctor system can complete appointment only after completed visit", () => {
  assert.throws(
    () =>
      assertAppointmentStatusTransition({
        current: "CONFIRMED",
        next: "COMPLETED",
        actor: "DOCTOR_SYSTEM",
        hasCompletedVisit: false,
      }),
    /COMPLETED/,
  );

  assert.doesNotThrow(() =>
    assertAppointmentStatusTransition({
      current: "CONFIRMED",
      next: "COMPLETED",
      actor: "DOCTOR_SYSTEM",
      hasCompletedVisit: true,
    }),
  );
});

test("availability and terminal status helpers stay aligned", () => {
  assert.equal(blocksAppointmentAvailability("CONFIRMED"), true);
  assert.equal(blocksAppointmentAvailability("CANCELLED_BY_ADMIN"), false);
  assert.equal(isTerminalAppointmentStatus("NO_SHOW"), true);
  assert.equal(isTerminalAppointmentStatus("RESCHEDULED"), false);
});

test("admin editable statuses exclude completed", () => {
  assert.deepEqual(getAdminEditableAppointmentStatuses("PENDING"), [
    "NEW",
    "PENDING",
    "CONFIRMED",
    "RESCHEDULED",
    "CANCELLED_BY_ADMIN",
    "NO_SHOW",
  ]);
});
