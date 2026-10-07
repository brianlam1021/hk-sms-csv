import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANNUAL_CAP,
  ADMIN,
  EP,
  NEP,
  compute,
  demoCapModel,
  demoModel,
  formatHkd,
  inpatientDaysFromStay,
  lateCharges,
  summaryToCsv,
} from "../docs/hospital-fees/fees.js";

describe("demo A&E + 3 acute nights + SOPC follow-up", () => {
  it("totals HK$1,590 for an Eligible Person", () => {
    const r = compute(demoModel());
    assert.equal(r.ep, true);
    assert.equal(r.eligibleGross, 400 + 900 + 250 + 40);
    assert.equal(r.payableNoCap, 1590);
    assert.equal(r.payableWithCap, 1590);
    assert.equal(r.capApplies, false);
  });
});

describe("A&E rules", () => {
  it("waives Category I / II attendances", () => {
    const r = compute({ status: "ep", aeExempt: 2 });
    assert.equal(r.eligibleGross, 0);
    assert.equal(r.payableNoCap, 0);
    const exempt = r.lines.find((line) => line.key === "aeExempt");
    assert.ok(exempt);
    assert.equal(exempt.qty, 2);
    assert.equal(exempt.amount, 0);
  });

  it("nets HK$50 after the $350 pre-consultation refund (Eligible Person)", () => {
    const r = compute({ status: "ep", aeLeftBefore: 1 });
    assert.equal(r.eligibleGross, EP.ae - EP.aeRefund);
    assert.equal(r.payableNoCap, 50);
    assert.ok(r.warnings.includes("aeRefundApply"));
  });

  it("nets HK$250 after the $1,850 pre-consultation refund (Non-eligible Person)", () => {
    const r = compute({ status: "nep", aeLeftBefore: 1 });
    assert.equal(r.payableNoCap, NEP.ae - NEP.aeRefund);
    assert.equal(r.payableNoCap, 250);
  });
});

describe("inpatient maintenance", () => {
  it("charges a same-day discharge as one day", () => {
    assert.equal(inpatientDaysFromStay(0, true), 1);
    assert.equal(inpatientDaysFromStay(2, false), 2);
  });

  it("halves Eligible Person bed fees for a child under 12", () => {
    const r = compute({ status: "ep", childUnder12: true, acuteDays: 4, convDays: 2 });
    assert.equal(r.eligibleGross, 4 * 150 + 2 * 100);
    assert.equal(r.payableNoCap, 800);
    assert.ok(r.warnings.includes("childHalf"));
  });

  it("does not halve Non-eligible Person bed fees", () => {
    const r = compute({ status: "nep", childUnder12: true, acuteDays: 1 });
    assert.equal(r.payableNoCap, NEP.general);
    assert.ok(r.warnings.includes("childNep"));
  });
});

describe("annual spending cap", () => {
  it("is HK$10,000 and only for Eligible Persons", () => {
    assert.equal(ANNUAL_CAP, 10000);
    const nep = compute({ status: "nep", acuteDays: 2 });
    assert.equal(nep.payableNoCap, 14800);
    assert.equal(nep.payableWithCap, 14800);
    assert.equal(nep.capApplies, false);
    assert.ok(nep.warnings.includes("nepNoCap"));
  });

  it("caps a 40-day acute stay at HK$10,000 after a successful application", () => {
    const r = compute(demoCapModel());
    assert.equal(r.eligibleGross, 12000);
    assert.equal(r.payableNoCap, 12000);
    assert.equal(r.payableWithCap, 10000);
    assert.equal(r.capSaving, 2000);
    assert.equal(r.capApplies, true);
  });

  it("only charges the remaining room when year-to-date spending already exists", () => {
    const r = compute({ status: "ep", acuteDays: 20, yearToDatePaid: 8000 });
    assert.equal(r.eligibleGross, 6000);
    assert.equal(r.capRoom, 2000);
    assert.equal(r.payableWithCap, 2000);
    assert.equal(r.payableNoCap, 6000);
  });

  it("does not cap medical-report fees", () => {
    const r = compute({ status: "ep", medicalReports: 1, yearToDatePaid: 10000 });
    assert.equal(r.ineligible, ADMIN.medicalReport);
    assert.equal(r.payableWithCap, 1100);
    assert.equal(r.payableNoCap, 1100);
  });
});

describe("full waiver", () => {
  it("zeros Eligible Person public charges but keeps admin items", () => {
    const r = compute({
      status: "ep",
      fullWaiver: true,
      aeConsult: 1,
      acuteDays: 2,
      medicalReports: 1,
    });
    assert.equal(r.eligibleGross, 400 + 600);
    assert.equal(r.waivedEligible, 1000);
    assert.equal(r.payableNoCap, 1100);
    assert.equal(r.payableWithCap, 1100);
    assert.ok(r.warnings.includes("fullWaiver"));
  });
});

describe("Non-eligible extras", () => {
  it("adds the booked obstetric package", () => {
    const r = compute({ status: "nep", obstetric: "booked" });
    assert.equal(r.payableNoCap, 74000);
  });

  it("adds ICU at HK$35,600 a day", () => {
    const r = compute({ status: "nep", icuDays: 1 });
    assert.equal(r.payableNoCap, 35600);
  });
});

describe("late administrative charges", () => {
  it("charges 5% after 60 days, capped at HK$1,000 per bill", () => {
    assert.deepEqual(lateCharges(10000, 60), { first: 500, second: 0, total: 500 });
    assert.deepEqual(lateCharges(30000, 60), { first: 1000, second: 0, total: 1000 });
  });

  it("adds 10% after 90 days, capped at HK$10,000, total cap HK$11,000", () => {
    const r = lateCharges(20000, 90);
    assert.equal(r.first, 1000);
    assert.equal(r.second, 2000);
    assert.equal(r.total, 3000);
    const big = lateCharges(200000, 90);
    assert.equal(big.first, 1000);
    assert.equal(big.second, 10000);
    assert.equal(big.total, 11000);
  });

  it("charges nothing before day 60", () => {
    assert.equal(lateCharges(9999, 59).total, 0);
  });
});

describe("helpers", () => {
  it("formats negative refunds", () => {
    assert.equal(formatHkd(-350), "-HK$350");
    assert.equal(formatHkd(1590), "HK$1,590");
  });

  it("writes a UTF-8 BOM CSV", () => {
    const csv = summaryToCsv(compute(demoModel()), { aeConsult: "A&E", acuteDays: "Acute", sopc: "SOPC", sopcDrugs: "Drugs" });
    assert.ok(csv.startsWith("\uFEFF"));
    assert.match(csv, /payable_before_cap,,,1590/);
  });
});
