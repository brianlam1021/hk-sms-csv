/**
 * Hong Kong Business Registration Certificate fee + levy, and
 * Companies Registry NAR1 (annual return) filing-fee estimator.
 *
 * BR fee / levy table: IRD “Business Registration Fee and Levy Table”
 *   https://www.ird.gov.hk/eng/pdf/brfee_table.pdf
 *   https://www.ird.gov.hk/chi/tax/bre_lcc.htm
 *   Checked 26 October 2026.
 *
 * NAR1 ladders: CR “主要收費 / Fees”
 *   https://www.cr.gov.hk/tc/services/fees.htm
 *   https://www.cr.gov.hk/en/services/fees.htm
 *   Checked 26 October 2026 (private $105 → $870/$1,740/$2,610/$3,480;
 *   public $140 → $1,200/$2,400/$3,600/$4,800;
 *   guarantee same as private; non-HK $180 → $1,200/$2,400/$3,600/$4,800).
 *
 * Reference only — not an IRD or CR official tool, and not legal advice.
 */

export const AS_OF = "2026-10-26";

/** Inclusive commencement-date bands from the IRD PDF table. */
export const BR_BANDS = [
  {
    id: "2026-27",
    from: "2026-04-01",
    to: "2027-03-31",
    labelZh: "01.04.2026 – 31.03.2027",
    labelEn: "1 Apr 2026 – 31 Mar 2027",
    main1: { fee: 2200, levy: 150, total: 2350 },
    main3: { fee: 5720, levy: 450, total: 6170 },
    branch1: { fee: 80, levy: 150, total: 230 },
    branch3: { fee: 208, levy: 450, total: 658 },
  },
  {
    id: "2025-26",
    from: "2025-04-01",
    to: "2026-03-31",
    labelZh: "01.04.2025 – 31.03.2026",
    labelEn: "1 Apr 2025 – 31 Mar 2026",
    main1: { fee: 2200, levy: 0, total: 2200 },
    main3: { fee: 5720, levy: 300, total: 6020 },
    branch1: { fee: 80, levy: 0, total: 80 },
    branch3: { fee: 208, levy: 300, total: 508 },
  },
  {
    id: "2024-25",
    from: "2024-04-01",
    to: "2025-03-31",
    labelZh: "01.04.2024 – 31.03.2025",
    labelEn: "1 Apr 2024 – 31 Mar 2025",
    main1: { fee: 2200, levy: 0, total: 2200 },
    main3: { fee: 5720, levy: 150, total: 5870 },
    branch1: { fee: 80, levy: 0, total: 80 },
    branch3: { fee: 208, levy: 150, total: 358 },
  },
  {
    id: "2023-24",
    from: "2023-04-01",
    to: "2024-03-31",
    labelZh: "01.04.2023 – 31.03.2024",
    labelEn: "1 Apr 2023 – 31 Mar 2024",
    main1: { fee: 2000, levy: 150, total: 2150 },
    main3: { fee: 5200, levy: 450, total: 5650 },
    branch1: { fee: 73, levy: 150, total: 223 },
    branch3: { fee: 189, levy: 450, total: 639 },
  },
  {
    id: "2022-23",
    from: "2022-06-17",
    to: "2023-03-31",
    labelZh: "17.06.2022 – 31.03.2023",
    labelEn: "17 Jun 2022 – 31 Mar 2023",
    main1: { fee: 0, levy: 150, total: 150 },
    main3: { fee: 3200, levy: 450, total: 3650 },
    branch1: { fee: 0, levy: 150, total: 150 },
    branch3: { fee: 116, levy: 450, total: 566 },
  },
];

/**
 * CR NAR1 filing-fee ladders (Cap. 622K).
 * Bands are measured from the return / anniversary date:
 *   onTime: within 42 days
 *   late1: >42 days and ≤3 months
 *   late2: >3 months and ≤6 months
 *   late3: >6 months and ≤9 months
 *   late4: >9 months
 */
export const NAR1_TYPES = {
  private: {
    id: "private",
    fees: { onTime: 105, late1: 870, late2: 1740, late3: 2610, late4: 3480 },
    returnHintZh: "公司成立為法團之日的周年日",
    returnHintEn: "Anniversary of the date of incorporation",
  },
  public: {
    id: "public",
    fees: { onTime: 140, late1: 1200, late2: 2400, late3: 3600, late4: 4800 },
    returnHintZh: "會計參照期結束後的 6 個月屆滿之日",
    returnHintEn: "Date 6 months after the accounting reference period end",
  },
  guarantee: {
    id: "guarantee",
    fees: { onTime: 105, late1: 870, late2: 1740, late3: 2610, late4: 3480 },
    returnHintZh: "會計參照期結束後的 9 個月屆滿之日",
    returnHintEn: "Date 9 months after the accounting reference period end",
  },
  nonHongKong: {
    id: "nonHongKong",
    fees: { onTime: 180, late1: 1200, late2: 2400, late3: 3600, late4: 4800 },
    returnHintZh: "註冊周年日",
    returnHintEn: "Anniversary of registration in Hong Kong",
  },
};

export function parseYmd(value) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!m) return null;
  var y = Number(m[1]);
  var mo = Number(m[2]);
  var d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  var dt = new Date(Date.UTC(y, mo - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== mo - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return { y: y, m: mo, d: d, iso: m[0], utc: dt };
}

export function daysBetween(a, b) {
  if (!a || !b) return null;
  return Math.round((b.utc - a.utc) / 86400000);
}

/** Add calendar months; clamp day to last day of target month. */
export function addMonths(date, months) {
  if (!date) return null;
  var total = date.m - 1 + months;
  var y = date.y + Math.floor(total / 12);
  var m0 = ((total % 12) + 12) % 12;
  var last = new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
  var d = Math.min(date.d, last);
  return parseYmd(
    String(y) +
      "-" +
      String(m0 + 1).padStart(2, "0") +
      "-" +
      String(d).padStart(2, "0")
  );
}

export function formatMoney(amount, digits) {
  var n = Number(amount);
  if (!Number.isFinite(n)) n = 0;
  var places = digits == null ? 0 : digits;
  var abs = Math.abs(n).toFixed(places);
  var sign = n < 0 ? "-" : "";
  var parts = abs.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sign + "HK$" + parts.join(".");
}

export function emptySettings() {
  return {
    enableBr: true,
    brKind: "main",
    brTerm: "1",
    brDate: "2026-04-01",
    enableNar: true,
    narType: "private",
    returnDate: "2026-01-15",
    filingDate: "2026-02-20",
  };
}

export function demoBr2026() {
  return Object.assign(emptySettings(), {
    enableBr: true,
    enableNar: false,
    brKind: "main",
    brTerm: "1",
    brDate: "2026-04-01",
  });
}

export function demoNarOnTime() {
  return Object.assign(emptySettings(), {
    enableBr: false,
    enableNar: true,
    narType: "private",
    returnDate: "2026-01-15",
    filingDate: "2026-02-20",
  });
}

export function demoNarVeryLate() {
  return Object.assign(emptySettings(), {
    enableBr: false,
    enableNar: true,
    narType: "private",
    returnDate: "2025-01-15",
    filingDate: "2025-11-01",
  });
}

export function demoCombined() {
  return Object.assign(emptySettings(), {
    enableBr: true,
    enableNar: true,
    brKind: "main",
    brTerm: "1",
    brDate: "2026-04-01",
    narType: "private",
    returnDate: "2026-01-15",
    filingDate: "2026-02-20",
  });
}

export function findBrBand(isoDate) {
  var d = parseYmd(isoDate);
  if (!d) return null;
  for (var i = 0; i < BR_BANDS.length; i++) {
    var band = BR_BANDS[i];
    if (d.iso >= band.from && d.iso <= band.to) return band;
  }
  return null;
}

function brSlotKey(kind, term) {
  var isBranch = kind === "branch";
  var is3 = String(term) === "3";
  if (isBranch && is3) return "branch3";
  if (isBranch) return "branch1";
  if (is3) return "main3";
  return "main1";
}

export function lookupBr(kind, term, commencementIso) {
  var band = findBrBand(commencementIso);
  if (!band) return null;
  var key = brSlotKey(kind, term);
  var row = band[key];
  return {
    band: band,
    kind: kind === "branch" ? "branch" : "main",
    term: String(term) === "3" ? "3" : "1",
    fee: row.fee,
    levy: row.levy,
    total: row.total,
  };
}

/**
 * Classify NAR1 filing relative to the return / anniversary date.
 * Returns band id + fee, days after return, and days past the 42-day window.
 */
export function classifyNar1(companyType, returnIso, filingIso) {
  var type = NAR1_TYPES[companyType] || NAR1_TYPES.private;
  var ret = parseYmd(returnIso);
  var fil = parseYmd(filingIso);
  if (!ret || !fil) {
    return { ok: false, reason: "badDate" };
  }
  if (fil.utc < ret.utc) {
    return { ok: false, reason: "beforeReturn", returnDate: ret, filingDate: fil };
  }

  var daysAfter = daysBetween(ret, fil);
  // On time if filing on or before return date + 42 calendar days.
  var onTimeEnd = parseYmd(
    (function () {
      var t = new Date(ret.utc.getTime() + 42 * 86400000);
      return (
        t.getUTCFullYear() +
        "-" +
        String(t.getUTCMonth() + 1).padStart(2, "0") +
        "-" +
        String(t.getUTCDate()).padStart(2, "0")
      );
    })()
  );
  var m3 = addMonths(ret, 3);
  var m6 = addMonths(ret, 6);
  var m9 = addMonths(ret, 9);

  var band;
  var fee;
  if (fil.utc <= onTimeEnd.utc) {
    band = "onTime";
    fee = type.fees.onTime;
  } else if (fil.utc <= m3.utc) {
    band = "late1";
    fee = type.fees.late1;
  } else if (fil.utc <= m6.utc) {
    band = "late2";
    fee = type.fees.late2;
  } else if (fil.utc <= m9.utc) {
    band = "late3";
    fee = type.fees.late3;
  } else {
    band = "late4";
    fee = type.fees.late4;
  }

  var daysLate = Math.max(0, daysAfter - 42);

  return {
    ok: true,
    companyType: type.id,
    returnDate: ret,
    filingDate: fil,
    daysAfter: daysAfter,
    daysLate: daysLate,
    onTimeEnd: onTimeEnd,
    m3: m3,
    m6: m6,
    m9: m9,
    band: band,
    fee: fee,
    fees: type.fees,
    returnHintZh: type.returnHintZh,
    returnHintEn: type.returnHintEn,
  };
}

export function compute(settings) {
  var s = Object.assign(emptySettings(), settings || {});
  var warnings = [];
  var br = null;
  var nar = null;

  if (s.enableBr) {
    var brDate = parseYmd(s.brDate);
    if (!brDate) {
      warnings.push("brBadDate");
    } else {
      br = lookupBr(s.brKind, s.brTerm, brDate.iso);
      if (!br) {
        warnings.push("brNoBand");
      }
    }
  }

  if (s.enableNar) {
    var ret = parseYmd(s.returnDate);
    var fil = parseYmd(s.filingDate);
    if (!ret || !fil) {
      warnings.push("narBadDate");
    } else if (fil.utc < ret.utc) {
      warnings.push("narBeforeReturn");
      nar = classifyNar1(s.narType, s.returnDate, s.filingDate);
    } else {
      nar = classifyNar1(s.narType, s.returnDate, s.filingDate);
      if (nar.ok && nar.band !== "onTime") {
        warnings.push("narLate");
      }
    }
  }

  if (!s.enableBr && !s.enableNar) {
    warnings.push("nothingEnabled");
  }

  var brTotal = br ? br.total : 0;
  var narFee = nar && nar.ok ? nar.fee : 0;
  var combined =
    (s.enableBr && br ? brTotal : 0) + (s.enableNar && nar && nar.ok ? narFee : 0);
  var bothOk =
    (s.enableBr ? Boolean(br) : true) &&
    (s.enableNar ? Boolean(nar && nar.ok) : true) &&
    (s.enableBr || s.enableNar);

  return {
    ok: bothOk,
    warnings: warnings,
    settings: s,
    br: br,
    nar: nar,
    brTotal: s.enableBr && br ? brTotal : null,
    narFee: s.enableNar && nar && nar.ok ? narFee : null,
    combined: bothOk && s.enableBr && s.enableNar ? combined : null,
    combinedPartial: combined,
  };
}
