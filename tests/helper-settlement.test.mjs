import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  FOOD_MIN,
  MEAL_TRAVEL_DEFAULT,
  MAW_NEW,
  buildWarnings,
  computeSettlement,
  demoForm,
  emptyForm,
  formatHKD,
  inclusiveDays,
  mealTravelAmount,
  reasonLabel,
  suggestLeavePay,
  toChineseUpper,
  toEnglishWords,
} from "../docs/helper-settlement/settlement.js";

describe("defaults and sourced rates", () => {
  it("uses LD-published food allowance and SEC journey allowance as defaults", () => {
    const form = emptyForm();
    assert.equal(form.foodAllowance, FOOD_MIN);
    assert.equal(FOOD_MIN, 1236);
    assert.equal(form.journeyRate, MEAL_TRAVEL_DEFAULT);
    assert.equal(MEAL_TRAVEL_DEFAULT, 100);
    assert.equal(form.wage, MAW_NEW);
    assert.equal(form.payMethod, "bank");
    assert.equal(form.reason, "expiry");
    assert.equal(form.airfareMode, "ticket");
  });

  it("demo totals unpaid wages + unused leave estimate + 2-day journey allowance", () => {
    const form = demoForm();
    const leave = suggestLeavePay(MAW_NEW, 7);
    assert.equal(leave, Math.round(((MAW_NEW / 26) * 7) * 100) / 100);
    const result = computeSettlement(form);
    assert.equal(result.unpaid, MAW_NEW);
    assert.equal(result.leaveDays, 7);
    assert.equal(result.mealTravel, 200);
    assert.equal(result.airfareProvided, true);
    assert.equal(result.total, MAW_NEW + leave + 200);
  });
});

describe("computeSettlement", () => {
  it("adds meal-and-travel as days × rate and treats ticket airfare as non-cash", () => {
    const form = Object.assign(emptyForm(), {
      journeyDays: 2.5,
      journeyRate: 100,
      airfareMode: "ticket",
      airfareAmount: 3800,
    });
    const result = computeSettlement(form);
    assert.equal(mealTravelAmount(2.5, 100), 250);
    assert.equal(result.mealTravel, 250);
    assert.equal(result.airfare, 0);
    assert.equal(result.airfareProvided, true);
    assert.equal(result.total, 250);
  });

  it("includes cash airfare and subtracts deductions", () => {
    const form = Object.assign(emptyForm(), {
      unpaidAmount: 5220,
      leavePay: 1400,
      lieuAmount: 5220,
      airfareMode: "cash",
      airfareAmount: 1800,
      journeyDays: 1,
      journeyRate: 100,
      extras: [
        { id: "a", kind: "add", desc: "Reimbursement", amount: 50 },
        { id: "b", kind: "deduct", desc: "Advance", amount: 200 },
      ],
    });
    const result = computeSettlement(form);
    assert.equal(result.total, 5220 + 1400 + 5220 + 1800 + 100 + 50 - 200);
    const deduct = result.lines.find((line) => line.key === "extra-b");
    assert.equal(deduct.sign, -1);
    assert.equal(deduct.amount, 200);
  });

  it("omits food-due when meals are provided", () => {
    const form = Object.assign(emptyForm(), {
      foodMode: "provided",
      foodDue: 1236,
      unpaidAmount: 100,
      journeyDays: 0,
    });
    const result = computeSettlement(form);
    assert.equal(result.foodDue, 0);
    assert.equal(
      result.lines.some((line) => line.key === "food"),
      false
    );
    assert.equal(result.total, 100);
  });

  it("includes unpaid food allowance only in allowance mode", () => {
    const form = Object.assign(emptyForm(), {
      foodMode: "allowance",
      foodDue: 1236,
      journeyDays: 0,
    });
    const result = computeSettlement(form);
    assert.equal(result.foodDue, 1236);
    assert.equal(result.total, 1236);
  });
});

describe("warnings stay non-calculating for SP/LSP", () => {
  it("flags a 2-year contract without inventing an SP/LSP amount", () => {
    const form = Object.assign(emptyForm(), {
      contractStart: "2024-11-01",
      contractEnd: "2026-10-31",
    });
    assert.ok(inclusiveDays(form.contractStart, form.contractEnd) >= 730);
    const warns = buildWarnings(form);
    assert.ok(warns.includes("checkSpLsp"));
    const result = computeSettlement(form);
    assert.equal(
      result.lines.some((line) => /SP|LSP|遣散|長期服務/.test(line.labelEn + line.labelZh)),
      false
    );
  });

  it("flags lieu and cash-airfare with zero amounts", () => {
    const warns = buildWarnings(
      Object.assign(emptyForm(), {
        reason: "lieu",
        lieuAmount: 0,
        airfareMode: "cash",
        airfareAmount: 0,
      })
    );
    assert.ok(warns.includes("lieuMissing"));
    assert.ok(warns.includes("airfareMissing"));
  });
});

describe("formatting", () => {
  it("formats HKD and amount-in-words", () => {
    assert.equal(formatHKD(5220), "HK$5,220.00");
    assert.equal(toChineseUpper(5220), "伍仟貳佰貳拾元正");
    assert.match(toEnglishWords(5220), /Five Thousand Two Hundred Twenty Hong Kong Dollars Only/);
    assert.equal(reasonLabel("employer_notice").en, "Terminated by employer’s notice");
  });
});

describe("page constraints", () => {
  it("has the AdSense account meta and no ad script or ad unit", () => {
    const html = readFileSync(new URL("../docs/helper-settlement/index.html", import.meta.url), "utf8");
    assert.match(html, /<meta name="google-adsense-account" content="ca-pub-4101065010696162">/);
    assert.doesNotMatch(html, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i);
    assert.match(html, /rel="canonical" href="https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/helper-settlement\/"/);
    assert.match(html, /lang="zh-Hant-HK"/);
    assert.match(html, /外傭合約終止結算單產生器/);
    assert.match(html, /FDH Contract Termination Settlement Generator/);
    assert.match(html, /fdh\.labour\.gov\.hk/);
    assert.doesNotMatch(html, /四字紙皮|紅白藍/);
  });

  it("is linked from the hub, sitemap and about page", () => {
    const hub = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
    const sitemap = readFileSync(new URL("../docs/sitemap.xml", import.meta.url), "utf8");
    const about = readFileSync(new URL("../docs/about/index.html", import.meta.url), "utf8");
    assert.match(hub, /href="\.\/helper-settlement\/"/);
    assert.match(hub, /外傭合約終止結算/);
    assert.match(sitemap, /https:\/\/hk-sms-csv\.pages\.dev\/helper-settlement\//);
    assert.match(sitemap, /https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/helper-settlement\//);
    assert.match(about, /helper-settlement\//);
  });
});
