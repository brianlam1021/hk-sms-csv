import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { compute, emptySettings, formatMoney, formatNum } from "../docs/hourly-wage/wage.js";

describe("canonical HK example", () => {
  it("HK$20,800 / month, 26 days, 8h → HK$100/h and HK$800/day", () => {
    const result = compute({
      mode: "monthly",
      amount: 20800,
      daysPerMonth: 26,
      hoursPerDay: 8,
      hoursPerWeek: 44,
    });
    assert.equal(result.ok, true);
    assert.equal(result.hoursPerMonth, 208);
    assert.equal(result.hourly, 100);
    assert.equal(result.daily, 800);
    assert.equal(result.monthly, 20800);
    assert.equal(result.weekly, 4400);
  });

  it("reverses hourly $100 to monthly $20,800 and daily $800", () => {
    const result = compute({
      mode: "hourly",
      amount: 100,
      daysPerMonth: 26,
      hoursPerDay: 8,
      hoursPerWeek: 44,
    });
    assert.equal(result.monthly, 20800);
    assert.equal(result.daily, 800);
    assert.equal(result.hourly, 100);
  });

  it("converts daily $800 to hourly $100 and monthly $20,800", () => {
    const result = compute({
      mode: "daily",
      amount: 800,
      daysPerMonth: 26,
      hoursPerDay: 8,
      hoursPerWeek: 44,
    });
    assert.equal(result.hourly, 100);
    assert.equal(result.monthly, 20800);
    assert.equal(result.daily, 800);
  });
});

describe("defaults and weekly view", () => {
  it("emptySettings match the 26×8 HK payroll assumption demo", () => {
    const settings = emptySettings();
    assert.equal(settings.mode, "monthly");
    assert.equal(settings.amount, 20800);
    assert.equal(settings.daysPerMonth, 26);
    assert.equal(settings.hoursPerDay, 8);
    assert.equal(settings.hoursPerWeek, 44);
    const result = compute(settings);
    assert.equal(result.hourly, 100);
  });

  it("hides weekly pay when hours per week is 0 or blank", () => {
    const hidden = compute({
      mode: "monthly",
      amount: 20800,
      daysPerMonth: 26,
      hoursPerDay: 8,
      hoursPerWeek: 0,
    });
    assert.equal(hidden.weekly, null);

    const blank = compute({
      mode: "monthly",
      amount: 20800,
      daysPerMonth: 26,
      hoursPerDay: 8,
      hoursPerWeek: "",
    });
    assert.equal(blank.weekly, null);
  });

  it("does not use weekly hours to derive monthly pay", () => {
    const a = compute({
      mode: "hourly",
      amount: 100,
      daysPerMonth: 26,
      hoursPerDay: 8,
      hoursPerWeek: 44,
    });
    const b = compute({
      mode: "hourly",
      amount: 100,
      daysPerMonth: 26,
      hoursPerDay: 8,
      hoursPerWeek: 20,
    });
    assert.equal(a.monthly, b.monthly);
    assert.equal(a.weekly, 4400);
    assert.equal(b.weekly, 2000);
  });
});

describe("validation", () => {
  it("rejects zero amount, days, or daily hours", () => {
    const noAmount = compute(Object.assign(emptySettings(), { amount: 0 }));
    assert.equal(noAmount.ok, false);
    assert.ok(noAmount.warnings.includes("noAmount"));

    const noDays = compute(Object.assign(emptySettings(), { daysPerMonth: 0 }));
    assert.equal(noDays.ok, false);
    assert.ok(noDays.warnings.includes("noDays"));

    const noHours = compute(Object.assign(emptySettings(), { hoursPerDay: 0 }));
    assert.equal(noHours.ok, false);
    assert.ok(noHours.warnings.includes("noHoursDay"));
  });

  it("does not divide by zero when hours are invalid", () => {
    const result = compute({
      mode: "monthly",
      amount: 20800,
      daysPerMonth: 26,
      hoursPerDay: 0,
      hoursPerWeek: 44,
    });
    assert.equal(result.hourly, 0);
    assert.equal(result.ok, false);
  });
});

describe("formatting", () => {
  it("formats HKD with grouping", () => {
    assert.equal(formatMoney(20800, 2), "HK$20,800.00");
    assert.equal(formatMoney(100, 2), "HK$100.00");
    assert.equal(formatNum(208, 2), "208.00");
  });
});

describe("page constraints", () => {
  it("has the AdSense account meta and no ad script or ad unit", () => {
    const html = readFileSync(new URL("../docs/hourly-wage/index.html", import.meta.url), "utf8");
    assert.match(html, /<meta name="google-adsense-account" content="ca-pub-4101065010696162">/);
    assert.doesNotMatch(html, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i);
    assert.match(html, /rel="canonical" href="https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/hourly-wage\/"/);
    assert.match(html, /lang="zh-Hant-HK"/);
  });
});
