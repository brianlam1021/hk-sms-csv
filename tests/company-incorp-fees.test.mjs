import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  compute,
  demoElectronic2026,
  demoHardCopy2026,
  demoPriorYear,
  emptySettings,
  formatMoney,
  guaranteeIncorpFee,
  lookupIncorp,
} from "../docs/company-incorp-fees/fees.js";

describe("default first-year government total", () => {
  it("electronic private + 1-year BRC from 2026-04-01 → 1545 + 2350 = 3895", () => {
    const r = compute(demoElectronic2026());
    assert.equal(r.ok, true);
    assert.equal(r.cr.fee, 1545);
    assert.equal(r.cr.refundable, 1280);
    assert.equal(r.br.total, 2350);
    assert.equal(r.br.fee, 2200);
    assert.equal(r.br.levy, 150);
    assert.equal(r.atIncorporation, 3895);
    assert.equal(r.yearOne, 3895);
    assert.equal(r.nameChange, null);
    assert.equal(r.nar1, null);
  });

  it("emptySettings matches the default scenario", () => {
    const r = compute(emptySettings());
    assert.equal(r.atIncorporation, 3895);
    assert.equal(r.delivery, "electronic");
    assert.equal(r.companyType, "private");
  });

  it("hard-copy private + same BRC → 1720 + 2350 = 4070", () => {
    const r = compute(demoHardCopy2026());
    assert.equal(r.cr.fee, 1720);
    assert.equal(r.cr.refundable, 1425);
    assert.equal(r.br.total, 2350);
    assert.equal(r.atIncorporation, 4070);
  });

  it("submission on 2026-03-31 uses 2025/26 1-year BRC 2200 → 3745", () => {
    const r = compute(demoPriorYear());
    assert.equal(r.br.total, 2200);
    assert.equal(r.br.levy, 0);
    assert.equal(r.br.band.id, "2025-26");
    assert.equal(r.cr.fee, 1545);
    assert.equal(r.atIncorporation, 3745);
  });

  it("3-year BRC from 2026-04-01 → 1545 + 6170 = 7715", () => {
    const r = compute({
      companyType: "private",
      delivery: "electronic",
      submissionDate: "2026-04-01",
      brcTerm: "3",
    });
    assert.equal(r.br.total, 6170);
    assert.equal(r.atIncorporation, 7715);
  });
});

describe("company types and optional lines", () => {
  it("public and non-HK share the private incorporation fee", () => {
    assert.equal(lookupIncorp("public", "electronic").fee, 1545);
    assert.equal(lookupIncorp("nonHongKong", "hardCopy").fee, 1720);
    const pub = compute({ companyType: "public", submissionDate: "2026-04-01" });
    const nhk = compute({ companyType: "nonHongKong", submissionDate: "2026-04-01" });
    assert.equal(pub.atIncorporation, 3895);
    assert.equal(nhk.atIncorporation, 3895);
  });

  it("optional name change + NAR1: local private 3895 + 295 + 105", () => {
    const r = compute({
      companyType: "private",
      delivery: "electronic",
      submissionDate: "2026-04-01",
      brcTerm: "1",
      includeNameChange: true,
      includeNar1: true,
    });
    assert.equal(r.nameChange.fee, 295);
    assert.equal(r.nameChange.refundable, 55);
    assert.equal(r.nar1.fee, 105);
    assert.equal(r.atIncorporation, 3895 + 295);
    assert.equal(r.yearOne, 3895 + 295 + 105);
    assert.equal(r.yearOneIncludesNar1, true);
  });

  it("public NAR1 on-time 140; non-HK name alteration 1425 and NAR1 180", () => {
    const pub = compute({
      companyType: "public",
      submissionDate: "2026-04-01",
      includeNar1: true,
    });
    assert.equal(pub.nar1.fee, 140);
    assert.equal(pub.yearOne, 3895 + 140);

    const nhk = compute({
      companyType: "nonHongKong",
      submissionDate: "2026-04-01",
      includeNameChange: true,
      includeNar1: true,
    });
    assert.equal(nhk.nameChange.fee, 1425);
    assert.equal(nhk.nameChange.refundable, 0);
    assert.equal(nhk.nar1.fee, 180);
    assert.equal(nhk.atIncorporation, 3895 + 1425);
    assert.equal(nhk.yearOne, 3895 + 1425 + 180);
  });
});

describe("guarantee-company incorporation bands", () => {
  it("≤25 electronic 155 / hard copy 170", () => {
    assert.equal(guaranteeIncorpFee(25, "electronic").fee, 155);
    assert.equal(guaranteeIncorpFee(1, "hardCopy").fee, 170);
    const r = compute({
      companyType: "guarantee",
      delivery: "electronic",
      memberCount: 25,
      submissionDate: "2026-04-01",
    });
    assert.equal(r.cr.fee, 155);
    assert.equal(r.atIncorporation, 155 + 2350);
  });

  it("26–100 electronic 305 / hard copy 340", () => {
    assert.equal(guaranteeIncorpFee(26, "electronic").fee, 305);
    assert.equal(guaranteeIncorpFee(100, "hardCopy").fee, 340);
  });

  it("101 members electronic 305+18=323; hard copy 340+20=360", () => {
    assert.equal(guaranteeIncorpFee(101, "electronic").fee, 323);
    assert.equal(guaranteeIncorpFee(101, "hardCopy").fee, 360);
    assert.equal(guaranteeIncorpFee(150, "electronic").fee, 323);
    assert.equal(guaranteeIncorpFee(151, "electronic").fee, 341);
  });

  it("electronic cap 925 and hard-copy cap 1025", () => {
    assert.equal(guaranteeIncorpFee(2000, "electronic").fee, 925);
    assert.equal(guaranteeIncorpFee(2000, "hardCopy").fee, 1025);
    assert.equal(guaranteeIncorpFee(1800, "electronic").fee, 917);
    assert.ok(guaranteeIncorpFee(2000, "electronic").capped);
  });

  it("invalid member count warns", () => {
    const r = compute({
      companyType: "guarantee",
      memberCount: 0,
      submissionDate: "2026-04-01",
    });
    assert.equal(r.ok, false);
    assert.ok(r.warnings.includes("badMembers"));
  });
});

describe("helpers + page wiring", () => {
  it("formatMoney", () => {
    assert.equal(formatMoney(3895), "HK$3,895");
    assert.equal(formatMoney(1545), "HK$1,545");
  });

  it("index.html has AdSense meta, canonical, official links, and disclaimer", () => {
    const html = readFileSync(
      new URL("../docs/company-incorp-fees/index.html", import.meta.url),
      "utf8"
    );
    assert.match(html, /ca-pub-4101065010696162/);
    assert.match(html, /brianlam1021\.github\.io\/hk-sms-csv\/company-incorp-fees\//);
    assert.match(html, /ird\.gov\.hk\/.*brfee_table\.pdf/);
    assert.match(html, /cr\.gov\.hk\/.*fees\.htm/);
    assert.match(html, /公司秘書|company secretary/);
    assert.match(html, /2026年10月27日|27 October 2026/);
  });
});
