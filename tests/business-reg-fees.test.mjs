import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  BR_BANDS,
  NAR1_TYPES,
  addMonths,
  classifyNar1,
  compute,
  demoBr2026,
  demoNarOnTime,
  demoNarVeryLate,
  findBrBand,
  formatMoney,
  lookupBr,
  parseYmd,
} from "../docs/business-reg-fees/fees.js";

describe("IRD BR fee table", () => {
  it("1-year main BR commencing 2026-04-01 → total 2350 (fee 2200 + levy 150)", () => {
    const r = lookupBr("main", "1", "2026-04-01");
    assert.ok(r);
    assert.equal(r.fee, 2200);
    assert.equal(r.levy, 150);
    assert.equal(r.total, 2350);
    assert.equal(r.band.id, "2026-27");
  });

  it("demoBr2026 compute → hero total 2350", () => {
    const r = compute(demoBr2026());
    assert.equal(r.ok, true);
    assert.equal(r.br.total, 2350);
    assert.equal(r.brTotal, 2350);
    assert.equal(r.narFee, null);
  });

  it("1-year main BR 2025/26 has zero levy → 2200", () => {
    const r = lookupBr("main", "1", "2025-06-01");
    assert.equal(r.fee, 2200);
    assert.equal(r.levy, 0);
    assert.equal(r.total, 2200);
  });

  it("3-year main BR 2026/27 → 6170", () => {
    const r = lookupBr("main", "3", "2026-04-01");
    assert.equal(r.total, 6170);
    assert.equal(r.fee, 5720);
    assert.equal(r.levy, 450);
  });

  it("1-year branch BR 2026/27 → 230", () => {
    const r = lookupBr("branch", "1", "2026-10-01");
    assert.equal(r.total, 230);
    assert.equal(r.fee, 80);
    assert.equal(r.levy, 150);
  });

  it("embeds at least the four recent IRD bands", () => {
    const ids = BR_BANDS.map((b) => b.id);
    assert.ok(ids.includes("2026-27"));
    assert.ok(ids.includes("2025-26"));
    assert.ok(ids.includes("2024-25"));
    assert.ok(ids.includes("2023-24"));
    assert.equal(findBrBand("2024-04-01").id, "2024-25");
  });
});

describe("CR NAR1 fee ladders", () => {
  it("private NAR1 filed on time → 105", () => {
    const r = classifyNar1("private", "2026-01-15", "2026-02-20");
    assert.equal(r.ok, true);
    assert.equal(r.band, "onTime");
    assert.equal(r.fee, 105);
    assert.equal(r.daysAfter, 36);
    assert.equal(r.daysLate, 0);
  });

  it("demoNarOnTime compute → 105", () => {
    const r = compute(demoNarOnTime());
    assert.equal(r.ok, true);
    assert.equal(r.nar.fee, 105);
    assert.equal(r.narFee, 105);
  });

  it("private NAR1 filed on day 42 still on time", () => {
    const r = classifyNar1("private", "2026-01-15", "2026-02-26");
    assert.equal(r.band, "onTime");
    assert.equal(r.fee, 105);
    assert.equal(r.daysAfter, 42);
  });

  it("private NAR1 day 43 → late1 $870", () => {
    const r = classifyNar1("private", "2026-01-15", "2026-02-27");
    assert.equal(r.band, "late1");
    assert.equal(r.fee, 870);
    assert.equal(r.daysLate, 1);
  });

  it("private NAR1 >9 months late → 3480", () => {
    const r = classifyNar1("private", "2025-01-15", "2025-11-01");
    assert.equal(r.ok, true);
    assert.equal(r.band, "late4");
    assert.equal(r.fee, 3480);
    assert.ok(r.daysLate > 0);
  });

  it("demoNarVeryLate compute → 3480", () => {
    const r = compute(demoNarVeryLate());
    assert.equal(r.nar.fee, 3480);
    assert.equal(r.nar.band, "late4");
  });

  it("exactly 3 months after return stays in late1", () => {
    const ret = "2026-01-15";
    const m3 = addMonths(parseYmd(ret), 3);
    const r = classifyNar1("private", ret, m3.iso);
    assert.equal(r.band, "late1");
    assert.equal(r.fee, 870);
  });

  it("day after 3 months → late2 $1740", () => {
    const r = classifyNar1("private", "2026-01-15", "2026-04-16");
    assert.equal(r.band, "late2");
    assert.equal(r.fee, 1740);
  });

  it("public / guarantee / non-HK ladders match CR page", () => {
    assert.deepEqual(NAR1_TYPES.public.fees, {
      onTime: 140,
      late1: 1200,
      late2: 2400,
      late3: 3600,
      late4: 4800,
    });
    assert.deepEqual(NAR1_TYPES.guarantee.fees, NAR1_TYPES.private.fees);
    assert.deepEqual(NAR1_TYPES.nonHongKong.fees, {
      onTime: 180,
      late1: 1200,
      late2: 2400,
      late3: 3600,
      late4: 4800,
    });
  });
});

describe("combined summary", () => {
  it("BR 2350 + NAR1 on-time 105 = 2455", () => {
    const r = compute({
      enableBr: true,
      brKind: "main",
      brTerm: "1",
      brDate: "2026-04-01",
      enableNar: true,
      narType: "private",
      returnDate: "2026-01-15",
      filingDate: "2026-02-20",
    });
    assert.equal(r.br.total, 2350);
    assert.equal(r.nar.fee, 105);
    assert.equal(r.combined, 2455);
  });
});

describe("helpers + page wiring", () => {
  it("formatMoney and parseYmd", () => {
    assert.equal(formatMoney(2350), "HK$2,350");
    assert.equal(parseYmd("2026-02-30"), null);
    assert.equal(parseYmd("2026-04-01").iso, "2026-04-01");
  });

  it("index.html has AdSense meta, canonical, and official links", () => {
    const html = readFileSync(
      new URL("../docs/business-reg-fees/index.html", import.meta.url),
      "utf8"
    );
    assert.match(html, /ca-pub-4101065010696162/);
    assert.match(html, /brianlam1021\.github\.io\/hk-sms-csv\/business-reg-fees\//);
    assert.match(html, /ird\.gov\.hk\/.*brfee_table\.pdf/);
    assert.match(html, /cr\.gov\.hk\/.*fees\.htm/);
  });
});
