import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  applyPreset,
  compute,
  countWorkDaysInMonth,
  dailyWorkSeconds,
  detectPreset,
  emptySettings,
  formatMoney,
  inLunch,
  isWorkDay,
  parseHms,
  secondsInWindows,
  workStatus,
  workWindows,
} from "../docs/salary-timer/timer.js";

function at(isoLocal) {
  return new Date(isoLocal);
}

function office() {
  return applyPreset(emptySettings(), "monfri96");
}

describe("parseHms / windows", () => {
  it("parses HH:MM into seconds from midnight", () => {
    assert.equal(parseHms("09:00"), 9 * 3600);
    assert.equal(parseHms("18:00"), 18 * 3600);
    assert.equal(parseHms("13:30"), 13 * 3600 + 30 * 60);
    assert.equal(parseHms("24:00"), null);
    assert.equal(parseHms("nope"), null);
  });

  it("subtracts a one-hour lunch from 9–6", () => {
    const windows = workWindows(office());
    assert.deepEqual(windows, [
      [9 * 3600, 13 * 3600],
      [14 * 3600, 18 * 3600],
    ]);
    assert.equal(dailyWorkSeconds(office()), 8 * 3600);
  });

  it("ignores lunch that sits outside work hours", () => {
    const settings = Object.assign(office(), {
      lunchStart: "19:00",
      lunchEnd: "20:00",
    });
    assert.deepEqual(workWindows(settings), [[9 * 3600, 18 * 3600]]);
  });

  it("returns no windows when end is not after start", () => {
    assert.deepEqual(workWindows(Object.assign(office(), { endTime: "09:00" })), []);
    assert.deepEqual(workWindows(Object.assign(office(), { endTime: "08:00" })), []);
  });
});

describe("calendar work days — October 2026", () => {
  it("counts 22 Mon–Fri days", () => {
    assert.equal(countWorkDaysInMonth(office(), 2026, 9), 22);
  });

  it("treats 7 Oct 2026 (Wednesday) as a work day", () => {
    assert.equal(isWorkDay(office(), at("2026-10-07T10:00:00")), true);
    assert.equal(isWorkDay(office(), at("2026-10-04T10:00:00")), false);
  });
});

describe("status + lunch", () => {
  const settings = office();

  it("is working mid-morning, lunch at 13:30, after hours at 18:00", () => {
    assert.equal(workStatus(settings, at("2026-10-07T10:15:00")), "working");
    assert.equal(workStatus(settings, at("2026-10-07T13:30:00")), "lunch");
    assert.equal(inLunch(settings, 13 * 3600 + 30 * 60), true);
    assert.equal(workStatus(settings, at("2026-10-07T18:00:00")), "after");
    assert.equal(workStatus(settings, at("2026-10-07T08:59:00")), "before");
    assert.equal(workStatus(settings, at("2026-10-04T11:00:00")), "off");
  });

  it("freezes as paused when pausedAt is set", () => {
    const paused = Object.assign(office(), { pausedAt: "2026-10-07T11:00:00" });
    assert.equal(workStatus(paused, at("2026-10-07T16:00:00")), "paused");
  });
});

describe("earnings at 14:30 on Wed 7 Oct 2026", () => {
  const now = at("2026-10-07T14:30:00");
  const r = compute(office(), now);

  it("uses 22 days × 8 hours for the second rate", () => {
    assert.equal(r.workDaysCalendar, 22);
    assert.equal(r.workDaysMonth, 22);
    assert.equal(r.hoursPerDay, 8);
    assert.equal(r.secondRate, 20000 / (22 * 8 * 3600));
    assert.equal(r.dayRate, 20000 / 22);
  });

  it("counts 4.5 hours today (09–13 plus 14:00–14:30)", () => {
    assert.equal(r.todayElapsedSec, 4.5 * 3600);
    assert.ok(Math.abs(r.todayEarned - r.secondRate * 4.5 * 3600) < 1e-9);
    assert.equal(r.status, "working");
  });

  it("adds four completed Mon–Fri days before the 7th", () => {
    // 1 Thu, 2 Fri, 5 Mon, 6 Tue
    assert.equal(r.monthElapsedSec, 4 * 8 * 3600 + 4.5 * 3600);
    assert.equal(r.monthEarned, r.secondRate * r.monthElapsedSec);
  });

  it("does not count lunch minutes", () => {
    const lunch = compute(office(), at("2026-10-07T13:30:00"));
    assert.equal(lunch.todayElapsedSec, 4 * 3600);
    assert.equal(lunch.status, "lunch");
    const afterLunch = compute(office(), at("2026-10-07T14:00:00"));
    assert.equal(afterLunch.todayElapsedSec, 4 * 3600);
  });
});

describe("pause freezes the clock", () => {
  it("uses pausedAt instead of now", () => {
    const settings = Object.assign(office(), { pausedAt: "2026-10-07T11:00:00" });
    const r = compute(settings, at("2026-10-07T16:00:00"));
    assert.equal(r.todayElapsedSec, 2 * 3600);
    assert.equal(r.status, "paused");
  });
});

describe("manual day count", () => {
  it("uses the typed day count for the rate", () => {
    const settings = Object.assign(office(), { daysMode: "manual", workDaysPerMonth: 20 });
    const r = compute(settings, at("2026-10-07T09:00:00"));
    assert.equal(r.workDaysMonth, 20);
    assert.equal(r.workDaysCalendar, 22);
    assert.equal(r.secondRate, 20000 / (20 * 8 * 3600));
  });
});

describe("presets + money format", () => {
  it("detects Mon–Fri 9–6", () => {
    assert.equal(detectPreset(office()), "monfri96");
    assert.equal(detectPreset(applyPreset(emptySettings(), "monfri95")), "monfri95");
    const custom = Object.assign(office(), { startTime: "10:00" });
    assert.equal(detectPreset(custom), "custom");
  });

  it("formats HK$ with grouping", () => {
    assert.equal(formatMoney(1234.5, "HKD", 2), "HK$1,234.50");
    assert.equal(formatMoney(0.031566, "HKD", 4), "HK$0.0316");
  });
});

describe("secondsInWindows", () => {
  it("clips a range to work windows", () => {
    const windows = [
      [9 * 3600, 13 * 3600],
      [14 * 3600, 18 * 3600],
    ];
    assert.equal(secondsInWindows(windows, 8 * 3600, 10 * 3600), 3600);
    assert.equal(secondsInWindows(windows, 12 * 3600, 15 * 3600), 2 * 3600);
    assert.equal(secondsInWindows(windows, 13 * 3600, 14 * 3600), 0);
  });
});

describe("page constraints", () => {
  it("has the AdSense account meta and no ad script or ad unit", () => {
    const html = readFileSync(new URL("../docs/salary-timer/index.html", import.meta.url), "utf8");
    assert.match(html, /<meta name="google-adsense-account" content="ca-pub-4101065010696162">/);
    assert.doesNotMatch(html, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i);
    assert.match(html, /rel="canonical" href="https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/salary-timer\/"/);
    assert.match(html, /lang="zh-Hant-HK"/);
  });
});
