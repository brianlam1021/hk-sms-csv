import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  AS_OF,
  LT_ADDONS,
  LT_FILING_BANDS,
  SCT_ADDONS,
  SCT_FILING_BANDS,
  SCT_LIMIT,
  compute,
  demo3k,
  demo60k,
  demoLt,
  demoWitness,
  emptySettings,
  formatMoney,
  lookupLtFiling,
  lookupSctFiling,
  parseAmount,
  parseCount,
} from "../docs/small-claims-fees/fees.js";

describe("SCT filing bands (Cap. 338B item 1, Oct 2024 table)", () => {
  it("≤ $5,000 → $20, including $0 and the $5,000 edge", () => {
    assert.equal(lookupSctFiling(0).fee, 20);
    assert.equal(lookupSctFiling(1).fee, 20);
    assert.equal(lookupSctFiling(5000).fee, 20);
    assert.equal(lookupSctFiling(5000).id, "le5k");
    assert.equal(lookupSctFiling("5,000").fee, 20);
  });

  it("just over $5,000 → $40", () => {
    assert.equal(lookupSctFiling(5000.01).fee, 40);
    assert.equal(lookupSctFiling(5000.01).id, "le25k");
    assert.equal(lookupSctFiling(25000).fee, 40);
  });

  it("just over $25,000 → $70; $50,000 still $70", () => {
    assert.equal(lookupSctFiling(25000.01).fee, 70);
    assert.equal(lookupSctFiling(50000).fee, 70);
    assert.equal(lookupSctFiling(50000).id, "le50k");
  });

  it("just over $50,000 → $120; $75,000 still $120", () => {
    assert.equal(lookupSctFiling(50000.01).fee, 120);
    assert.equal(lookupSctFiling(75000).fee, 120);
    assert.equal(lookupSctFiling(75000).id, "le75k");
    assert.equal(lookupSctFiling(SCT_LIMIT).ok, true);
  });

  it("$75,000.01 cannot file as SCT", () => {
    var r = lookupSctFiling(75000.01);
    assert.equal(r.ok, false);
    assert.equal(r.reason, "overLimit");
    assert.equal(r.limit, 75000);
  });

  it("negative or blank claim is invalid", () => {
    assert.equal(lookupSctFiling(-1).reason, "badAmount");
    assert.equal(lookupSctFiling("").reason, "badAmount");
    assert.equal(lookupSctFiling(null).reason, "badAmount");
    assert.equal(lookupSctFiling("abc").reason, "badAmount");
  });

  it("embeds the four official SCT filing fees", () => {
    assert.deepEqual(
      SCT_FILING_BANDS.map(function (b) {
        return b.fee;
      }),
      [20, 40, 70, 120]
    );
  });
});

describe("SCT add-ons + compute", () => {
  it("demo $3,000 claim → filing $20, total $20", () => {
    var r = compute(demo3k());
    assert.equal(r.ok, true);
    assert.equal(r.tribunal, "sct");
    assert.equal(r.filingFee, 20);
    assert.equal(r.addonsTotal, 0);
    assert.equal(r.total, 20);
  });

  it("emptySettings matches the $3,000 demo", () => {
    var r = compute(emptySettings());
    assert.equal(r.filingFee, 20);
    assert.equal(r.total, 20);
    assert.equal(r.claimAmount, 3000);
  });

  it("demo $60,000 claim → filing $120", () => {
    var r = compute(demo60k());
    assert.equal(r.ok, true);
    assert.equal(r.filingFee, 120);
    assert.equal(r.total, 120);
    assert.equal(r.filing.id, "le75k");
  });

  it("demo claim + one witness summons → $40 + $33 = $73", () => {
    var r = compute(demoWitness());
    assert.equal(r.claimAmount, 8000);
    assert.equal(r.filingFee, 40);
    assert.equal(r.addonsTotal, 33);
    assert.equal(r.total, 73);
    var witness = r.lines.find(function (line) {
      return line.id === "witnessSummons";
    });
    assert.equal(witness.fee, 33);
    assert.equal(witness.qty, 1);
    assert.equal(witness.item, "2");
  });

  it("adds official common add-ons with counts", () => {
    var r = compute({
      tribunal: "sct",
      claimAmount: 30000,
      interPartySummons: 2,
      witnessSummons: 3,
      amendedDocument: 1,
      writOfExecution: 1,
      setAside: true,
      review: true,
      leaveToAppeal: true,
      bailiffDelivery: 2,
    });
    assert.equal(r.filingFee, 70);
    assert.equal(r.addonsTotal, 55 * 2 + 33 * 3 + 20 + 55 + 61 + 61 + 61 + 10 * 2);
    assert.equal(r.total, 70 + r.addonsTotal);
    assert.equal(SCT_ADDONS.interPartySummons.fee, 55);
    assert.equal(SCT_ADDONS.witnessSummons.fee, 33);
    assert.equal(SCT_ADDONS.amendedDocument.fee, 20);
    assert.equal(SCT_ADDONS.writOfExecution.fee, 55);
    assert.equal(SCT_ADDONS.setAside.fee, 61);
    assert.equal(SCT_ADDONS.review.fee, 61);
    assert.equal(SCT_ADDONS.leaveToAppeal.fee, 61);
    assert.equal(SCT_ADDONS.bailiffDelivery.fee, 10);
  });

  it("over-limit claim warns and does not invent another court's fee", () => {
    var r = compute({ tribunal: "sct", claimAmount: 75000.01, witnessSummons: 1 });
    assert.equal(r.ok, false);
    assert.equal(r.overLimit, true);
    assert.equal(r.filingFee, null);
    assert.ok(r.warnings.includes("overLimit"));
    assert.equal(r.abandonExcess.claimAmount, 75000);
    assert.equal(r.abandonExcess.filingFee, 120);
    assert.equal(r.addonsTotal, 33);
    assert.equal(r.total, 33);
  });
});

describe("Labour Tribunal filing (Cap. 25B item 1)", () => {
  it("≤ $2,000 → $20; $2,000.01 → $30", () => {
    assert.equal(lookupLtFiling(0).fee, 20);
    assert.equal(lookupLtFiling(2000).fee, 20);
    assert.equal(lookupLtFiling(2000.01).fee, 30);
    assert.equal(lookupLtFiling(5000).fee, 30);
  });

  it("$5,000.01 → $40; $10,000.01 → $50", () => {
    assert.equal(lookupLtFiling(5000.01).fee, 40);
    assert.equal(lookupLtFiling(10000).fee, 40);
    assert.equal(lookupLtFiling(10000.01).fee, 50);
    assert.equal(lookupLtFiling(250000).fee, 50);
  });

  it("demo LT $12,000 + witness + one service address → $50 + $25 + $10", () => {
    var r = compute(demoLt());
    assert.equal(r.ok, true);
    assert.equal(r.tribunal, "lt");
    assert.equal(r.filingFee, 50);
    assert.equal(r.addonsTotal, 35);
    assert.equal(r.total, 85);
    assert.equal(LT_ADDONS.witnessSummons.fee, 25);
    assert.equal(LT_ADDONS.review.fee, 45);
    assert.equal(LT_ADDONS.leaveToAppeal.fee, 45);
    assert.equal(LT_ADDONS.serviceAddress.fee, 10);
  });

  it("LT review + leave to appeal", () => {
    var r = compute({
      tribunal: "lt",
      claimAmount: 1500,
      review: true,
      leaveToAppeal: true,
    });
    assert.equal(r.filingFee, 20);
    assert.equal(r.total, 20 + 45 + 45);
  });

  it("embeds the four official LT filing fees", () => {
    assert.deepEqual(
      LT_FILING_BANDS.map(function (b) {
        return b.fee;
      }),
      [20, 30, 40, 50]
    );
  });
});

describe("helpers + page wiring", () => {
  it("formatMoney, parseAmount, parseCount", () => {
    assert.equal(formatMoney(120), "HK$120");
    assert.equal(formatMoney(3000), "HK$3,000");
    assert.equal(parseAmount("8,000"), 8000);
    assert.equal(parseAmount(""), null);
    assert.equal(parseCount(2.9), 2);
    assert.equal(parseCount(-3), 0);
    assert.equal(parseCount(200), 99);
  });

  it("index.html has AdSense meta, canonical, official links, and disclaimer", () => {
    const html = readFileSync(
      new URL("../docs/small-claims-fees/index.html", import.meta.url),
      "utf8"
    );
    assert.match(html, /ca-pub-4101065010696162/);
    assert.match(html, /brianlam1021\.github\.io\/hk-sms-csv\/small-claims-fees\//);
    assert.match(html, /gcssct_9_202410\.pdf/);
    assert.match(html, /judiciary\.hk\/.*\/sc\.html/);
    assert.match(html, /judiciary\.hk\/.*labour\.html/);
    assert.match(html, /2026年10月28日|28 October 2026/);
    assert.match(html, /不是司法機構|not a Judiciary/i);
    assert.match(html, /localStorage/);
    assert.match(html, /75,000|75000/);
  });

  it("records verification date 2026-10-28", () => {
    assert.equal(AS_OF, "2026-10-28");
  });
});
