import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  AS_OF,
  DAYS_PER_MONTH_PROXY,
  calendarBounds,
  compute,
  daysInclusive,
  demoDismissedHalfYear,
  demoFullYear,
  demoProbationShort,
  demoResignedHalfYear,
  formatHkd,
  hasCalendarMonths,
  lunarBounds,
  summaryToCsv,
} from "../docs/year-end-pay/year-end-pay.js";

describe("period bounds", () => {
  it("calendar 2026 is 365 days; 2024 is 366", () => {
    const y2026 = calendarBounds(2026);
    const y2024 = calendarBounds(2024);
    assert.equal(daysInclusive(y2026.start, y2026.end), 365);
    assert.equal(daysInclusive(y2024.start, y2024.end), 366);
  });

  it("lunar 2026 丙午 is 2026-02-17 to 2027-02-05 (354 days)", () => {
    const lunar = lunarBounds(2026);
    assert.equal(lunar.start, "2026-02-17");
    assert.equal(lunar.end, "2027-02-05");
    assert.equal(daysInclusive(lunar.start, lunar.end), 354);
  });

  it("lunar 2025 乙巳 (leap lunar year) is 384 days", () => {
    const lunar = lunarBounds(2025);
    assert.equal(lunar.start, "2025-01-29");
    assert.equal(lunar.end, "2026-02-16");
    assert.equal(daysInclusive(lunar.start, lunar.end), 384);
  });
});

describe("calendar months (3-month test)", () => {
  it("1 Jan–31 Mar is exactly 3 months; 1 Jan–30 Mar is not", () => {
    assert.equal(hasCalendarMonths("2026-01-01", "2026-03-31", 3), true);
    assert.equal(hasCalendarMonths("2026-01-01", "2026-03-30", 3), false);
  });

  it("15 Jan–14 Apr is 3 months", () => {
    assert.equal(hasCalendarMonths("2026-01-15", "2026-04-14", 3), true);
    assert.equal(hasCalendarMonths("2026-01-15", "2026-04-13", 3), false);
  });
});

describe("sanity: HK$20,000, ~6/12 calendar year", () => {
  it("employer dismissal → eligible, about HK$10,000 (181/365)", () => {
    const r = compute(demoDismissedHalfYear());
    assert.equal(r.eligible, true);
    assert.equal(r.payable, true);
    assert.equal(r.reason, "yes_prorata_dismissed");
    assert.equal(r.periodDays, 365);
    assert.equal(r.employedDays, 181);
    assert.equal(r.fullAmount, 20000);
    assert.equal(r.amount, 9917.81);
    assert.ok(r.amount > 9900 && r.amount < 10100);
    assert.match(r.formula, /181/);
    assert.match(r.formula, /365/);
  });

  it("resignation → not entitled, nil / N/A unless contract toggle", () => {
    const r = compute(demoResignedHalfYear());
    assert.equal(r.eligible, false);
    assert.equal(r.payable, false);
    assert.equal(r.reason, "no_resigned");
    assert.equal(r.amount, 0);
    assert.ok(r.warnings.includes("resignedNotEntitled"));
  });

  it("resignation + contract grants pro-rata → same ~HK$10,000", () => {
    const r = compute(
      Object.assign(demoResignedHalfYear(), { contractGrantResign: true }),
    );
    assert.equal(r.eligible, true);
    assert.equal(r.reason, "yes_prorata_resign_contract");
    assert.equal(r.amount, 9917.81);
    assert.ok(r.warnings.includes("contractBeatsStatute"));
  });

  it("days-only 182/365 dismissal is still about half", () => {
    const r = compute({
      amountMode: "fixed",
      amount: 20000,
      periodKind: "calendar",
      periodYear: 2026,
      serviceMode: "days",
      employedDays: 182,
      termination: "dismissed",
    });
    assert.equal(r.eligible, true);
    assert.equal(r.employedDays, 182);
    assert.equal(r.amount, 9972.6);
  });
});

describe("full period and ineligible endings", () => {
  it("still employed for the whole calendar year → full HK$20,000", () => {
    const r = compute(demoFullYear());
    assert.equal(r.eligible, true);
    assert.equal(r.completedWhole, true);
    assert.equal(r.amount, 20000);
    assert.equal(r.reason, "yes_full");
  });

  it("summary dismissal mid-period → not entitled", () => {
    const r = compute(
      Object.assign(demoDismissedHalfYear(), { termination: "summary" }),
    );
    assert.equal(r.eligible, false);
    assert.equal(r.amount, 0);
    assert.equal(r.reason, "no_summary");
  });

  it("still employed but only 2 months → not entitled", () => {
    const r = compute({
      amount: 20000,
      periodKind: "calendar",
      periodYear: 2026,
      serviceMode: "dates",
      empStart: "2026-11-01",
      empEnd: "2026-12-31",
      termination: "stillEmployed",
    });
    assert.equal(r.eligible, false);
    assert.equal(r.reason, "no_short_service");
    assert.equal(r.amount, 0);
  });

  it("unspecified amount uses one month’s average wages as the full sum", () => {
    const r = compute({
      amountMode: "average",
      amount: 18000,
      periodKind: "calendar",
      periodYear: 2026,
      serviceMode: "dates",
      empStart: "2026-01-01",
      empEnd: "2026-12-31",
      termination: "stillEmployed",
    });
    assert.equal(r.amountMode, "average");
    assert.equal(r.fullAmount, 18000);
    assert.equal(r.amount, 18000);
  });
});

describe("probation exclusion (LD / 1823)", () => {
  it("5 months with 3-month probation: not eligible, amount not estimated", () => {
    const r = compute(demoProbationShort());
    assert.equal(r.employedDays, 151);
    assert.ok(r.qualifyingDays < DAYS_PER_MONTH_PROXY);
    assert.equal(r.eligible, false);
    assert.equal(r.reason, "no_short_service");
    assert.equal(r.amount, 0);
    assert.ok(r.warnings.includes("probationExcludedForTest"));
  });

  it("6 months with 3-month probation: eligible; amount still uses all 181 days", () => {
    const r = compute(
      Object.assign(demoDismissedHalfYear(), {
        excludeProbation: true,
        probationMonths: 3,
      }),
    );
    assert.equal(r.eligible, true);
    assert.equal(r.employedDays, 181);
    assert.equal(r.excludedDays, 90);
    assert.equal(r.amount, 9917.81);
    assert.ok(r.warnings.includes("probationExcludedForTest"));
  });
});

describe("formatting and csv", () => {
  it("formats HKD", () => {
    assert.equal(formatHkd(9917.81), "HK$9,917.81");
    assert.equal(formatHkd(20000), "HK$20,000.00");
  });

  it("csv has a UTF-8 BOM and the estimate", () => {
    const csv = summaryToCsv(compute(demoDismissedHalfYear()), {
      item: "項目",
      amount: "內容",
      eligibility: "資格",
      yes: "合資格",
      no: "不合資格",
      reason: "理由",
      period: "酬金期",
      periodDays: "日數",
      employedDays: "受僱",
      qualifyingDays: "資格日",
      ratio: "比例",
      full: "全數",
      estimate: "估算",
      termination: "狀況",
      formula: "算式",
    });
    assert.equal(csv.charCodeAt(0), 0xfeff);
    assert.match(csv, /9917\.81/);
    assert.match(csv, /合資格/);
  });
});

describe("page constraints", () => {
  it("has the AdSense account meta and no ad script or ad unit", () => {
    const html = readFileSync(new URL("../docs/year-end-pay/index.html", import.meta.url), "utf8");
    assert.match(html, /<meta name="google-adsense-account" content="ca-pub-4101065010696162">/);
    assert.doesNotMatch(html, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i);
    assert.match(html, /rel="canonical" href="https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/year-end-pay\/"/);
    assert.match(html, /lang="zh-Hant-HK"/);
    assert.match(html, /href="\.\.\/privacy\/"/);
    assert.match(html, /labour\.gov\.hk/);
    assert.match(html, /ConciseGuide\/08\.pdf/);
    assert.match(html, /1823\.gov\.hk/);
    assert.match(html, /href="\.\.\/site\.css"/);
    const css = readFileSync(new URL("../docs/year-end-pay/style.css", import.meta.url), "utf8");
    assert.match(css, /\[hidden\]\s*\{[\s\S]*?display:\s*none\s*!important/);
  });

  it("is linked from the hub, sitemap and about page", () => {
    const hub = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
    const sitemap = readFileSync(new URL("../docs/sitemap.xml", import.meta.url), "utf8");
    const about = readFileSync(new URL("../docs/about/index.html", import.meta.url), "utf8");
    assert.match(hub, /href="\.\/year-end-pay\/"/);
    assert.match(hub, /年終酬金/);
    assert.match(sitemap, /https:\/\/hk-sms-csv\.pages\.dev\/year-end-pay\//);
    assert.match(sitemap, /https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/year-end-pay\//);
    assert.match(about, /year-end-pay\//);
    const rootSitemap = readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8");
    assert.match(rootSitemap, /https:\/\/hk-sms-csv\.pages\.dev\/year-end-pay\//);
    assert.match(rootSitemap, /https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/year-end-pay\//);
  });
});

describe("constants", () => {
  it("as-of date is 2026-10-23 and 3-month proxy is 90 days", () => {
    assert.equal(AS_OF, "2026-10-23");
    assert.equal(DAYS_PER_MONTH_PROXY, 90);
  });
});
