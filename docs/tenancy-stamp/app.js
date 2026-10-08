import {
  compute,
  demoRentFree,
  demoShort,
  emptyModel,
  formatHkd,
  formatYmd,
  summaryToCsv,
} from "./stamp.js";

const STORAGE_KEY = "hk-tenancy-stamp:v1";
const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "租約印花稅估算器",
    lede: "按稅務局租約印花稅率，估算正本、複本、頂手費，以及逾期加蓋印花罰款。免租期會計入租期。不用註冊，不會上傳。",
    notice: "只供參考，並非稅務局官方工具或繳稅單；實際以印花稅條例、e-Stamping 及印花稅署評定為準。",
    explainTitle: "為甚麼需要這個工具",
    explainBody:
      "稅務局有網上租約印花稅計算機，但註明只適用於租期超過1年、全期固定月租、而且沒有免租期的租約；也不計算複本5元或逾期罰款。官方說明是 IRSD119 PDF。本頁把免租期、分段租金、複本、頂手費與逾期2／4／10倍加起來，方便簽約或補蓋印花前對照。",
    demoBtn: "免租期示範",
    demoShortBtn: "8個月示範",
    clearData: "清除資料 Clear data",
    formTitle: "租約資料",
    termLegend: "租期",
    termModeLegend: "怎樣輸入租期",
    termMonthsMode: "固定月數（最常見：12／24個月）",
    termDatesMode: "開始／終止日期（對照稅務局計年方法）",
    termUncertainMode: "租期不固定（輸入平均年租）",
    termMonths: "租期（月）",
    termMonthsHint: "12個月＝不超逾1年（0.25%）；13–36個月＝0.5%；超過36個月＝1%。",
    startDate: "開始日期（計入免租期）",
    endDate: "終止日期",
    datesHint: "稅務局：開始日與終止日都計算。1月1日至12月31日＝1年（不超逾1年）；至翌年1月1日＝1年零1日（改用0.5%）。",
    uncertainYearly: "平均年租（港元）",
    rentLegend: "租金",
    monthlyRent: "每月租金（港元）",
    rentFreeMonths: "免租期（月）",
    rentFreeHint: "免租期減少須繳租金，但仍計入租期。按金不計印花稅。",
    rent2Months: "其後月數（分段租金，可0）",
    monthlyRent2: "其後每月租金",
    deposit: "按金（不計稅，只作紀錄）",
    extraLegend: "複本、頂手費與分擔",
    counterparts: "複本／對應本份數",
    counterpartsHint: "一式兩份通常填1。每份5元。",
    keyMoney: "頂手費／建築費等（港元）",
    keyMoneyHint: "同時有租金時按代價4.25%。沒有租金則與物業轉讓相同，本頁不估算從價印花稅。",
    landlordShare: "業主分擔（%）",
    whenLegend: "簽立與加蓋印花日期",
    signedDate: "簽立日期",
    stampDate: "擬加蓋／已加蓋日期",
    whenHint: "須於簽立後30日內加蓋。開始租住日期不影響限期。",
    printBtn: "列印／另存 PDF",
    copyBtn: "複製文字",
    csvBtn: "下載 CSV",
    draftStatus: "草稿會自動保存在此瀏覽器。",
    copied: "已複製。",
    copyFail: "無法複製，請人手選取。",
    kpiDuty: "應繳印花稅",
    kpiPenalty: "逾期罰款",
    kpiTotal: "連罰款合計",
    kpiSplit: "業主／租客（正本稅）",
    billTitle: "租約印花稅估算",
    billSub: "按 IRSD119 稅率 · 截至 2026-10-08 核對",
    colItem: "項目",
    colAmt: "金額",
    lineTerm: "租期／稅階",
    lineRent: "須繳租金總額",
    lineBase: "計稅基數（向上取整至$100）",
    lineRentDuty: "租金印花稅",
    lineKey: "頂手費印花稅（4.25%）",
    lineCopy: "複本／對應本",
    lineDuty: "印花稅（未計罰款）",
    lineDeadline: "加蓋限期（簽立後30日）",
    lineLate: "逾期罰款",
    lineReduced: "自願披露常見減免（下限$500，非保證）",
    lineTotal: "連罰款合計",
    lineLandlord: "業主分擔（印花稅）",
    lineTenant: "租客分擔（印花稅）",
    bandUpto1: "不超逾1年 · 租金總額 0.25%",
    bandOver1: "超逾1年但不超逾3年 · 平均年租 0.5%",
    bandOver3: "超逾3年 · 平均年租 1%",
    bandUncertain: "租期不固定 · 平均年租 0.25%",
    termExact: "{years}年整",
    termPlus: "{years}年零{days}日",
    termMonthsN: "{n}個月",
    lateOn: "依期（無需罰款）",
    late2: "逾期不超逾1個月 · 罰款＝印花稅×2",
    late4: "逾期超逾1個月但不超逾2個月 · 罰款＝印花稅×4",
    late10: "逾期超逾2個月 · 罰款＝印花稅×10",
    empty: "請輸入租期與租金。",
    notIrd: "不是稅務局評稅或繳款通知。",
    warnBadDates: "終止日期不能早於開始日期。",
    warnZero: "請輸入租期。",
    warnDeposit: "按金不計入印花稅。",
    warnRentFree: "免租期會計入租期，即使那幾個月不用交租。",
    warnOneYearDay: "租期是1年零1日或以上，稅階改為0.5%。差1日都會由0.25%變成0.5%。",
    warnExactYear: "開始日至終止日剛好1年，屬「不超逾1年」，用租金總額0.25%。",
    warnKey: "沒有租金的頂手費按物業轉讓從價印花稅計算，本頁不估算。",
    warnLate: "擬加蓋日期已過簽立後30日，下列罰款只供參考；實際可否減免由印花稅署署長決定。",
    ratesTitle: "租約印花稅率（IRSD119，2024年9月）",
    rateTerm: "租期",
    rateDuty: "印花稅",
    rateUncertain: "無指定或不固定",
    rateUncertainV: "平均年租 0.25%",
    rateUpto1: "不超逾1年",
    rateUpto1V: "租金總額 0.25%",
    rateOver1: "超逾1年但不超逾3年",
    rateOver1V: "年租或平均年租 0.5%",
    rateOver3: "超逾3年",
    rateOver3V: "年租或平均年租 1%",
    rateKey: "頂手費等（同時有租金）",
    rateKeyV: "代價 4.25%",
    rateCopy: "複本／對應本",
    ratesHint: "年租／平均年租／租金總額向上取整至100元；印花稅向上取整至1元。按金不計。數字截至2026年10月8日核對官方頁。",
    faqTitle: "常見問題",
    faq1q: "香港租約印花稅怎樣計？",
    faq1a: "稅率視乎租期：不超逾1年按租金總額0.25%；超逾1年但不超逾3年按年租或平均年租0.5%；超逾3年按1%；租期不固定按平均年租0.25%。年租／平均年租／租金總額向上取整至最接近的100元，印花稅向上取整至最接近的1元。按金不計入。每份複本或對應本另加5元。",
    faq2q: "免租期會否改變稅階？",
    faq2a: "會。稅務局 IRSD119 註明計算租期時免租期須計算在內。例如免租期令整段協議變成1年零7日，便屬「超逾1年但不超逾3年」，改用0.5%。免租期同時減少須繳租金，計稅基數會較低。",
    faq3q: "逾期加蓋印花罰幾多？",
    faq3a: "租約須於簽立後30日內加蓋印花。逾期不超逾1個月罰印花稅2倍；超逾1個月但不超逾2個月罰4倍；其他情況罰10倍。自願披露個案，印花稅署署長可按情況減免；GovHK 列明常見公式為14%×印花稅×逾期日數÷365，下限500元，並非保證。",
    faq4q: "業主還是租客交印花稅？",
    faq4a: "法律沒有指定由哪一方繳付。立約各方均有法律責任，實務上多數各付一半。本頁可改分擔比例，只供估算。",
    faq5q: "資料會上傳嗎？",
    faq5a: "不會。估算只在瀏覽器內計算，草稿可選擇寫入本機 localStorage。沒有帳戶、沒有伺服器存檔。",
    sourcesTitle: "資料來源 / Sources",
    srcLeaflet: "稅務局印花稅署 — 租約加蓋印花程序及註釋 IRSD119（2024年9月）：",
    srcCalc: "稅務局 — 計算印花稅（物業）租約（官方計算機不含免租期／逾期罰款）：",
    srcLate: "GovHK — 逾期加蓋印花及漏納印花（罰款及自願披露減免，頁面標示2025年8月覆核）：",
    srcEstamp: "GovHK e-Stamping 網上加蓋印花：",
    srcAsOf: "以上稅率與例子於2026年10月8日核對上述官方頁；若憲報或稅務局其後修訂，以官方為準。",
    privacyTitle: "私隱",
    privacyBody: "租金、日期與分擔比例只留在這個瀏覽器（localStorage）。本頁不上傳、不設帳號、不設後端。列印、複製或匯出 CSV 才會在你選擇的位置產生檔案。",
    disclaimer: "只供參考，並非稅務局評稅或法律意見。 / For reference only; not an IRD assessment or legal advice.",
    csvItem: "項目",
    csvAmount: "金額",
  },
  en: {
    pageTitle: "Tenancy stamp duty estimator",
    lede: "Estimate Hong Kong lease stamp duty from IRD rates, including rent-free months, counterparts, key money and late-stamping penalties. No sign-up, no upload.",
    notice: "For reference only — not an IRD tool or demand note. The Stamp Duty Ordinance, e-Stamping and the Stamp Office assessment prevail.",
    explainTitle: "Why this tool exists",
    explainBody:
      "IRD’s online tenancy calculator only covers a term exceeding 1 year with fixed monthly rent and no rent-free period. It also omits the $5 counterpart and late-stamping penalties. The official worked examples sit in IRSD119 (a PDF). This page adds those pieces in the browser so you can check a draft lease or a late stamping.",
    demoBtn: "Rent-free demo",
    demoShortBtn: "8-month demo",
    clearData: "Clear data",
    formTitle: "Tenancy details",
    termLegend: "Term",
    termModeLegend: "How to enter the term",
    termMonthsMode: "Fixed months (typical 12 / 24-month lease)",
    termDatesMode: "Start / end dates (IRD year-counting)",
    termUncertainMode: "Uncertain term (enter average yearly rent)",
    termMonths: "Term (months)",
    termMonthsHint: "12 months = not exceeding 1 year (0.25%); 13–36 months = 0.5%; over 36 months = 1%.",
    startDate: "Start date (include any rent-free)",
    endDate: "End date",
    datesHint: "IRD counts both the commencement and cessation dates. 1 Jan–31 Dec is 1 year (0.25%); to 1 Jan the next year is 1 year and 1 day (0.5%).",
    uncertainYearly: "Average yearly rent (HK$)",
    rentLegend: "Rent",
    monthlyRent: "Monthly rent (HK$)",
    rentFreeMonths: "Rent-free months",
    rentFreeHint: "Rent-free months reduce rent payable but still count toward the term. Deposit is ignored.",
    rent2Months: "Later months (stepped rent; 0 if none)",
    monthlyRent2: "Later monthly rent",
    deposit: "Deposit (ignored for duty; record only)",
    extraLegend: "Counterparts, key money and split",
    counterparts: "Duplicates / counterparts",
    counterpartsHint: "Two signed copies usually means 1. HK$5 each.",
    keyMoney: "Key money / construction fee (HK$)",
    keyMoneyHint: "4.25% of the consideration if rent is also payable. Without rent it follows AVD for a sale — not estimated here.",
    landlordShare: "Landlord share (%)",
    whenLegend: "Signing and stamping dates",
    signedDate: "Date of execution",
    stampDate: "Intended / actual stamping date",
    whenHint: "Stamp within 30 days after execution. The commencement date does not move the deadline.",
    printBtn: "Print / save PDF",
    copyBtn: "Copy text",
    csvBtn: "Download CSV",
    draftStatus: "A draft is saved in this browser.",
    copied: "Copied.",
    copyFail: "Could not copy. Select the text instead.",
    kpiDuty: "Stamp duty",
    kpiPenalty: "Late penalty",
    kpiTotal: "Duty + penalty",
    kpiSplit: "Landlord / tenant (duty)",
    billTitle: "Tenancy stamp duty estimate",
    billSub: "IRD IRSD119 rates · checked 8 Oct 2026",
    colItem: "Item",
    colAmt: "Amount",
    lineTerm: "Term / band",
    lineRent: "Total rent payable",
    lineBase: "Duty base (rounded up to $100)",
    lineRentDuty: "Duty on rent",
    lineKey: "Duty on key money (4.25%)",
    lineCopy: "Duplicates / counterparts",
    lineDuty: "Stamp duty (before penalty)",
    lineDeadline: "Stamping deadline (30 days after execution)",
    lineLate: "Late-stamping penalty",
    lineReduced: "Typical voluntary-disclosure remission (min $500; not a guarantee)",
    lineTotal: "Duty + penalty",
    lineLandlord: "Landlord share (duty)",
    lineTenant: "Tenant share (duty)",
    bandUpto1: "Does not exceed 1 year · 0.25% of total rent",
    bandOver1: "Exceeds 1 year but not 3 years · 0.5% of average yearly rent",
    bandOver3: "Exceeds 3 years · 1% of average yearly rent",
    bandUncertain: "Uncertain term · 0.25% of average yearly rent",
    termExact: "{years} year(s) exactly",
    termPlus: "{years} year(s) and {days} day(s)",
    termMonthsN: "{n} months",
    lateOn: "On time (no penalty)",
    late2: "Delay not exceeding 1 month · penalty = 2 × duty",
    late4: "Delay exceeding 1 month but not 2 months · penalty = 4 × duty",
    late10: "Delay exceeding 2 months · penalty = 10 × duty",
    empty: "Enter a term and rent.",
    notIrd: "Not an IRD assessment or payment notice.",
    warnBadDates: "The end date cannot be before the start date.",
    warnZero: "Enter a term.",
    warnDeposit: "A rental deposit is ignored when computing stamp duty.",
    warnRentFree: "A rent-free period still counts toward the term.",
    warnOneYearDay: "The term is 1 year and 1 day or more, so the rate is 0.5%. One extra day moves you out of the 0.25% band.",
    warnExactYear: "Start to end is exactly 1 year, so the 0.25% total-rent band applies.",
    warnKey: "Key money without rent follows AVD for a property sale and is not estimated here.",
    warnLate: "The stamping date is more than 30 days after execution. The penalty below is only an estimate; any remission is for the Collector.",
    ratesTitle: "Tenancy stamp duty rates (IRSD119, September 2024)",
    rateTerm: "Term",
    rateDuty: "Duty",
    rateUncertain: "Not defined or uncertain",
    rateUncertainV: "0.25% of average yearly rent",
    rateUpto1: "Does not exceed 1 year",
    rateUpto1V: "0.25% of total rent",
    rateOver1: "Exceeds 1 year but not 3 years",
    rateOver1V: "0.5% of yearly or average yearly rent",
    rateOver3: "Exceeds 3 years",
    rateOver3V: "1% of yearly or average yearly rent",
    rateKey: "Key money etc. (rent also payable)",
    rateKeyV: "4.25% of the consideration",
    rateCopy: "Duplicate / counterpart",
    ratesHint: "Yearly / average yearly / total rent is rounded up to the nearest $100; duty is rounded up to the nearest $1. Deposit ignored. Figures checked against the official pages on 8 October 2026.",
    faqTitle: "FAQ",
    faq1q: "How is stamp duty on a Hong Kong tenancy calculated?",
    faq1a: "The rate depends on the term: 0.25% of total rent if not exceeding 1 year; 0.5% of yearly or average yearly rent if exceeding 1 year but not 3 years; 1% if exceeding 3 years; 0.25% of average yearly rent if the term is uncertain. Round the rent base up to the nearest $100 and the duty up to the nearest $1. Deposit is ignored. Each duplicate or counterpart is $5.",
    faq2q: "Does a rent-free period change the rate band?",
    faq2a: "Yes. IRSD119 says the rent-free period is counted when measuring the term. A rent-free week that turns the instrument into 1 year and 7 days moves it into the 0.5% band. The unpaid months also reduce the rent base.",
    faq3q: "What is the late-stamping penalty?",
    faq3a: "Stamp within 30 days after execution. Delay not exceeding 1 month: 2× duty; exceeding 1 month but not 2 months: 4×; any other case: 10×. On voluntary disclosure the Collector may remit; GovHK publishes a typical 14% × duty × days / 365 formula with a $500 minimum. That is not a guarantee.",
    faq4q: "Who pays — landlord or tenant?",
    faq4a: "The ordinance does not assign the cost. Every executing party is liable. In practice many leases split 50/50. This page lets you change the split for an estimate only.",
    faq5q: "Is anything uploaded?",
    faq5a: "No. The estimate runs in this browser. A draft may be written to localStorage. There is no account and no server copy.",
    sourcesTitle: "Sources",
    srcLeaflet: "IRD Stamp Office — Stamping of Tenancy Agreement IRSD119 (September 2024):",
    srcCalc: "IRD — Stamp Duty Computation (tenancy; official tool excludes rent-free / late penalty):",
    srcLate: "GovHK — Late stamping and omission (penalty and voluntary-disclosure remission; page last reviewed August 2025):",
    srcEstamp: "GovHK e-Stamping:",
    srcAsOf: "Rates and examples were checked against those official pages on 8 October 2026. Later Gazette or IRD changes prevail.",
    privacyTitle: "Privacy",
    privacyBody: "Rent, dates and the split stay in this browser (localStorage). This page does not upload, create an account, or use a backend. Print, copy or CSV only creates a file where you choose.",
    disclaimer: "For reference only; not an IRD assessment or legal advice.",
    csvItem: "Item",
    csvAmount: "Amount",
  },
};

const WARN_KEY = {
  badDates: "warnBadDates",
  zeroTerm: "warnZero",
  depositIgnored: "warnDeposit",
  rentFreeCounts: "warnRentFree",
  oneYearAndADay: "warnOneYearDay",
  exactOneYear: "warnExactYear",
  keyMoneyNoRent: "warnKey",
  lateStamp: "warnLate",
};

const state = {
  lang: "zh",
  model: emptyModel(),
};

function $(id) {
  return document.getElementById(id);
}

function pack() {
  return I18N[state.lang] || I18N.zh;
}

function readLang() {
  try {
    var stored = localStorage.getItem(LANG_KEY);
    if (stored === "en" || stored === "zh") return stored;
  } catch (e) {
    /* ignore */
  }
  return "zh";
}

function saveLang(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    /* ignore */
  }
}

function loadDraft() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    return Object.assign(emptyModel(), parsed);
  } catch (e) {
    return null;
  }
}

function saveDraft() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.model));
  } catch (e) {
    /* ignore */
  }
}

function applyI18n() {
  var t = pack();
  document.documentElement.lang = state.lang === "en" ? "en-HK" : "zh-Hant-HK";
  document.title =
    state.lang === "en"
      ? "HK tenancy stamp duty estimator · rent-free, counterpart, late penalty"
      : "租約印花稅估算器｜免租期逾期罰款 中英 · HK tenancy stamp duty";
  $("lang-zh").setAttribute("aria-pressed", state.lang === "zh" ? "true" : "false");
  $("lang-en").setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    if (t[key] != null) el.textContent = t[key];
  });
}

function readForm() {
  var mode = "months";
  var radios = document.querySelectorAll('input[name="termMode"]');
  radios.forEach(function (el) {
    if (el.checked) mode = el.value;
  });
  return {
    termMode: mode,
    termMonths: Number($("term-months").value) || 0,
    startDate: $("start-date").value,
    endDate: $("end-date").value,
    monthlyRent: Number($("monthly-rent").value) || 0,
    rentFreeMonths: Number($("rent-free").value) || 0,
    rent2Months: Number($("rent2-months").value) || 0,
    monthlyRent2: Number($("monthly-rent2").value) || 0,
    counterparts: Number($("counterparts").value) || 0,
    keyMoney: Number($("key-money").value) || 0,
    deposit: Number($("deposit").value) || 0,
    landlordShare: Number($("landlord-share").value),
    signedDate: $("signed-date").value,
    stampDate: $("stamp-date").value,
    uncertainYearly: Number($("uncertain-yearly").value) || 0,
  };
}

function writeForm(model) {
  document.querySelectorAll('input[name="termMode"]').forEach(function (el) {
    el.checked = el.value === model.termMode;
  });
  $("term-months").value = model.termMonths;
  $("start-date").value = model.startDate;
  $("end-date").value = model.endDate;
  $("monthly-rent").value = model.monthlyRent;
  $("rent-free").value = model.rentFreeMonths;
  $("rent2-months").value = model.rent2Months;
  $("monthly-rent2").value = model.monthlyRent2;
  $("counterparts").value = model.counterparts;
  $("key-money").value = model.keyMoney;
  $("deposit").value = model.deposit;
  $("landlord-share").value = model.landlordShare;
  $("signed-date").value = model.signedDate;
  $("stamp-date").value = model.stampDate;
  $("uncertain-yearly").value = model.uncertainYearly;
  setMode(model.termMode);
}

function setMode(mode) {
  document.body.classList.remove("mode-months", "mode-dates", "mode-uncertain");
  document.body.classList.add("mode-" + (mode || "months"));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, function (_, key) {
    return vars[key] == null ? "" : vars[key];
  });
}

function bandLabel(t, band) {
  if (band === "over3") return t.bandOver3;
  if (band === "over1") return t.bandOver1;
  if (band === "uncertain") return t.bandUncertain;
  return t.bandUpto1;
}

function termLabel(t, result) {
  if (result.termMode === "uncertain") return t.bandUncertain;
  if (result.termMode === "months") return fill(t.termMonthsN, { n: String(Math.round(result.termMonths)) });
  if (!result.term) return "—";
  if (result.term.extraDays === 0) return fill(t.termExact, { years: String(result.term.years) });
  return fill(t.termPlus, { years: String(result.term.years), days: String(result.term.extraDays) });
}

function lateLabel(t, late) {
  if (!late || late.onTime) return t.lateOn;
  if (late.band === "1m") return t.late2;
  if (late.band === "2m") return t.late4;
  return t.late10;
}

function warnHtml(result) {
  var t = pack();
  var items = (result.warnings || [])
    .map(function (key) {
      return t[WARN_KEY[key]];
    })
    .filter(Boolean);
  var box = $("warnings");
  if (!items.length) {
    box.classList.remove("is-on");
    box.innerHTML = "";
    return;
  }
  box.classList.add("is-on");
  box.innerHTML = "<ul>" + items.map(function (text) { return "<li>" + escapeHtml(text) + "</li>"; }).join("") + "</ul>";
}

function row(label, value) {
  return (
    "<tr><th>" +
    escapeHtml(label) +
    "</th><td class='num'>" +
    escapeHtml(value) +
    "</td></tr>"
  );
}

function render() {
  var t = pack();
  var result = compute(state.model);
  setMode(state.model.termMode);
  warnHtml(result);

  $("kpis").innerHTML =
    kpi(t.kpiDuty, formatHkd(result.duty)) +
    kpi(t.kpiPenalty, formatHkd(result.penalty)) +
    kpi(t.kpiTotal, formatHkd(result.totalWithPenalty)) +
    kpi(t.kpiSplit, formatHkd(result.landlord) + " / " + formatHkd(result.tenant));

  var deadline = result.late && result.late.deadline ? formatYmd(result.late.deadline) : "—";
  var rows =
    row(t.lineTerm, termLabel(t, result) + " · " + bandLabel(t, result.band)) +
    (result.termMode === "uncertain" ? "" : row(t.lineRent, formatHkd(result.totalRent, 2))) +
    row(t.lineBase, formatHkd(result.rentBase)) +
    row(t.lineRentDuty, formatHkd(result.rentDuty)) +
    (result.keyDuty ? row(t.lineKey, formatHkd(result.keyDuty)) : "") +
    (result.counterpartDuty ? row(t.lineCopy, formatHkd(result.counterpartDuty) + " (" + result.counterparts + " × HK$5)") : "") +
    row(t.lineDuty, formatHkd(result.duty)) +
    row(t.lineDeadline, deadline) +
    row(t.lineLate, formatHkd(result.penalty) + " · " + lateLabel(t, result.late)) +
    (result.late && !result.late.onTime
      ? row(t.lineReduced, formatHkd(result.reducedPenalty, 2))
      : "") +
    row(t.lineTotal, formatHkd(result.totalWithPenalty)) +
    row(t.lineLandlord, formatHkd(result.landlord, 2)) +
    row(t.lineTenant, formatHkd(result.tenant, 2));

  $("bill").innerHTML =
    "<div class='bill-head'><div><h2 class='bill-title'>" +
    escapeHtml(t.billTitle) +
    "<small>" +
    escapeHtml(t.billSub) +
    "</small></h2></div><div class='bill-chop' aria-hidden='true'>租約<br />印花</div></div>" +
    "<table><thead><tr><th>" +
    escapeHtml(t.colItem) +
    "</th><th class='num'>" +
    escapeHtml(t.colAmt) +
    "</th></tr></thead><tbody>" +
    rows +
    "</tbody></table>" +
    "<p class='bill-note'>" +
    escapeHtml(t.notIrd) +
    "</p>";
}

function kpi(label, value) {
  return "<div class='kpi'><span>" + escapeHtml(label) + "</span><strong>" + escapeHtml(value) + "</strong></div>";
}

function resultText() {
  var t = pack();
  var result = compute(state.model);
  return [
    t.billTitle,
    t.billSub,
    "",
    t.lineTerm + ": " + termLabel(t, result) + " · " + bandLabel(t, result.band),
    t.lineRent + ": " + formatHkd(result.totalRent, 2),
    t.lineBase + ": " + formatHkd(result.rentBase),
    t.lineRentDuty + ": " + formatHkd(result.rentDuty),
    t.lineKey + ": " + formatHkd(result.keyDuty),
    t.lineCopy + ": " + formatHkd(result.counterpartDuty),
    t.lineDuty + ": " + formatHkd(result.duty),
    t.lineLate + ": " + formatHkd(result.penalty) + " · " + lateLabel(t, result.late),
    t.lineTotal + ": " + formatHkd(result.totalWithPenalty),
    t.lineLandlord + ": " + formatHkd(result.landlord, 2),
    t.lineTenant + ": " + formatHkd(result.tenant, 2),
    "",
    t.notIrd,
  ].join("\n");
}

function onFormChange() {
  state.model = readForm();
  saveDraft();
  render();
}

function csvLabels() {
  var t = pack();
  return {
    item: t.csvItem,
    amount: t.csvAmount,
    totalRent: t.lineRent,
    rentBase: t.lineBase,
    rentDuty: t.lineRentDuty,
    keyDuty: t.lineKey,
    counterpartDuty: t.lineCopy,
    duty: t.lineDuty,
    penalty: t.lineLate,
    total: t.lineTotal,
    landlord: t.lineLandlord,
    tenant: t.lineTenant,
  };
}

function init() {
  state.lang = readLang();
  var draft = loadDraft();
  if (draft) state.model = draft;
  writeForm(state.model);
  applyI18n();
  render();

  $("stamp-form").addEventListener("input", onFormChange);
  $("stamp-form").addEventListener("change", onFormChange);
  $("lang-zh").addEventListener("click", function () {
    state.lang = "zh";
    saveLang("zh");
    applyI18n();
    render();
  });
  $("lang-en").addEventListener("click", function () {
    state.lang = "en";
    saveLang("en");
    applyI18n();
    render();
  });
  $("demo-btn").addEventListener("click", function () {
    state.model = demoRentFree();
    writeForm(state.model);
    saveDraft();
    render();
  });
  $("demo-short-btn").addEventListener("click", function () {
    state.model = demoShort();
    writeForm(state.model);
    saveDraft();
    render();
  });
  $("clear-data").addEventListener("click", function () {
    state.model = emptyModel();
    writeForm(state.model);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    render();
  });
  $("print-btn").addEventListener("click", function () {
    window.print();
  });
  $("copy-btn").addEventListener("click", function () {
    var text = resultText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          $("copy-status").textContent = pack().copied;
        },
        function () {
          $("copy-status").textContent = pack().copyFail;
        },
      );
    } else {
      $("copy-status").textContent = pack().copyFail;
    }
  });
  $("csv-btn").addEventListener("click", function () {
    var csv = summaryToCsv(compute(state.model), csvLabels());
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "tenancy-stamp.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
