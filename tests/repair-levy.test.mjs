import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  compute,
  demoModel,
  largestRemainder,
  parsePaste,
  quickShare,
  resolveItems,
  summaryToCsv,
  validateModel,
} from "../docs/repair-levy/levy.js";

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

describe("largestRemainder", () => {
  it("splits $100 across three equal shares to $1 with leftover to the first", () => {
    const { amounts, steppedTotal } = largestRemainder([1, 1, 1], 100, 1);
    assert.equal(steppedTotal, 100);
    assert.deepEqual(amounts, [34, 33, 33]);
    assert.equal(sum(amounts), 100);
  });

  it("splits $10 across two 1:1 shares to $0.1 exactly", () => {
    const { amounts, steppedTotal } = largestRemainder([1, 1], 10, 0.1);
    assert.equal(steppedTotal, 10);
    assert.deepEqual(amounts, [5, 5]);
  });

  it("gives leftover tenths to the largest remainder", () => {
    const { amounts, steppedTotal } = largestRemainder([2, 1, 1], 10, 0.1);
    assert.equal(steppedTotal, 10);
    assert.equal(Number(sum(amounts).toFixed(1)), 10);
    assert.equal(amounts[0], 5);
    assert.equal(Number((amounts[1] + amounts[2]).toFixed(1)), 5);
  });

  it("returns zeros when all weights are zero", () => {
    const { amounts, steppedTotal } = largestRemainder([0, 0], 99, 1);
    assert.deepEqual(amounts, [0, 0]);
    assert.equal(steppedTotal, 99);
  });

  it("rounds the item total to the step before allocating", () => {
    const { amounts, steppedTotal } = largestRemainder([1, 1], 10.4, 1);
    assert.equal(steppedTotal, 10);
    assert.deepEqual(amounts, [5, 5]);
  });
});

describe("quickShare", () => {
  it("computes exact amount, percent and instalment", () => {
    const r = quickShare(6912000, 50, 1220, 4);
    assert.equal(r.ok, true);
    assert.equal(Number(r.amount.toFixed(6)), Number(((6912000 * 50) / 1220).toFixed(6)));
    assert.equal(Number(r.pct.toFixed(6)), Number(((50 / 1220) * 100).toFixed(6)));
    assert.equal(Number((r.perInstalment * 4).toFixed(6)), Number(r.amount.toFixed(6)));
  });

  it("rejects a zero building total", () => {
    assert.equal(quickShare(100, 10, 0, 1).ok, false);
  });
});

describe("resolveItems percent of fixed amounts", () => {
  it("takes 8% of fixed works only", () => {
    const items = resolveItems([
      { id: "a", mode: "amount", value: 4800000 },
      { id: "b", mode: "amount", value: 1600000 },
      { id: "c", mode: "percent", value: 8 },
    ]);
    assert.equal(items[2].resolvedAmount, 512000);
  });
});

describe("compute demo building", () => {
  it("reconciles each item column and the payable total to the cost", () => {
    const model = demoModel();
    const result = compute(model);
    assert.equal(result.ok, true);
    assert.equal(result.rows.length, 32);
    assert.equal(result.totals.gross, 6912000);
    assert.equal(result.totals.subsidy, 0);
    assert.equal(result.totals.itemsColumnSum, 6912000);
    assert.equal(result.totals.payable, 6912000);

    result.items.forEach((item) => {
      const col = result.rows.reduce((s, row) => s + (row.itemShares[item.id] || 0), 0);
      assert.equal(col, item.steppedTotal);
    });
    const payableSum = result.rows.reduce((s, row) => s + row.payable, 0);
    assert.equal(payableSum, result.totals.payable);
  });

  it("charges the lift only to residential shares", () => {
    const result = compute(demoModel());
    const lift = result.items.find((item) => item.id === "i2");
    const shop = result.rows.find((row) => row.label === "Shop 1");
    const flat = result.rows.find((row) => row.label === "1A");
    const carpark = result.rows.find((row) => row.label === "CP01");
    assert.equal(shop.itemShares.i2, 0);
    assert.equal(carpark.itemShares.i2, 0);
    assert.ok(flat.itemShares.i2 > 0);
    assert.equal(lift.steppedTotal, 1600000);
  });

  it("applies an OC subsidy before apportionment", () => {
    const model = demoModel();
    model.ocSubsidy = 912000;
    const result = compute(model);
    assert.equal(result.ok, true);
    assert.equal(result.totals.subsidy, 912000);
    assert.equal(result.totals.itemsColumnSum, 6000000);
    assert.equal(result.totals.payable, 6000000);
  });

  it("subtracts a per-unit deduction after apportionment", () => {
    const model = demoModel();
    model.units[0].deduction = 1000;
    const result = compute(model);
    const flat = result.rows.find((row) => row.label === "1A");
    assert.equal(flat.deduction, 1000);
    assert.equal(flat.payable, flat.itemsTotal - 1000);
    assert.equal(result.totals.deductions, 1000);
    assert.equal(result.totals.payable, result.totals.itemsColumnSum - 1000);
  });

  it("splits instalments with largest remainder so they sum to payable", () => {
    const result = compute(demoModel());
    result.rows.forEach((row) => {
      assert.equal(row.instalments.length, 4);
      assert.equal(sum(row.instalments), row.payable);
    });
  });
});

describe("validation", () => {
  it("flags blank or zero shares, duplicate labels, and empty category pools", () => {
    const errors = validateModel({
      units: [
        { id: "a", label: "1A", shares: 0, category: "residential", deduction: 0 },
        { id: "b", label: "1A", shares: 10, category: "residential", deduction: 0 },
        { id: "c", label: "Shop", shares: 5, category: "shop", deduction: 0 },
      ],
      items: [
        { id: "i", name: "Lift", mode: "amount", value: 100, categories: ["carpark"] },
      ],
    });
    const codes = errors.map((e) => e.code);
    assert.ok(codes.includes("zero-shares"));
    assert.ok(codes.includes("duplicate-label"));
    assert.ok(codes.includes("category-zero-shares"));
  });
});

describe("parsePaste", () => {
  it("reads tab and comma rows with optional owner and category", () => {
    const text = [
      "單位,業主,份數,類別",
      "1A,陳大文,50,住宅",
      "Shop 1\t示例商號\t100\t商舖",
      "CP01,10,車位",
    ].join("\n");
    const { units } = parsePaste(text);
    assert.equal(units.length, 3);
    assert.equal(units[0].label, "1A");
    assert.equal(units[0].owner, "陳大文");
    assert.equal(units[0].shares, 50);
    assert.equal(units[0].category, "residential");
    assert.equal(units[1].category, "shop");
    assert.equal(units[2].label, "CP01");
    assert.equal(units[2].shares, 10);
    assert.equal(units[2].category, "carpark");
  });
});

describe("CSV", () => {
  it("writes UTF-8 BOM and a totals row that matches the cost", () => {
    const model = demoModel();
    const result = compute(model);
    const csv = summaryToCsv(result, model, "zh");
    assert.equal(csv.charCodeAt(0), 0xfeff);
    assert.match(csv, /單位,業主,類別/);
    assert.match(csv, /合計/);
    assert.match(csv, /6912000/);
  });
});

describe("page constraints", () => {
  it("has the AdSense account meta and no ad script or ad unit", () => {
    const html = readFileSync(new URL("../docs/repair-levy/index.html", import.meta.url), "utf8");
    assert.match(html, /<meta name="google-adsense-account" content="ca-pub-4101065010696162">/);
    assert.doesNotMatch(html, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i);
    assert.match(html, /rel="canonical" href="https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/repair-levy\/"/);
    assert.match(html, /lang="zh-Hant-HK"/);
  });
});
