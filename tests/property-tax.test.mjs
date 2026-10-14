import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  STANDARD_RATE,
  compute,
  demoFullYear,
  demoMidYear,
  formatHkd,
  nextYearOfAssessment,
  summaryToCsv,
} from "../docs/property-tax/property.js";

describe("GovHK worked examples", () => {
  it("Example 1: $10,000/month, tenant paid rates, full year", () => {
    const r = compute(demoFullYear());
    assert.equal(r.yearOfAssessment, "2025/26");
    assert.equal(r.nextYear, "2026/27");
    assert.equal(r.rentalIncome, 120000);
    assert.equal(r.assessableValue, 120000);
    assert.equal(r.allowance, 24000);
    assert.equal(r.nav, 96000);
    assert.equal(r.rate, STANDARD_RATE);
    assert.equal(r.tax, 14400);
    assert.equal(r.provisionalTax, 14400);
    assert.equal(r.totalPayable, 28800);
    assert.equal(r.firstInstalment, 22800);
    assert.equal(r.secondInstalment, 6000);
    assert.equal(r.holdoverThreshold, 108000);
    assert.equal(r.ok, true);
  });

  it("Example 2: mid-year letting from 1 July, owner-paid rates $12,000", () => {
    const r = compute(demoMidYear());
    assert.equal(r.monthsLet, 9);
    assert.equal(r.rentalIncome, 270000);
    assert.equal(r.assessableValue, 270000);
    assert.equal(r.ownerPaidRates, 12000);
    assert.equal(r.afterRates, 258000);
    assert.equal(r.allowance, 51600);
    assert.equal(r.nav, 206400);
    assert.equal(r.tax, 30960);
    assert.equal(r.estimatedNav, 275200);
    assert.equal(r.provisionalTax, 41280);
    assert.equal(r.totalPayable, 72240);
    assert.equal(r.firstInstalment, 55040);
    assert.equal(r.secondInstalment, 17200);
    assert.equal(r.estimatedAv, 360000);
    assert.equal(r.holdoverThreshold, 324000);
    assert.ok(r.warnings.includes("partialYear"));
    assert.ok(r.warnings.includes("ratesNotRent"));
  });

  it("IRD FAQ: $10,000/month from 1 April matches Example 1 tax", () => {
    const r = compute({
      yearOfAssessment: "2025/26",
      monthlyRent: 10000,
      monthsLet: 12,
    });
    assert.equal(r.tax, 14400);
    assert.equal(r.totalPayable, 28800);
  });
});

describe("deductions and holdover", () => {
  it("subtracts irrecoverable rent before rates and the 20% allowance", () => {
    const r = compute({
      monthlyRent: 10000,
      monthsLet: 12,
      irrecoverableRent: 20000,
      ownerPaidRates: 4000,
    });
    assert.equal(r.consideration, 120000);
    assert.equal(r.assessableValue, 100000);
    assert.equal(r.afterRates, 96000);
    assert.equal(r.allowance, 19200);
    assert.equal(r.nav, 76800);
    assert.equal(r.tax, 11520);
    assert.ok(r.warnings.includes("irrecoverableDeposit"));
  });

  it("adds other consideration into assessable value", () => {
    const r = compute({
      monthlyRent: 10000,
      monthsLet: 12,
      otherConsideration: 24000,
    });
    assert.equal(r.consideration, 144000);
    assert.equal(r.assessableValue, 144000);
    assert.equal(r.nav, 115200);
    assert.equal(r.tax, 17280);
  });

  it("flags a holdover when estimated next-year AV is under 90%", () => {
    const under = compute({
      ...demoFullYear(),
      expectedNextAv: 107999,
    });
    assert.equal(under.holdoverThreshold, 108000);
    assert.equal(under.holdoverLikely, true);
    assert.ok(under.warnings.includes("holdoverLikely"));

    const over = compute({
      ...demoFullYear(),
      expectedNextAv: 108000,
    });
    assert.equal(over.holdoverLikely, false);
  });

  it("splits this year’s tax by ownership share", () => {
    const r = compute({
      ...demoFullYear(),
      ownerShare: 50,
    });
    assert.equal(r.ownerTax, 7200);
    assert.equal(r.otherOwnersTax, 7200);
  });

  it("does not treat a deposit as a deduction", () => {
    const r = compute(demoFullYear());
    assert.equal(r.nav, 96000);
    assert.ok(r.warnings.includes("noMortgageDeduct"));
    assert.ok(r.warnings.includes("notPersonalAssessment"));
  });
});

describe("helpers", () => {
  it("advances the year of assessment", () => {
    assert.equal(nextYearOfAssessment("2025/26"), "2026/27");
    assert.equal(nextYearOfAssessment("2026/27"), "2027/28");
  });

  it("formats whole dollars with grouping", () => {
    assert.equal(formatHkd(28800), "HK$28,800");
    assert.equal(formatHkd(0), "HK$0");
  });

  it("writes a UTF-8 BOM CSV", () => {
    const csv = summaryToCsv(compute(demoFullYear()), {
      item: "項目",
      amount: "金額",
      year: "課稅年度",
      nextYear: "暫繳稅年度",
      rentalIncome: "租金收入",
      other: "其他代價",
      irrecoverable: "不能追回",
      assessableValue: "應評稅值",
      rates: "差餉",
      allowance: "免稅額",
      nav: "應評稅淨值",
      tax: "物業稅",
      provisional: "暫繳稅",
      total: "合計",
      first: "第一期",
      second: "第二期",
      holdover: "緩繳門檻",
      owner: "業權分攤",
    });
    assert.equal(csv.charCodeAt(0), 0xfeff);
    assert.match(csv, /物業稅,14400/);
    assert.match(csv, /合計,28800/);
  });
});

describe("page constraints", () => {
  it("has the AdSense account meta and no ad script or ad unit", () => {
    const html = readFileSync(new URL("../docs/property-tax/index.html", import.meta.url), "utf8");
    assert.match(html, /<meta name="google-adsense-account" content="ca-pub-4101065010696162">/);
    assert.doesNotMatch(html, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i);
    assert.match(html, /rel="canonical" href="https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/property-tax\/"/);
    assert.match(html, /lang="zh-Hant-HK"/);
    assert.match(html, /href="\.\.\/privacy\/"/);
  });

  it("is linked from the hub, sitemap and about page", () => {
    const hub = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
    const sitemap = readFileSync(new URL("../docs/sitemap.xml", import.meta.url), "utf8");
    const about = readFileSync(new URL("../docs/about/index.html", import.meta.url), "utf8");
    assert.match(hub, /href="\.\/property-tax\/"/);
    assert.match(hub, /物業稅估算/);
    assert.match(sitemap, /https:\/\/hk-sms-csv\.pages\.dev\/property-tax\//);
    assert.match(sitemap, /https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/property-tax\//);
    assert.match(about, /property-tax\//);
  });
});
