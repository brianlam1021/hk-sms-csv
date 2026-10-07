/**
 * Hospital Authority public charges in force from 1 January 2026.
 * Figures are copied from the HA fees page / Gazette schedule.
 * https://www.ha.org.hk/visitor/fees_and_charges.asp
 */

export const EFFECTIVE_FROM = "2026-01-01";
export const ANNUAL_CAP = 10000;

export const EP = {
  ae: 400,
  aeRefund: 350,
  acute: 300,
  conv: 200,
  sopc: 250,
  sopcDrug: 20,
  fmc: 150,
  fmcDrug: 5,
  injection: 50,
  psychDay: 0,
  geriatricDay: 100,
  rehabDay: 100,
  dayProc: 250,
  communityNursing: 100,
  communityAllied: 100,
  pathBasic: 0,
  pathInter: 50,
  pathAdv: 200,
  radioBasic: 0,
  radioInter: 250,
  radioAdv: 500,
};

export const NEP = {
  ae: 2100,
  aeRefund: 1850,
  general: 7400,
  psych: 3100,
  icu: 35600,
  hdu: 21000,
  nursery: 3100,
  obstetricBooked: 74000,
  obstetricUnbooked: 130000,
  sopc: 850,
  sopcDrug: 90,
  fmc: 500,
  fmcDrug: 40,
  injection: 250,
  dayProc: 7400,
  haemodialysisChronic: 3000,
  haemodialysisAcute: 6000,
  oncologyDay: 1300,
  ophthalmicDay: 950,
  psychDay: 1800,
  geriatricDay: 2700,
  rehabDay: 1900,
  communityNursing: 800,
  communityNursingPsych: 2000,
  communityAllied: 2000,
  pathBasic: 400,
  pathInter: 800,
  pathAdv: 16100,
  radioBasic: 400,
  radioInter: 1600,
  radioAdv: 4700,
};

export const ADMIN = {
  medicalReport: 1100,
  medicationDelivery: 65,
};

function money(n) {
  return Math.round(Number(n) * 100) / 100;
}

function qty(n) {
  var v = Number(n);
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.floor(v);
}

function addLine(lines, key, quantity, unit, amount, capEligible) {
  if (quantity <= 0 && amount === 0) return;
  if (quantity <= 0) return;
  lines.push({
    key: key,
    qty: quantity,
    unit: unit,
    amount: money(amount),
    capEligible: !!capEligible,
  });
}

export function emptyModel() {
  return {
    status: "ep",
    childUnder12: false,
    fullWaiver: false,
    yearToDatePaid: 0,
    aeConsult: 0,
    aeExempt: 0,
    aeLeftBefore: 0,
    acuteDays: 0,
    convDays: 0,
    psychDays: 0,
    icuDays: 0,
    hduDays: 0,
    nurseryDays: 0,
    sopc: 0,
    sopcDrugs: 0,
    fmc: 0,
    fmcDrugs: 0,
    injection: 0,
    dayProc: 0,
    haemodialysisChronic: 0,
    haemodialysisAcute: 0,
    oncologyDay: 0,
    ophthalmicDay: 0,
    geriatricDay: 0,
    rehabDay: 0,
    psychDay: 0,
    communityNursing: 0,
    communityNursingPsych: 0,
    communityAllied: 0,
    pathInter: 0,
    pathAdv: 0,
    radioInter: 0,
    radioAdv: 0,
    obstetric: "none",
    medicalReports: 0,
    medicationDelivery: 0,
  };
}

export function demoModel() {
  return Object.assign(emptyModel(), {
    status: "ep",
    aeConsult: 1,
    acuteDays: 3,
    sopc: 1,
    sopcDrugs: 2,
  });
}

export function demoCapModel() {
  return Object.assign(emptyModel(), {
    status: "ep",
    acuteDays: 40,
  });
}

/**
 * Same-day admission and discharge still counts as one maintenance day (HA note N3).
 * Callers should enter calendar midnights crossed + 1, or at least 1 if admitted and discharged the same day.
 */
export function inpatientDaysFromStay(nights, sameDay) {
  var n = qty(nights);
  if (sameDay) return 1;
  return n;
}

export function lateCharges(outstanding, daysSinceIssue) {
  var bill = money(outstanding);
  var days = qty(daysSinceIssue);
  if (bill <= 0 || days < 60) {
    return { first: 0, second: 0, total: 0 };
  }
  var first = days >= 60 ? Math.min(money(bill * 0.05), 1000) : 0;
  var second = days >= 90 ? Math.min(money(bill * 0.1), 10000) : 0;
  return {
    first: money(first),
    second: money(second),
    total: money(first + second),
  };
}

export function compute(raw) {
  var m = Object.assign(emptyModel(), raw || {});
  var ep = m.status !== "nep";
  var child = ep && !!m.childUnder12;
  var waiver = ep && !!m.fullWaiver;
  var bedFactor = child ? 0.5 : 1;
  var lines = [];
  var warnings = [];

  if (ep) {
    addLine(lines, "aeConsult", qty(m.aeConsult), EP.ae, qty(m.aeConsult) * EP.ae, true);
    addLine(lines, "aeExempt", qty(m.aeExempt), 0, 0, true);
    var left = qty(m.aeLeftBefore);
    if (left > 0) {
      addLine(lines, "aeLeftGross", left, EP.ae, left * EP.ae, true);
      addLine(lines, "aeLeftRefund", left, -EP.aeRefund, left * -EP.aeRefund, true);
    }
    addLine(lines, "acuteDays", qty(m.acuteDays), EP.acute * bedFactor, qty(m.acuteDays) * EP.acute * bedFactor, true);
    addLine(lines, "convDays", qty(m.convDays), EP.conv * bedFactor, qty(m.convDays) * EP.conv * bedFactor, true);
    addLine(lines, "psychDays", qty(m.psychDays), EP.conv * bedFactor, qty(m.psychDays) * EP.conv * bedFactor, true);
    addLine(lines, "sopc", qty(m.sopc), EP.sopc, qty(m.sopc) * EP.sopc, true);
    addLine(lines, "sopcDrugs", qty(m.sopcDrugs), EP.sopcDrug, qty(m.sopcDrugs) * EP.sopcDrug, true);
    addLine(lines, "fmc", qty(m.fmc), EP.fmc, qty(m.fmc) * EP.fmc, true);
    addLine(lines, "fmcDrugs", qty(m.fmcDrugs), EP.fmcDrug, qty(m.fmcDrugs) * EP.fmcDrug, true);
    addLine(lines, "injection", qty(m.injection), EP.injection, qty(m.injection) * EP.injection, true);
    addLine(lines, "dayProc", qty(m.dayProc), EP.dayProc, qty(m.dayProc) * EP.dayProc, true);
    addLine(lines, "geriatricDay", qty(m.geriatricDay), EP.geriatricDay, qty(m.geriatricDay) * EP.geriatricDay, true);
    addLine(lines, "rehabDay", qty(m.rehabDay), EP.rehabDay, qty(m.rehabDay) * EP.rehabDay, true);
    addLine(lines, "psychDay", qty(m.psychDay), EP.psychDay, qty(m.psychDay) * EP.psychDay, true);
    addLine(lines, "communityNursing", qty(m.communityNursing), EP.communityNursing, qty(m.communityNursing) * EP.communityNursing, true);
    addLine(lines, "communityAllied", qty(m.communityAllied), EP.communityAllied, qty(m.communityAllied) * EP.communityAllied, true);
    addLine(lines, "pathInter", qty(m.pathInter), EP.pathInter, qty(m.pathInter) * EP.pathInter, true);
    addLine(lines, "pathAdv", qty(m.pathAdv), EP.pathAdv, qty(m.pathAdv) * EP.pathAdv, true);
    addLine(lines, "radioInter", qty(m.radioInter), EP.radioInter, qty(m.radioInter) * EP.radioInter, true);
    addLine(lines, "radioAdv", qty(m.radioAdv), EP.radioAdv, qty(m.radioAdv) * EP.radioAdv, true);
  } else {
    addLine(lines, "aeConsult", qty(m.aeConsult), NEP.ae, qty(m.aeConsult) * NEP.ae, false);
    if (qty(m.aeExempt) > 0) {
      warnings.push("nepTriage");
    }
    var leftNep = qty(m.aeLeftBefore);
    if (leftNep > 0) {
      addLine(lines, "aeLeftGross", leftNep, NEP.ae, leftNep * NEP.ae, false);
      addLine(lines, "aeLeftRefund", leftNep, -NEP.aeRefund, leftNep * -NEP.aeRefund, false);
    }
    addLine(lines, "acuteDays", qty(m.acuteDays), NEP.general, qty(m.acuteDays) * NEP.general, false);
    addLine(lines, "convDays", qty(m.convDays), NEP.general, qty(m.convDays) * NEP.general, false);
    addLine(lines, "psychDays", qty(m.psychDays), NEP.psych, qty(m.psychDays) * NEP.psych, false);
    addLine(lines, "icuDays", qty(m.icuDays), NEP.icu, qty(m.icuDays) * NEP.icu, false);
    addLine(lines, "hduDays", qty(m.hduDays), NEP.hdu, qty(m.hduDays) * NEP.hdu, false);
    addLine(lines, "nurseryDays", qty(m.nurseryDays), NEP.nursery, qty(m.nurseryDays) * NEP.nursery, false);
    addLine(lines, "sopc", qty(m.sopc), NEP.sopc, qty(m.sopc) * NEP.sopc, false);
    addLine(lines, "sopcDrugs", qty(m.sopcDrugs), NEP.sopcDrug, qty(m.sopcDrugs) * NEP.sopcDrug, false);
    addLine(lines, "fmc", qty(m.fmc), NEP.fmc, qty(m.fmc) * NEP.fmc, false);
    addLine(lines, "fmcDrugs", qty(m.fmcDrugs), NEP.fmcDrug, qty(m.fmcDrugs) * NEP.fmcDrug, false);
    addLine(lines, "injection", qty(m.injection), NEP.injection, qty(m.injection) * NEP.injection, false);
    addLine(lines, "dayProc", qty(m.dayProc), NEP.dayProc, qty(m.dayProc) * NEP.dayProc, false);
    addLine(lines, "haemodialysisChronic", qty(m.haemodialysisChronic), NEP.haemodialysisChronic, qty(m.haemodialysisChronic) * NEP.haemodialysisChronic, false);
    addLine(lines, "haemodialysisAcute", qty(m.haemodialysisAcute), NEP.haemodialysisAcute, qty(m.haemodialysisAcute) * NEP.haemodialysisAcute, false);
    addLine(lines, "oncologyDay", qty(m.oncologyDay), NEP.oncologyDay, qty(m.oncologyDay) * NEP.oncologyDay, false);
    addLine(lines, "ophthalmicDay", qty(m.ophthalmicDay), NEP.ophthalmicDay, qty(m.ophthalmicDay) * NEP.ophthalmicDay, false);
    addLine(lines, "geriatricDay", qty(m.geriatricDay), NEP.geriatricDay, qty(m.geriatricDay) * NEP.geriatricDay, false);
    addLine(lines, "rehabDay", qty(m.rehabDay), NEP.rehabDay, qty(m.rehabDay) * NEP.rehabDay, false);
    addLine(lines, "psychDay", qty(m.psychDay), NEP.psychDay, qty(m.psychDay) * NEP.psychDay, false);
    addLine(lines, "communityNursing", qty(m.communityNursing), NEP.communityNursing, qty(m.communityNursing) * NEP.communityNursing, false);
    addLine(lines, "communityNursingPsych", qty(m.communityNursingPsych), NEP.communityNursingPsych, qty(m.communityNursingPsych) * NEP.communityNursingPsych, false);
    addLine(lines, "communityAllied", qty(m.communityAllied), NEP.communityAllied, qty(m.communityAllied) * NEP.communityAllied, false);
    addLine(lines, "pathInter", qty(m.pathInter), NEP.pathInter, qty(m.pathInter) * NEP.pathInter, false);
    addLine(lines, "pathAdv", qty(m.pathAdv), NEP.pathAdv, qty(m.pathAdv) * NEP.pathAdv, false);
    addLine(lines, "radioInter", qty(m.radioInter), NEP.radioInter, qty(m.radioInter) * NEP.radioInter, false);
    addLine(lines, "radioAdv", qty(m.radioAdv), NEP.radioAdv, qty(m.radioAdv) * NEP.radioAdv, false);
    if (m.obstetric === "booked") {
      addLine(lines, "obstetricBooked", 1, NEP.obstetricBooked, NEP.obstetricBooked, false);
    } else if (m.obstetric === "unbooked") {
      addLine(lines, "obstetricUnbooked", 1, NEP.obstetricUnbooked, NEP.obstetricUnbooked, false);
    }
    if (m.childUnder12) warnings.push("childNep");
    if (m.fullWaiver) warnings.push("waiverNep");
  }

  addLine(lines, "medicalReports", qty(m.medicalReports), ADMIN.medicalReport, qty(m.medicalReports) * ADMIN.medicalReport, false);
  addLine(lines, "medicationDelivery", qty(m.medicationDelivery), ADMIN.medicationDelivery, qty(m.medicationDelivery) * ADMIN.medicationDelivery, false);

  var eligibleGross = money(
    lines.reduce(function (sum, line) {
      return sum + (line.capEligible ? line.amount : 0);
    }, 0),
  );
  var ineligible = money(
    lines.reduce(function (sum, line) {
      return sum + (line.capEligible ? 0 : line.amount);
    }, 0),
  );
  var waivedEligible = waiver ? eligibleGross : 0;
  var eligibleAfterWaiver = money(eligibleGross - waivedEligible);
  var ytd = money(Math.max(0, Number(m.yearToDatePaid) || 0));
  var combined = money(ytd + eligibleAfterWaiver);
  var capRoom = money(Math.max(0, ANNUAL_CAP - ytd));
  var eligibleAfterCap = ep ? money(Math.min(eligibleAfterWaiver, capRoom)) : eligibleAfterWaiver;
  var capApplies = ep && !waiver && combined >= ANNUAL_CAP;
  var capSaving = money(eligibleAfterWaiver - eligibleAfterCap);
  var payableNoCap = money(eligibleAfterWaiver + ineligible);
  var payableWithCap = money(eligibleAfterCap + ineligible);

  if (qty(m.aeLeftBefore) > 0) warnings.push("aeRefundApply");
  if (ep && child) warnings.push("childHalf");
  if (waiver) warnings.push("fullWaiver");
  if (capApplies) warnings.push("capMayApply");
  if (!ep) warnings.push("nepNoCap");

  return {
    ep: ep,
    child: child,
    waiver: waiver,
    lines: lines.filter(function (line) {
      return line.amount !== 0 || line.key === "aeExempt";
    }),
    eligibleGross: eligibleGross,
    waivedEligible: waivedEligible,
    eligibleAfterWaiver: eligibleAfterWaiver,
    ineligible: ineligible,
    yearToDatePaid: ytd,
    combined: combined,
    capApplies: capApplies,
    capRoom: capRoom,
    capSaving: capSaving,
    payableNoCap: payableNoCap,
    payableWithCap: payableWithCap,
    warnings: warnings,
  };
}

export function formatHkd(n) {
  var v = money(n);
  var abs = Math.abs(v);
  var formatted = abs.toLocaleString("en-HK", {
    minimumFractionDigits: v % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return (v < 0 ? "-HK$" : "HK$") + formatted;
}

export function summaryToCsv(result, labels) {
  var rows = [["item", "qty", "unit", "amount"]];
  result.lines.forEach(function (line) {
    rows.push([labels[line.key] || line.key, String(line.qty), String(line.unit), String(line.amount)]);
  });
  rows.push(["eligible_public", "", "", String(result.eligibleAfterWaiver)]);
  rows.push(["admin_or_other", "", "", String(result.ineligible)]);
  rows.push(["payable_before_cap", "", "", String(result.payableNoCap)]);
  rows.push(["payable_if_cap_approved", "", "", String(result.payableWithCap)]);
  var bom = "\uFEFF";
  return (
    bom +
    rows
      .map(function (row) {
        return row
          .map(function (cell) {
            var s = String(cell);
            if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
            return s;
          })
          .join(",");
      })
      .join("\r\n") +
    "\r\n"
  );
}
