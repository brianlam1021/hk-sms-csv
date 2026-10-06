import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  accountToCsv,
  apportionAccount,
  apportionBill,
  assertApportionmentLegal,
  demoState,
  inclusiveDays,
  roundDownMoney,
  submeterUsage,
  tenantCheck,
  toCents,
} from "../docs/utility-account/app.js";

function unitsFromUsages(usages, extras) {
  return usages.map(function (usage, i) {
    var prev = 1000 * (i + 1);
    return Object.assign(
      {
        id: "u" + (i + 1),
        label: "R" + (i + 1),
        tenantName: "T" + (i + 1),
        area: extras && extras.areas ? extras.areas[i] : 80,
        occupants: extras && extras.occupants ? extras.occupants[i] : 1,
        daysOccupied: extras && extras.days ? extras.days[i] : "",
        isLandlord: extras && extras.landlordIndex === i,
        customPct: extras && extras.pct ? { b1: extras.pct[i] } : {},
        remainderPct: extras && extras.remPct ? { b1: extras.remPct[i] } : {},
        submeters: { b1: { prev: prev, curr: prev + usage } },
      },
      extras && extras.override ? extras.override(i) : {},
    );
  });
}

function bill(partial) {
  return Object.assign(
    {
      id: "b1",
      type: "electricity",
      provider: "CLP",
      accountHolder: "Owner",
      periodFrom: "2026-03-01",
      periodTo: "2026-03-31",
      amount: 1286.4,
      mainConsumption: 1050,
      method: "submeter",
      remainderMethod: "proportional",
    },
    partial,
  );
}

describe("roundDownMoney", () => {
  it("rounds down to the nearest 10 cents", () => {
    assert.equal(roundDownMoney(383.183, 0.1), 383.1);
    assert.equal(roundDownMoney(33.09, 0.1), 33);
    assert.equal(roundDownMoney(0.09, 0.1), 0);
  });

  it("rounds down to the nearest dollar", () => {
    assert.equal(roundDownMoney(99.99, 1), 99);
    assert.equal(roundDownMoney(100, 1), 100);
  });
});

describe("inclusiveDays", () => {
  it("counts both ends of a calendar period", () => {
    assert.equal(inclusiveDays("2026-03-01", "2026-03-31"), 31);
    assert.equal(inclusiveDays("2026-02-01", "2026-02-28"), 28);
  });
});

describe("sub-meter apportionment", () => {
  it("uses average unit price and shares unmetered usage proportionally", () => {
    const units = unitsFromUsages([280, 310, 350]);
    assert.equal(submeterUsage(units[0], "b1"), 280);
    const result = apportionBill(bill(), units, { rounding: "0.1", lang: "zh" });
    assert.equal(result.ok, true);
    assert.ok(Math.abs(result.unitPrice - 1286.4 / 1050) < 1e-12);
    assert.equal(result.sumSubUsage, 940);
    assert.equal(result.commonUsage, 110);
    const exactSum = result.rows.reduce((s, row) => s + row.exactAmount, 0);
    assert.ok(Math.abs(exactSum - 1286.4) < 1e-9);
    assert.equal(result.rows[0].amount, 383.1);
    assert.equal(result.rows[1].amount, 424.2);
    assert.equal(result.rows[2].amount, 478.9);
    assert.equal(result.roundedSum, 1286.2);
    assert.ok(result.roundedSum <= 1286.4);
    assert.equal(result.remainder, 0.2);
    assertApportionmentLegal(result);
  });

  it("splits the whole bill by sub-meter usage when main consumption is blank", () => {
    const units = unitsFromUsages([280, 310, 350]);
    const result = apportionBill(bill({ mainConsumption: "" }), units, { rounding: "0.1" });
    assert.equal(result.ok, true);
    assert.equal(result.unitPrice, null);
    const expectedA = roundDownMoney((1286.4 * 280) / 940, 0.1);
    assert.equal(result.rows[0].amount, expectedA);
    assert.ok(result.roundedSum <= 1286.4);
    assertApportionmentLegal(result);
  });

  it("rejects sub-meter totals above the main meter", () => {
    const units = unitsFromUsages([400, 400, 400]);
    const result = apportionBill(bill({ mainConsumption: 1050 }), units, { rounding: "0.1" });
    assert.equal(result.ok, false);
    assert.equal(result.warnings[0].code, "SUB_EXCEEDS_MAIN");
  });
});

describe("other methods", () => {
  it("splits equally and still stays under the bill after rounding down", () => {
    const units = unitsFromUsages([0, 0, 0]);
    const result = apportionBill(bill({ amount: 100, method: "equal", mainConsumption: "" }), units, {
      rounding: "1",
    });
    assert.deepEqual(
      result.rows.map((row) => row.amount),
      [33, 33, 33],
    );
    assert.equal(result.roundedSum, 99);
    assert.equal(result.remainder, 1);
    assertApportionmentLegal(result);
  });

  it("splits by custom percentages that total 100", () => {
    const units = unitsFromUsages([0, 0, 0], { pct: [50, 30, 20] });
    const result = apportionBill(bill({ amount: 999.99, method: "custom", mainConsumption: "" }), units, {
      rounding: "0.1",
    });
    assert.equal(result.ok, true);
    assert.equal(result.rows[0].amount, 499.9);
    assert.equal(result.rows[1].amount, 299.9);
    assert.equal(result.rows[2].amount, 199.9);
    assert.ok(result.roundedSum <= 999.99);
    assertApportionmentLegal(result);
  });

  it("rejects custom percentages that do not total 100", () => {
    const units = unitsFromUsages([0, 0, 0], { pct: [40, 30, 20] });
    const result = apportionBill(bill({ amount: 100, method: "custom" }), units, { rounding: "0.1" });
    assert.equal(result.ok, false);
    assert.equal(result.warnings[0].code, "CUSTOM_PCT");
  });

  it("splits by person-days over a 31-day bill", () => {
    const units = unitsFromUsages([0, 0, 0], { occupants: [1, 2, 1] });
    const result = apportionBill(
      bill({ amount: 186.3, type: "water", method: "persondays", mainConsumption: "" }),
      units,
      { rounding: "0.1", lang: "zh" },
    );
    assert.equal(result.ok, true);
    assert.equal(result.rows[0].amount, 46.5);
    assert.equal(result.rows[1].amount, 93.1);
    assert.equal(result.rows[2].amount, 46.5);
    assert.ok(result.roundedSum <= 186.3);
    assertApportionmentLegal(result);
  });

  it("splits by floor area", () => {
    const units = unitsFromUsages([0, 0, 0], { areas: [80, 95, 72] });
    const result = apportionBill(bill({ method: "area", mainConsumption: "" }), units, { rounding: "0.1" });
    assert.equal(result.ok, true);
    const totalArea = 247;
    assert.ok(Math.abs(result.rows[0].exactAmount - (1286.4 * 80) / totalArea) < 1e-9);
    assert.ok(result.roundedSum <= 1286.4);
    assertApportionmentLegal(result);
  });

  it("lets a landlord/common row take a share that tenants do not pay", () => {
    const units = unitsFromUsages([0, 0, 0, 0]);
    units[3].isLandlord = true;
    units[3].label = "common";
    const result = apportionBill(bill({ amount: 100, method: "equal", mainConsumption: "" }), units, {
      rounding: "0.1",
    });
    assert.equal(result.rows.filter((row) => !row.isLandlord).reduce((s, row) => s + row.amount, 0), 75);
    assert.equal(result.rows[3].amount, 25);
    assertApportionmentLegal(result);
  });
});

describe("demo account invariant", () => {
  it("keeps every demo bill at or below the printed total", () => {
    const demo = demoState();
    const account = apportionAccount(Object.assign({ lang: "zh" }, demo));
    assert.equal(account.bills.length, 2);
    for (const result of account.bills) {
      assert.equal(result.ok, true);
      assertApportionmentLegal(result);
      assert.ok(toCents(result.roundedSum) <= toCents(result.amount));
    }
    const clp = account.bills[0];
    assert.deepEqual(
      clp.rows.map((row) => row.basisValue),
      [280, 310, 350],
    );
    assert.ok(clp.roundedSum <= 1286.4);
  });

  it("writes a UTF-8 BOM CSV", () => {
    const demo = demoState();
    const account = apportionAccount(Object.assign({ lang: "zh" }, demo));
    const csv = accountToCsv(Object.assign({ lang: "zh" }, demo), account);
    assert.equal(csv.charCodeAt(0), 0xfeff);
    assert.match(csv, /中電 CLP/);
    assert.match(csv, /房A/);
  });
});

describe("tenant check", () => {
  it("flags a demand above the rounded-down fair share", () => {
    const check = tenantCheck(1050, 280, 1050, 400, 0.1);
    assert.equal(check.ok, true);
    assert.equal(check.fair, 280);
    assert.equal(check.exceeds, true);
  });

  it("accepts a demand that does not exceed the fair share", () => {
    const check = tenantCheck(1050, 280, 1050, 280, 0.1);
    assert.equal(check.exceeds, false);
  });
});
