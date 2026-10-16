import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  SCALES,
  compute,
  demoLantau,
  demoNt,
  demoUrban,
  distanceUnits,
  emptySettings,
  formatMoney,
  inc1Ticks,
  meterFare,
  waitingUnits,
} from "../docs/taxi-fare/taxi.js";

describe("TD scale thresholds (14 July 2024)", () => {
  it("urban $2.1 ticks land exactly on $102.5", () => {
    assert.equal(inc1Ticks(SCALES.urban), 35);
    assert.equal(meterFare(SCALES.urban, 35), 102.5);
  });

  it("NT $1.9 ticks land exactly on $82.5", () => {
    assert.equal(inc1Ticks(SCALES.nt), 30);
    assert.equal(meterFare(SCALES.nt, 30), 82.5);
  });

  it("Lantau $1.9 ticks land exactly on $195", () => {
    assert.equal(inc1Ticks(SCALES.lantau), 90);
    assert.equal(meterFare(SCALES.lantau, 90), 195);
  });
});

describe("flag-fall and 200 m / 1 min units", () => {
  it("first 2 km or any part is flag-fall only", () => {
    assert.equal(distanceUnits(0), 0);
    assert.equal(distanceUnits(0.1), 0);
    assert.equal(distanceUnits(2), 0);
    const short = compute(Object.assign(emptySettings(), { distanceKm: 0.8, waitingMin: 0, baggage: 0, harbour: "none" }));
    assert.equal(short.meter, 29);
    assert.equal(short.total, 29);
  });

  it("2.2 km urban is one $2.1 unit → $31.1", () => {
    assert.equal(distanceUnits(2.2), 1);
    const r = compute(Object.assign(emptySettings(), { distanceKm: 2.2, waitingMin: 0, baggage: 0, harbour: "none" }));
    assert.equal(r.meter, 31.1);
  });

  it("5 km urban is 15 units → $60.5", () => {
    assert.equal(distanceUnits(5), 15);
    const r = compute(Object.assign(emptySettings(), { distanceKm: 5, waitingMin: 0, baggage: 0, harbour: "none" }));
    assert.equal(r.units, 15);
    assert.equal(r.meter, 60.5);
  });

  it("9 km urban hits $102.5; 9.2 km then $1.4", () => {
    assert.equal(distanceUnits(9), 35);
    assert.equal(distanceUnits(9.2), 36);
    const at = compute(Object.assign(emptySettings(), { distanceKm: 9, waitingMin: 0, baggage: 0, harbour: "none" }));
    const after = compute(Object.assign(emptySettings(), { distanceKm: 9.2, waitingMin: 0, baggage: 0, harbour: "none" }));
    assert.equal(at.meter, 102.5);
    assert.equal(after.meter, 103.9);
  });

  it("waiting 3 minutes is 3 units; 0.1 minute is 1 unit (part thereof)", () => {
    assert.equal(waitingUnits(0), 0);
    assert.equal(waitingUnits(3), 3);
    assert.equal(waitingUnits(0.1), 1);
  });
});

describe("demos and extras", () => {
  it("urban harbour demo: 5 km + 3 min wait + 1 bag + return toll = $122.8", () => {
    const r = compute(demoUrban());
    assert.equal(r.ok, true);
    assert.equal(r.type, "urban");
    assert.equal(r.distUnits, 15);
    assert.equal(r.waitUnits, 3);
    assert.equal(r.meter, 66.8);
    assert.equal(r.baggageFee, 6);
    assert.equal(r.tunnelFee, 50);
    assert.equal(r.total, 122.8);
  });

  it("NT demo: 8 km + 2 min + Shing Mun = $93.3", () => {
    const r = compute(demoNt());
    assert.equal(r.type, "nt");
    assert.equal(r.distUnits, 30);
    assert.equal(r.unitsInc1, 30);
    assert.equal(r.unitsInc2, 2);
    assert.equal(r.meter, 85.3);
    assert.equal(r.tunnelFee, 8);
    assert.equal(r.total, 93.3);
  });

  it("Lantau demo: 12 km + 5 min + booking = $133.5", () => {
    const r = compute(demoLantau());
    assert.equal(r.type, "lantau");
    assert.equal(r.meter, 128.5);
    assert.equal(r.bookingFee, 5);
    assert.equal(r.tunnelFee, 0);
    assert.equal(r.total, 133.5);
  });

  it("harbour one-way is $25; animals $5 each", () => {
    const r = compute(
      Object.assign(emptySettings(), {
        distanceKm: 2,
        waitingMin: 0,
        baggage: 0,
        animals: 2,
        harbour: "oneWay",
      })
    );
    assert.equal(r.meter, 29);
    assert.equal(r.animalFee, 10);
    assert.equal(r.tunnelFee, 25);
    assert.equal(r.total, 64);
  });

  it("ignores harbour extras on NT taxis", () => {
    const r = compute(
      Object.assign(demoNt(), { harbour: "return", tatesCairn: true })
    );
    assert.ok(r.warnings.includes("harbourIgnored"));
    assert.ok(r.warnings.includes("tunnelIgnored"));
    assert.equal(r.tunnelFee, 8);
  });
});

describe("validation", () => {
  it("rejects negative distance, waiting, or extras", () => {
    assert.equal(compute(Object.assign(emptySettings(), { distanceKm: -1 })).ok, false);
    assert.equal(compute(Object.assign(emptySettings(), { waitingMin: -0.5 })).ok, false);
    assert.equal(compute(Object.assign(emptySettings(), { baggage: -1 })).ok, false);
    assert.ok(compute(Object.assign(emptySettings(), { baggage: 1.5 })).warnings.includes("fracBaggage"));
  });

  it("zero distance still pays flag-fall and warns", () => {
    const r = compute(Object.assign(emptySettings(), { distanceKm: 0, waitingMin: 0, baggage: 0, harbour: "none" }));
    assert.equal(r.ok, true);
    assert.equal(r.total, 29);
    assert.ok(r.warnings.includes("zeroDistance"));
  });
});

describe("formatting", () => {
  it("formats HKD to one decimal like the TD table", () => {
    assert.equal(formatMoney(122.8, 1), "HK$122.8");
    assert.equal(formatMoney(102.5, 1), "HK$102.5");
    assert.equal(formatMoney(29, 1), "HK$29.0");
  });
});

describe("page constraints", () => {
  it("has the AdSense account meta and no ad script or ad unit", () => {
    const html = readFileSync(new URL("../docs/taxi-fare/index.html", import.meta.url), "utf8");
    assert.match(html, /<meta name="google-adsense-account" content="ca-pub-4101065010696162">/);
    assert.doesNotMatch(html, /adsbygoogle|data-ad-slot|pagead2\.googlesyndication/i);
    assert.match(html, /rel="canonical" href="https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/taxi-fare\/"/);
    assert.match(html, /lang="zh-Hant-HK"/);
    assert.match(html, /href="\.\.\/privacy\/"/);
    assert.match(html, /td\.gov\.hk/);
    const css = readFileSync(new URL("../docs/taxi-fare/style.css", import.meta.url), "utf8");
    assert.match(css, /\[hidden\]\s*\{[\s\S]*?display:\s*none\s*!important/);
  });

  it("is linked from the hub, sitemap and about page", () => {
    const hub = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
    const sitemap = readFileSync(new URL("../docs/sitemap.xml", import.meta.url), "utf8");
    const about = readFileSync(new URL("../docs/about/index.html", import.meta.url), "utf8");
    assert.match(hub, /href="\.\/taxi-fare\/"/);
    assert.match(hub, /的士車費/);
    assert.match(sitemap, /https:\/\/hk-sms-csv\.pages\.dev\/taxi-fare\//);
    assert.match(sitemap, /https:\/\/brianlam1021\.github\.io\/hk-sms-csv\/taxi-fare\//);
    assert.match(about, /taxi-fare\//);
  });
});
