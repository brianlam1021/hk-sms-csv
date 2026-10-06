const STORAGE_KEY = "hk-utility-account:v1";

export const BILL_TYPES = ["electricity", "water", "towngas", "lpg", "comms", "other"];
export const METHODS = ["submeter", "area", "persondays", "days", "equal", "custom"];
export const REMAINDER_METHODS = ["proportional", "equal", "custom"];

const TYPE_META = {
  electricity: { zh: "電費", en: "Electricity", providerZh: "中電 CLP／港燈 HK Electric", providerEn: "CLP / HK Electric", unitZh: "度（kWh）", unitEn: "kWh" },
  water: { zh: "水費", en: "Water", providerZh: "水務署 WSD", providerEn: "WSD", unitZh: "立方米（m³）", unitEn: "m³" },
  towngas: { zh: "煤氣", en: "Towngas", providerZh: "煤氣公司 Towngas", providerEn: "Towngas", unitZh: "立方米（m³）", unitEn: "m³" },
  lpg: { zh: "石油氣", en: "LPG", providerZh: "石油氣供應商", providerEn: "LPG supplier", unitZh: "公斤／立方米", unitEn: "kg / m³" },
  comms: { zh: "上網·電話·收費電視", en: "Communications", providerZh: "寬頻／電話／收費電視", providerEn: "Broadband / phone / pay TV", unitZh: "單位", unitEn: "units" },
  other: { zh: "其他", en: "Other", providerZh: "供應商", providerEn: "Provider", unitZh: "單位", unitEn: "units" },
};

const METHOD_META = {
  submeter: { zh: "獨立分錶度數", en: "Sub-meter readings" },
  area: { zh: "按面積", en: "Floor area" },
  persondays: { zh: "按人數×日數", en: "Person-days" },
  days: { zh: "按日數", en: "Days occupied" },
  equal: { zh: "平均", en: "Equal split" },
  custom: { zh: "自訂百分比", en: "Custom %" },
};

const REMAINDER_META = {
  proportional: { zh: "按分錶用量比例", en: "Proportional to sub-meter usage" },
  equal: { zh: "平均", en: "Equal" },
  custom: { zh: "自訂百分比", en: "Custom %" },
};

const I18N = {
  zh: {
    pageTitle: "劏房／分租水電費分攤帳目產生器",
    lede: "為香港劏房規管租賃及合租室友產生水電、煤氣、石油氣與上網等費用的書面分攤帳目。不用註冊，不會上傳。",
    notice: "只供參考，並非法律意見；一切以《業主與租客（綜合）條例》第IVA部及差估署資料為準。",
    clearData: "清除資料 Clear data",
    demoBtn: "載入示範",
    formTitle: "帳目資料",
    whoLegend: "繳費人與物業",
    landlordName: "繳費人／業主姓名（帳單具名人）",
    propertyAddress: "物業地址（可選）",
    issuedDate: "帳目發出日期",
    notes: "備註（可選）",
    rulesLegend: "取整與單位",
    roundLegend: "金額向下取整至",
    roundDime: "港幣 0.1 元",
    roundDollar: "港幣 1 元",
    areaUnitLegend: "面積單位",
    landlordRow: "加入「業主自用／公用」一列，該份額由業主承擔",
    billsTitle: "繳費單",
    billsLead: "可加入多張單（電、水、煤氣、石油氣、上網／電話／收費電視）。",
    addBill: "新增繳費單",
    unitsTitle: "單位／住客",
    unitsLead: "日數留空則按該張繳費單的期間日數計算。",
    addUnit: "新增單位",
    tenantCheckTitle: "租客核對",
    tenantCheckLead: "輸入帳單總額、你的分攤基準，以及業主要求的金額，核對是否高於按該基準計算的公允分攤額（向下取整）。",
    tcBill: "繳費單總額（港元）",
    tcBasis: "你的基準（例如度數、面積、人日或百分比）",
    tcWhole: "全體基準（例如總錶度數、總面積或 100）",
    tcDemand: "業主要求你支付的金額（港元）",
    printBtn: "列印／另存 PDF",
    copyBtn: "複製文字",
    csvBtn: "下載 CSV",
    slipLabel: "顯示",
    draftStatus: "草稿會自動保存在此瀏覽器。",
    faqTitle: "常見問題",
    faq1q: "劏房租客要分擔水電費，業主要符合甚麼條件？",
    faq1a: "根據《業主與租客（綜合）條例》第IVA部，若分間單位沒有獨立水電／煤氣／通訊帳單，業主要求租客償還該等費用前，須為繳費單上的具名人、向租客出示帳單副本，並給予書面帳目說明如何分攤，且所有分攤款額之和不得超過帳單款額；亦不得收取多於該單位所示分攤額。超收屬罪行。本工具只供參考，並非法律意見。",
    faq2q: "可以用甚麼方法分攤水電費？",
    faq2a: "本頁支援：獨立分錶度數（平均單價＝帳單÷總錶，未分錶／公用用量再按分錶比例、平均或自訂百分比攤分）、按面積、按人數×日數、按日數、平均，以及自訂百分比（須合計100%）。合租室友分中電、港燈、水務署、煤氣或寬頻帳單同樣適用。",
    faq3q: "為甚麼金額要向下取整？",
    faq3a: "條例要求各經分攤款額總和不得超過繳費單款額。每名租客款額向下取整至港幣1角或1元，差額由業主承擔，即可保證總和不大於帳單，亦避免因四捨五入而超收。",
    faq4q: "合租室友可以用這個工具嗎？",
    faq4a: "可以。書面帳目格式對劏房規管租賃及一般合租分帳單都有用。合租並非一律受第IVA部規管，但仍可用同一套透明分攤方法。",
    faq5q: "資料會上傳嗎？",
    faq5a: "不會。全部分攤在瀏覽器內計算，草稿只可選擇寫入本機 localStorage。沒有帳戶、沒有伺服器存檔。列印、複製或下載 CSV 才會在你選擇的位置產生內容。",
    sourcesTitle: "法例及資料來源 / Sources",
    srcRvd: "差餉物業估價署 — 第IVA部規管租賃：",
    srcSdu: "分間單位區域服務隊資訊平台 — 規管租賃：",
    srcCap: "《業主與租客（綜合）條例》（第7章）電子版：",
    privacyTitle: "私隱",
    privacyBody: "姓名、地址與帳單數字只留在這個瀏覽器（localStorage）。本頁不上傳、不設帳號、不設後端，亦不會向外部伺服器發送請求。列印、複製或匯出 CSV 才會在你選擇的位置產生檔案。",
    disclaimer: "只供參考，並非法律意見；一切以《業主與租客（綜合）條例》第IVA部及差估署資料為準。 / For reference only, not legal advice.",
    backHome: "← 返回短訊記帳CSV",
    otherTools: "其他免費工具：",
    toolReceipt: "外傭工資收據",
    source: "開源靜態頁，原始碼在",
    footerFine: "不是差餉物業估價署或任何政府部門的官方工具。請自行核對法例與帳單原文。",
    checkTitle: "業主合規提示",
    checkLead: "若單位沒有獨立帳單而要求租客償還水電等費用，業主應同時做到：",
    check1: "業主為繳費單上的具名人／繳費人 ✓",
    check2: "向租客出示該份帳單副本 ✓",
    check3: "給予本頁產生的書面帳目，說明如何分攤 ✓",
    check4: "不得收取多於帳目上該單位所示的分攤額 ✓",
    accountTitle: "水電費及其他公用設施分攤書面帳目",
    accountTitleEn: "Written apportionment account of utility charges",
    colUnit: "單位",
    colTenant: "住客",
    colBasis: "基準",
    colShare: "份額",
    colAmount: "金額",
    allUnits: "全部單位（完整帳目）",
    copied: "已複製到剪貼簿。",
    copyFail: "未能複製，請手動選取文字。",
    confirmClear: "確定清除本機所有已儲存的帳目資料？",
    confirmDemo: "載入示範會覆蓋目前表格。繼續？",
    landlordLabel: "業主自用／公用",
    landlordAbsorbs: "由業主承擔",
    warnTitle: "請先核對",
    periodFrom: "期間由",
    periodTo: "期間至",
    billAmount: "繳費單款額（港元）",
    mainConsumption: "總錶用量（可選）",
    accountHolder: "帳單具名人",
    provider: "供應商",
    billType: "種類",
    method: "分攤方法",
    remainderMethod: "未分錶／公用用量分攤",
    unitLabel: "單位名稱",
    tenantName: "住客姓名",
    floorArea: "面積（可選）",
    occupants: "人數",
    daysOccupied: "佔用日數（可選）",
    removeBill: "刪除此單",
    removeUnit: "刪除此列",
    prevReading: "上期讀數",
    currReading: "今期讀數",
    customPct: "自訂 %",
    remainderPct: "公用 %",
    usage: "用量",
    payer: "繳費人／具名人",
    address: "物業地址",
    issued: "發出日期",
    billNo: "繳費單",
    period: "期間",
    totalMeter: "總錶用量",
    unitPrice: "平均單價",
    methodLabel: "分攤方法",
    tenantTotals: "各租客合計（所有繳費單）",
    absorbed: "差額（由業主承擔）",
    apportionedSum: "各經分攤款額總和",
    billTotal: "繳費單款額",
    notesLabel: "備註",
    signLandlord: "繳費人／業主簽署",
    signTenant: "住客簽署",
    slipTitle: "住客分攤通知",
    emptyAccount: "請加入繳費單與單位後，書面帳目會顯示在這裡。",
    rvdHelp: "差餉物業估價署提供免費諮詢及調解服務：",
  },
  en: {
    pageTitle: "SDU / shared-flat utility apportionment account",
    lede: "Produce a written account splitting water, electricity, gas, LPG and communications bills for Hong Kong SDU regulated tenancies or flatmates. No sign-up. Nothing is uploaded.",
    notice: "For reference only, not legal advice. The Landlord and Tenant (Consolidation) Ordinance Part IVA and Rating and Valuation Department materials prevail.",
    clearData: "Clear data / 清除資料",
    demoBtn: "Load sample",
    formTitle: "Account details",
    whoLegend: "Payer and property",
    landlordName: "Payer / landlord name (named on the bill)",
    propertyAddress: "Property address (optional)",
    issuedDate: "Date issued",
    notes: "Notes (optional)",
    rulesLegend: "Rounding and units",
    roundLegend: "Round every tenant amount down to",
    roundDime: "HK$0.1",
    roundDollar: "HK$1",
    areaUnitLegend: "Floor-area unit",
    landlordRow: "Add a landlord-occupied / common-area row absorbed by the landlord",
    billsTitle: "Bills",
    billsLead: "Add one or more bills (electricity, water, Towngas, LPG, internet / phone / pay TV).",
    addBill: "Add bill",
    unitsTitle: "Units / occupants",
    unitsLead: "Leave days blank to use each bill’s period length.",
    addUnit: "Add unit",
    tenantCheckTitle: "Tenant check",
    tenantCheckLead: "Enter the bill total, your share of the basis, and the amount demanded. This checks whether the demand is higher than a fair apportionment (rounded down) of those figures.",
    tcBill: "Bill total (HK$)",
    tcBasis: "Your basis (e.g. kWh, area, person-days or %)",
    tcWhole: "Whole-bill basis (e.g. main-meter kWh, total area or 100)",
    tcDemand: "Amount the landlord asked you to pay (HK$)",
    printBtn: "Print / Save as PDF",
    copyBtn: "Copy as text",
    csvBtn: "Download CSV",
    slipLabel: "Show",
    draftStatus: "A draft is saved automatically in this browser.",
    faqTitle: "FAQ",
    faq1q: "When may a landlord ask an SDU tenant to repay utilities?",
    faq1a: "Under Part IVA of the Landlord and Tenant (Consolidation) Ordinance, if the unit has no separate bill, the landlord may ask for reimbursement only if the landlord is the named payer, shows the tenant a copy of the bill, gives a written account of how the bill is apportioned (and the sum of apportioned amounts does not exceed the bill), and does not demand more than the amount shown for that unit. Overcharging is an offence. This tool is for reference only and is not legal advice.",
    faq2q: "Which split methods can I use?",
    faq2a: "Sub-meter readings (average unit price = bill ÷ main-meter consumption; unmetered / common usage is then shared by sub-meter proportion, equally, or by custom %); floor area; person-days; days only; equal; and custom % (must total 100%). The same methods work for flatmates splitting CLP, HK Electric, WSD, Towngas or broadband bills.",
    faq3q: "Why round down?",
    faq3a: "The Ordinance requires that the sum of apportioned amounts must not exceed the bill. Rounding every tenant line down to HK$0.1 or HK$1, with the difference absorbed by the landlord, keeps the total at or below the bill and avoids overcharging from ordinary rounding.",
    faq4q: "Can flatmates use this?",
    faq4a: "Yes. The written-account format is useful for both SDU regulated tenancies and ordinary flatshares. Flatshares are not all regulated by Part IVA, but the same transparent split still helps.",
    faq5q: "Is anything uploaded?",
    faq5a: "No. All maths run in your browser. A draft may be saved to localStorage on this device only. There is no account and no server copy. A file is created only when you print, copy or export CSV.",
    sourcesTitle: "Ordinance and sources / 法例及資料來源",
    srcRvd: "Rating and Valuation Department — Part IVA regulated tenancies:",
    srcSdu: "SDU District Service Team information platform — regulated tenancy:",
    srcCap: "Landlord and Tenant (Consolidation) Ordinance (Cap. 7) on eLegislation:",
    privacyTitle: "Privacy",
    privacyBody: "Names, address and bill figures stay in this browser (localStorage). Nothing is uploaded and this page makes no requests to other servers. A file is created only when you print, copy or export CSV.",
    disclaimer: "For reference only, not legal advice. The Landlord and Tenant (Consolidation) Ordinance Part IVA and Rating and Valuation Department materials prevail. / 只供參考，並非法律意見。",
    backHome: "← Back to SMS ledger",
    otherTools: "Other free tools:",
    toolReceipt: "FDH wage receipt",
    source: "Open-source static page. Source on",
    footerFine: "Not an official Rating and Valuation Department or government tool. Please check the Ordinance and the original bill.",
    checkTitle: "Landlord compliance reminder",
    checkLead: "If there is no separate bill for the unit and the landlord asks the tenant to repay a utility, the landlord should also:",
    check1: "Be the named payer on the bill ✓",
    check2: "Show the tenant a copy of the bill ✓",
    check3: "Give this written account showing how the bill is split ✓",
    check4: "Not charge more than the amount shown for that unit ✓",
    accountTitle: "Written apportionment account of utility charges",
    accountTitleEn: "水電費及其他公用設施分攤書面帳目",
    colUnit: "Unit",
    colTenant: "Occupant",
    colBasis: "Basis",
    colShare: "Share",
    colAmount: "Amount",
    allUnits: "All units (full account)",
    copied: "Copied to clipboard.",
    copyFail: "Could not copy. Please select the text manually.",
    confirmClear: "Clear all saved account data in this browser?",
    confirmDemo: "Loading the sample will replace the current form. Continue?",
    landlordLabel: "Landlord / common",
    landlordAbsorbs: "Absorbed by landlord",
    warnTitle: "Please check",
    periodFrom: "Period from",
    periodTo: "Period to",
    billAmount: "Bill total (HK$)",
    mainConsumption: "Main-meter consumption (optional)",
    accountHolder: "Named account holder",
    provider: "Provider",
    billType: "Type",
    method: "Apportionment method",
    remainderMethod: "Unmetered / common usage split",
    unitLabel: "Unit label",
    tenantName: "Tenant name",
    floorArea: "Floor area (optional)",
    occupants: "Occupants",
    daysOccupied: "Days occupied (optional)",
    removeBill: "Remove bill",
    removeUnit: "Remove row",
    prevReading: "Previous reading",
    currReading: "Current reading",
    customPct: "Custom %",
    remainderPct: "Common %",
    usage: "Usage",
    payer: "Payer / named on bill",
    address: "Property address",
    issued: "Date issued",
    billNo: "Bill",
    period: "Period",
    totalMeter: "Main-meter consumption",
    unitPrice: "Average unit price",
    methodLabel: "Method",
    tenantTotals: "Per-tenant total (all bills)",
    absorbed: "Difference (absorbed by landlord)",
    apportionedSum: "Sum of apportioned amounts",
    billTotal: "Bill amount",
    notesLabel: "Notes",
    signLandlord: "Landlord / payer signature",
    signTenant: "Tenant signature",
    slipTitle: "Tenant apportionment slip",
    emptyAccount: "Add a bill and at least one unit to see the written account.",
    rvdHelp: "The Rating and Valuation Department offers free advice and mediation:",
  },
};

export function toCents(n) {
  var x = Number(n);
  if (!isFinite(x)) return 0;
  return Math.round(x * 100 + 1e-8);
}

export function fromCents(cents) {
  return Math.round(cents) / 100;
}

export function num(v, fallback) {
  if (v === "" || v == null) return fallback;
  var n = Number(v);
  return isFinite(n) ? n : fallback;
}

export function inclusiveDays(fromIso, toIso) {
  var a = parseIso(fromIso);
  var b = parseIso(toIso);
  if (!a || !b) return 0;
  return Math.round((b - a) / 86400000) + 1;
}

export function parseIso(iso) {
  if (!iso) return null;
  var p = String(iso).split("-");
  if (p.length < 3) return null;
  var y = Number(p[0]);
  var m = Number(p[1]);
  var d = Number(p[2]);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function todayIso() {
  var d = new Date();
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

export function monthBounds(iso) {
  var d = parseIso(iso) || new Date();
  var y = d.getFullYear();
  var m = d.getMonth() + 1;
  var last = new Date(y, m, 0).getDate();
  return {
    from: y + "-" + pad2(m) + "-01",
    to: y + "-" + pad2(m) + "-" + pad2(last),
  };
}

export function formatHKD(n) {
  var cents = toCents(n);
  var neg = cents < 0;
  cents = Math.abs(cents);
  var dollars = Math.floor(cents / 100);
  var frac = pad2(cents % 100);
  var whole = String(dollars).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "-" : "") + "HK$" + whole + "." + frac;
}

export function roundDownMoney(amount, increment) {
  var x = Number(amount);
  if (!isFinite(x) || x <= 0) return 0;
  if (Number(increment) === 1) {
    return Math.max(0, Math.floor(x + 1e-9));
  }
  return Math.max(0, Math.floor(x * 10 + 1e-9) / 10);
}

export function formatDate(iso, lang) {
  if (!iso) return "________";
  var p = String(iso).split("-");
  if (lang === "en") {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Number(p[2]) + " " + months[Number(p[1]) - 1] + " " + p[0];
  }
  return Number(p[0]) + "年" + Number(p[1]) + "月" + Number(p[2]) + "日";
}

export function consumptionUnit(type, lang) {
  var meta = TYPE_META[type] || TYPE_META.other;
  return lang === "en" ? meta.unitEn : meta.unitZh;
}

export function typeLabel(type, lang) {
  var meta = TYPE_META[type] || TYPE_META.other;
  return lang === "en" ? meta.en : meta.zh;
}

export function methodLabel(method, lang) {
  var meta = METHOD_META[method] || METHOD_META.equal;
  return lang === "en" ? meta.en : meta.zh;
}

function remainderLabel(method, lang) {
  var meta = REMAINDER_META[method] || REMAINDER_META.equal;
  return lang === "en" ? meta.en : meta.zh;
}

function billDays(bill) {
  return Math.max(0, inclusiveDays(bill.periodFrom, bill.periodTo));
}

function unitDays(unit, bill) {
  if (unit.daysOccupied != null && unit.daysOccupied !== "") {
    var d = Number(unit.daysOccupied);
    if (isFinite(d)) return Math.max(0, d);
  }
  return billDays(bill);
}

export function submeterUsage(unit, billId) {
  var sm = unit.submeters && unit.submeters[billId];
  if (!sm) return null;
  if (sm.prev === "" || sm.prev == null || sm.curr === "" || sm.curr == null) return null;
  var prev = Number(sm.prev);
  var curr = Number(sm.curr);
  if (!isFinite(prev) || !isFinite(curr)) return null;
  return curr - prev;
}

function warn(code, extra) {
  return { code: code, extra: extra || {} };
}

function emptyResult(bill, units, warnings) {
  return {
    ok: false,
    billId: bill.id,
    amount: num(bill.amount, 0),
    method: bill.method,
    warnings: warnings,
    unitPrice: null,
    mainConsumption: num(bill.mainConsumption, null),
    sumSubUsage: null,
    commonUsage: null,
    rows: units.map(function (u) {
      return {
        unitId: u.id,
        label: u.label || "",
        tenantName: u.tenantName || "",
        isLandlord: !!u.isLandlord,
        basisValue: 0,
        basisText: "—",
        sharePct: 0,
        exactAmount: 0,
        amount: 0,
      };
    }),
    roundedSum: 0,
    remainder: num(bill.amount, 0),
    legal: true,
  };
}

function finishRows(bill, rows, increment) {
  var billAmt = num(bill.amount, 0);
  var billCents = toCents(billAmt);
  var exactTotal = 0;
  for (var i = 0; i < rows.length; i++) exactTotal += rows[i].exactAmount;
  for (var j = 0; j < rows.length; j++) {
    var row = rows[j];
    row.sharePct = billAmt > 0 ? (row.exactAmount / billAmt) * 100 : 0;
    row.amount = roundDownMoney(row.exactAmount, increment);
  }
  var roundedCents = 0;
  for (var k = 0; k < rows.length; k++) roundedCents += toCents(rows[k].amount);
  if (roundedCents > billCents) {
    var overflow = roundedCents - billCents;
    for (var k2 = rows.length - 1; k2 >= 0 && overflow > 0; k2--) {
      var have = toCents(rows[k2].amount);
      var take = Math.min(have, overflow);
      rows[k2].amount = fromCents(have - take);
      overflow -= take;
    }
    roundedCents = 0;
    for (var k3 = 0; k3 < rows.length; k3++) roundedCents += toCents(rows[k3].amount);
  }
  var roundedSum = fromCents(roundedCents);
  var remainder = fromCents(Math.max(0, billCents - roundedCents));
  var result = {
    ok: true,
    billId: bill.id,
    amount: billAmt,
    method: bill.method,
    warnings: [],
    unitPrice: null,
    mainConsumption: num(bill.mainConsumption, null),
    sumSubUsage: null,
    commonUsage: null,
    rows: rows,
    roundedSum: roundedSum,
    remainder: remainder,
    exactTotal: exactTotal,
    legal: roundedCents <= billCents,
  };
  assertApportionmentLegal(result);
  return result;
}

function weightsOrWarn(units, weightFn, missingCode) {
  var weights = [];
  var sum = 0;
  var missing = false;
  for (var i = 0; i < units.length; i++) {
    var w = weightFn(units[i]);
    if (w == null) {
      missing = true;
      w = 0;
    }
    weights.push(w);
    sum += w;
  }
  if (missing && missingCode) return { ok: false, code: missingCode, weights: weights, sum: sum };
  if (sum <= 0) return { ok: false, code: "NO_WEIGHTS", weights: weights, sum: sum };
  return { ok: true, weights: weights, sum: sum };
}

function rowsFromWeights(units, bill, weights, sum, basisTextFn) {
  var amount = num(bill.amount, 0);
  return units.map(function (u, i) {
    var w = weights[i];
    return {
      unitId: u.id,
      label: u.label || "",
      tenantName: u.tenantName || "",
      isLandlord: !!u.isLandlord,
      basisValue: w,
      basisText: basisTextFn ? basisTextFn(u, w) : String(w),
      sharePct: 0,
      exactAmount: amount * (w / sum),
      amount: 0,
    };
  });
}

export function apportionBill(bill, units, opts) {
  var increment = opts && Number(opts.rounding) === 1 ? 1 : 0.1;
  var lang = opts && opts.lang === "en" ? "en" : "zh";
  var areaUnit = opts && opts.areaUnit === "m2" ? "m2" : "ft2";
  var list = units || [];
  if (!list.length) return emptyResult(bill, [], [warn("NO_UNITS")]);
  var method = bill.method || "equal";
  var amount = num(bill.amount, 0);
  if (amount < 0) return emptyResult(bill, list, [warn("NEG_AMOUNT")]);

  if (method === "submeter") {
    return apportionSubmeter(bill, list, increment, lang);
  }
  if (method === "area") {
    var areaW = weightsOrWarn(
      list,
      function (u) {
        var a = num(u.area, null);
        return a == null ? null : Math.max(0, a);
      },
      "MISSING_AREA"
    );
    if (!areaW.ok) return emptyResult(bill, list, [warn(areaW.code)]);
    var unitName = areaUnit === "m2" ? "m²" : "ft²";
    return finishRows(
      bill,
      rowsFromWeights(list, bill, areaW.weights, areaW.sum, function (u, w) {
        return w + " " + unitName;
      }),
      increment
    );
  }
  if (method === "persondays") {
    var pd = weightsOrWarn(list, function (u) {
      return Math.max(0, num(u.occupants, 0)) * unitDays(u, bill);
    });
    if (!pd.ok) return emptyResult(bill, list, [warn(pd.code)]);
    return finishRows(
      bill,
      rowsFromWeights(list, bill, pd.weights, pd.sum, function (u, w) {
        var occ = Math.max(0, num(u.occupants, 0));
        var days = unitDays(u, bill);
        return occ + (lang === "en" ? " × " : "人 × ") + days + (lang === "en" ? " days = " : "日 = ") + w;
      }),
      increment
    );
  }
  if (method === "days") {
    var dw = weightsOrWarn(list, function (u) {
      return unitDays(u, bill);
    });
    if (!dw.ok) return emptyResult(bill, list, [warn(dw.code)]);
    return finishRows(
      bill,
      rowsFromWeights(list, bill, dw.weights, dw.sum, function (u, w) {
        return w + (lang === "en" ? " days" : " 日");
      }),
      increment
    );
  }
  if (method === "custom") {
    var cw = weightsOrWarn(list, function (u) {
      var pct = u.customPct && u.customPct[bill.id];
      return Math.max(0, num(pct, 0));
    });
    if (!cw.ok) return emptyResult(bill, list, [warn(cw.code)]);
    if (Math.abs(cw.sum - 100) > 0.05) {
      return emptyResult(bill, list, [warn("CUSTOM_PCT", { total: cw.sum })]);
    }
    return finishRows(
      bill,
      rowsFromWeights(list, bill, cw.weights, cw.sum, function (u, w) {
        return w.toFixed(2) + "%";
      }),
      increment
    );
  }
  var ew = weightsOrWarn(list, function () {
    return 1;
  });
  return finishRows(
    bill,
    rowsFromWeights(list, bill, ew.weights, ew.sum, function () {
      return lang === "en" ? "1 share" : "1 份";
    }),
    increment
  );
}

function apportionSubmeter(bill, units, increment, lang) {
  var usages = [];
  var sumSub = 0;
  var anyNeg = false;
  for (var i = 0; i < units.length; i++) {
    var usage = submeterUsage(units[i], bill.id);
    if (usage == null) usage = 0;
    if (usage < 0) anyNeg = true;
    usages.push(usage);
    sumSub += usage;
  }
  if (anyNeg) return emptyResult(bill, units, [warn("NEG_USAGE")]);
  var mainRaw = bill.mainConsumption;
  var hasMain = mainRaw !== "" && mainRaw != null && isFinite(Number(mainRaw)) && Number(mainRaw) > 0;
  var main = hasMain ? Number(mainRaw) : null;
  if (hasMain && sumSub - main > 1e-9) {
    return emptyResult(bill, units, [warn("SUB_EXCEEDS_MAIN", { sum: sumSub, main: main })]);
  }
  if (!hasMain) {
    if (sumSub <= 0) return emptyResult(bill, units, [warn("NO_WEIGHTS")]);
    var prop = finishRows(
      bill,
      rowsFromWeights(units, bill, usages, sumSub, function (u, w) {
        return w + " " + consumptionUnit(bill.type, lang);
      }),
      increment
    );
    prop.sumSubUsage = sumSub;
    prop.commonUsage = null;
    prop.unitPrice = null;
    return prop;
  }
  var unitPrice = num(bill.amount, 0) / main;
  var commonUsage = main - sumSub;
  var remMethod = bill.remainderMethod || "proportional";
  var remWeights = [];
  var remSum = 0;
  for (var r = 0; r < units.length; r++) {
    var rw = 0;
    if (remMethod === "equal") rw = 1;
    else if (remMethod === "custom") rw = Math.max(0, num(units[r].remainderPct && units[r].remainderPct[bill.id], 0));
    else rw = usages[r];
    remWeights.push(rw);
    remSum += rw;
  }
  if (commonUsage > 1e-9 && remMethod === "custom" && Math.abs(remSum - 100) > 0.05) {
    return emptyResult(bill, units, [warn("REMAINDER_PCT", { total: remSum })]);
  }
  if (commonUsage > 1e-9 && remSum <= 0) {
    remWeights = units.map(function () {
      return 1;
    });
    remSum = units.length;
  }
  var commonAmount = commonUsage * unitPrice;
  var rows = units.map(function (u, idx) {
    var metered = usages[idx] * unitPrice;
    var commonShare = remSum > 0 ? commonAmount * (remWeights[idx] / remSum) : 0;
    return {
      unitId: u.id,
      label: u.label || "",
      tenantName: u.tenantName || "",
      isLandlord: !!u.isLandlord,
      basisValue: usages[idx],
      basisText: usages[idx] + " " + consumptionUnit(bill.type, lang),
      sharePct: 0,
      exactAmount: metered + commonShare,
      amount: 0,
    };
  });
  var result = finishRows(bill, rows, increment);
  result.unitPrice = unitPrice;
  result.mainConsumption = main;
  result.sumSubUsage = sumSub;
  result.commonUsage = commonUsage;
  result.remainderMethod = remMethod;
  return result;
}

export function assertApportionmentLegal(result) {
  if (!result || !result.ok) return true;
  var sumCents = 0;
  for (var i = 0; i < result.rows.length; i++) {
    var row = result.rows[i];
    if (toCents(row.amount) - toCents(row.exactAmount) > 0) {
      throw new Error("Rounded amount exceeds exact share for " + row.unitId);
    }
    sumCents += toCents(row.amount);
  }
  var billCents = toCents(result.amount);
  if (sumCents > billCents) {
    throw new Error("Apportionment sum HK$" + fromCents(sumCents) + " exceeds bill HK$" + fromCents(billCents));
  }
  result.legal = true;
  result.roundedSum = fromCents(sumCents);
  return true;
}

export function apportionAccount(state) {
  var bills = state.bills || [];
  var units = state.units || [];
  var opts = { rounding: state.rounding, areaUnit: state.areaUnit, lang: state.lang };
  var results = bills.map(function (bill) {
    return apportionBill(bill, units, opts);
  });
  var totals = {};
  for (var i = 0; i < units.length; i++) {
    totals[units[i].id] = {
      unitId: units[i].id,
      label: units[i].label || "",
      tenantName: units[i].tenantName || "",
      isLandlord: !!units[i].isLandlord,
      amount: 0,
    };
  }
  for (var b = 0; b < results.length; b++) {
    var rows = results[b].rows || [];
    for (var r = 0; r < rows.length; r++) {
      if (totals[rows[r].unitId]) totals[rows[r].unitId].amount += rows[r].amount;
    }
  }
  var tenantTotals = [];
  var keys = Object.keys(totals);
  for (var t = 0; t < keys.length; t++) {
    totals[keys[t]].amount = fromCents(toCents(totals[keys[t]].amount));
    tenantTotals.push(totals[keys[t]]);
  }
  return { bills: results, tenantTotals: tenantTotals };
}

export function tenantCheck(billTotal, basis, whole, demanded, increment) {
  var bill = num(billTotal, 0);
  var b = num(basis, 0);
  var w = num(whole, 0);
  var demand = num(demanded, 0);
  if (bill <= 0 || w <= 0) {
    return { ok: false, reason: "INCOMPLETE", fair: 0, demanded: demand, exceeds: false };
  }
  var exact = bill * (b / w);
  var fair = roundDownMoney(exact, increment);
  var exceeds = demand > fair + 1e-9;
  return { ok: true, exact: exact, fair: fair, demanded: demand, exceeds: exceeds, sharePct: (b / w) * 100 };
}

export function formulaText(bill, result, lang, rounding) {
  var method = bill.method || "equal";
  var round = Number(rounding) === 1 || Number(bill._rounding) === 1 || (result && Number(result._rounding) === 1) ? 1 : 0.1;
  var zhRound = round === 1 ? "1 元" : "0.1 元";
  var enRound = round === 1 ? "HK$1" : "HK$0.1";
  var tailZh = "各單位款額向下取整至港幣" + zhRound + "，差額由業主承擔，以確保分攤總和不大於繳費單款額。";
  var tailEn = "Each unit amount is rounded down to " + enRound + ". The difference is absorbed by the landlord so the sum never exceeds the bill.";
  if (method === "submeter") {
    if (result && result.mainConsumption) {
      var rem = remainderLabel(result.remainderMethod || bill.remainderMethod, lang);
      if (lang === "en") {
        return (
          "Average unit price = bill total ÷ main-meter consumption. Each unit pays its sub-meter usage × that price. Unmetered / common usage (main − Σ sub-meters) is then shared (" +
          rem +
          "). " +
          tailEn
        );
      }
      return (
        "平均單價 = 繳費單款額 ÷ 總錶用量。各單位應付 = 分錶用量 × 平均單價。未分錶／公用用量（總錶 − 各分錶之和）再按" +
        rem +
        "攤分。" +
        tailZh
      );
    }
    return lang === "en"
      ? "No main-meter total was entered, so the bill is split in proportion to sub-meter usage. " + tailEn
      : "未填總錶用量，故按各單位分錶用量比例攤分整張繳費單。" + tailZh;
  }
  if (method === "area") {
    return lang === "en"
      ? "Each unit pays bill × its floor area ÷ total floor area. " + tailEn
      : "各單位應付 = 繳費單款額 × 該單位面積 ÷ 總面積。" + tailZh;
  }
  if (method === "persondays") {
    return lang === "en"
      ? "Each unit pays bill × (occupants × days occupied) ÷ total person-days. " + tailEn
      : "各單位應付 = 繳費單款額 ×（人數 × 日數）÷ 總人日。" + tailZh;
  }
  if (method === "days") {
    return lang === "en"
      ? "Each unit pays bill × days occupied ÷ total days. " + tailEn
      : "各單位應付 = 繳費單款額 × 日數 ÷ 總日數。" + tailZh;
  }
  if (method === "custom") {
    return lang === "en"
      ? "Each unit pays bill × its custom percentage (must total 100%). " + tailEn
      : "各單位應付 = 繳費單款額 × 自訂百分比（合計須為 100%）。" + tailZh;
  }
  return lang === "en"
    ? "The bill is split equally among the listed units. " + tailEn
    : "各單位應付 = 繳費單款額 ÷ 單位數目。" + tailZh;
}

function escapeCsv(value) {
  var text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
  return text;
}

export function accountToCsv(state, account) {
  var lang = state.lang === "en" ? "en" : "zh";
  var headers =
    lang === "en"
      ? ["Bill type", "Provider", "Period from", "Period to", "Bill amount", "Unit", "Tenant", "Basis", "Share %", "Amount", "Landlord absorbed"]
      : ["種類", "供應商", "期間由", "期間至", "繳費單款額", "單位", "住客", "基準", "份額%", "金額", "業主承擔差額"];
  var lines = [headers.join(",")];
  var bills = state.bills || [];
  for (var i = 0; i < bills.length; i++) {
    var bill = bills[i];
    var result = account.bills[i];
    var rows = result && result.rows ? result.rows : [];
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      lines.push(
        [
          typeLabel(bill.type, lang),
          bill.provider || "",
          bill.periodFrom || "",
          bill.periodTo || "",
          num(bill.amount, 0).toFixed(2),
          row.label,
          row.isLandlord ? (lang === "en" ? "Landlord / common" : "業主自用／公用") : row.tenantName,
          row.basisText,
          row.sharePct.toFixed(2),
          Number(row.amount).toFixed(2),
          r === 0 ? Number(result.remainder).toFixed(2) : "",
        ]
          .map(escapeCsv)
          .join(",")
      );
    }
  }
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}

export function accountToText(state, account, slipUnitId) {
  var lang = state.lang === "en" ? "en" : "zh";
  var pack = I18N[lang];
  var lines = [];
  lines.push(lang === "en" ? "Utility apportionment account" : "【水電費分攤書面帳目】");
  if (state.landlordName) lines.push((lang === "en" ? "Payer: " : "繳費人：") + state.landlordName);
  if (state.propertyAddress) lines.push((lang === "en" ? "Address: " : "物業：") + state.propertyAddress);
  if (state.issuedDate) lines.push((lang === "en" ? "Issued: " : "發出：") + formatDate(state.issuedDate, lang));
  lines.push("");
  for (var i = 0; i < (state.bills || []).length; i++) {
    var bill = state.bills[i];
    var result = account.bills[i];
    lines.push("── " + typeLabel(bill.type, lang) + (bill.provider ? " · " + bill.provider : "") + " ──");
    lines.push((lang === "en" ? "Period: " : "期間：") + formatDate(bill.periodFrom, lang) + " – " + formatDate(bill.periodTo, lang));
    lines.push((lang === "en" ? "Bill: " : "繳費單：") + formatHKD(bill.amount));
    lines.push((lang === "en" ? "Method: " : "方法：") + methodLabel(bill.method, lang));
    var rows = (result.rows || []).filter(function (row) {
      return !slipUnitId || row.unitId === slipUnitId;
    });
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      var who = row.isLandlord ? pack.landlordLabel : row.tenantName || row.label;
      lines.push(
        (row.label || "") +
          " " +
          who +
          "  " +
          row.basisText +
          "  " +
          row.sharePct.toFixed(2) +
          "%  " +
          formatHKD(row.amount)
      );
    }
    if (result.ok) {
      lines.push(
        "✓ " +
          pack.apportionedSum +
          " " +
          formatHKD(result.roundedSum) +
          " ≤ " +
          pack.billTotal +
          " " +
          formatHKD(result.amount)
      );
      lines.push(pack.absorbed + " " + formatHKD(result.remainder));
    }
    lines.push("");
  }
  lines.push(pack.tenantTotals);
  var totals = account.tenantTotals || [];
  for (var t = 0; t < totals.length; t++) {
    if (slipUnitId && totals[t].unitId !== slipUnitId) continue;
    if (totals[t].isLandlord) continue;
    lines.push((totals[t].label || "") + " " + (totals[t].tenantName || "") + "  " + formatHKD(totals[t].amount));
  }
  if (state.notes) {
    lines.push("");
    lines.push((lang === "en" ? "Notes: " : "備註：") + state.notes);
  }
  lines.push("");
  lines.push(pack.notice);
  return lines.join("\n");
}

export function demoState() {
  var bounds = monthBounds("2026-03-15");
  return {
    landlordName: "陳志偉",
    propertyAddress: "九龍深水埗福榮街88號3樓",
    issuedDate: "2026-04-05",
    notes: "業主已出示本期中電及水務署繳費單副本。走廊照明計入總錶未分錶用量。",
    rounding: "0.1",
    areaUnit: "ft2",
    includeLandlordRow: false,
    bills: [
      {
        id: "b1",
        type: "electricity",
        provider: "中電 CLP",
        accountHolder: "陳志偉",
        periodFrom: bounds.from,
        periodTo: bounds.to,
        amount: 1286.4,
        mainConsumption: 1050,
        method: "submeter",
        remainderMethod: "proportional",
      },
      {
        id: "b2",
        type: "water",
        provider: "水務署 WSD",
        accountHolder: "陳志偉",
        periodFrom: bounds.from,
        periodTo: bounds.to,
        amount: 186.3,
        mainConsumption: "",
        method: "persondays",
        remainderMethod: "equal",
      },
    ],
    units: [
      {
        id: "u1",
        label: "房A",
        tenantName: "李小明",
        area: 80,
        occupants: 1,
        daysOccupied: "",
        isLandlord: false,
        customPct: {},
        remainderPct: {},
        submeters: { b1: { prev: 1020, curr: 1300 }, b2: { prev: "", curr: "" } },
      },
      {
        id: "u2",
        label: "房B",
        tenantName: "王美玲",
        area: 95,
        occupants: 2,
        daysOccupied: "",
        isLandlord: false,
        customPct: {},
        remainderPct: {},
        submeters: { b1: { prev: 880, curr: 1190 }, b2: { prev: "", curr: "" } },
      },
      {
        id: "u3",
        label: "房C",
        tenantName: "張志強",
        area: 72,
        occupants: 1,
        daysOccupied: "",
        isLandlord: false,
        customPct: {},
        remainderPct: {},
        submeters: { b1: { prev: 540, curr: 890 }, b2: { prev: "", curr: "" } },
      },
    ],
  };
}

function uid(prefix, seq) {
  return prefix + seq;
}

export function defaultState() {
  var bounds = monthBounds(todayIso());
  return {
    landlordName: "",
    propertyAddress: "",
    issuedDate: todayIso(),
    notes: "",
    rounding: "0.1",
    areaUnit: "ft2",
    includeLandlordRow: false,
    bills: [
      {
        id: "b1",
        type: "electricity",
        provider: "",
        accountHolder: "",
        periodFrom: bounds.from,
        periodTo: bounds.to,
        amount: "",
        mainConsumption: "",
        method: "equal",
        remainderMethod: "proportional",
      },
    ],
    units: [
      emptyUnit("u1", "房A / Room A"),
      emptyUnit("u2", "房B / Room B"),
    ],
  };
}

function emptyUnit(id, label) {
  return {
    id: id,
    label: label || "",
    tenantName: "",
    area: "",
    occupants: 1,
    daysOccupied: "",
    isLandlord: false,
    customPct: {},
    remainderPct: {},
    submeters: {},
  };
}

function landlordUnit(id) {
  var u = emptyUnit(id, "業主自用／公用");
  u.tenantName = "";
  u.isLandlord = true;
  u.occupants = 0;
  return u;
}

function nextId(items, prefix) {
  var max = 0;
  for (var i = 0; i < items.length; i++) {
    var m = String(items[i].id || "").match(/(\d+)$/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return uid(prefix, max + 1);
}

function warningMessage(w, lang) {
  var zh = {
    NO_UNITS: "請至少加入一個單位。",
    NO_WEIGHTS: "沒有可用的分攤基準（度數、面積、人日、日數或百分比皆為 0）。",
    NEG_AMOUNT: "繳費單款額不能是負數。",
    NEG_USAGE: "分錶今期讀數不能少於上期。",
    SUB_EXCEEDS_MAIN: "各分錶用量之和大於總錶用量。",
    CUSTOM_PCT: "自訂百分比合計須為 100%。",
    REMAINDER_PCT: "公用用量的自訂百分比合計須為 100%。",
    MISSING_AREA: "按面積分攤時，請為各單位填寫面積。",
  };
  var en = {
    NO_UNITS: "Add at least one unit.",
    NO_WEIGHTS: "No usable basis (usage, area, person-days, days or % are all zero).",
    NEG_AMOUNT: "Bill amount cannot be negative.",
    NEG_USAGE: "A current sub-meter reading is lower than the previous reading.",
    SUB_EXCEEDS_MAIN: "The sum of sub-meter usage is greater than the main-meter consumption.",
    CUSTOM_PCT: "Custom percentages must total 100%.",
    REMAINDER_PCT: "Custom percentages for common usage must total 100%.",
    MISSING_AREA: "Enter a floor area for each unit when splitting by area.",
  };
  var pack = lang === "en" ? en : zh;
  var msg = pack[w.code] || w.code;
  if (w.extra && w.extra.total != null) msg += " (" + Number(w.extra.total).toFixed(2) + ")";
  if (w.extra && w.extra.sum != null && w.extra.main != null) {
    msg += " (" + w.extra.sum + " > " + w.extra.main + ")";
  }
  return msg;
}

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function blankOr(text) {
  var t = String(text == null ? "" : text).trim();
  return t ? escapeHtml(t) : '<span class="blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
}

var state = {
  lang: "zh",
  slipUnitId: "",
  suppressSave: false,
  seqBill: 2,
  seqUnit: 2,
};

function $(id) {
  return document.getElementById(id);
}

function t(key) {
  var pack = I18N[state.lang] || I18N.zh;
  return pack[key] != null ? pack[key] : key;
}

function readHeader() {
  var rounding = document.querySelector('input[name="rounding"]:checked');
  var areaUnit = document.querySelector('input[name="areaUnit"]:checked');
  return {
    landlordName: $("landlord-name").value.trim(),
    propertyAddress: $("property-address").value.trim(),
    issuedDate: $("issued-date").value,
    notes: $("notes").value.trim(),
    rounding: rounding ? rounding.value : "0.1",
    areaUnit: areaUnit ? areaUnit.value : "ft2",
    includeLandlordRow: $("landlord-row").checked,
  };
}

function applyHeader(data) {
  $("landlord-name").value = data.landlordName || "";
  $("property-address").value = data.propertyAddress || "";
  $("issued-date").value = data.issuedDate || "";
  $("notes").value = data.notes || "";
  var rounds = document.querySelectorAll('input[name="rounding"]');
  for (var i = 0; i < rounds.length; i++) rounds[i].checked = rounds[i].value === (data.rounding || "0.1");
  var areas = document.querySelectorAll('input[name="areaUnit"]');
  for (var j = 0; j < areas.length; j++) areas[j].checked = areas[j].value === (data.areaUnit || "ft2");
  $("landlord-row").checked = !!data.includeLandlordRow;
}

function currentModel() {
  var header = typeof document !== "undefined" && $("landlord-name") ? readHeader() : {};
  return {
    lang: state.lang,
    landlordName: header.landlordName != null ? header.landlordName : state.form.landlordName,
    propertyAddress: header.propertyAddress != null ? header.propertyAddress : state.form.propertyAddress,
    issuedDate: header.issuedDate != null ? header.issuedDate : state.form.issuedDate,
    notes: header.notes != null ? header.notes : state.form.notes,
    rounding: header.rounding || state.form.rounding,
    areaUnit: header.areaUnit || state.form.areaUnit,
    includeLandlordRow: header.includeLandlordRow != null ? header.includeLandlordRow : state.form.includeLandlordRow,
    bills: state.form.bills,
    units: state.form.units,
  };
}

function ensureLandlordRow() {
  var on = currentModel().includeLandlordRow;
  var has = state.form.units.some(function (u) {
    return u.isLandlord;
  });
  if (on && !has) {
    var u = landlordUnit(nextId(state.form.units, "u"));
    state.form.units.push(u);
  }
  if (!on && has) {
    state.form.units = state.form.units.filter(function (u) {
      return !u.isLandlord;
    });
  }
}

function loadStore() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveStore() {
  if (state.suppressSave) return;
  try {
    var model = currentModel();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang: state.lang, form: model }));
  } catch (e) {
    /* private mode or quota */
  }
}

function applyI18n() {
  var pack = I18N[state.lang] || I18N.zh;
  var nodes = document.querySelectorAll("[data-i18n]");
  for (var i = 0; i < nodes.length; i++) {
    var key = nodes[i].getAttribute("data-i18n");
    if (pack[key] != null) nodes[i].textContent = pack[key];
  }
  $("lang-zh").setAttribute("aria-pressed", state.lang === "zh" ? "true" : "false");
  $("lang-en").setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
  document.documentElement.lang = state.lang === "en" ? "en" : "zh-Hant-HK";
  renderLists();
  renderSlipOptions();
}

function optionHtml(value, label, selected) {
  return (
    '<option value="' +
    escapeHtml(value) +
    '"' +
    (selected ? " selected" : "") +
    ">" +
    escapeHtml(label) +
    "</option>"
  );
}

function renderBillCard(bill, index) {
  var lang = state.lang;
  var typeOpts = BILL_TYPES.map(function (tp) {
    return optionHtml(tp, typeLabel(tp, lang), bill.type === tp);
  }).join("");
  var methodOpts = METHODS.map(function (m) {
    return optionHtml(m, methodLabel(m, lang), bill.method === m);
  }).join("");
  var remOpts = REMAINDER_METHODS.map(function (m) {
    return optionHtml(m, remainderLabel(m, lang), bill.remainderMethod === m);
  }).join("");
  var ph = TYPE_META[bill.type] || TYPE_META.other;
  var extra = "";
  if (bill.method === "submeter") {
    extra += '<div class="extra-block">';
    extra += "<p class=\"hint\">" + escapeHtml(t("usage")) + "</p>";
    extra += '<div class="table-wrap"><table class="mini-table"><thead><tr>';
    extra += "<th>" + escapeHtml(t("colUnit")) + "</th><th>" + escapeHtml(t("prevReading")) + "</th><th>" + escapeHtml(t("currReading")) + "</th></tr></thead><tbody>";
    for (var i = 0; i < state.form.units.length; i++) {
      var u = state.form.units[i];
      var sm = (u.submeters && u.submeters[bill.id]) || {};
      extra +=
        "<tr><th scope=\"row\">" +
        escapeHtml(u.label || u.tenantName || u.id) +
        '</th><td><input data-bill="' +
        bill.id +
        '" data-unit="' +
        u.id +
        '" data-field="subPrev" type="number" inputmode="decimal" step="any" value="' +
        escapeHtml(sm.prev == null ? "" : sm.prev) +
        '" aria-label="' +
        escapeHtml((u.label || "") + " " + t("prevReading")) +
        '"></td><td><input data-bill="' +
        bill.id +
        '" data-unit="' +
        u.id +
        '" data-field="subCurr" type="number" inputmode="decimal" step="any" value="' +
        escapeHtml(sm.curr == null ? "" : sm.curr) +
        '" aria-label="' +
        escapeHtml((u.label || "") + " " + t("currReading")) +
        '"></td></tr>';
    }
    extra += "</tbody></table></div>";
    var showRem = bill.mainConsumption !== "" && bill.mainConsumption != null && Number(bill.mainConsumption) > 0;
    if (showRem) {
      extra +=
        '<label class="field" for="rem-' +
        bill.id +
        '"><span>' +
        escapeHtml(t("remainderMethod")) +
        '</span><select id="rem-' +
        bill.id +
        '" data-bill="' +
        bill.id +
        '" data-field="remainderMethod">' +
        remOpts +
        "</select></label>";
      if (bill.remainderMethod === "custom") {
        extra += renderPctTable(bill, "remainderPct", t("remainderPct"));
      }
    }
    extra += "</div>";
  }
  if (bill.method === "custom") {
    extra += '<div class="extra-block">' + renderPctTable(bill, "customPct", t("customPct")) + "</div>";
  }
  return (
    '<article class="card" data-bill-card="' +
    bill.id +
    '"><div class="card-head"><h3>' +
    escapeHtml(t("billNo")) +
    " " +
    (index + 1) +
    '</h3><button type="button" class="danger" data-remove-bill="' +
    bill.id +
    '">' +
    escapeHtml(t("removeBill")) +
    "</button></div><div class=\"fields\">" +
    '<label class="field" for="type-' +
    bill.id +
    '"><span>' +
    escapeHtml(t("billType")) +
    '</span><select id="type-' +
    bill.id +
    '" data-bill="' +
    bill.id +
    '" data-field="type">' +
    typeOpts +
    "</select></label>" +
    '<label class="field" for="prov-' +
    bill.id +
    '"><span>' +
    escapeHtml(t("provider")) +
    '</span><input id="prov-' +
    bill.id +
    '" data-bill="' +
    bill.id +
    '" data-field="provider" type="text" maxlength="80" placeholder="' +
    escapeHtml(lang === "en" ? ph.providerEn : ph.providerZh) +
    '" value="' +
    escapeHtml(bill.provider || "") +
    '"></label>' +
    '<label class="field" for="holder-' +
    bill.id +
    '"><span>' +
    escapeHtml(t("accountHolder")) +
    '</span><input id="holder-' +
    bill.id +
    '" data-bill="' +
    bill.id +
    '" data-field="accountHolder" type="text" maxlength="80" value="' +
    escapeHtml(bill.accountHolder || "") +
    '"></label>' +
    '<div class="row-2"><label class="field" for="from-' +
    bill.id +
    '"><span>' +
    escapeHtml(t("periodFrom")) +
    '</span><input id="from-' +
    bill.id +
    '" data-bill="' +
    bill.id +
    '" data-field="periodFrom" type="date" value="' +
    escapeHtml(bill.periodFrom || "") +
    '"></label><label class="field" for="to-' +
    bill.id +
    '"><span>' +
    escapeHtml(t("periodTo")) +
    '</span><input id="to-' +
    bill.id +
    '" data-bill="' +
    bill.id +
    '" data-field="periodTo" type="date" value="' +
    escapeHtml(bill.periodTo || "") +
    '"></label></div>' +
    '<label class="field" for="amt-' +
    bill.id +
    '"><span>' +
    escapeHtml(t("billAmount")) +
    '</span><input id="amt-' +
    bill.id +
    '" data-bill="' +
    bill.id +
    '" data-field="amount" type="number" inputmode="decimal" min="0" step="0.01" value="' +
    escapeHtml(bill.amount === 0 ? "0" : bill.amount || "") +
    '"></label>' +
    '<label class="field" for="main-' +
    bill.id +
    '"><span>' +
    escapeHtml(t("mainConsumption")) +
    "（" +
    escapeHtml(consumptionUnit(bill.type, lang)) +
    '）</span><input id="main-' +
    bill.id +
    '" data-bill="' +
    bill.id +
    '" data-field="mainConsumption" type="number" inputmode="decimal" min="0" step="any" value="' +
    escapeHtml(bill.mainConsumption === 0 ? "0" : bill.mainConsumption || "") +
    '"></label>' +
    '<label class="field" for="method-' +
    bill.id +
    '"><span>' +
    escapeHtml(t("method")) +
    '</span><select id="method-' +
    bill.id +
    '" data-bill="' +
    bill.id +
    '" data-field="method">' +
    methodOpts +
    "</select></label>" +
    extra +
    "</div></article>"
  );
}

function renderPctTable(bill, field, label) {
  var html =
    '<div class="table-wrap"><table class="mini-table"><thead><tr><th>' +
    escapeHtml(t("colUnit")) +
    "</th><th>" +
    escapeHtml(label) +
    "</th></tr></thead><tbody>";
  var sum = 0;
  for (var i = 0; i < state.form.units.length; i++) {
    var u = state.form.units[i];
    var bag = u[field] || {};
    var val = num(bag[bill.id], 0);
    sum += val;
    html +=
      "<tr><th scope=\"row\">" +
      escapeHtml(u.label || u.tenantName || u.id) +
      '</th><td><input data-bill="' +
      bill.id +
      '" data-unit="' +
      u.id +
      '" data-field="' +
      field +
      '" type="number" inputmode="decimal" min="0" step="0.01" value="' +
      escapeHtml(bag[bill.id] == null ? "" : bag[bill.id]) +
      '" aria-label="' +
      escapeHtml((u.label || "") + " " + label) +
      '"></td></tr>';
  }
  var ok = Math.abs(sum - 100) <= 0.05;
  html +=
    '</tbody></table></div><p class="pct-sum ' +
    (ok ? "is-ok" : "is-bad") +
    '">' +
    escapeHtml(label) +
    " Σ " +
    sum.toFixed(2) +
    "% " +
    (ok ? "✓" : "") +
    "</p>";
  return html;
}

function renderUnitCard(unit, index) {
  return (
    '<article class="card" data-unit-card="' +
    unit.id +
    '"><div class="card-head"><h3>' +
    escapeHtml(unit.isLandlord ? t("landlordLabel") : t("colUnit") + " " + (index + 1)) +
    '</h3><button type="button" class="danger" data-remove-unit="' +
    unit.id +
    '"' +
    (unit.isLandlord ? " disabled" : "") +
    ">" +
    escapeHtml(t("removeUnit")) +
    "</button></div><div class=\"fields\">" +
    '<label class="field" for="label-' +
    unit.id +
    '"><span>' +
    escapeHtml(t("unitLabel")) +
    '</span><input id="label-' +
    unit.id +
    '" data-unit="' +
    unit.id +
    '" data-field="label" type="text" maxlength="40" value="' +
    escapeHtml(unit.label || "") +
    '"></label>' +
    '<label class="field" for="tenant-' +
    unit.id +
    '"><span>' +
    escapeHtml(t("tenantName")) +
    '</span><input id="tenant-' +
    unit.id +
    '" data-unit="' +
    unit.id +
    '" data-field="tenantName" type="text" maxlength="80" value="' +
    escapeHtml(unit.tenantName || "") +
    '"></label>' +
    '<div class="row-3"><label class="field" for="area-' +
    unit.id +
    '"><span>' +
    escapeHtml(t("floorArea")) +
    '</span><input id="area-' +
    unit.id +
    '" data-unit="' +
    unit.id +
    '" data-field="area" type="number" inputmode="decimal" min="0" step="any" value="' +
    escapeHtml(unit.area === 0 ? "0" : unit.area || "") +
    '"></label><label class="field" for="occ-' +
    unit.id +
    '"><span>' +
    escapeHtml(t("occupants")) +
    '</span><input id="occ-' +
    unit.id +
    '" data-unit="' +
    unit.id +
    '" data-field="occupants" type="number" inputmode="numeric" min="0" step="1" value="' +
    escapeHtml(unit.occupants == null ? "1" : unit.occupants) +
    '"></label><label class="field" for="days-' +
    unit.id +
    '"><span>' +
    escapeHtml(t("daysOccupied")) +
    '</span><input id="days-' +
    unit.id +
    '" data-unit="' +
    unit.id +
    '" data-field="daysOccupied" type="number" inputmode="numeric" min="0" step="1" placeholder="' +
    escapeHtml(String(billDays(state.form.bills[0] || {}) || "")) +
    '" value="' +
    escapeHtml(unit.daysOccupied == null ? "" : unit.daysOccupied) +
    '"></label></div></div></article>'
  );
}

function renderLists() {
  var billsEl = $("bills-list");
  var unitsEl = $("units-list");
  billsEl.innerHTML = state.form.bills
    .map(function (b, i) {
      return renderBillCard(b, i);
    })
    .join("");
  unitsEl.innerHTML = state.form.units
    .map(function (u, i) {
      return renderUnitCard(u, i);
    })
    .join("");
}

function renderSlipOptions() {
  var sel = $("slip-view");
  var current = state.slipUnitId;
  var html = optionHtml("", t("allUnits"), !current);
  for (var i = 0; i < state.form.units.length; i++) {
    var u = state.form.units[i];
    if (u.isLandlord) continue;
    html += optionHtml(u.id, (u.label || u.id) + (u.tenantName ? " · " + u.tenantName : ""), current === u.id);
  }
  sel.innerHTML = html;
}

function findBill(id) {
  for (var i = 0; i < state.form.bills.length; i++) {
    if (state.form.bills[i].id === id) return state.form.bills[i];
  }
  return null;
}

function findUnit(id) {
  for (var i = 0; i < state.form.units.length; i++) {
    if (state.form.units[i].id === id) return state.form.units[i];
  }
  return null;
}

function patchField(target) {
  var billId = target.getAttribute("data-bill");
  var unitId = target.getAttribute("data-unit");
  var field = target.getAttribute("data-field");
  if (!field) return false;
  var value = target.type === "number" || target.tagName === "SELECT" ? target.value : target.value;
  if (billId && unitId && (field === "subPrev" || field === "subCurr")) {
    var u = findUnit(unitId);
    if (!u.submeters) u.submeters = {};
    if (!u.submeters[billId]) u.submeters[billId] = { prev: "", curr: "" };
    u.submeters[billId][field === "subPrev" ? "prev" : "curr"] = value;
    return true;
  }
  if (billId && unitId && (field === "customPct" || field === "remainderPct")) {
    var u2 = findUnit(unitId);
    if (!u2[field]) u2[field] = {};
    u2[field][billId] = value;
    return "pct";
  }
  if (billId && !unitId) {
    var b = findBill(billId);
    if (!b) return false;
    b[field] = field === "amount" || field === "mainConsumption" ? value : value;
    return field === "type" || field === "method" || field === "remainderMethod" ? "struct" : true;
  }
  if (unitId && !billId) {
    var unit = findUnit(unitId);
    if (!unit) return false;
    if (field === "occupants" || field === "area" || field === "daysOccupied") unit[field] = value;
    else unit[field] = value;
    return field === "label" || field === "tenantName" ? "label" : true;
  }
  return false;
}

function renderWarnings(account) {
  var box = $("warnings");
  var msgs = [];
  for (var i = 0; i < account.bills.length; i++) {
    var result = account.bills[i];
    for (var w = 0; w < (result.warnings || []).length; w++) {
      msgs.push(typeLabel(state.form.bills[i].type, state.lang) + "：" + warningMessage(result.warnings[w], state.lang));
    }
  }
  if (!msgs.length) {
    box.className = "warn-box";
    box.innerHTML = "";
    return;
  }
  box.className = "warn-box is-on";
  box.innerHTML =
    "<h2>" +
    escapeHtml(t("warnTitle")) +
    "</h2><ul>" +
    msgs
      .map(function (m) {
        return "<li>" + escapeHtml(m) + "</li>";
      })
      .join("") +
    "</ul>";
}

function renderTenantCheck() {
  var resultEl = $("tenant-check-result");
  var header = readHeader();
  var check = tenantCheck($("tc-bill").value, $("tc-basis").value, $("tc-whole").value, $("tc-demand").value, header.rounding);
  if (!check.ok) {
    resultEl.className = "tenant-result";
    resultEl.textContent = "";
    return;
  }
  var lang = state.lang;
  if (check.exceeds) {
    resultEl.className = "tenant-result is-bad";
    resultEl.innerHTML =
      (lang === "en"
        ? "The amount demanded (" +
          formatHKD(check.demanded) +
          ") is higher than a fair apportionment of the figures you entered (" +
          formatHKD(check.fair) +
          ", rounded down). This page cannot decide a dispute. "
        : "業主要求的金額（" +
          formatHKD(check.demanded) +
          "）高於按你輸入基準計算的公允分攤額（向下取整後 " +
          formatHKD(check.fair) +
          "）。本頁不能裁決爭議。") +
      t("rvdHelp") +
      ' <a href="' +
      (lang === "en"
        ? "https://www.rvd.gov.hk/en/our_services/part_iva.html"
        : "https://www.rvd.gov.hk/tc/our_services/part_iva.html") +
      '" rel="noopener noreferrer">rvd.gov.hk</a>';
  } else {
    resultEl.className = "tenant-result is-ok";
    resultEl.textContent =
      lang === "en"
        ? "The amount demanded (" +
          formatHKD(check.demanded) +
          ") is not higher than a fair apportionment of the figures you entered (" +
          formatHKD(check.fair) +
          ")."
        : "業主要求的金額（" +
          formatHKD(check.demanded) +
          "）沒有高於按你輸入基準計算的公允分攤額（" +
          formatHKD(check.fair) +
          "）。";
  }
}

function renderAccount() {
  var model = currentModel();
  var account = apportionAccount(model);
  renderWarnings(account);
  renderTenantCheck();
  var slip = state.slipUnitId;
  var lang = state.lang;
  var pack = I18N[lang];
  if (!model.bills.length || !model.units.length) {
    $("accounts").innerHTML = '<article class="account"><p>' + escapeHtml(t("emptyAccount")) + "</p></article>";
    return account;
  }
  var meta =
    '<div class="meta">' +
    '<div><span class="k">' +
    escapeHtml(pack.payer) +
    "</span><span>" +
    blankOr(model.landlordName) +
    "</span></div>" +
    '<div><span class="k">' +
    escapeHtml(pack.address) +
    "</span><span>" +
    blankOr(model.propertyAddress) +
    "</span></div>" +
    '<div><span class="k">' +
    escapeHtml(pack.issued) +
    "</span><span>" +
    escapeHtml(formatDate(model.issuedDate, lang)) +
    "</span></div></div>";
  var blocks = "";
  for (var i = 0; i < model.bills.length; i++) {
    var bill = model.bills[i];
    var result = account.bills[i];
    var rows = (result.rows || []).filter(function (row) {
      return !slip || row.unitId === slip || row.isLandlord;
    });
    var body = rows
      .map(function (row) {
        var who = row.isLandlord ? pack.landlordLabel : row.tenantName;
        return (
          "<tr><td data-label=\"" +
          escapeHtml(pack.colUnit) +
          "\">" +
          escapeHtml(row.label) +
          "</td><td data-label=\"" +
          escapeHtml(pack.colTenant) +
          "\">" +
          escapeHtml(who) +
          "</td><td data-label=\"" +
          escapeHtml(pack.colBasis) +
          "\">" +
          escapeHtml(row.basisText) +
          '</td><td class="num" data-label="' +
          escapeHtml(pack.colShare) +
          '">' +
          row.sharePct.toFixed(2) +
          '%</td><td class="num" data-label="' +
          escapeHtml(pack.colAmount) +
          '">' +
          formatHKD(row.amount) +
          "</td></tr>"
        );
      })
      .join("");
    var checkClass = result.ok && result.legal ? "check-line" : "check-line is-bad";
    var checkText = result.ok
      ? "✓ " + pack.apportionedSum + " " + formatHKD(result.roundedSum) + " ≤ " + pack.billTotal + " " + formatHKD(result.amount)
      : "—";
    var extras = "";
    if (result.unitPrice != null) {
      extras +=
        '<div><span class="k">' +
        escapeHtml(pack.unitPrice) +
        "</span><span>" +
        formatHKD(result.unitPrice) +
        " / " +
        escapeHtml(consumptionUnit(bill.type, lang)) +
        "</span></div>";
    }
    if (result.mainConsumption != null) {
      extras +=
        '<div><span class="k">' +
        escapeHtml(pack.totalMeter) +
        "</span><span>" +
        escapeHtml(String(result.mainConsumption)) +
        " " +
        escapeHtml(consumptionUnit(bill.type, lang)) +
        "</span></div>";
    }
    blocks +=
      '<section class="bill-block"><h3>' +
      escapeHtml(pack.billNo) +
      " " +
      (i + 1) +
      " · " +
      escapeHtml(typeLabel(bill.type, lang)) +
      (bill.provider ? " · " + escapeHtml(bill.provider) : "") +
      "</h3><div class=\"meta\">" +
      '<div><span class="k">' +
      escapeHtml(pack.period) +
      "</span><span>" +
      escapeHtml(formatDate(bill.periodFrom, lang) + " – " + formatDate(bill.periodTo, lang)) +
      "</span></div>" +
      '<div><span class="k">' +
      escapeHtml(pack.accountHolder) +
      "</span><span>" +
      blankOr(bill.accountHolder || model.landlordName) +
      "</span></div>" +
      '<div><span class="k">' +
      escapeHtml(pack.billTotal) +
      "</span><span>" +
      formatHKD(bill.amount) +
      "</span></div>" +
      extras +
      '<div><span class="k">' +
      escapeHtml(pack.methodLabel) +
      "</span><span>" +
      escapeHtml(methodLabel(bill.method, lang)) +
      "</span></div></div>" +
      '<p class="formula">' +
      escapeHtml(formulaText(bill, result, lang, model.rounding)) +
      '</p><div class="table-wrap"><table class="lines"><thead><tr><th>' +
      escapeHtml(pack.colUnit) +
      "</th><th>" +
      escapeHtml(pack.colTenant) +
      "</th><th>" +
      escapeHtml(pack.colBasis) +
      "</th><th>" +
      escapeHtml(pack.colShare) +
      "</th><th>" +
      escapeHtml(pack.colAmount) +
      "</th></tr></thead><tbody>" +
      body +
      '</tbody><tfoot><tr class="total-row"><th colspan="4">' +
      escapeHtml(pack.apportionedSum) +
      '</th><td class="num">' +
      formatHKD(result.ok ? result.roundedSum : 0) +
      "</td></tr><tr><th colspan=\"4\">" +
      escapeHtml(pack.absorbed) +
      '</th><td class="num">' +
      formatHKD(result.ok ? result.remainder : 0) +
      "</td></tr></tfoot></table></div>" +
      '<p class="' +
      checkClass +
      '" data-legal-check="' +
      (result.ok && result.legal ? "ok" : "bad") +
      '">' +
      escapeHtml(checkText) +
      "</p></section>";
  }
  var totals = (account.tenantTotals || []).filter(function (row) {
    if (row.isLandlord) return false;
    return !slip || row.unitId === slip;
  });
  var totalRows = totals
    .map(function (row) {
        return (
          "<tr><td data-label=\"" +
          escapeHtml(pack.colUnit) +
          "\">" +
          escapeHtml(row.label) +
          "</td><td data-label=\"" +
          escapeHtml(pack.colTenant) +
          "\">" +
          escapeHtml(row.tenantName) +
          '</td><td class="num" colspan="3" data-label="' +
          escapeHtml(pack.colAmount) +
          '">' +
          formatHKD(row.amount) +
          "</td></tr>"
        );
    })
    .join("");
  var notes = model.notes
    ? "<p><strong>" + escapeHtml(pack.notesLabel) + "：</strong> " + escapeHtml(model.notes) + "</p>"
    : "";
  var signUnits = model.units.filter(function (u) {
    if (u.isLandlord) return false;
    return !slip || u.id === slip;
  });
  var signs =
    '<div class="signs"><div class="sign"><div class="line"></div><p class="who">' +
    escapeHtml(pack.signLandlord) +
    "<br>" +
    blankOr(model.landlordName) +
    "</p></div>" +
    signUnits
      .map(function (u) {
        return (
          '<div class="sign"><div class="line"></div><p class="who">' +
          escapeHtml(pack.signTenant) +
          "<br>" +
          blankOr((u.label ? u.label + " · " : "") + u.tenantName) +
          "</p></div>"
        );
      })
      .join("") +
    "</div>";
  var title = slip ? pack.slipTitle : pack.accountTitle;
  $("accounts").innerHTML =
    '<article class="account"><header class="account-head"><div><h2 class="account-title">' +
    escapeHtml(title) +
    "<small>" +
    escapeHtml(pack.accountTitleEn) +
    '</small></h2></div><div class="account-chop" aria-hidden="true">' +
    (lang === "en" ? "A/C<br>BILL" : "書面<br>帳目") +
    "</div></header>" +
    meta +
    '<p class="account-note">' +
    escapeHtml(pack.notice) +
    "</p>" +
    blocks +
    "<h3>" +
    escapeHtml(pack.tenantTotals) +
    '</h3><div class="table-wrap"><table class="lines"><thead><tr><th>' +
    escapeHtml(pack.colUnit) +
    "</th><th>" +
    escapeHtml(pack.colTenant) +
    '</th><th colspan="3">' +
    escapeHtml(pack.colAmount) +
    "</th></tr></thead><tbody>" +
    totalRows +
    "</tbody></table></div>" +
    notes +
    signs +
    '<p class="account-note">' +
    escapeHtml(pack.disclaimer) +
    " rvd.gov.hk · sdu-info.org.hk · elegislation.gov.hk/hk/cap7</p></article>";
  return account;
}

function addBill() {
  var bounds = monthBounds(todayIso());
  var id = nextId(state.form.bills, "b");
  state.form.bills.push({
    id: id,
    type: "other",
    provider: "",
    accountHolder: currentModel().landlordName || "",
    periodFrom: bounds.from,
    periodTo: bounds.to,
    amount: "",
    mainConsumption: "",
    method: "equal",
    remainderMethod: "proportional",
  });
  renderLists();
  saveStore();
  renderAccount();
}

function addUnit() {
  var n = state.form.units.filter(function (u) {
    return !u.isLandlord;
  }).length + 1;
  state.form.units.push(emptyUnit(nextId(state.form.units, "u"), (state.lang === "en" ? "Room " : "房") + n));
  renderLists();
  renderSlipOptions();
  saveStore();
  renderAccount();
}

function removeBill(id) {
  if (state.form.bills.length <= 1) return;
  state.form.bills = state.form.bills.filter(function (b) {
    return b.id !== id;
  });
  renderLists();
  saveStore();
  renderAccount();
}

function removeUnit(id) {
  var unit = findUnit(id);
  if (!unit || unit.isLandlord) return;
  var remain = state.form.units.filter(function (u) {
    return !u.isLandlord && u.id !== id;
  });
  if (!remain.length) return;
  state.form.units = state.form.units.filter(function (u) {
    return u.id !== id;
  });
  if (state.slipUnitId === id) state.slipUnitId = "";
  renderLists();
  renderSlipOptions();
  saveStore();
  renderAccount();
}

function onFormInput(ev) {
  var target = ev.target;
  if (!target) return;
  if (target.id === "landlord-row") {
    ensureLandlordRow();
    renderLists();
    renderSlipOptions();
    saveStore();
    renderAccount();
    return;
  }
  if (target.id && !target.getAttribute("data-field") && $("account-form").contains(target)) {
    saveStore();
    renderAccount();
    return;
  }
  var kind = patchField(target);
  if (!kind) return;
  if (kind === "struct") {
    renderLists();
  } else if (kind === "pct") {
    var extra = target.closest(".extra-block");
    var fieldName = target.getAttribute("data-field");
    if (extra) {
      var inputs = extra.querySelectorAll('input[data-field="' + fieldName + '"]');
      var sum = 0;
      for (var i = 0; i < inputs.length; i++) sum += num(inputs[i].value, 0);
      var sumEl = extra.querySelector(".pct-sum");
      if (sumEl) {
        var okPct = Math.abs(sum - 100) <= 0.05;
        sumEl.className = "pct-sum " + (okPct ? "is-ok" : "is-bad");
        sumEl.textContent =
          (fieldName === "remainderPct" ? t("remainderPct") : t("customPct")) +
          " Σ " +
          sum.toFixed(2) +
          "% " +
          (okPct ? "✓" : "");
      }
    }
  } else if (kind === "label") {
    renderSlipOptions();
  }
  saveStore();
  renderAccount();
}

function downloadCsv() {
  var model = currentModel();
  var account = apportionAccount(model);
  var csv = accountToCsv(model, account);
  var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "utility-apportionment-account.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 500);
}

function copyText() {
  var model = currentModel();
  var account = apportionAccount(model);
  var text = accountToText(model, account, state.slipUnitId || "");
  var status = $("copy-status");
  function ok() {
    status.textContent = t("copied");
  }
  function fail() {
    status.textContent = t("copyFail");
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(ok).catch(fail);
    return;
  }
  var ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    ok();
  } catch (e) {
    fail();
  }
  ta.remove();
}

function clearData() {
  if (!window.confirm(t("confirmClear"))) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    /* ignore */
  }
  state.form = defaultState();
  state.slipUnitId = "";
  applyHeader(state.form);
  renderLists();
  renderSlipOptions();
  saveStore();
  renderAccount();
}

function loadDemo() {
  if ($("landlord-name").value || findBill("b1") && findBill("b1").amount) {
    if (!window.confirm(t("confirmDemo"))) return;
  }
  state.form = demoState();
  state.slipUnitId = "";
  applyHeader(state.form);
  renderLists();
  renderSlipOptions();
  saveStore();
  renderAccount();
}

function hydrate(stored) {
  var base = defaultState();
  if (!stored || !stored.form) {
    state.form = base;
    return;
  }
  state.lang = stored.lang === "en" ? "en" : "zh";
  var form = stored.form;
  state.form = {
    landlordName: form.landlordName || "",
    propertyAddress: form.propertyAddress || "",
    issuedDate: form.issuedDate || todayIso(),
    notes: form.notes || "",
    rounding: form.rounding === "1" ? "1" : "0.1",
    areaUnit: form.areaUnit === "m2" ? "m2" : "ft2",
    includeLandlordRow: !!form.includeLandlordRow,
    bills: Array.isArray(form.bills) && form.bills.length ? form.bills : base.bills,
    units: Array.isArray(form.units) && form.units.length ? form.units : base.units,
  };
}

function boot() {
  state.form = defaultState();
  var stored = loadStore();
  hydrate(stored);
  applyHeader(state.form);
  ensureLandlordRow();
  applyI18n();
  renderAccount();

  $("account-form").addEventListener("input", onFormInput);
  $("account-form").addEventListener("change", onFormInput);
  $("bills-list").addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-remove-bill]");
    if (btn) removeBill(btn.getAttribute("data-remove-bill"));
  });
  $("units-list").addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-remove-unit]");
    if (btn) removeUnit(btn.getAttribute("data-remove-unit"));
  });
  $("add-bill").addEventListener("click", addBill);
  $("add-unit").addEventListener("click", addUnit);
  $("clear-data").addEventListener("click", clearData);
  $("demo-btn").addEventListener("click", loadDemo);
  $("print-btn").addEventListener("click", function () {
    window.print();
  });
  $("copy-btn").addEventListener("click", copyText);
  $("csv-btn").addEventListener("click", downloadCsv);
  $("slip-view").addEventListener("change", function () {
    state.slipUnitId = $("slip-view").value;
    renderAccount();
  });
  $("lang-zh").addEventListener("click", function () {
    state.lang = "zh";
    applyI18n();
    saveStore();
    renderAccount();
  });
  $("lang-en").addEventListener("click", function () {
    state.lang = "en";
    applyI18n();
    saveStore();
    renderAccount();
  });
  $("tc-bill").addEventListener("input", renderTenantCheck);
  $("tc-basis").addEventListener("input", renderTenantCheck);
  $("tc-whole").addEventListener("input", renderTenantCheck);
  $("tc-demand").addEventListener("input", renderTenantCheck);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
}
