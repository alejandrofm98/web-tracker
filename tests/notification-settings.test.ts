import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_NOTIFICATIONS, parseNotificationPreferences, daysUntilInMadrid, isNotificationTime, madridDateKey } from "../src/lib/notification-settings";

test("normaliza los días de aviso y acepta el propio vencimiento", () => {
  const result = parseNotificationPreferences({ ...DEFAULT_NOTIFICATIONS, domainDays: [0, 7, 30, 7] });
  assert.deepEqual(result.domainDays, [30, 7, 0]);
  assert.deepEqual(result.chargeDays, [30, 15, 7, 1]);
});

test("rechaza horas, tipos y días fuera de los límites", () => {
  for (const sendTime of ["24:00", "09:60", "9:00", "09:00 * * *"]) {
    assert.throws(() => parseNotificationPreferences({ ...DEFAULT_NOTIFICATIONS, sendTime }));
  }
  for (const domainDays of [[], [-1], [366], [0.5], ["7"], [NaN], Array(21).fill(7)]) {
    assert.throws(() => parseNotificationPreferences({ ...DEFAULT_NOTIFICATIONS, domainDays }));
  }
  assert.throws(() => parseNotificationPreferences({ ...DEFAULT_NOTIFICATIONS, enabled: "false" }));
});

test("el horario diario respeta verano, invierno, medianoche y pausa", () => {
  assert.equal(isNotificationTime(DEFAULT_NOTIFICATIONS, new Date("2026-07-01T07:00:00Z")), true);
  assert.equal(isNotificationTime(DEFAULT_NOTIFICATIONS, new Date("2026-12-01T08:00:00Z")), true);
  assert.equal(isNotificationTime(DEFAULT_NOTIFICATIONS, new Date("2026-07-01T09:00:00Z")), false);
  assert.equal(isNotificationTime({ ...DEFAULT_NOTIFICATIONS, enabled: false }, new Date("2026-07-01T07:00:00Z")), false);
  assert.equal(isNotificationTime({ ...DEFAULT_NOTIFICATIONS, sendTime: "00:00" }, new Date("2026-07-01T22:00:00Z")), true);
});

test("cuenta días de calendario de Madrid, incluso durante cambios de hora", () => {
  assert.equal(daysUntilInMadrid(new Date("2026-10-10"), new Date("2026-10-10T12:00:00Z")), 0);
  assert.equal(daysUntilInMadrid(new Date("2026-10-11"), new Date("2026-10-10T23:00:00Z")), 0);
  assert.equal(daysUntilInMadrid(new Date("2026-10-26"), new Date("2026-10-25T08:00:00Z")), 1);
  assert.equal(daysUntilInMadrid(null), null);
  assert.equal(madridDateKey(new Date("2026-07-01T23:00:00Z")), "2026-07-02");
});
