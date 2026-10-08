import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  RATES,
  addDays,
  compute,
  demoRentFree,
  demoShort,
  formatHkd,
  latePenaltyTimes,
  parseYmd,
  rateBand,
  roundDuty,
  roundRentBase,
  summaryToCsv,
  termFromDates,
  termFromMonths,
  voluntaryDisclosurePenalty,
  wholeMonths,
} from "../docs/tenancy-stamp/stamp.js";

function y(s) {
  return parseYmd(s);
}

describe("IRD IRSD119 term counting", () => {
  it("Example 1: 1 Jan–31 Dec is exactly 1 year (does not exceed 1 year)", () => {
    const t = termFromDates(y("2024-01-01"), y("2024-12-31"));
    assert.deepEqual(t, { years: 1, extraDays: 0 });
    assert.equal(rateBand(1, 0), "upto1");
  });

  it("Example 2: 1 Jan 2024–1 Jan 2025 is 1 year and 1 day", () => {
    const t = termFromDates(y("2024-01-01"), y("2025-01-01"));
    assert.deepEqual(t, { years: 1, extraDays: 1 });
    assert.equal(rateBand(1, 1), "over1");
  });

  it("Example 5: rent-free 25–31 Dec 2023 plus 2024 calendar year is 1 year 7 days", () => {
    const t = termFromDates(y("2023-12-25"), y("2024-12-31"));
    assert.deepEqual(t, { years: 1, extraDays: 7 });
    assert.equal(rateBand(1, 7), "over1");
  });

  it("counts both ends of a 2-year term 1 Sep 2024–31 Aug 2026", () => {
    const t = termFromDates(y("2024-09-01"), y("2026-08-31"));
    assert.deepEqual(t, { years: 2, extraDays: 0 });
    assert.equal(wholeMonths(y("2024-09-01"), y("2026-08-31")), 24);
  });
});

describe("IRD IRSD119 duty examples", () => {
  it("Example 6: 8 months × $5,000 = $100 (no counterpart)", () => {
    const r = compute({
      termMode: "months",
      termMonths: 8,
      monthlyRent: 5000,
      rentFreeMonths: 0,
      counterparts: 0,
      keyMoney: 0,
      signedDate: "2024-07-01",
      stampDate: "2024-07-15",
    });
    assert.equal(r.band, "upto1");
    assert.equal(r.rate, RATES.upto1);
    assert.equal(r.totalRent, 40000);
    assert.equal(r.rentBase, 40000);
    assert.equal(r.rentDuty, 100);
    assert.equal(r.duty, 100);
    assert.equal(r.late.onTime, true);
  });

  it("Example 7: 2 years × $7,000 + 1 counterpart = $425", () => {
    const r = compute({
      termMode: "months",
      termMonths: 24,
      monthlyRent: 7000,
      rentFreeMonths: 0,
      counterparts: 1,
      signedDate: "2024-01-04",
      stampDate: "2024-01-20",
    });
    assert.equal(r.band, "over1");
    assert.equal(r.rawBase, 84000);
    assert.equal(r.rentDuty, 420);
    assert.equal(r.counterpartDuty, 5);
    assert.equal(r.duty, 425);
  });

  it("Example 8: varied rent over 4 years + counterpart = $1,625", () => {
    const r = compute({
      termMode: "months",
      termMonths: 48,
      monthlyRent: 12000,
      rent2Months: 24,
      monthlyRent2: 15000,
      rentFreeMonths: 0,
      counterparts: 1,
      signedDate: "2024-02-01",
      stampDate: "2024-02-10",
    });
    assert.equal(r.band, "over3");
    assert.equal(r.totalRent, 12000 * 24 + 15000 * 24);
    assert.equal(r.rawBase, 162000);
    assert.equal(r.rentDuty, 1620);
    assert.equal(r.duty, 1625);
  });

  it("Example 9: 2 years, $10,000, 2 rent-free months + counterpart = $555", () => {
    const r = compute(demoRentFree());
    assert.equal(r.band, "over1");
    assert.equal(r.totalRent, 220000);
    assert.equal(r.rawBase, 110000);
    assert.equal(r.rentDuty, 550);
    assert.equal(r.counterpartDuty, 5);
    assert.equal(r.duty, 555);
    assert.equal(r.late.onTime, true);
  });

  it("reproduces Example 9 from dates instead of months", () => {
    const r = compute({
      termMode: "dates",
      startDate: "2024-09-01",
      endDate: "2026-08-31",
      monthlyRent: 10000,
      rentFreeMonths: 2,
      counterparts: 1,
      signedDate: "2024-07-02",
      stampDate: "2024-07-20",
    });
    assert.equal(r.band, "over1");
    assert.equal(r.term.years, 2);
    assert.equal(r.term.extraDays, 0);
    assert.equal(r.duty, 555);
  });

  it("CLIC 3-year $10,000 with 2 rent-free months + counterpart = $572", () => {
    const r = compute({
      termMode: "months",
      termMonths: 36,
      monthlyRent: 10000,
      rentFreeMonths: 2,
      counterparts: 1,
      signedDate: "2026-01-01",
      stampDate: "2026-01-15",
    });
    assert.equal(r.band, "over1");
    assert.equal(r.totalRent, 340000);
    assert.equal(r.rawBase, 340000 / 3);
    assert.equal(r.rentBase, 113400);
    assert.equal(r.rentDuty, 567);
    assert.equal(r.duty, 572);
  });
});

describe("rounding (IRSD119 notes 1–2)", () => {
  it("rounds the rent base up to the next $100", () => {
    assert.equal(roundRentBase(40000), 40000);
    assert.equal(roundRentBase(40001), 40100);
    assert.equal(roundRentBase(0), 0);
  });

  it("rounds duty up to the next $1", () => {
    assert.equal(roundDuty(101.01), 102);
    assert.equal(roundDuty(100), 100);
  });

  it("applies both rounding steps on a short lease", () => {
    const r = compute({
      termMode: "months",
      termMonths: 8,
      monthlyRent: 5010,
      rentFreeMonths: 0,
      counterparts: 0,
      signedDate: "2026-01-01",
      stampDate: "2026-01-10",
    });
    assert.equal(r.totalRent, 40080);
    assert.equal(r.rentBase, 40100);
    assert.equal(r.rentDuty, 101);
  });
});

describe("late stamping", () => {
  it("is on time on the 30th day after signing", () => {
    const signed = y("2024-07-01");
    const deadline = addDays(signed, 30);
    assert.equal(deadline.y, 2024);
    assert.equal(deadline.mo, 7);
    assert.equal(deadline.d, 31);
    const late = latePenaltyTimes(signed, y("2024-07-31"));
    assert.equal(late.onTime, true);
    assert.equal(late.times, 0);
  });

  it("charges 2× when stamped one day late", () => {
    const r = compute({
      ...demoShort(),
      stampDate: "2024-08-01",
    });
    assert.equal(r.late.onTime, false);
    assert.equal(r.late.times, 2);
    assert.equal(r.duty, 100);
    assert.equal(r.penalty, 200);
    assert.equal(r.totalWithPenalty, 300);
  });

  it("charges 4× after more than one month of delay", () => {
    const late = latePenaltyTimes(y("2024-07-01"), y("2024-09-01"));
    assert.equal(late.times, 4);
  });

  it("charges 10× after more than two months of delay", () => {
    const late = latePenaltyTimes(y("2024-07-01"), y("2024-10-02"));
    assert.equal(late.times, 10);
  });

  it("estimates voluntary-disclosure remission with a $500 floor", () => {
    assert.equal(voluntaryDisclosurePenalty(100, 2), 500);
    const raw = (0.14 * 50000 * 40) / 365;
    assert.ok(raw > 500);
    assert.ok(Math.abs(voluntaryDisclosurePenalty(50000, 40) - raw) < 1e-9);
  });
});

describe("key money, deposit, 50/50 split", () => {
  it("adds 4.25% key money when rent is also payable", () => {
    const r = compute({
      termMode: "months",
      termMonths: 8,
      monthlyRent: 5000,
      rentFreeMonths: 0,
      keyMoney: 20000,
      counterparts: 0,
      signedDate: "2024-07-01",
      stampDate: "2024-07-15",
    });
    assert.equal(r.rentDuty, 100);
    assert.equal(r.keyDuty, 850);
    assert.equal(r.duty, 950);
  });

  it("ignores the deposit and splits duty 50/50 by default", () => {
    const r = compute(demoShort());
    assert.ok(r.warnings.includes("depositIgnored"));
    assert.equal(r.landlord, 50);
    assert.equal(r.tenant, 50);
  });

  it("does not invent AVD for key money without rent", () => {
    const r = compute({
      termMode: "months",
      termMonths: 8,
      monthlyRent: 0,
      keyMoney: 20000,
      counterparts: 0,
    });
    assert.ok(r.warnings.includes("keyMoneyNoRent"));
    assert.equal(r.keyDuty, 0);
  });
});

describe("months helper + money format", () => {
  it("treats 12 / 36 months as the top of each band", () => {
    assert.equal(termFromMonths(12).years, 1);
    assert.equal(termFromMonths(12).extraDays, 0);
    const twelve = compute({ termMode: "months", termMonths: 12, monthlyRent: 10000, counterparts: 0 });
    assert.equal(twelve.band, "upto1");
    const thirtysix = compute({ termMode: "months", termMonths: 36, monthlyRent: 10000, counterparts: 0 });
    assert.equal(thirtysix.band, "over1");
    const thirtyseven = compute({ termMode: "months", termMonths: 37, monthlyRent: 10000, counterparts: 0 });
    assert.equal(thirtyseven.band, "over3");
  });

  it("formats whole dollars with grouping", () => {
    assert.equal(formatHkd(1625), "HK$1,625");
    assert.equal(formatHkd(0), "HK$0");
  });

  it("writes a UTF-8 BOM CSV", () => {
    const csv = summaryToCsv(compute(demoShort()), {
      item: "項目",
      amount: "金額",
      totalRent: "租金總額",
      rentBase: "計稅租金",
      rentDuty: "租金印花稅",
      keyDuty: "頂手費印花稅",
      counterpartDuty: "複本",
      duty: "印花稅",
      penalty: "逾期罰款",
      total: "連罰款",
      landlord: "業主",
      tenant: "租客",
    });
    assert.equal(csv.charCodeAt(0), 0xfeff);
    assert.match(csv, /印花稅,100/);
  });
});

describe("page constraints", () => {
  it("has the AdSense account meta and no ad script or ad unit", () => {
    const html = readFileSync(new URL("../docs/tenancy-stamp/index.html", import.meta.url), "utf8");
    assert.match(html, /<meta name="google-adsense-account" content="ca-pub-4101065010696162">/);
    assert.doesNotMatch(html, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i);
    assert.match(html, /rel="canonical" href="https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/tenancy-stamp\/"/);
    assert.match(html, /lang="zh-Hant-HK"/);
  });
});
