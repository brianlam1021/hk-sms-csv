import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  AS_OF,
  SCALE_NON_RESIDENTIAL,
  SCALE_RESIDENTIAL,
  compute,
  demoFlat,
  demoLuxury,
  demoShop,
  dutyOnAmount,
  emptyModel,
  formatHkd,
  parseYmd,
  resolveScale,
  roundDuty,
  summaryToCsv,
} from "../docs/property-stamp/duty.js";

describe("rounding and band math", () => {
  it("rounds duty up to the nearest $1", () => {
    assert.equal(roundDuty(100), 100);
    assert.equal(roundDuty(100.01), 101);
    assert.equal(roundDuty(64856.715), 64857);
  });

  it("$4,000,000 residential → $100", () => {
    const r = dutyOnAmount(4000000, SCALE_RESIDENTIAL);
    assert.equal(r.duty, 100);
    assert.equal(r.band.kind, "flat");
  });

  it("marginal relief at $4,100,000 → $100 + 20% × $100,000 = $20,100", () => {
    const r = dutyOnAmount(4100000, SCALE_RESIDENTIAL);
    assert.equal(r.duty, 20100);
  });

  it("$6,000,000 at 2.25% → $135,000", () => {
    const r = dutyOnAmount(6000000, SCALE_RESIDENTIAL);
    assert.equal(r.duty, 135000);
    assert.equal(r.band.rate, 0.0225);
  });

  it("$15,000,000 at 3.75% → $562,500", () => {
    const r = dutyOnAmount(15000000, SCALE_RESIDENTIAL);
    assert.equal(r.duty, 562500);
  });

  it("residential $120,000,000 uses 6.5% band", () => {
    const r = dutyOnAmount(120000000, SCALE_RESIDENTIAL);
    assert.equal(r.band.rate, 0.065);
    assert.equal(r.duty, 7800000);
  });

  it("non-residential $120,000,000 stays at 4.25%", () => {
    const r = dutyOnAmount(120000000, SCALE_NON_RESIDENTIAL);
    assert.equal(r.band.rate, 0.0425);
    assert.equal(r.duty, 5100000);
  });

  it("boundary $109,574,470 residential matches 6.5% entry", () => {
    const marginal = dutyOnAmount(109574470, SCALE_RESIDENTIAL);
    const flat = dutyOnAmount(109574471, SCALE_RESIDENTIAL);
    assert.equal(marginal.duty, 7122341);
    assert.equal(flat.duty, 7122341);
  });
});

describe("scale selection by date and type", () => {
  it("residential on/after 26 Feb 2026 uses Scale 1/2 with 6.5% tier", () => {
    const s = resolveScale("residential", parseYmd("2026-10-20"));
    assert.equal(s.id, "scale1and2");
    assert.equal(s.bands, SCALE_RESIDENTIAL);
  });

  it("non-residential on/after 26 Feb 2026 uses Scale 3", () => {
    const s = resolveScale("nonResidential", parseYmd("2026-02-26"));
    assert.equal(s.id, "scale3");
    assert.equal(s.bands, SCALE_NON_RESIDENTIAL);
  });

  it("residential before 26 Feb 2026 uses old Scale 2 (= Scale 3 table)", () => {
    const s = resolveScale("residential", parseYmd("2025-12-01"));
    assert.equal(s.id, "scale2-pre2026");
    assert.equal(s.bands, SCALE_NON_RESIDENTIAL);
  });
});

describe("compute demos and DSM labels", () => {
  it("$6M residential demo → AVD $135,000; BSD/SSD/NRSD = 0", () => {
    const r = compute(demoFlat());
    assert.equal(r.chargeable, 6000000);
    assert.equal(r.avd, 135000);
    assert.equal(r.bsd, 0);
    assert.equal(r.ssd, 0);
    assert.equal(r.nrsd, 0);
    assert.equal(r.total, 135000);
    assert.equal(r.dsmStatus, "abolished");
    assert.ok(r.warnings.includes("dsmAbolished"));
  });

  it("$120M residential demo → $7,800,000 AVD", () => {
    const r = compute(demoLuxury());
    assert.equal(r.avd, 7800000);
    assert.ok(r.warnings.includes("luxuryBand"));
  });

  it("$15M shop → Scale 3 $562,500", () => {
    const r = compute(demoShop());
    assert.equal(r.propertyType, "nonResidential");
    assert.equal(r.scale.id, "scale3");
    assert.equal(r.avd, 562500);
  });

  it("uses higher of consideration and market value", () => {
    const r = compute({
      propertyType: "residential",
      consideration: 5000000,
      marketValue: 6000000,
      instrumentDate: "2026-10-20",
    });
    assert.equal(r.chargeable, 6000000);
    assert.equal(r.avd, 135000);
    assert.ok(r.warnings.includes("valueHigher"));
  });

  it("pre-28 Feb 2024 instrument flags historical DSM", () => {
    const r = compute({
      propertyType: "residential",
      consideration: 6000000,
      instrumentDate: "2024-01-15",
    });
    assert.equal(r.dsmStatus, "mayApply");
    assert.ok(r.warnings.includes("dsmHistorical"));
    assert.equal(r.bsd, 0);
  });

  it("buyer share splits duty", () => {
    const r = compute({
      ...demoFlat(),
      buyerShare: 50,
    });
    assert.equal(r.buyer, 67500);
    assert.equal(r.seller, 67500);
  });

  it("empty model is usable sample", () => {
    const m = emptyModel();
    assert.equal(m.propertyType, "residential");
    assert.ok(m.consideration > 0);
  });
});

describe("formatting and CSV", () => {
  it("formats HKD", () => {
    assert.equal(formatHkd(135000), "HK$135,000");
  });

  it("CSV includes AVD and zero DSM columns", () => {
    const csv = summaryToCsv(compute(demoFlat()), {
      item: "Item",
      amount: "Amount",
      chargeable: "Chargeable",
      avd: "AVD",
      bsd: "BSD",
      ssd: "SSD",
      nrsd: "NRSD",
      total: "Total",
      buyer: "Buyer",
      seller: "Seller",
    });
    assert.match(csv, /AVD,135000/);
    assert.match(csv, /BSD,0/);
    assert.match(csv, /SSD,0/);
    assert.match(csv, /NRSD,0/);
  });
});

describe("page wiring", () => {
  it("stamps AS_OF and cites IRD sources in the HTML", () => {
    const html = readFileSync(new URL("../docs/property-stamp/index.html", import.meta.url), "utf8");
    assert.match(html, /ca-pub-4101065010696162/);
    assert.match(html, /ird\.gov\.hk\/.*faq\/avd/);
    assert.match(html, /ird\.gov\.hk\/.*faq\/dsmm/);
    assert.match(html, /gov\.hk\/.*stamp_duty_rates/);
    assert.match(html, /僅供參考/);
    assert.equal(AS_OF, "2026-10-20");
  });

  it("hub index links the new tool", () => {
    const hub = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
    assert.match(hub, /property-stamp\//);
    assert.match(hub, /物業買賣印花稅/);
  });
});
