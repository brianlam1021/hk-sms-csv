import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  AS_OF,
  FOUR_MONTH_DAYS,
  SEWAGE_RATE,
  compute,
  daysBetween,
  demoChan,
  demoLee,
  demoTrade,
  formatHkd,
  formatM3,
  summaryToCsv,
} from "../docs/water-sewage/water.js";

describe("WSD published water examples", () => {
  it("Example 1: Mr Chan 66 m³ / 127 days → water $274.05", () => {
    const r = compute(demoChan());
    assert.equal(r.days, 127);
    assert.equal(r.consumption, 66);
    assert.equal(r.factor, 1.04406);
    assert.equal(r.waterRows[0].volume, 12.529);
    assert.equal(r.waterRows[1].volume, 32.366);
    assert.equal(r.waterRows[1].charge, 134.64);
    assert.equal(r.waterRows[2].volume, 19.837);
    assert.equal(r.waterRows[2].charge, 127.94);
    assert.equal(r.waterRows[3].volume, 1.268);
    assert.equal(r.waterRows[3].charge, 11.47);
    assert.equal(r.waterCharge, 274.05);
    assert.equal(r.ok, true);
  });

  it("Example 2: Mr Lee 66 m³ / 117 days → water $299.51", () => {
    const r = compute(demoLee());
    assert.equal(r.days, 117);
    assert.equal(r.waterRows[0].volume, 11.542);
    assert.equal(r.waterRows[1].volume, 29.817);
    assert.equal(r.waterRows[1].charge, 124.03);
    assert.equal(r.waterRows[2].charge, 117.87);
    assert.equal(r.waterRows[3].volume, 6.366);
    assert.equal(r.waterRows[3].charge, 57.61);
    assert.equal(r.waterCharge, 299.51);
  });

  it("date difference matches WSD Example 1 (1 Aug to 6 Dec 1995 = 127 days)", () => {
    assert.equal(daysBetween("1995-08-01", "1995-12-06"), 127);
    assert.equal(daysBetween("1995-08-01", "1995-11-26"), 117);
  });
});

describe("WSD sewage illustrations (62 m³ / 122 days and 242-day variants)", () => {
  it("62 m³ over 122 days: water $251.06 + sewage $145.89 = $396.95", () => {
    const r = compute({
      supply: "domestic",
      consumption: 62,
      days: 122,
      sewage: true,
    });
    assert.equal(r.waterRows[0].volume, 12.036);
    assert.equal(r.waterRows[1].volume, 31.092);
    assert.equal(r.waterRows[1].charge, 129.34);
    assert.equal(r.waterRows[2].volume, 18.872);
    assert.equal(r.waterRows[2].charge, 121.72);
    assert.equal(r.waterCharge, 251.06);
    assert.equal(r.sewageFree, 12.036);
    assert.equal(r.sewageVolume, 49.964);
    assert.equal(r.sewageCharge, 145.89);
    assert.equal(r.total, 396.95);
  });

  it("123 m³ over 242 days: water $498.12 + sewage $289.44 = $787.56", () => {
    const r = compute({
      supply: "domestic",
      consumption: 123,
      days: 242,
      sewage: true,
    });
    assert.equal(r.waterCharge, 498.12);
    assert.equal(r.sewageCharge, 289.44);
    assert.equal(r.total, 787.56);
  });

  it("154 m³ over 242 days: water $777.77 + sewage $379.96 = $1,157.73", () => {
    const r = compute({
      supply: "domestic",
      consumption: 154,
      days: 242,
      sewage: true,
    });
    assert.equal(r.waterCharge, 777.77);
    assert.equal(r.sewageCharge, 379.96);
    assert.equal(r.total, 1157.73);
  });
});

describe("non-domestic and flushing", () => {
  it("trade 100 m³ × $4.58 = $458, sewage $292", () => {
    const r = compute(demoTrade());
    assert.equal(r.waterCharge, 458);
    assert.equal(r.sewageCharge, 292);
    assert.equal(r.total, 750);
  });

  it("construction 100 m³ × $7.11 = $711", () => {
    const r = compute({
      supply: "construction",
      consumption: 100,
      days: 122,
      sewage: false,
    });
    assert.equal(r.waterCharge, 711);
    assert.equal(r.sewageCharge, 0);
  });

  it("flushing 100 m³ / 121.64 days / 1 flat → $320.60 and no sewage", () => {
    const r = compute({
      supply: "flushing",
      consumption: 100,
      days: FOUR_MONTH_DAYS,
      flats: 1,
      sewage: true,
    });
    assert.equal(r.sewageOn, false);
    assert.equal(r.sewageCharge, 0);
    assert.equal(r.waterCharge, 320.6);
    assert.ok(r.warnings.includes("flushingNotIndividual"));
  });
});

describe("guards", () => {
  it("zero consumption is not ok", () => {
    const r = compute({ consumption: 0, days: 122 });
    assert.equal(r.ok, false);
    assert.ok(r.warnings.includes("zeroConsumption"));
  });

  it("optional 5% overdue surcharge applies to water + sewage", () => {
    const r = compute({
      supply: "domestic",
      consumption: 62,
      days: 122,
      sewage: true,
      overdue: true,
    });
    assert.equal(r.subtotal, 396.95);
    assert.equal(r.surcharge, 19.84);
    assert.equal(r.total, 416.79);
    assert.ok(r.warnings.includes("overdueSurcharge"));
  });

  it("sewage rate constant is $2.92", () => {
    assert.equal(SEWAGE_RATE, 2.92);
    assert.equal(AS_OF, "2026-10-22");
  });
});

describe("formatting and csv", () => {
  it("formats HKD and m³", () => {
    assert.equal(formatHkd(274.05), "HK$274.05");
    assert.equal(formatM3(12.529), "12.529");
  });

  it("csv has a UTF-8 BOM", () => {
    const csv = summaryToCsv(compute(demoChan()), {
      item: "項目",
      amount: "金額",
      supply: "類別",
      consumption: "用水量",
      days: "日數",
      factor: "比例",
      water: "水費",
      sewage: "排污費",
      subtotal: "小計",
      surcharge: "附加費",
      total: "合計",
      tier: "級別",
    });
    assert.equal(csv.charCodeAt(0), 0xfeff);
    assert.match(csv, /274\.05/);
  });
});

describe("page constraints", () => {
  it("has the AdSense account meta and no ad script or ad unit", () => {
    const html = readFileSync(new URL("../docs/water-sewage/index.html", import.meta.url), "utf8");
    assert.match(html, /<meta name="google-adsense-account" content="ca-pub-4101065010696162">/);
    assert.doesNotMatch(html, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i);
    assert.match(html, /rel="canonical" href="https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/water-sewage\/"/);
    assert.match(html, /lang="zh-Hant-HK"/);
    assert.match(html, /href="\.\.\/privacy\/"/);
    assert.match(html, /wsd\.gov\.hk/);
    assert.match(html, /dsd\.gov\.hk/);
    const css = readFileSync(new URL("../docs/water-sewage/style.css", import.meta.url), "utf8");
    assert.match(css, /\[hidden\]\s*\{[\s\S]*?display:\s*none\s*!important/);
  });

  it("is linked from the hub, sitemap and about page", () => {
    const hub = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
    const sitemap = readFileSync(new URL("../docs/sitemap.xml", import.meta.url), "utf8");
    const about = readFileSync(new URL("../docs/about/index.html", import.meta.url), "utf8");
    assert.match(hub, /href="\.\/water-sewage\/"/);
    assert.match(hub, /水費／排污費/);
    assert.match(sitemap, /https:\/\/hk-sms-csv\.pages\.dev\/water-sewage\//);
    assert.match(sitemap, /https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/water-sewage\//);
    assert.match(about, /water-sewage\//);
  });
});
