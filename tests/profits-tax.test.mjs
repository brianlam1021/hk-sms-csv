import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  CORP_HIGH,
  CORP_LOW,
  TIER_THRESHOLD,
  UNC_HIGH,
  UNC_LOW,
  compute,
  demoOverCap,
  demoSmeCorp,
  demoStandard,
  emptySettings,
  formatMoney,
  formatPct,
  nextYearOfAssessment,
  reductionCapFor,
  taxOn,
} from "../docs/profits-tax/profits.js";

describe("IRD two-tier corporation table", () => {
  it("$800,000 SME corp → 8.25% = $66,000; 2025/26 waiver $3,000", () => {
    const r = compute(demoSmeCorp());
    assert.equal(r.ok, true);
    assert.equal(r.entity, "corporation");
    assert.equal(r.twoTier, true);
    assert.equal(r.yearOfAssessment, "2025/26");
    assert.equal(r.nextYear, "2026/27");
    assert.equal(r.netProfits, 800000);
    assert.equal(r.band1, 800000);
    assert.equal(r.band2, 0);
    assert.equal(r.lowRate, CORP_LOW);
    assert.equal(r.taxBeforeReduction, 66000);
    assert.equal(r.reductionCap, 3000);
    assert.equal(r.reduction, 3000);
    assert.equal(r.finalTax, 63000);
    assert.equal(r.standardTax, 132000);
    assert.equal(r.twoTierSaving, 66000);
    assert.equal(r.provisionalTax, 66000);
    assert.equal(r.totalPayable, 129000);
    assert.equal(r.firstInstalment, 112500);
    assert.equal(r.secondInstalment, 16500);
  });

  it("$3,000,000: first $2m at 8.25%, remainder at 16.5%", () => {
    const r = compute(demoOverCap());
    assert.equal(r.band1, TIER_THRESHOLD);
    assert.equal(r.band2, 1000000);
    assert.equal(r.taxBeforeReduction, 330000);
    assert.equal(r.reduction, 3000);
    assert.equal(r.finalTax, 327000);
    assert.equal(r.standardTax, 495000);
    assert.equal(r.twoTierSaving, 165000);
    assert.equal(r.provisionalTax, 330000);
  });

  it("exactly $2,000,000 stays in the lower band", () => {
    const r = compute(Object.assign(emptySettings(), { assessableProfits: 2000000 }));
    assert.equal(r.band1, 2000000);
    assert.equal(r.band2, 0);
    assert.equal(r.taxBeforeReduction, 165000);
  });

  it("connected entity not nominated: whole profit at 16.5%", () => {
    const r = compute(demoStandard());
    assert.equal(r.twoTier, false);
    assert.equal(r.taxBeforeReduction, 132000);
    assert.equal(r.finalTax, 129000);
    assert.equal(r.twoTierSaving, 0);
    assert.equal(r.provisionalTax, 132000);
    assert.ok(r.warnings.includes("standardRate"));
  });
});

describe("unincorporated two-tier", () => {
  it("$400,000 sole prop → 7.5% = $30,000; waiver $3,000", () => {
    const r = compute({
      yearOfAssessment: "2025/26",
      entity: "unincorporated",
      twoTier: true,
      assessableProfits: 400000,
    });
    assert.equal(r.lowRate, UNC_LOW);
    assert.equal(r.highRate, UNC_HIGH);
    assert.equal(r.taxBeforeReduction, 30000);
    assert.equal(r.finalTax, 27000);
    assert.equal(r.standardTax, 60000);
    assert.equal(r.twoTierSaving, 30000);
    assert.ok(r.warnings.includes("notPersonalAssessment"));
  });

  it("unincorporated over $2m: remainder at 15%", () => {
    const r = compute({
      entity: "unincorporated",
      twoTier: true,
      assessableProfits: 2500000,
    });
    assert.equal(r.band1, 2000000);
    assert.equal(r.band2, 500000);
    assert.equal(r.taxBeforeReduction, 225000);
  });
});

describe("waiver years and provisional tax", () => {
  it("2024/25 waiver cap is $1,500; 2026/27 is $0", () => {
    assert.equal(reductionCapFor("2024/25"), 1500);
    assert.equal(reductionCapFor("2025/26"), 3000);
    assert.equal(reductionCapFor("2026/27"), 0);
    assert.equal(nextYearOfAssessment("2025/26"), "2026/27");
  });

  it("2024/25 SME corp waiver is $1,500", () => {
    const r = compute(Object.assign(demoSmeCorp(), { yearOfAssessment: "2024/25" }));
    assert.equal(r.reduction, 1500);
    assert.equal(r.finalTax, 64500);
    assert.equal(r.provisionalTax, 66000);
  });

  it("2026/27 has no waiver; provisional still excludes any later waiver", () => {
    const r = compute(Object.assign(demoSmeCorp(), { yearOfAssessment: "2026/27" }));
    assert.equal(r.reduction, 0);
    assert.equal(r.finalTax, 66000);
    assert.equal(r.provisionalTax, 66000);
    assert.ok(r.warnings.includes("noReduction2027"));
  });

  it("provisional tax never applies the one-off waiver", () => {
    const current = taxOn(800000, "corporation", true, "2025/26", true);
    const prov = taxOn(800000, "corporation", true, "2026/27", false);
    assert.equal(current.reduction, 3000);
    assert.equal(prov.reduction, 0);
    assert.equal(prov.finalTax, 66000);
  });
});

describe("loss brought forward and holdover", () => {
  it("loss of $200,000 against $800,000 nets $600,000", () => {
    const r = compute(Object.assign(emptySettings(), { lossBroughtForward: 200000 }));
    assert.equal(r.netProfits, 600000);
    assert.equal(r.taxBeforeReduction, 49500);
    assert.equal(r.unusedLoss, 0);
    assert.ok(r.warnings.includes("lossUsed"));
  });

  it("loss larger than profits carries the balance forward", () => {
    const r = compute(
      Object.assign(emptySettings(), {
        assessableProfits: 100000,
        lossBroughtForward: 150000,
      })
    );
    assert.equal(r.netProfits, 0);
    assert.equal(r.finalTax, 0);
    assert.equal(r.provisionalTax, 0);
    assert.equal(r.unusedLoss, 50000);
    assert.ok(r.warnings.includes("lossCarry"));
  });

  it("holdover when estimated next-year profits are under 90%", () => {
    const r = compute(
      Object.assign(emptySettings(), { expectedNextProfits: 700000 })
    );
    assert.equal(r.holdoverThreshold, 720000);
    assert.equal(r.holdoverLikely, true);
    assert.ok(r.warnings.includes("holdoverLikely"));
  });

  it("no holdover flag when expected next-year profits are omitted", () => {
    const r = compute(emptySettings());
    assert.equal(r.holdoverLikely, false);
    assert.equal(r.warnings.includes("holdoverLikely"), false);
  });
});

describe("validation", () => {
  it("rejects negative profits and negative loss", () => {
    const neg = compute(Object.assign(emptySettings(), { assessableProfits: -1 }));
    assert.equal(neg.ok, false);
    assert.ok(neg.warnings.includes("negProfits"));

    const loss = compute(Object.assign(emptySettings(), { lossBroughtForward: -10 }));
    assert.equal(loss.ok, false);
    assert.ok(loss.warnings.includes("negLoss"));
  });

  it("zero profits is a valid $0 year", () => {
    const r = compute(Object.assign(emptySettings(), { assessableProfits: 0 }));
    assert.equal(r.ok, true);
    assert.equal(r.finalTax, 0);
    assert.ok(r.warnings.includes("zeroProfits"));
  });
});

describe("formatting", () => {
  it("formats HKD with grouping and percents without trailing zeros", () => {
    assert.equal(formatMoney(63000, 2), "HK$63,000.00");
    assert.equal(formatMoney(2000000, 0), "HK$2,000,000");
    assert.equal(formatPct(0.0825), "8.25%");
    assert.equal(formatPct(0.15), "15%");
  });
});

describe("page constraints", () => {
  it("has the AdSense account meta and no ad script or ad unit", () => {
    const html = readFileSync(new URL("../docs/profits-tax/index.html", import.meta.url), "utf8");
    assert.match(html, /<meta name="google-adsense-account" content="ca-pub-4101065010696162">/);
    assert.doesNotMatch(html, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i);
    assert.match(html, /rel="canonical" href="https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/profits-tax\/"/);
    assert.match(html, /lang="zh-Hant-HK"/);
    assert.match(html, /href="\.\.\/privacy\/"/);
    assert.match(html, /ird\.gov\.hk/);
    assert.match(html, /gov\.hk/);
    const css = readFileSync(new URL("../docs/profits-tax/style.css", import.meta.url), "utf8");
    assert.match(css, /\[hidden\]\s*\{[\s\S]*?display:\s*none\s*!important/);
  });

  it("is linked from the hub, sitemap and about page", () => {
    const hub = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
    const sitemap = readFileSync(new URL("../docs/sitemap.xml", import.meta.url), "utf8");
    const about = readFileSync(new URL("../docs/about/index.html", import.meta.url), "utf8");
    assert.match(hub, /href="\.\/profits-tax\/"/);
    assert.match(hub, /利得稅/);
    assert.match(sitemap, /https:\/\/hk-sms-csv\.pages\.dev\/profits-tax\//);
    assert.match(sitemap, /https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/profits-tax\//);
    assert.match(about, /profits-tax\//);
  });
});
