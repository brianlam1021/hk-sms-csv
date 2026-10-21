import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  MONTHLY_WAGE_CEILING,
  TOTAL_CAP,
  TRANSITION_YMD,
  YEAR_UNIT_CAP,
  checkEligibility,
  compute,
  demoCap,
  demoMonthlySp,
  demoStraddle,
  emptySettings,
  formatMoney,
  parseYmd,
  yearUnit,
  yearsBetween,
} from "../docs/sp-lsp/sp-lsp.js";

describe("constants (LD Cap.57 / abolition FAQ)", () => {
  it("uses $22,500 monthly ceiling, $15,000 year unit, $390,000 total, 1 May 2025 transition", () => {
    assert.equal(MONTHLY_WAGE_CEILING, 22500);
    assert.equal(YEAR_UNIT_CAP, 15000);
    assert.equal(TOTAL_CAP, 390000);
    assert.equal(TRANSITION_YMD, "2025-05-01");
  });
});

describe("yearUnit", () => {
  it("monthly: wage × 2/3, capped at $15,000", () => {
    assert.equal(yearUnit(15000, "monthly"), 10000);
    assert.equal(yearUnit(18000, "monthly"), 12000);
    assert.equal(yearUnit(22500, "monthly"), 15000);
    assert.equal(yearUnit(30000, "monthly"), 15000);
  });

  it("daily: 18-day sum capped at $15,000", () => {
    assert.equal(yearUnit(12000, "daily"), 12000);
    assert.equal(yearUnit(18000, "daily"), 15000);
  });
});

describe("yearsBetween (pro rata)", () => {
  it("LD FAQ span: 2021-05-01 → 2025-05-01 = 4 years; → 2028-05-01 post = 3 years", () => {
    const start = parseYmd("2021-05-01");
    const transition = parseYmd("2025-05-01");
    const end = parseYmd("2028-05-01");
    assert.equal(yearsBetween(start, transition), 4);
    assert.equal(yearsBetween(transition, end), 3);
  });
});

describe("eligibility", () => {
  it("SP needs ≥24 months continuous + redundancy/layoff reason", () => {
    const short = checkEligibility({ entitlement: "sp", spReason: "redundancy" }, 1.5);
    assert.equal(short.eligible, false);
    assert.ok(short.failReasons.includes("spShortService"));

    const ok = checkEligibility({ entitlement: "sp", spReason: "layoff" }, 2);
    assert.equal(ok.eligible, true);
  });

  it("LSP needs ≥5 years + non-redundancy qualifying reason", () => {
    const short = checkEligibility({ entitlement: "lsp", lspReason: "dismissal" }, 4.9);
    assert.equal(short.eligible, false);
    assert.ok(short.failReasons.includes("lspShortService"));

    const ok = checkEligibility({ entitlement: "lsp", lspReason: "age65" }, 5);
    assert.equal(ok.eligible, true);
  });
});

describe("LD FAQ monthly straddle example", () => {
  it("4 yrs pre @ $15,000 + 3 yrs post @ $18,000 = $76,000", () => {
    const r = compute(demoStraddle());
    assert.equal(r.ok, true);
    assert.equal(r.mode, "straddle");
    assert.equal(r.yearsPre, 4);
    assert.equal(r.yearsPost, 3);
    assert.equal(r.unitPre, 10000);
    assert.equal(r.unitTerm, 12000);
    assert.equal(r.preAmount, 40000);
    assert.equal(r.postAmount, 36000);
    assert.equal(r.total, 76000);
    assert.equal(r.capApplied, false);
  });
});

describe("LD FAQ total-cap straddle (excess from post)", () => {
  it("20 yrs pre + 10 yrs post → pre $300,000, post reduced to $90,000", () => {
    const r = compute(demoCap());
    assert.equal(r.ok, true);
    assert.equal(r.mode, "straddle");
    assert.equal(r.yearsPre, 20);
    assert.equal(r.yearsPost, 10);
    assert.equal(r.preRaw, 300000);
    assert.equal(r.postRaw, 150000);
    assert.equal(r.totalBeforeCap, 450000);
    assert.equal(r.preAmount, 300000);
    assert.equal(r.postAmount, 90000);
    assert.equal(r.total, 390000);
    assert.equal(r.excessDeducted, 60000);
    assert.ok(r.warnings.includes("totalCapped"));
  });
});

describe("single-period monthly SP (post-transition hire)", () => {
  it("3 years @ $21,000/month → unit $14,000 × 3 = $42,000", () => {
    const r = compute(demoMonthlySp());
    assert.equal(r.ok, true);
    assert.equal(r.mode, "single");
    assert.equal(r.straddles, false);
    assert.equal(r.yearsTotal, 3);
    assert.equal(r.unitTerm, 14000);
    assert.equal(r.total, 42000);
    assert.equal(r.entitlement, "sp");
  });
});

describe("12-month average election and daily-rated", () => {
  it("useAverage flags a note but uses the entered wage figure", () => {
    const r = compute(Object.assign(emptySettings(), { useAverage: true, entitlement: "lsp" }));
    assert.ok(r.warnings.includes("avgNote"));
    assert.equal(r.ok, true);
  });

  it("daily-rated: 18-day sum × years, capped at $15,000", () => {
    const r = compute({
      entitlement: "sp",
      wageType: "daily",
      startDate: "2025-06-01",
      endDate: "2028-06-01",
      eighteenDays: 18000,
      eighteenDaysPre: 0,
      spReason: "redundancy",
      lspReason: "dismissal",
      useAverage: false,
      monthlyWage: 0,
      monthlyWagePre: 0,
    });
    assert.equal(r.ok, true);
    assert.equal(r.unitTerm, 15000);
    assert.equal(r.yearsTotal, 3);
    assert.equal(r.total, 45000);
    assert.ok(r.warnings.includes("eighteenCapped"));
  });
});

describe("ineligible cases do not invent a number", () => {
  it("SP with under 24 months → ok false, total 0", () => {
    const r = compute({
      entitlement: "sp",
      wageType: "monthly",
      startDate: "2026-01-01",
      endDate: "2026-06-01",
      monthlyWage: 20000,
      monthlyWagePre: 20000,
      spReason: "redundancy",
      lspReason: "dismissal",
      useAverage: false,
      eighteenDays: 0,
      eighteenDaysPre: 0,
    });
    assert.equal(r.ok, false);
    assert.equal(r.total, 0);
    assert.ok(r.warnings.includes("spShortService"));
  });

  it("LSP with under 5 years → ok false", () => {
    const r = compute({
      entitlement: "lsp",
      wageType: "monthly",
      startDate: "2022-01-01",
      endDate: "2025-06-01",
      monthlyWage: 20000,
      monthlyWagePre: 18000,
      spReason: "redundancy",
      lspReason: "dismissal",
      useAverage: false,
      eighteenDays: 0,
      eighteenDaysPre: 0,
    });
    assert.equal(r.ok, false);
    assert.equal(r.total, 0);
    assert.ok(r.warnings.includes("lspShortService"));
  });
});

describe("formatting", () => {
  it("formats HKD with grouping", () => {
    assert.equal(formatMoney(390000, 2), "HK$390,000.00");
    assert.equal(formatMoney(15000, 0), "HK$15,000");
  });
});

describe("page constraints", () => {
  it("has AdSense account meta, canonical, zh-Hant-HK, no wage localStorage", () => {
    const html = readFileSync(new URL("../docs/sp-lsp/index.html", import.meta.url), "utf8");
    assert.match(html, /<meta name="google-adsense-account" content="ca-pub-4101065010696162">/);
    assert.doesNotMatch(html, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i);
    assert.match(html, /rel="canonical" href="https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/sp-lsp\/"/);
    assert.match(html, /lang="zh-Hant-HK"/);
    assert.match(html, /href="\.\.\/privacy\/"/);
    assert.match(html, /labour\.gov\.hk|op\.labour\.gov\.hk/);

    const app = readFileSync(new URL("../docs/sp-lsp/app.js", import.meta.url), "utf8");
    // Language preference may use localStorage; wage figures / drafts must not.
    assert.doesNotMatch(app, /STORAGE_KEY/);
    assert.doesNotMatch(app, /localStorage\.(setItem|getItem)\([^)]*(wage|monthly|settings|draft)/i);
    assert.match(app, /hk-sms-csv-lang/);
    const langOnly = [...app.matchAll(/localStorage\.(setItem|getItem)\(([^)]+)\)/g)].map(
      (m) => m[2]
    );
    assert.ok(langOnly.length >= 1);
    for (const args of langOnly) {
      assert.match(args, /LANG_KEY|hk-sms-csv-lang/);
    }
  });

  it("is linked from the hub, sitemap and about page", () => {
    const hub = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
    const sitemap = readFileSync(new URL("../docs/sitemap.xml", import.meta.url), "utf8");
    const about = readFileSync(new URL("../docs/about/index.html", import.meta.url), "utf8");
    assert.match(hub, /href="\.\/sp-lsp\/"/);
    assert.match(hub, /遣散費|長期服務金/);
    assert.match(sitemap, /https:\/\/hk-sms-csv\.pages\.dev\/sp-lsp\//);
    assert.match(sitemap, /https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/sp-lsp\//);
    assert.match(about, /sp-lsp\//);
  });
});
