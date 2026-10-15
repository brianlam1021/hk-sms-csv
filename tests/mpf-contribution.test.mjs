import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  DAILY_MAX,
  DAILY_MIN,
  MONTHLY_MAX,
  MONTHLY_MIN,
  YEARLY_MAX,
  YEARLY_MIN,
  compute,
  demoBelowMin,
  demoCapped,
  demoEmployee,
  emptySettings,
  formatMoney,
  levelsFor,
} from "../docs/mpf-contribution/mpf.js";

describe("MPFA monthly employee table", () => {
  it("$20,000/month → employer and employee each $1,000", () => {
    const r = compute(demoEmployee());
    assert.equal(r.ok, true);
    assert.equal(r.band, "inBand");
    assert.equal(r.minLevel, MONTHLY_MIN);
    assert.equal(r.maxLevel, MONTHLY_MAX);
    assert.equal(r.employerMC, 1000);
    assert.equal(r.employeeMC, 1000);
    assert.equal(r.totalMC, 2000);
    assert.equal(r.takeHome, 19000);
    assert.equal(r.annualEmployer, 12000);
    assert.equal(r.annualEmployee, 12000);
  });

  it("below $7,100: employee $0, employer still 5% of actual income", () => {
    const r = compute(demoBelowMin());
    assert.equal(r.ok, true);
    assert.equal(r.band, "belowMin");
    assert.equal(r.employerMC, 300);
    assert.equal(r.employeeMC, 0);
    assert.equal(r.totalMC, 300);
    assert.equal(r.takeHome, 6000);
    assert.ok(r.warnings.includes("employeeBelowMin"));
  });

  it("exactly $7,100: both $355", () => {
    const r = compute(Object.assign(emptySettings(), { income: 7100 }));
    assert.equal(r.employerMC, 355);
    assert.equal(r.employeeMC, 355);
    assert.equal(r.band, "inBand");
  });

  it("exactly $30,000: both $1,500", () => {
    const r = compute(Object.assign(emptySettings(), { income: 30000 }));
    assert.equal(r.employerMC, 1500);
    assert.equal(r.employeeMC, 1500);
    assert.equal(r.band, "inBand");
  });

  it("above $30,000: both capped at $1,500", () => {
    const r = compute(demoCapped());
    assert.equal(r.band, "aboveMax");
    assert.equal(r.relevantCapped, 30000);
    assert.equal(r.employerMC, 1500);
    assert.equal(r.employeeMC, 1500);
    assert.equal(r.takeHome, 48500);
    assert.ok(r.warnings.includes("capped"));
  });
});

describe("non-monthly wage periods (daily min/max × days)", () => {
  it("weekly 7 days: min $1,960 max $7,000, $4,000 → each $200", () => {
    const lv = levelsFor("weekly", 7);
    assert.equal(lv.min, DAILY_MIN * 7);
    assert.equal(lv.max, DAILY_MAX * 7);
    const r = compute({
      role: "employee",
      period: "weekly",
      income: 4000,
      days: 7,
    });
    assert.equal(r.minLevel, 1960);
    assert.equal(r.maxLevel, 7000);
    assert.equal(r.employerMC, 200);
    assert.equal(r.employeeMC, 200);
    assert.equal(r.annualTotal, null);
  });

  it("weekly income below $1,960: employee $0", () => {
    const r = compute({
      role: "employee",
      period: "weekly",
      income: 1500,
      days: 7,
    });
    assert.equal(r.employerMC, 75);
    assert.equal(r.employeeMC, 0);
  });

  it("weekly income above $7,000: each $350", () => {
    const r = compute({
      role: "employee",
      period: "weekly",
      income: 8000,
      days: 7,
    });
    assert.equal(r.employerMC, 350);
    assert.equal(r.employeeMC, 350);
  });

  it("semi-monthly 15 days: min $4,200 max $15,000", () => {
    const r = compute({
      role: "employee",
      period: "semiMonthly",
      income: 10000,
      days: 15,
    });
    assert.equal(r.minLevel, 4200);
    assert.equal(r.maxLevel, 15000);
    assert.equal(r.employerMC, 500);
    assert.equal(r.employeeMC, 500);
  });

  it("daily 1 day: min $280 max $1,000", () => {
    const r = compute({
      role: "employee",
      period: "daily",
      income: 500,
      days: 1,
    });
    assert.equal(r.minLevel, 280);
    assert.equal(r.maxLevel, 1000);
    assert.equal(r.employerMC, 25);
    assert.equal(r.employeeMC, 25);
  });
});

describe("self-employed", () => {
  it("monthly $20,000 → $1,000; no employer share", () => {
    const r = compute({
      role: "selfEmployed",
      period: "monthly",
      income: 20000,
    });
    assert.equal(r.employerMC, 0);
    assert.equal(r.employeeMC, 0);
    assert.equal(r.selfMC, 1000);
    assert.equal(r.totalMC, 1000);
    assert.equal(r.takeHome, 19000);
    assert.equal(r.annualSelf, 12000);
  });

  it("monthly below $7,100 → $0", () => {
    const r = compute({
      role: "selfEmployed",
      period: "monthly",
      income: 6000,
    });
    assert.equal(r.selfMC, 0);
    assert.ok(r.warnings.includes("selfBelowMin"));
  });

  it("yearly $360,000 → $18,000; below yearly min → $0", () => {
    const cap = compute({
      role: "selfEmployed",
      period: "yearly",
      income: 400000,
    });
    assert.equal(cap.minLevel, YEARLY_MIN);
    assert.equal(cap.maxLevel, YEARLY_MAX);
    assert.equal(cap.selfMC, 18000);
    assert.equal(cap.annualSelf, 18000);

    const low = compute({
      role: "selfEmployed",
      period: "yearly",
      income: 80000,
    });
    assert.equal(low.selfMC, 0);
  });

  it("forces monthly if a self-employed user picks a weekly period", () => {
    const r = compute({
      role: "selfEmployed",
      period: "weekly",
      income: 20000,
      days: 7,
    });
    assert.equal(r.period, "monthly");
    assert.equal(r.selfMC, 1000);
  });
});

describe("employee contribution holiday and extras", () => {
  it("holiday zeros employee MC only", () => {
    const r = compute(Object.assign(emptySettings(), { holiday: true }));
    assert.equal(r.employerMC, 1000);
    assert.equal(r.employeeMC, 0);
    assert.equal(r.takeHome, 20000);
    assert.equal(r.annualEmployee, null);
    assert.ok(r.warnings.includes("holidayOn"));
  });

  it("voluntary is deducted from take-home but not from mandatory", () => {
    const r = compute(Object.assign(emptySettings(), { voluntary: 500 }));
    assert.equal(r.employeeMC, 1000);
    assert.equal(r.voluntary, 500);
    assert.equal(r.deductedFromPay, 1500);
    assert.equal(r.takeHome, 18500);
  });

  it("rejects negative income and missing days", () => {
    const neg = compute(Object.assign(emptySettings(), { income: -1 }));
    assert.equal(neg.ok, false);
    assert.ok(neg.warnings.includes("negIncome"));

    const days = compute({
      role: "employee",
      period: "weekly",
      income: 4000,
      days: 0,
    });
    assert.equal(days.ok, false);
    assert.ok(days.warnings.includes("noDays"));
  });

  it("zero income is a valid $0 contribution period", () => {
    const r = compute(Object.assign(emptySettings(), { income: 0 }));
    assert.equal(r.ok, true);
    assert.equal(r.employerMC, 0);
    assert.equal(r.employeeMC, 0);
    assert.equal(r.band, "zero");
  });
});

describe("formatting", () => {
  it("formats HKD with grouping", () => {
    assert.equal(formatMoney(20000, 2), "HK$20,000.00");
    assert.equal(formatMoney(1500, 2), "HK$1,500.00");
  });
});

describe("page constraints", () => {
  it("has the AdSense account meta and no ad script or ad unit", () => {
    const html = readFileSync(new URL("../docs/mpf-contribution/index.html", import.meta.url), "utf8");
    assert.match(html, /<meta name="google-adsense-account" content="ca-pub-4101065010696162">/);
    assert.doesNotMatch(html, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i);
    assert.match(html, /rel="canonical" href="https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/mpf-contribution\/"/);
    assert.match(html, /lang="zh-Hant-HK"/);
    assert.match(html, /href="\.\.\/privacy\/"/);
    assert.match(html, /mpfa\.org\.hk/);
  });

  it("is linked from the hub, sitemap and about page", () => {
    const hub = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
    const sitemap = readFileSync(new URL("../docs/sitemap.xml", import.meta.url), "utf8");
    const about = readFileSync(new URL("../docs/about/index.html", import.meta.url), "utf8");
    assert.match(hub, /href="\.\/mpf-contribution\/"/);
    assert.match(hub, /強積金供款/);
    assert.match(sitemap, /https:\/\/hk-sms-csv\.pages\.dev\/mpf-contribution\//);
    assert.match(sitemap, /https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/mpf-contribution\//);
    assert.match(about, /mpf-contribution\//);
  });
});
