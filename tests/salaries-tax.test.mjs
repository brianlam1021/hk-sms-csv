import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  MPF_CAP,
  STANDARD_HIGH,
  STANDARD_LOW,
  STANDARD_TIER,
  compute,
  demoIrdGuide,
  demoMarriedChild,
  demoStandardRate,
  demoTypical,
  emptySettings,
  formatMoney,
  formatPct,
  progressiveTax,
  standardTaxOn,
  yearTable,
} from "../docs/salaries-tax/salaries.js";

describe("IRD guide worked example 2025/26", () => {
  it("$240,000 income, $9,000 MPF, basic allowance → $940 after waiver", () => {
    const r = compute(demoIrdGuide());
    assert.equal(r.ok, true);
    assert.equal(r.yearOfAssessment, "2025/26");
    assert.equal(r.income, 240000);
    assert.equal(r.mpf, 9000);
    assert.equal(r.netIncome, 231000);
    assert.equal(r.allowances.personal, 132000);
    assert.equal(r.allowances.total, 132000);
    assert.equal(r.netChargeableIncome, 99000);
    assert.equal(r.progressiveTax, 3940);
    assert.equal(r.standardTax, 34650);
    assert.equal(r.basis, "progressive");
    assert.equal(r.taxBeforeReduction, 3940);
    assert.equal(r.reductionCap, 3000);
    assert.equal(r.reduction, 3000);
    assert.equal(r.finalTax, 940);
  });
});

describe("typical employee and married + child", () => {
  it("$30,000 × 12 with MPF cap: NCI $210,000, tax $14,700 after waiver", () => {
    const r = compute(demoTypical());
    assert.equal(r.income, 360000);
    assert.equal(r.mpf, 18000);
    assert.equal(r.netIncome, 342000);
    assert.equal(r.netChargeableIncome, 210000);
    assert.equal(r.progressiveTax, 17700);
    assert.equal(r.standardTax, 51300);
    assert.equal(r.basis, "progressive");
    assert.equal(r.reduction, 3000);
    assert.equal(r.finalTax, 14700);
  });

  it("married person’s allowance replaces basic; 1 child $130,000", () => {
    const r = compute(demoMarriedChild());
    assert.equal(r.allowances.married, true);
    assert.equal(r.allowances.personal, 264000);
    assert.equal(r.allowances.child, 130000);
    assert.equal(r.allowances.total, 394000);
    assert.equal(r.netIncome, 582000);
    assert.equal(r.netChargeableIncome, 188000);
    assert.equal(r.progressiveTax, 14320);
    assert.equal(r.basis, "progressive");
    assert.equal(r.finalTax, 11320);
    assert.ok(r.warnings.includes("marriedReplacesBasic"));
  });
});

describe("progressive vs two-tiered standard rates", () => {
  it("high income uses standard rate when it is lower", () => {
    const r = compute(demoStandardRate());
    assert.equal(r.netIncome, 2482000);
    assert.equal(r.netChargeableIncome, 2350000);
    assert.equal(r.progressiveTax, 381500);
    assert.equal(r.standardTax, 372300);
    assert.equal(r.basis, "standard");
    assert.equal(r.taxBeforeReduction, 372300);
    assert.equal(r.reduction, 3000);
    assert.equal(r.finalTax, 369300);
    assert.ok(r.warnings.includes("usedStandard"));
  });

  it("net income over $5,000,000: first $5m at 15%, remainder at 16%", () => {
    const std = standardTaxOn(6000000);
    assert.equal(std.band1, STANDARD_TIER);
    assert.equal(std.band2, 1000000);
    assert.equal(std.tax, moneyish(STANDARD_TIER * STANDARD_LOW + 1000000 * STANDARD_HIGH));

    const r = compute(
      Object.assign(emptySettings(), { income: 6018000, mpf: 18000 })
    );
    assert.equal(r.netIncome, 6000000);
    assert.equal(r.standardTax, 910000);
    assert.equal(r.basis, "standard");
    assert.equal(r.finalTax, 907000);
  });

  it("progressive bands match GovHK table: $200,000 NCI → $16,000", () => {
    const p = progressiveTax(200000);
    assert.equal(p.tax, 16000);
    assert.equal(p.bands.length, 4);
    const top = progressiveTax(317000);
    assert.equal(top.tax, 35890);
  });
});

describe("allowances, MPF cap, waiver years", () => {
  it("dependent parent 60+ living with gets $50,000 + $50,000 additional", () => {
    const r = compute(
      Object.assign(emptySettings(), { parents60Live: 1, mpf: 0, income: 400000 })
    );
    assert.equal(r.allowances.parent, 100000);
    assert.equal(r.allowances.total, 232000);
  });

  it("dependent parent 55–59 is $25,000; living with adds another $25,000", () => {
    const r = compute(
      Object.assign(emptySettings(), { parents55: 1, parents55Live: 1, mpf: 0, income: 400000 })
    );
    assert.equal(r.allowances.parent, 75000);
  });

  it("2026/27 uses raised allowances and no waiver", () => {
    const t = yearTable("2026/27");
    assert.equal(t.basic, 145000);
    assert.equal(t.married, 290000);
    assert.equal(t.child, 140000);
    assert.equal(t.parent60, 55000);
    assert.equal(t.reductionCap, 0);
    const r = compute(Object.assign(demoTypical(), { yearOfAssessment: "2026/27" }));
    assert.equal(r.allowances.personal, 145000);
    assert.equal(r.netChargeableIncome, 197000);
    assert.equal(r.reduction, 0);
    assert.equal(r.finalTax, r.taxBeforeReduction);
    assert.ok(r.warnings.includes("noReduction2027"));
  });

  it("2024/25 waiver cap is $1,500; MPF above $18,000 is capped", () => {
    const y = compute(Object.assign(demoIrdGuide(), { yearOfAssessment: "2024/25" }));
    assert.equal(y.reduction, 1500);
    assert.equal(y.finalTax, 2440);

    const r = compute(Object.assign(emptySettings(), { mpf: 24000 }));
    assert.equal(r.mpf, MPF_CAP);
    assert.equal(r.mpfEntered, 24000);
    assert.ok(r.warnings.includes("mpfCapped"));
  });

  it("children are capped at 9", () => {
    const r = compute(Object.assign(emptySettings(), { children: 12, income: 2000000 }));
    assert.equal(r.allowances.children, 9);
    assert.equal(r.allowances.child, 9 * 130000);
    assert.ok(r.warnings.includes("childrenCapped"));
  });
});

describe("validation", () => {
  it("rejects negative income and negative MPF", () => {
    const neg = compute(Object.assign(emptySettings(), { income: -1 }));
    assert.equal(neg.ok, false);
    assert.ok(neg.warnings.includes("negIncome"));

    const mpf = compute(Object.assign(emptySettings(), { mpf: -10 }));
    assert.equal(mpf.ok, false);
    assert.ok(mpf.warnings.includes("negMpf"));
  });

  it("zero income is a valid $0 year", () => {
    const r = compute(Object.assign(emptySettings(), { income: 0, mpf: 0 }));
    assert.equal(r.ok, true);
    assert.equal(r.finalTax, 0);
    assert.ok(r.warnings.includes("zeroIncome"));
  });

  it("always flags that this is not a tax return", () => {
    const r = compute(emptySettings());
    assert.ok(r.warnings.includes("notTaxReturn"));
    assert.ok(r.warnings.includes("notPersonalAssessment"));
    assert.ok(r.warnings.includes("notJointAssessment"));
  });
});

describe("formatting", () => {
  it("formats HKD with grouping and percents without trailing zeros", () => {
    assert.equal(formatMoney(14700, 2), "HK$14,700.00");
    assert.equal(formatMoney(132000, 0), "HK$132,000");
    assert.equal(formatPct(0.02), "2%");
    assert.equal(formatPct(0.15), "15%");
    assert.equal(formatPct(0.0825), "8.25%");
  });
});

describe("page constraints", () => {
  it("has the AdSense account meta and no ad script or ad unit", () => {
    const html = readFileSync(new URL("../docs/salaries-tax/index.html", import.meta.url), "utf8");
    assert.match(html, /<meta name="google-adsense-account" content="ca-pub-4101065010696162">/);
    assert.doesNotMatch(html, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i);
    assert.match(html, /rel="canonical" href="https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/salaries-tax\/"/);
    assert.match(html, /lang="zh-Hant-HK"/);
    assert.match(html, /href="\.\.\/privacy\/"/);
    assert.match(html, /ird\.gov\.hk/);
    assert.match(html, /gov\.hk/);
    assert.match(html, /只供估算/);
    assert.match(html, /報稅表/);
    const css = readFileSync(new URL("../docs/salaries-tax/style.css", import.meta.url), "utf8");
    assert.match(css, /\[hidden\]\s*\{[\s\S]*?display:\s*none\s*!important/);
    assert.match(css, /@media print/);
    const app = readFileSync(new URL("../docs/salaries-tax/app.js", import.meta.url), "utf8");
    assert.doesNotMatch(app, /STORAGE_KEY/);
    assert.doesNotMatch(app, /localStorage\.setItem\([^,]+,\s*JSON\.stringify/);
  });

  it("is linked from the hub, sitemap and about page", () => {
    const hub = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
    const sitemap = readFileSync(new URL("../docs/sitemap.xml", import.meta.url), "utf8");
    const about = readFileSync(new URL("../docs/about/index.html", import.meta.url), "utf8");
    assert.match(hub, /href="\.\/salaries-tax\/"/);
    assert.match(hub, /薪俸稅/);
    assert.match(sitemap, /https:\/\/hk-sms-csv\.pages\.dev\/salaries-tax\//);
    assert.match(sitemap, /https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/salaries-tax\//);
    assert.match(about, /salaries-tax\//);
  });

  it("does not store income in localStorage (engine has no storage key)", () => {
    const js = readFileSync(new URL("../docs/salaries-tax/salaries.js", import.meta.url), "utf8");
    assert.doesNotMatch(js, /localStorage/);
  });
});

function moneyish(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
