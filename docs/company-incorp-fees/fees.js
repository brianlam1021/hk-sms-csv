/**
 * Hong Kong company incorporation first-year government fees estimator.
 *
 * Companies Registry major fees (Cap. 622K summary):
 *   https://www.cr.gov.hk/en/services/fees.htm
 *   https://www.cr.gov.hk/tc/services/fees.htm
 *   Checked 27 October 2026.
 *
 * First Business Registration Certificate fee + levy:
 *   IRD “Business Registration Fee and Levy Table”
 *   https://www.ird.gov.hk/eng/pdf/brfee_table.pdf
 *   Bands reused from ../business-reg-fees/fees.js
 *
 * For a local company’s first BRC applied for via CR, IRD uses the date of
 * the related incorporation submission (not the later incorporation date).
 *
 * Reference only — not a CR or IRD official tool, and not legal advice.
 * Government fees only: excludes company secretary, registered office,
 * agent/CPA, bank, chops, significant controllers register, audits.
 */

import { lookupBr, parseYmd } from "../business-reg-fees/fees.js";

export { formatMoney, parseYmd, lookupBr, findBrBand } from "../business-reg-fees/fees.js";

export const AS_OF = "2026-10-27";

/** Same electronic / hard-copy fee for private, public, and registered non-HK. */
export const SHARE_INCORP = {
  electronic: { fee: 1545, refundable: 1280 },
  hardCopy: { fee: 1720, refundable: 1425 },
};

/**
 * Guarantee-company incorporation bands (CR fees page).
 * ≤25: 155 / 170
 * 26–100: 305 / 340
 * >100: 305 or 340 + 18 / 20 per additional 50 members (or part),
 *       capped at 925 / 1,025.
 */
export const GUARANTEE_INCORP = {
  electronic: { le25: 155, le100: 305, step: 18, cap: 925 },
  hardCopy: { le25: 170, le100: 340, step: 20, cap: 1025 },
};

export const COMPANY_TYPES = {
  private: {
    id: "private",
    incorpKind: "share",
    nar1OnTime: 105,
    nameChange: { fee: 295, refundable: 55, kind: "changeOfName" },
  },
  public: {
    id: "public",
    incorpKind: "share",
    nar1OnTime: 140,
    nameChange: { fee: 295, refundable: 55, kind: "changeOfName" },
  },
  guarantee: {
    id: "guarantee",
    incorpKind: "guarantee",
    nar1OnTime: 105,
    nameChange: { fee: 295, refundable: 55, kind: "changeOfName" },
  },
  nonHongKong: {
    id: "nonHongKong",
    incorpKind: "share",
    nar1OnTime: 180,
    nameChange: { fee: 1425, refundable: 0, kind: "alterationOfName" },
  },
};

export function emptySettings() {
  return {
    companyType: "private",
    delivery: "electronic",
    submissionDate: "2026-04-01",
    brcTerm: "1",
    memberCount: 25,
    includeNameChange: false,
    includeNar1: false,
  };
}

export function demoElectronic2026() {
  return emptySettings();
}

export function demoHardCopy2026() {
  return Object.assign(emptySettings(), { delivery: "hardCopy" });
}

export function demoPriorYear() {
  return Object.assign(emptySettings(), { submissionDate: "2026-03-31" });
}

export function normalizeDelivery(value) {
  return value === "hardCopy" ? "hardCopy" : "electronic";
}

export function normalizeType(value) {
  return COMPANY_TYPES[value] ? value : "private";
}

export function normalizeTerm(value) {
  return String(value) === "3" ? "3" : "1";
}

/**
 * Guarantee incorporation fee from member count and delivery mode.
 * Returns null if member count is not a positive integer.
 */
export function guaranteeIncorpFee(members, delivery) {
  var n = Number(members);
  if (!Number.isFinite(n)) return null;
  n = Math.floor(n);
  if (n < 1) return null;

  var mode = normalizeDelivery(delivery);
  var table = GUARANTEE_INCORP[mode];
  if (n <= 25) {
    return {
      fee: table.le25,
      refundable: 0,
      band: "le25",
      members: n,
      extraBlocks: 0,
      capped: false,
    };
  }
  if (n <= 100) {
    return {
      fee: table.le100,
      refundable: 0,
      band: "le100",
      members: n,
      extraBlocks: 0,
      capped: false,
    };
  }
  var extraBlocks = Math.ceil((n - 100) / 50);
  var raw = table.le100 + extraBlocks * table.step;
  var fee = Math.min(table.cap, raw);
  return {
    fee: fee,
    refundable: 0,
    band: "over100",
    members: n,
    extraBlocks: extraBlocks,
    capped: raw >= table.cap,
    cap: table.cap,
    step: table.step,
    base: table.le100,
  };
}

export function lookupIncorp(companyType, delivery, memberCount) {
  var type = COMPANY_TYPES[normalizeType(companyType)];
  var mode = normalizeDelivery(delivery);
  if (type.incorpKind === "guarantee") {
    var g = guaranteeIncorpFee(memberCount, mode);
    if (!g) return null;
    return {
      kind: "guarantee",
      companyType: type.id,
      delivery: mode,
      fee: g.fee,
      refundable: g.refundable,
      guarantee: g,
    };
  }
  var row = SHARE_INCORP[mode];
  return {
    kind: "share",
    companyType: type.id,
    delivery: mode,
    fee: row.fee,
    refundable: row.refundable,
    guarantee: null,
  };
}

export function compute(settings) {
  var s = Object.assign(emptySettings(), settings || {});
  s.companyType = normalizeType(s.companyType);
  s.delivery = normalizeDelivery(s.delivery);
  s.brcTerm = normalizeTerm(s.brcTerm);
  s.includeNameChange = s.includeNameChange === true;
  s.includeNar1 = s.includeNar1 === true;

  var warnings = [];
  var type = COMPANY_TYPES[s.companyType];
  var date = parseYmd(s.submissionDate);
  var cr = null;
  var br = null;

  if (type.incorpKind === "guarantee") {
    cr = lookupIncorp(s.companyType, s.delivery, s.memberCount);
    if (!cr) warnings.push("badMembers");
  } else {
    cr = lookupIncorp(s.companyType, s.delivery, s.memberCount);
  }

  if (!date) {
    warnings.push("badDate");
  } else {
    br = lookupBr("main", s.brcTerm, date.iso);
    if (!br) warnings.push("brNoBand");
  }

  var nameChange = null;
  if (s.includeNameChange) {
    nameChange = {
      fee: type.nameChange.fee,
      refundable: type.nameChange.refundable,
      kind: type.nameChange.kind,
    };
  }

  var nar1 = null;
  if (s.includeNar1) {
    nar1 = {
      fee: type.nar1OnTime,
      onTime: true,
      companyType: type.id,
    };
  }

  var crFee = cr ? cr.fee : 0;
  var brTotal = br ? br.total : 0;
  var nameFee = nameChange ? nameChange.fee : 0;
  var narFee = nar1 ? nar1.fee : 0;
  var atIncorporation = cr && br ? crFee + brTotal + nameFee : null;
  var yearOne = atIncorporation != null ? atIncorporation + narFee : null;
  var ok = Boolean(cr && br);

  return {
    ok: ok,
    warnings: warnings,
    settings: s,
    companyType: type.id,
    delivery: s.delivery,
    cr: cr,
    br: br,
    nameChange: nameChange,
    nar1: nar1,
    atIncorporation: ok ? atIncorporation : null,
    yearOne: ok ? yearOne : null,
    yearOneIncludesNar1: Boolean(ok && nar1),
  };
}
