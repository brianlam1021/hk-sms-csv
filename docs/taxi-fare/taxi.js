/**
 * Hong Kong taxi fare estimator from Transport Department gazette tables.
 * Scale of fares effective 14 July 2024; in-taxi bilingual table edition 10 May 2026.
 * Checked against TD “Taxi fare of Hong Kong” on 16 October 2026.
 * https://www.td.gov.hk/en/transport_in_hong_kong/public_transport/taxi/taxi_fare_of_hong_kong/index.html
 * https://www.td.gov.hk/tc/transport_in_hong_kong/public_transport/taxi/taxi_fare_of_hong_kong/index.html
 * Estimate only — not a taximeter or TD official tool. GPS routing is not used.
 */

export const AS_OF = "2026-10-16";
export const EFFECTIVE_FROM = "2024-07-14";
export const FLAG_KM = 2;
export const UNIT_M = 200;

export const SCALES = {
  urban: { flag: 29, threshold: 102.5, inc1: 2.1, inc2: 1.4 },
  nt: { flag: 25.5, threshold: 82.5, inc1: 1.9, inc2: 1.4 },
  lantau: { flag: 24, threshold: 195, inc1: 1.9, inc2: 1.6 },
};

export const EXTRA = {
  baggage: 6,
  animal: 5,
  booking: 5,
};

/** Statutory additional fare for using a toll tunnel / road / area, by taxi type. */
export const TUNNELS = {
  harbour: { oneWay: 25, returnToll: 25, types: ["urban"] },
  taiLam: { amount: 28, types: ["urban", "nt"] },
  tatesCairn: { amount: 20, types: ["urban"] },
  aberdeen: { amount: 8, types: ["urban"] },
  shingMun: { amount: 8, types: ["urban", "nt"] },
  lionRock: { amount: 8, types: ["urban"] },
  tsingSha: { amount: 8, types: ["urban"] },
};

export const TUNNEL_KEYS = [
  "taiLam",
  "tatesCairn",
  "aberdeen",
  "shingMun",
  "lionRock",
  "tsingSha",
];

function finite(n, fallback) {
  var v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

export function money1(n) {
  return Math.round((finite(n, 0) + Number.EPSILON) * 10) / 10;
}

export function formatMoney(amount, digits) {
  var n = Number(amount);
  if (!Number.isFinite(n)) n = 0;
  var places = digits == null ? 1 : digits;
  var abs = Math.abs(n).toFixed(places);
  var sign = n < 0 ? "-" : "";
  var parts = abs.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sign + "HK$" + parts.join(".");
}

export function formatNum(amount, digits) {
  var n = Number(amount);
  if (!Number.isFinite(n)) n = 0;
  var places = digits == null ? 1 : digits;
  var abs = Math.abs(n).toFixed(places);
  var sign = n < 0 ? "-" : "";
  var parts = abs.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sign + parts.join(".");
}

export function emptySettings() {
  return {
    type: "urban",
    distanceKm: 5,
    waitingMin: 3,
    baggage: 1,
    animals: 0,
    booking: false,
    harbour: "return",
    taiLam: false,
    tatesCairn: false,
    aberdeen: false,
    shingMun: false,
    lionRock: false,
    tsingSha: false,
  };
}

/** Urban 5 km + 3 min wait + 1 bag + harbour return toll. */
export function demoUrban() {
  return emptySettings();
}

/** NT 8 km + 2 min wait + Shing Mun Tunnels $8. Hits the $82.5 band change. */
export function demoNt() {
  var s = emptySettings();
  s.type = "nt";
  s.distanceKm = 8;
  s.waitingMin = 2;
  s.baggage = 0;
  s.harbour = "none";
  s.shingMun = true;
  return s;
}

/** Lantau 12 km + 5 min wait + phone booking. */
export function demoLantau() {
  var s = emptySettings();
  s.type = "lantau";
  s.distanceKm = 12;
  s.waitingMin = 5;
  s.baggage = 0;
  s.booking = true;
  s.harbour = "none";
  return s;
}

export function scaleFor(type) {
  return SCALES[type] || SCALES.urban;
}

/** How many $inc1 ticks fit between flag-fall and the lower-increment threshold. */
export function inc1Ticks(scale) {
  return Math.round((scale.threshold - scale.flag) / scale.inc1);
}

/**
 * Extra meter units after the first 2 km, “or any part thereof”.
 * Distance is rounded to the nearest metre so 5.0 km stays 15 units of 200 m.
 */
export function distanceUnits(distanceKm) {
  var meters = Math.round(finite(distanceKm, 0) * 1000);
  if (meters <= FLAG_KM * 1000) return 0;
  return Math.ceil((meters - FLAG_KM * 1000) / UNIT_M);
}

/** Waiting units: every 1 minute or part thereof. */
export function waitingUnits(waitingMin) {
  var wait = finite(waitingMin, 0);
  if (wait <= 0) return 0;
  return Math.ceil(wait - 1e-9);
}

export function meterFare(scale, units) {
  var n1 = inc1Ticks(scale);
  var u1 = Math.min(units, n1);
  var u2 = Math.max(0, units - n1);
  return money1(scale.flag + u1 * scale.inc1 + u2 * scale.inc2);
}

export function tunnelAllowed(key, type) {
  var spec = TUNNELS[key];
  if (!spec || !spec.types) return false;
  return spec.types.indexOf(type) !== -1;
}

function nonNegInt(n) {
  return Number.isFinite(n) && n >= 0 && Math.floor(n) === n;
}

/**
 * Estimate meter + extras + tunnel add-ons for one hiring.
 * Distance and waiting are added as separate taximeter units (moving vs hired-but-stopped).
 */
export function compute(settings) {
  var type = settings && settings.type;
  if (type !== "nt" && type !== "lantau") type = "urban";
  var scale = SCALES[type];

  var distanceKm = Number(settings && settings.distanceKm);
  var waitingMin = Number(settings && settings.waitingMin);
  var baggage = Number(settings && settings.baggage);
  var animals = Number(settings && settings.animals);
  var booking = !!(settings && settings.booking);
  var harbour = settings && settings.harbour;
  if (harbour !== "oneWay" && harbour !== "return") harbour = "none";

  var warnings = [];
  if (!Number.isFinite(distanceKm) || distanceKm < 0) warnings.push("badDistance");
  if (!Number.isFinite(waitingMin) || waitingMin < 0) warnings.push("badWaiting");
  if (!Number.isFinite(baggage) || baggage < 0) warnings.push("badBaggage");
  if (!Number.isFinite(animals) || animals < 0) warnings.push("badAnimals");
  if (Number.isFinite(baggage) && baggage > 0 && !nonNegInt(baggage)) {
    warnings.push("fracBaggage");
  }
  if (Number.isFinite(animals) && animals > 0 && !nonNegInt(animals)) {
    warnings.push("fracAnimals");
  }
  if (Number.isFinite(distanceKm) && distanceKm === 0) warnings.push("zeroDistance");
  if (Number.isFinite(distanceKm) && distanceKm > 80) warnings.push("longTrip");
  if (type !== "urban" && harbour !== "none") warnings.push("harbourIgnored");

  var ok =
    warnings.indexOf("badDistance") === -1 &&
    warnings.indexOf("badWaiting") === -1 &&
    warnings.indexOf("badBaggage") === -1 &&
    warnings.indexOf("badAnimals") === -1 &&
    warnings.indexOf("fracBaggage") === -1 &&
    warnings.indexOf("fracAnimals") === -1;

  var distUnits = 0;
  var waitUnits = 0;
  var units = 0;
  var meter = 0;
  var n1 = inc1Ticks(scale);
  var unitsInc1 = 0;
  var unitsInc2 = 0;
  var extras = 0;
  var baggageFee = 0;
  var animalFee = 0;
  var bookingFee = 0;
  var tunnelFee = 0;
  var harbourFee = 0;
  var harbourReturn = 0;
  var tunnelLines = [];
  var total = 0;

  if (ok) {
    distUnits = distanceUnits(distanceKm);
    waitUnits = waitingUnits(waitingMin);
    units = distUnits + waitUnits;
    unitsInc1 = Math.min(units, n1);
    unitsInc2 = Math.max(0, units - n1);
    meter = meterFare(scale, units);

    var bagCount = Math.floor(baggage);
    var animalCount = Math.floor(animals);
    baggageFee = bagCount * EXTRA.baggage;
    animalFee = animalCount * EXTRA.animal;
    bookingFee = booking ? EXTRA.booking : 0;
    extras = baggageFee + animalFee + bookingFee;

    if (type === "urban" && harbour === "oneWay") {
      harbourFee = TUNNELS.harbour.oneWay;
      tunnelLines.push({ key: "harbourOneWay", amount: harbourFee });
    } else if (type === "urban" && harbour === "return") {
      harbourFee = TUNNELS.harbour.oneWay;
      harbourReturn = TUNNELS.harbour.returnToll;
      tunnelLines.push({ key: "harbourReturn", amount: harbourFee + harbourReturn });
    }

    for (var i = 0; i < TUNNEL_KEYS.length; i++) {
      var key = TUNNEL_KEYS[i];
      if (!(settings && settings[key])) continue;
      if (!tunnelAllowed(key, type)) {
        warnings.push("tunnelIgnored");
        continue;
      }
      var amount = TUNNELS[key].amount;
      tunnelLines.push({ key: key, amount: amount });
    }

    tunnelFee = harbourFee + harbourReturn;
    for (var j = 0; j < tunnelLines.length; j++) {
      if (tunnelLines[j].key === "harbourOneWay" || tunnelLines[j].key === "harbourReturn") {
        continue;
      }
      tunnelFee += tunnelLines[j].amount;
    }

    total = money1(meter + extras + tunnelFee);
  }

  return {
    ok: ok,
    warnings: warnings,
    type: type,
    scale: scale,
    distanceKm: distanceKm,
    waitingMin: waitingMin,
    distUnits: distUnits,
    waitUnits: waitUnits,
    units: units,
    unitsInc1: unitsInc1,
    unitsInc2: unitsInc2,
    meter: meter,
    baggageFee: baggageFee,
    animalFee: animalFee,
    bookingFee: bookingFee,
    extras: extras,
    harbourFee: harbourFee,
    harbourReturn: harbourReturn,
    tunnelFee: tunnelFee,
    tunnelLines: tunnelLines,
    total: total,
  };
}
