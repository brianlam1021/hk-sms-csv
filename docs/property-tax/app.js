import {
  compute,
  demoFullYear,
  demoMidYear,
  emptyModel,
  formatHkd,
  summaryToCsv,
} from "./property.js";

const STORAGE_KEY = "hk-property-tax:v1";
const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "物業稅估算器",
    docTitle: "物業稅估算器｜租金暫繳稅 中英 · HK property tax",
    lede: "按稅務局物業稅公式，估算應評稅淨值、本年15%物業稅、翌年暫繳稅與兩期繳款。業主已繳差餉可扣；地租與按揭利息不可扣。不用註冊，不會上傳。",
    notice: "只供參考，並非稅務局官方工具或繳稅單；實際以稅務條例、BIR57及評稅通知為準。選擇個人入息課稅可能更低，本頁不估算。",
    explainTitle: "為甚麼需要這個工具",
    explainBody:
      "稅務局有薪俸稅／個人入息課稅計算機，但物業稅本身沒有官方互動工具，只有GovHK算式、BIR57附註與FAQ例子。本頁把應評稅值、業主差餉、20%免稅額、年中起租的12個月推算、兩期繳款與緩繳90%門檻一次計出，方便收租業主在填BIR57或收到評稅單前對照。",
    demoBtn: "全年示範",
    demoMidBtn: "年中起租示範",
    clearData: "清除資料 Clear data",
    formTitle: "出租資料",
    yearLegend: "課稅年度",
    yearLabel: "課稅年度（4月1日至翌年3月31日）",
    yearHint: "標準稅率兩年都是15%。示範例子用2025/26，與GovHK相同。",
    rentLegend: "租金與代價",
    monthlyRent: "每月租金（港元）",
    monthsLet: "本年度出租月數",
    monthsHint: "年中起租填實際月數，例如7月1日起租填9。未足1個月請自行估成月數。",
    otherConsideration: "其他代價（頂手費、租客代付業主開支等）",
    otherHint: "該課稅年度已付或應付予業主的金錢或等值。按金一般不是代價。",
    deductLegend: "可扣除項目",
    irrecoverable: "不能追回的租金",
    irrecoverableHint: "已被按金抵銷的欠租不可當作不能追回。",
    ownerRates: "業主已繳差餉（港元）",
    ratesHint: "只計業主同意繳付並已繳的差餉。地租／政府地租不可扣，即使與差餉一併徵收。",
    extraLegend: "暫繳稅對照與業權",
    expectedNext: "估計下年度應評稅值（可0）",
    expectedHint: "填0則不判斷緩繳。若少於本年（或推算全年）應評稅值的90%，會提示或可申請緩繳暫繳稅。",
    ownerShare: "你所佔業權（%）",
    shareHint: "只作分攤參考。聯名物業通常仍收一張評稅單。",
    printBtn: "列印／另存 PDF",
    copyBtn: "複製文字",
    csvBtn: "下載 CSV",
    draftStatus: "草稿會自動保存在此瀏覽器。",
    copied: "已複製。",
    copyFail: "無法複製，請人手選取。",
    kpiTax: "本年物業稅",
    kpiProv: "翌年暫繳稅",
    kpiTotal: "評稅單合計",
    kpiFirst: "第一期（約）",
    billTitle: "物業稅估算",
    billSub: "按 GovHK / BIR57 算式 · 截至 2026-10-14 核對",
    colItem: "項目",
    colAmt: "金額",
    lineYear: "課稅年度",
    lineNext: "暫繳稅年度",
    lineRent: "租金收入",
    lineOther: "其他代價",
    lineIrrecoverable: "不能追回租金",
    lineAv: "應評稅值",
    lineRates: "業主已繳差餉",
    lineAfter: "減差餉後",
    lineAllowance: "20%修葺及支出免稅額",
    lineNav: "應評稅淨值",
    lineTax: "本年物業稅（15%）",
    lineEstAv: "推算全年應評稅值",
    lineEstNav: "推算全年應評稅淨值",
    lineProv: "翌年暫繳稅",
    lineFirst: "第一期（本年稅 + 暫繳稅×7/12）",
    lineSecond: "第二期（暫繳稅×5/12）",
    lineTotal: "評稅單合計",
    lineHoldover: "緩繳門檻（應評稅值90%）",
    lineOwner: "按業權分攤（本年稅）",
    empty: "請輸入租金與出租月數。",
    notIrd: "不是稅務局評稅或繳款通知。",
    warnZeroMonths: "請輸入大於 0 的出租月數。",
    warnMonthsCapped: "出租月數已按上限 12 個月計算。",
    warnZeroRent: "請輸入每月租金或其他代價。",
    warnIrrecoverable: "已被按金抵銷的欠租，不可當作不能追回租金。",
    warnRatesNotRent: "只可扣業主已繳差餉，不可扣地租／政府地租。",
    warnNoMortgage: "按揭利息、管理費、裝修與保險在物業稅下不可扣；按揭利息只可走個人入息課稅。",
    warnNotPa: "本頁不比較個人入息課稅。有薪金、按揭利息或其他扣除時，官方個人入息課稅計算機可能更低。",
    warnIrrecoverableExceeds: "不能追回租金已超過代價，應評稅值當 0。",
    warnRatesExceed: "業主已繳差餉已超過應評稅值，餘額當 0。",
    warnPartial: "年中起租：本年按實際月數計稅，暫繳稅會把應評稅淨值推算至 12 個月。",
    warnHoldover: "估計下年度應評稅值低於 90% 門檻，或可申請緩繳暫繳稅（IR1121，限期以官方為準）。",
    ratesTitle: "物業稅算式（GovHK / BIR57）",
    rateStep: "步驟",
    rateHow: "怎樣計",
    rateA: "A 出租收入／代價",
    rateAV: "月租 × 出租月數 ＋ 其他代價",
    rateB: "B 減：不能追回租金",
    rateBV: "按金抵銷部分不可扣",
    rateC: "C 應評稅值",
    rateD: "D 減：業主已繳差餉",
    rateDV: "不包括地租",
    rateE: "E",
    rateF: "F 減：20%修葺及支出免稅額",
    rateNav: "應評稅淨值",
    rateTax: "物業稅",
    rateTaxV: "應評稅淨值 × 15%",
    ratesHintFoot: "數字截至2026年10月14日核對GovHK與稅務局FAQ。其後憲報或稅務局修訂，以官方為準。",
    faqTitle: "常見問題",
    faq1q: "香港物業稅怎樣計？",
    faq1a: "課稅年度由4月1日至翌年3月31日。出租收入減不能追回租金得出應評稅值，再減業主已繳差餉，餘額扣20%法定修葺及支出免稅額，得出應評稅淨值，再乘標準稅率15%（2020/21至2026/27年度）。評稅通知通常會加上翌年暫繳稅。",
    faq2q: "差餉、地租、管理費和按揭利息可以扣嗎？",
    faq2a: "只有業主同意繳付並已繳的差餉，以及不能追回的租金可以扣。地租即使與差餉一併徵收也不可扣。管理費、裝修、保險、代理佣金和按揭利息在物業稅下都不可扣；按揭利息只可在選擇個人入息課稅時申請。",
    faq3q: "年中才開始出租怎樣計暫繳稅？",
    faq3a: "本年物業稅按實際出租月數計算。翌年暫繳稅則把本年應評稅淨值按比例推算至12個月。例如9個月出租的應評稅淨值會乘12/9再按15%計暫繳稅。第一期通常是本年稅加暫繳稅的7/12，第二期是餘下5/12。",
    faq4q: "何時可以申請緩繳暫繳稅？",
    faq4a: "如估計暫繳稅年度的應評稅值少於上年度應評稅值（或用作計算暫繳稅的估計應評稅值）的90%，可在繳稅到期日前不少於28日，或發出暫繳稅通知後14日（以較後者為準）以書面申請緩繳。賣樓令租金減少，或已選擇個人入息課稅，也可能符合。表格為IR1121。",
    faq5q: "資料會上傳嗎？",
    faq5a: "不會。估算只在瀏覽器內計算，草稿可選擇寫入本機 localStorage。沒有帳戶、沒有伺服器存檔。",
    sourcesTitle: "資料來源 / Sources",
    srcGov: "GovHK — 怎樣計算物業稅（算式、暫繳稅與緩繳，含官方例子）：",
    srcFaq: "稅務局 — 填寫物業稅報稅表 FAQ（BIR57／58 例子）：",
    srcNotes: "稅務局 — BIR57 附註及說明（標準稅率15%，2020/21至2026/27）：",
    srcPa: "稅務局 — 個人入息課稅計算機（物業稅以外的另一評稅途徑）：",
    srcAsOf: "以上稅率與例子於2026年10月14日核對上述官方頁；若憲報或稅務局其後修訂，以官方為準。",
    privacyTitle: "私隱",
    privacyBody: "租金、差餉與業權比例只留在這個瀏覽器（localStorage）。本頁不上傳、不設帳號、不設後端。列印、複製或匯出 CSV 才會在你選擇的位置產生檔案。",
    disclaimer: "只供參考，並非稅務局評稅或法律意見。 / For reference only; not an IRD assessment or legal advice.",
    csvItem: "項目",
    csvAmount: "金額",
  },
  en: {
    pageTitle: "Property tax estimator",
    docTitle: "HK property tax estimator · rent, provisional tax, holdover",
    lede: "Estimate net assessable value, 15% property tax, next-year provisional tax and the two instalments from the IRD formula. Owner-paid rates are deductible; Government rent and mortgage interest are not. No sign-up, nothing uploaded.",
    notice: "For reference only — not an IRD tool or demand note. The Inland Revenue Ordinance, BIR57 and the notice of assessment prevail. Personal Assessment may be lower; this page does not estimate it.",
    explainTitle: "Why this tool",
    explainBody:
      "IRD has salaries-tax and Personal Assessment calculators, but no official interactive Property Tax tool — only the GovHK formula, BIR57 notes and FAQ examples. This page adds owner-paid rates, the 20% allowance, a mid-year 12-month gross-up, two instalments and the 90% holdover threshold so a landlord can check a BIR57 or demand note.",
    demoBtn: "Full-year demo",
    demoMidBtn: "Mid-year letting demo",
    clearData: "Clear data",
    formTitle: "Letting details",
    yearLegend: "Year of assessment",
    yearLabel: "Year of assessment (1 April to 31 March)",
    yearHint: "The standard rate is 15% in both years. Demos use 2025/26, matching GovHK.",
    rentLegend: "Rent and consideration",
    monthlyRent: "Monthly rent (HKD)",
    monthsLet: "Months let in this year",
    monthsHint: "For a mid-year start, enter actual months — e.g. 9 if letting began on 1 July. Estimate a part-month yourself.",
    otherConsideration: "Other consideration (premium, tenant-paid owner expenses)",
    otherHint: "Money or money’s worth paid or payable to the owner in the year. A deposit is usually not consideration.",
    deductLegend: "Allowable deductions",
    irrecoverable: "Irrecoverable rent",
    irrecoverableHint: "Rent set off against a deposit is not irrecoverable rent.",
    ownerRates: "Rates paid by owner (HKD)",
    ratesHint: "Only rates the owner agreed to pay and has paid. Government rent is not deductible even when billed with rates.",
    extraLegend: "Provisional tax check and ownership",
    expectedNext: "Estimated next-year assessable value (0 to skip)",
    expectedHint: "Leave 0 to skip the holdover check. If this is under 90% of this year’s (or annualised) assessable value, a holdover claim may be open.",
    ownerShare: "Your ownership share (%)",
    shareHint: "Display only. Joint owners usually still receive one notice of assessment.",
    printBtn: "Print / save PDF",
    copyBtn: "Copy text",
    csvBtn: "Download CSV",
    draftStatus: "A draft is saved in this browser.",
    copied: "Copied.",
    copyFail: "Could not copy. Select the text yourself.",
    kpiTax: "This year’s tax",
    kpiProv: "Next-year provisional",
    kpiTotal: "Notice total",
    kpiFirst: "First instalment (approx.)",
    billTitle: "Property tax estimate",
    billSub: "GovHK / BIR57 formula · checked 2026-10-14",
    colItem: "Item",
    colAmt: "Amount",
    lineYear: "Year of assessment",
    lineNext: "Provisional year",
    lineRent: "Rental income",
    lineOther: "Other consideration",
    lineIrrecoverable: "Irrecoverable rent",
    lineAv: "Assessable value",
    lineRates: "Rates paid by owner",
    lineAfter: "After rates",
    lineAllowance: "20% repairs and outgoings allowance",
    lineNav: "Net assessable value",
    lineTax: "Property tax this year (15%)",
    lineEstAv: "Annualised assessable value",
    lineEstNav: "Annualised net assessable value",
    lineProv: "Provisional tax next year",
    lineFirst: "First instalment (this year + 7/12 provisional)",
    lineSecond: "Second instalment (5/12 provisional)",
    lineTotal: "Notice total",
    lineHoldover: "Holdover threshold (90% of AV)",
    lineOwner: "Your share of this year’s tax",
    empty: "Enter rent and months let.",
    notIrd: "Not an IRD assessment or payment notice.",
    warnZeroMonths: "Enter months let greater than 0.",
    warnMonthsCapped: "Months let are capped at 12.",
    warnZeroRent: "Enter monthly rent or other consideration.",
    warnIrrecoverable: "Rent set off against a deposit is not irrecoverable rent.",
    warnRatesNotRent: "Only owner-paid rates are deductible — not Government rent.",
    warnNoMortgage: "Mortgage interest, management fees, renovation and insurance are not deductible under Property Tax; mortgage interest needs Personal Assessment.",
    warnNotPa: "This page does not compare Personal Assessment. With salaries, mortgage interest or other deductions, the official PA calculator may be lower.",
    warnIrrecoverableExceeds: "Irrecoverable rent exceeds consideration, so assessable value is treated as 0.",
    warnRatesExceed: "Owner-paid rates exceed assessable value, so the balance is treated as 0.",
    warnPartial: "Mid-year letting: this year’s tax uses actual months; provisional tax annualises net assessable value to 12 months.",
    warnHoldover: "Estimated next-year assessable value is under the 90% threshold. A holdover claim (IR1121) may be open — check official deadlines.",
    ratesTitle: "Property tax formula (GovHK / BIR57)",
    rateStep: "Step",
    rateHow: "How it is computed",
    rateA: "A Rental income / consideration",
    rateAV: "Monthly rent × months let + other consideration",
    rateB: "B Less: irrecoverable rent",
    rateBV: "Amount set off against a deposit is not deductible",
    rateC: "C Assessable value",
    rateD: "D Less: rates paid by owner",
    rateDV: "Excludes Government rent",
    rateE: "E",
    rateF: "F Less: 20% repairs and outgoings allowance",
    rateNav: "Net assessable value",
    rateTax: "Property tax",
    rateTaxV: "Net assessable value × 15%",
    ratesHintFoot: "Figures checked against GovHK and the IRD FAQ on 14 October 2026. Later Gazette or IRD changes prevail.",
    faqTitle: "FAQ",
    faq1q: "How is Hong Kong property tax computed?",
    faq1a: "A year of assessment runs from 1 April to 31 March. Rental income minus irrecoverable rent is the assessable value. Deduct rates paid by the owner, then 20% statutory allowance for repairs and outgoings. Tax is 15% of net assessable value for 2020/21 to 2026/27. The notice usually also charges next year’s provisional tax.",
    faq2q: "Are rates, Government rent, management fees and mortgage interest deductible?",
    faq2a: "Only rates the owner agreed to pay and has paid, plus irrecoverable rent. Government rent is not deductible even when collected with rates. Management fees, renovation, insurance, agency commission and mortgage interest are not deductible under Property Tax; mortgage interest needs a Personal Assessment election.",
    faq3q: "What if letting started mid-year?",
    faq3a: "This year’s tax uses the months actually let. Provisional tax for next year annualises this year’s net assessable value to 12 months — e.g. a 9-month NAV is multiplied by 12/9, then taxed at 15%. The first instalment is usually this year’s tax plus 7/12 of provisional tax; the second is the remaining 5/12.",
    faq4q: "When can I apply to hold over provisional tax?",
    faq4a: "If estimated assessable value for the provisional year is likely under 90% of last year’s assessable value (or of the estimated AV used for provisional tax), apply in writing at least 28 days before the due date, or within 14 days of the provisional-tax notice, whichever is later. A sale that cuts rent, or a Personal Assessment election, may also qualify. Use form IR1121.",
    faq5q: "Is anything uploaded?",
    faq5a: "No. The estimate runs in this browser. A draft may be written to localStorage. There is no account and no server copy.",
    sourcesTitle: "Sources",
    srcGov: "GovHK — How Property Tax is Computed (formula, provisional tax, holdover, official examples):",
    srcFaq: "IRD — FAQ on Property Tax returns (BIR57 / 58 examples):",
    srcNotes: "IRD — BIR57 notes (standard rate 15% for 2020/21 to 2026/27):",
    srcPa: "IRD — Personal Assessment / salaries tax calculator (a different basis):",
    srcAsOf: "Rates and examples were checked against those official pages on 14 October 2026. Later Gazette or IRD changes prevail.",
    privacyTitle: "Privacy",
    privacyBody: "Rent, rates and the ownership share stay in this browser (localStorage). This page does not upload, create an account, or use a backend. Print, copy or CSV only creates a file where you choose.",
    disclaimer: "For reference only; not an IRD assessment or legal advice.",
    csvItem: "Item",
    csvAmount: "Amount",
  },
};

const WARN_KEY = {
  zeroMonths: "warnZeroMonths",
  monthsCapped: "warnMonthsCapped",
  zeroRent: "warnZeroRent",
  irrecoverableDeposit: "warnIrrecoverable",
  ratesNotRent: "warnRatesNotRent",
  noMortgageDeduct: "warnNoMortgage",
  notPersonalAssessment: "warnNotPa",
  irrecoverableExceeds: "warnIrrecoverableExceeds",
  ratesExceed: "warnRatesExceed",
  partialYear: "warnPartial",
  holdoverLikely: "warnHoldover",
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
    return Object.assign(emptyModel(), JSON.parse(raw));
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
  document.title = t.docTitle;
  $("lang-zh").setAttribute("aria-pressed", state.lang === "zh" ? "true" : "false");
  $("lang-en").setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    if (t[key] != null) el.textContent = t[key];
  });
}

function readForm() {
  return {
    yearOfAssessment: $("year").value || "2025/26",
    monthlyRent: Number($("monthly-rent").value) || 0,
    monthsLet: Number($("months-let").value) || 0,
    otherConsideration: Number($("other").value) || 0,
    irrecoverableRent: Number($("irrecoverable").value) || 0,
    ownerPaidRates: Number($("rates").value) || 0,
    expectedNextAv: Number($("expected-next").value) || 0,
    ownerShare: Number($("owner-share").value),
  };
}

function writeForm(model) {
  $("year").value = model.yearOfAssessment;
  $("monthly-rent").value = model.monthlyRent;
  $("months-let").value = model.monthsLet;
  $("other").value = model.otherConsideration;
  $("irrecoverable").value = model.irrecoverableRent;
  $("rates").value = model.ownerPaidRates;
  $("expected-next").value = model.expectedNextAv;
  $("owner-share").value = model.ownerShare;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

function kpi(label, value) {
  return "<div class='kpi'><span>" + escapeHtml(label) + "</span><strong>" + escapeHtml(value) + "</strong></div>";
}

function render() {
  var t = pack();
  var result = compute(state.model);
  warnHtml(result);

  $("kpis").innerHTML =
    kpi(t.kpiTax, formatHkd(result.tax)) +
    kpi(t.kpiProv, formatHkd(result.provisionalTax)) +
    kpi(t.kpiTotal, formatHkd(result.totalPayable)) +
    kpi(t.kpiFirst, formatHkd(result.firstInstalment));

  if (!result.ok) {
    $("bill").innerHTML =
      "<div class='bill-head'><div><h2 class='bill-title'>" +
      escapeHtml(t.billTitle) +
      "<small>" +
      escapeHtml(t.billSub) +
      "</small></h2></div><div class='bill-chop' aria-hidden='true'>物業<br />稅</div></div>" +
      "<p class='bill-note'>" +
      escapeHtml(t.empty) +
      "</p>";
    return;
  }

  var rows =
    row(t.lineYear, result.yearOfAssessment) +
    row(t.lineNext, result.nextYear) +
    row(t.lineRent, formatHkd(result.rentalIncome, 2)) +
    (result.otherConsideration ? row(t.lineOther, formatHkd(result.otherConsideration, 2)) : "") +
    (result.irrecoverableRent ? row(t.lineIrrecoverable, formatHkd(result.irrecoverableRent, 2)) : "") +
    row(t.lineAv, formatHkd(result.assessableValue)) +
    (result.ownerPaidRates ? row(t.lineRates, formatHkd(result.ownerPaidRates, 2)) : "") +
    row(t.lineAfter, formatHkd(result.afterRates)) +
    row(t.lineAllowance, formatHkd(result.allowance)) +
    row(t.lineNav, formatHkd(result.nav)) +
    row(t.lineTax, formatHkd(result.tax)) +
    (result.monthsLet < 12
      ? row(t.lineEstAv, formatHkd(result.estimatedAv)) + row(t.lineEstNav, formatHkd(result.estimatedNav))
      : "") +
    row(t.lineProv, formatHkd(result.provisionalTax)) +
    row(t.lineFirst, formatHkd(result.firstInstalment)) +
    row(t.lineSecond, formatHkd(result.secondInstalment)) +
    row(t.lineTotal, formatHkd(result.totalPayable)) +
    row(t.lineHoldover, formatHkd(result.holdoverThreshold)) +
    (result.ownerShare !== 100 ? row(t.lineOwner, formatHkd(result.ownerTax, 2) + " (" + result.ownerShare + "%)") : "");

  $("bill").innerHTML =
    "<div class='bill-head'><div><h2 class='bill-title'>" +
    escapeHtml(t.billTitle) +
    "<small>" +
    escapeHtml(t.billSub) +
    "</small></h2></div><div class='bill-chop' aria-hidden='true'>物業<br />稅</div></div>" +
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

function resultText() {
  var t = pack();
  var result = compute(state.model);
  return [
    t.billTitle,
    t.billSub,
    "",
    t.lineYear + ": " + result.yearOfAssessment,
    t.lineNext + ": " + result.nextYear,
    t.lineRent + ": " + formatHkd(result.rentalIncome, 2),
    t.lineAv + ": " + formatHkd(result.assessableValue),
    t.lineRates + ": " + formatHkd(result.ownerPaidRates, 2),
    t.lineAllowance + ": " + formatHkd(result.allowance),
    t.lineNav + ": " + formatHkd(result.nav),
    t.lineTax + ": " + formatHkd(result.tax),
    t.lineProv + ": " + formatHkd(result.provisionalTax),
    t.lineFirst + ": " + formatHkd(result.firstInstalment),
    t.lineSecond + ": " + formatHkd(result.secondInstalment),
    t.lineTotal + ": " + formatHkd(result.totalPayable),
    t.lineHoldover + ": " + formatHkd(result.holdoverThreshold),
    "",
    t.notIrd,
  ].join("\n");
}

function csvLabels() {
  var t = pack();
  return {
    item: t.csvItem,
    amount: t.csvAmount,
    year: t.lineYear,
    nextYear: t.lineNext,
    rentalIncome: t.lineRent,
    other: t.lineOther,
    irrecoverable: t.lineIrrecoverable,
    assessableValue: t.lineAv,
    rates: t.lineRates,
    allowance: t.lineAllowance,
    nav: t.lineNav,
    tax: t.lineTax,
    provisional: t.lineProv,
    total: t.lineTotal,
    first: t.lineFirst,
    second: t.lineSecond,
    holdover: t.lineHoldover,
    owner: t.lineOwner,
  };
}

function onFormChange() {
  state.model = readForm();
  saveDraft();
  render();
}

function init() {
  state.lang = readLang();
  var draft = loadDraft();
  if (draft) state.model = draft;
  writeForm(state.model);
  applyI18n();
  render();

  $("tax-form").addEventListener("input", onFormChange);
  $("tax-form").addEventListener("change", onFormChange);
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
    state.model = demoFullYear();
    writeForm(state.model);
    saveDraft();
    render();
  });
  $("demo-mid-btn").addEventListener("click", function () {
    state.model = demoMidYear();
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
    a.download = "property-tax.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
