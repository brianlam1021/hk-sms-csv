import {
  compute,
  daysBetween,
  demoChan,
  demoLee,
  demoTrade,
  emptyModel,
  formatHkd,
  formatM3,
  summaryToCsv,
} from "./water.js";

const STORAGE_KEY = "hk-water-sewage:v1";
const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "水費／排污費估算器",
    docTitle: "水費／排污費估算器｜住宅四級收費 中英 · HK water bill",
    lede: "按水務署住宅四級收費及121.64日比例，估算本期水費與排污費。不用帳戶、不用IE11。不用註冊，不會上傳。",
    notice: "只供參考，並非水務署帳單或官方計算機；實際以水務設施規例、渠務署排污費及本期水費單為準。寬減、上期零額結轉與逾期附加費可能令帳單不同。",
    explainTitle: "為甚麼需要這個工具",
    explainBody:
      "差餉／地租已有差餉物業估價署官方互動計算機，本頁不重複。水務署雖有「試算水費及排污費」，但要最近一期帳單帳戶資料，並註明請用 Internet Explorer 11。官方公開的是四級算式與例子。本頁讓你直接輸入用水量（立方米）與抄錶日數，計出按日數比例調整後的水費與排污費，方便對照水費單或分租帳目。",
    demoBtn: "陳先生示範",
    demoLeeBtn: "李先生示範",
    demoTradeBtn: "商業用水示範",
    clearData: "清除資料 Clear data",
    formTitle: "用水資料",
    supplyLegend: "用水類別",
    supplyDomestic: "住宅",
    supplyTrade: "商業",
    supplyConstruction: "建築",
    supplyFlushing: "淡水沖廁",
    supplyHint: "大多數住戶選住宅。淡水沖廁通常由管理處整幢結算，不會出現在你個人水費單。海水沖廁免費，本頁不計。",
    usageLegend: "用水量與日數",
    consumption: "用水量（立方米 m³）",
    consumptionHint: "兩次抄錶之間的用水量，見水費單。",
    days: "抄錶相隔日數",
    daysHint: "水務設施規例以121.64日為一個4個月周期。日數愈長，同一用水量的收費通常愈低。",
    startDate: "抄錶開始日期（可選）",
    endDate: "抄錶結束日期（可選）",
    dateHint: "填妥兩個日期會自動計日數。官方例子：1995-08-01至1995-12-06為127日。",
    flats: "住宅單位數目（沖廁）",
    flatsHint: "淡水沖廁每單位每4個月首30立方米免費，再按日數比例調整。",
    extraLegend: "排污費與附加費",
    sewage: "計算排污費（住宅／商業；沖廁不用繳）",
    sewageHint: "處所須接駁公用污水渠。首12立方米（按日數比例）住宅免費，其後每立方米$2.92（2017年4月1日起）。",
    overdue: "另加5%逾期附加費",
    overdueHint: "水務署註明逾期帳單可加徵5%。預設關閉。",
    printBtn: "列印／另存 PDF",
    copyBtn: "複製文字",
    csvBtn: "下載 CSV",
    draftStatus: "草稿會自動保存在此瀏覽器。",
    copied: "已複製。",
    copyFail: "無法複製，請人手選取。",
    kpiWater: "水費",
    kpiSewage: "排污費",
    kpiTotal: "本期合計",
    kpiDays: "日數",
    billTitle: "水費／排污費估算",
    billSub: "按水務署算式 · 截至 2026-10-22 核對",
    colItem: "項目",
    colAmt: "金額",
    lineSupply: "用水類別",
    lineConsumption: "用水量",
    lineDays: "抄錶日數",
    lineFactor: "相對121.64日比例",
    lineTier: "級別",
    lineVol: "水量 m³",
    lineRate: "收費率",
    lineCharge: "收費",
    lineWater: "水費合計",
    lineSewageFree: "排污費免費額",
    lineSewageVol: "須繳排污水量",
    lineSewage: "排污費",
    lineSubtotal: "水費＋排污費",
    lineSurcharge: "5%逾期附加費",
    lineTotal: "本期估算合計",
    empty: "請輸入用水量與大於 0 的抄錶日數。",
    notWsd: "不是水務署帳單或繳款通知。",
    m3Unit: " m³",
    daysUnit: " 日",
    supplyNameDomestic: "住宅",
    supplyNameTrade: "商業",
    supplyNameConstruction: "建築",
    supplyNameFlushing: "淡水沖廁",
    tierDomestic1: "第一級（免費）",
    tierDomestic2: "第二級（$4.16）",
    tierDomestic3: "第三級（$6.45）",
    tierDomestic4: "第四級（$9.05）",
    tierFlat: "單一收費率",
    tierFlushFree: "沖廁免費額",
    tierFlushPaid: "沖廁其餘（$4.58）",
    warnZeroConsumption: "請輸入大於 0 的用水量。",
    warnZeroDays: "請輸入大於 0 的抄錶日數。",
    warnDaysCapped: "日數已按上限 800 日計算。",
    warnFlushingNotIndividual: "淡水沖廁通常整幢由管理處結算，不會出現在住戶個人水費單。",
    warnNotWsdBill: "實際帳單可能因上期零額結轉、寬減或逾期附加費而不同。",
    warnSewageIfConnected: "排污費只適用於已接駁公用污水渠的處所；渠務署代收，由水務署一併出單。",
    warnNoSmeConcession: "2026年1月15日至2027年1月14日非住宅帳戶或有50%寬減（水費每月上限$10,000、排污費每月上限$5,000）。本頁不計算該寬減。",
    warnNoTes: "部分行業另繳工商業污水附加費（TES），本頁不估算。",
    warnOverdueSurcharge: "已另加5%逾期附加費，只供估算。",
    ratesTitle: "住宅水費及排污費算式（水務署）",
    rateStep: "級別",
    rateHow: "每4個月（121.64日）用量",
    rateRate: "收費率",
    rateA: "第一級",
    rateAV: "首 12 m³",
    rateAR: "免費",
    rateB: "第二級",
    rateBV: "繼後 31 m³",
    rateBR: "每立方米 $4.16",
    rateC: "第三級",
    rateCV: "繼後 19 m³",
    rateCR: "每立方米 $6.45",
    rateD: "第四級",
    rateDV: "其餘（超過合共 62 m³）",
    rateDR: "每立方米 $9.05",
    rateS: "排污費",
    rateSV: "首 12 m³ 免費，其餘按用水量",
    rateSR: "每立方米 $2.92（2017-04-01起）",
    ratesHintFoot: "各級水量按實際抄錶日數 ÷ 121.64 比例調整。數字截至2026年10月22日核對水務署收費率頁與Key Facts 2026。其後修訂以官方為準。",
    faqTitle: "常見問題",
    faq1q: "香港住宅水費怎樣計？",
    faq1a: "住宅食水分四級，以4個月（規例定為121.64日）為周期：首12立方米免費，繼後31立方米每立方米$4.16，再繼後19立方米$6.45，其餘$9.05。抄錶日數不是剛好121.64日時，每一級的水量按日數比例調整。同樣用水量，結算期較長通常較便宜。",
    faq2q: "排污費怎樣計？與差餉有分別嗎？",
    faq2a: "住宅排污費由2017年4月1日起每立方米$2.92，每4個月首12立方米免費，同樣按抄錶日數比例調整。排污費由渠務署徵收、水務署代收，與差餉／地租（差餉物業估價署按應課差餉租值徵收）不是同一項。差餉物業估價署已有官方差餉及地租計算機，本頁不重複。",
    faq3q: "為甚麼不用水務署官方試算？",
    faq3a: "水務署「試算水費及排污費」要最近一期帳單的帳戶資料，並註明請用 Internet Explorer 11，用來按過往用水模式推算至某個日期。它不是「輸入立方米與日數」的公開算式工具。本頁只套用水務署公布的四級算式與例子。",
    faq4q: "非住宅、沖廁、寬減或逾期怎樣處理？",
    faq4a: "商業用水每立方米$4.58、建築$7.11；商業排污費每立方米$2.92，沒有住宅那12立方米免費額。淡水沖廁每單位每4個月首30立方米免費，其餘$4.58，且不徵排污費；海水沖廁免費。2026年1月15日至2027年1月14日非住宅或有50%寬減（有每月上限），本頁不計算。逾期或加徵5%。",
    faq5q: "資料會上傳嗎？",
    faq5a: "不會。估算只在瀏覽器內計算，草稿可選擇寫入本機 localStorage。沒有帳戶、沒有伺服器存檔。",
    sourcesTitle: "資料來源 / Sources",
    srcTariff: "水務署 — 水費及排污費收費率（四級算式、官方例子、排污費$2.92）：",
    srcKey: "水務署 — Key Facts 2026（截至2026年3月31日收費表仍為上述稅率）：",
    srcCalc: "水務署 — 試算水費及排污費（帳戶／IE11；不是本頁所用的公開算式）：",
    srcDsd: "渠務署 — 排污費：",
    srcAsOf: "以上收費率與例子於2026年10月22日核對上述官方頁；若其後修訂，以官方為準。",
    privacyTitle: "私隱",
    privacyBody: "用水量與日數只留在這個瀏覽器（localStorage）。本頁不上傳、不設帳號、不設後端。列印、複製或匯出 CSV 才會在你選擇的位置產生檔案。",
    disclaimer: "只供參考，並非水務署帳單或法律意見。 / For reference only; not a WSD bill or legal advice.",
    csvItem: "項目",
    csvAmount: "金額",
  },
  en: {
    pageTitle: "Water and sewage estimator",
    docTitle: "HK water and sewage estimator · domestic 4-tier tariff",
    lede: "Estimate this period’s water and sewage charges from the WSD domestic 4-tier tariff, scaled to 121.64-day units. No account number, no IE11. No sign-up, nothing uploaded.",
    notice: "For reference only — not a WSD bill or the official estimator. The Waterworks Regulations, DSD sewage charges and your demand note prevail. Concessions, odd-cent carry-forward and overdue surcharges can change the bill.",
    explainTitle: "Why this tool",
    explainBody:
      "Rates and Government rent already have RVD’s official calculator, so this site does not clone that. WSD does publish an “Estimate for Water and Sewage Charges”, but it needs your latest bill’s account data and still asks for Internet Explorer 11. The public method is the four-tier formula and worked examples. This page lets you type cubic metres and meter-reading days — useful when checking a bill or splitting a shared account.",
    demoBtn: "Mr Chan demo",
    demoLeeBtn: "Mr Lee demo",
    demoTradeBtn: "Trade demo",
    clearData: "Clear data",
    formTitle: "Consumption",
    supplyLegend: "Type of supply",
    supplyDomestic: "Domestic",
    supplyTrade: "Trade",
    supplyConstruction: "Construction",
    supplyFlushing: "Fresh-water flushing",
    supplyHint: "Most households use Domestic. Fresh-water flushing is usually billed to the management office for the whole building, not on your flat’s bill. Seawater flushing is free and is not estimated here.",
    usageLegend: "Volume and days",
    consumption: "Consumption (cubic metres m³)",
    consumptionHint: "Volume between two meter readings, as on the water bill.",
    days: "Days between meter readings",
    daysHint: "The Waterworks Regulations treat 121.64 days as one 4-month period. The same consumption over more days usually costs less.",
    startDate: "Reading start date (optional)",
    endDate: "Reading end date (optional)",
    dateHint: "Both dates fill the day count. WSD’s example: 1995-08-01 to 1995-12-06 is 127 days.",
    flats: "Number of flats (flushing)",
    flatsHint: "Fresh-water flushing: first 30 m³ per flat per 4-month period is free, then scaled by days.",
    extraLegend: "Sewage and surcharge",
    sewage: "Include sewage charge (domestic / trade; not for flushing)",
    sewageHint: "Only if the premises connect to a communal sewer. First 12 m³ (day-scaled) is free for domestic; then $2.92/m³ from 1 April 2017.",
    overdue: "Add 5% overdue surcharge",
    overdueHint: "WSD notes a 5% surcharge on overdue bills. Off by default.",
    printBtn: "Print / save PDF",
    copyBtn: "Copy text",
    csvBtn: "Download CSV",
    draftStatus: "A draft is saved in this browser.",
    copied: "Copied.",
    copyFail: "Could not copy. Select the text yourself.",
    kpiWater: "Water",
    kpiSewage: "Sewage",
    kpiTotal: "Period total",
    kpiDays: "Days",
    billTitle: "Water and sewage estimate",
    billSub: "WSD formula · checked 2026-10-22",
    colItem: "Item",
    colAmt: "Amount",
    lineSupply: "Type of supply",
    lineConsumption: "Consumption",
    lineDays: "Meter-reading days",
    lineFactor: "Ratio to 121.64 days",
    lineTier: "Tier",
    lineVol: "Volume m³",
    lineRate: "Rate",
    lineCharge: "Charge",
    lineWater: "Water subtotal",
    lineSewageFree: "Sewage free allowance",
    lineSewageVol: "Sewage chargeable volume",
    lineSewage: "Sewage charge",
    lineSubtotal: "Water + sewage",
    lineSurcharge: "5% overdue surcharge",
    lineTotal: "Estimated total this period",
    empty: "Enter consumption and meter-reading days greater than 0.",
    notWsd: "Not a WSD bill or payment notice.",
    m3Unit: " m³",
    daysUnit: " days",
    supplyNameDomestic: "Domestic",
    supplyNameTrade: "Trade",
    supplyNameConstruction: "Construction",
    supplyNameFlushing: "Fresh-water flushing",
    tierDomestic1: "First tier (free)",
    tierDomestic2: "Second tier ($4.16)",
    tierDomestic3: "Third tier ($6.45)",
    tierDomestic4: "Fourth tier ($9.05)",
    tierFlat: "Flat rate",
    tierFlushFree: "Flushing free allowance",
    tierFlushPaid: "Flushing remainder ($4.58)",
    warnZeroConsumption: "Enter consumption greater than 0.",
    warnZeroDays: "Enter meter-reading days greater than 0.",
    warnDaysCapped: "Days are capped at 800.",
    warnFlushingNotIndividual: "Fresh-water flushing is usually billed to the management office for the building, not on an individual flat bill.",
    warnNotWsdBill: "The actual bill may differ because of odd-cent carry-forward, concessions or overdue surcharge.",
    warnSewageIfConnected: "Sewage charge applies only if the premises connect to a communal sewer. DSD levies it; WSD collects it on the combined bill.",
    warnNoSmeConcession: "Non-domestic accounts may get a 50% concession from 15 January 2026 to 14 January 2027 (monthly caps $10,000 water / $5,000 sewage). This page does not compute that concession.",
    warnNoTes: "Some trades also pay Trade Effluent Surcharge (TES). This page does not estimate TES.",
    warnOverdueSurcharge: "A 5% overdue surcharge has been added for illustration only.",
    ratesTitle: "Domestic water and sewage formula (WSD)",
    rateStep: "Tier",
    rateHow: "Volume per 4-month (121.64-day) period",
    rateRate: "Rate",
    rateA: "First",
    rateAV: "First 12 m³",
    rateAR: "Free",
    rateB: "Second",
    rateBV: "Next 31 m³",
    rateBR: "$4.16 per m³",
    rateC: "Third",
    rateCV: "Next 19 m³",
    rateCR: "$6.45 per m³",
    rateD: "Fourth",
    rateDV: "Remainder (above 62 m³ combined)",
    rateDR: "$9.05 per m³",
    rateS: "Sewage",
    rateSV: "First 12 m³ free, then on consumption",
    rateSR: "$2.92 per m³ (from 1 Apr 2017)",
    ratesHintFoot: "Each tier’s volume is scaled by actual meter-reading days ÷ 121.64. Figures checked against the WSD tariff page and Key Facts 2026 on 22 October 2026. Later changes prevail.",
    faqTitle: "FAQ",
    faq1q: "How is a Hong Kong domestic water bill computed?",
    faq1a: "Domestic fresh water uses four tiers on a 4-month period (121.64 days in the Waterworks Regulations): first 12 m³ free, next 31 m³ at $4.16/m³, next 19 m³ at $6.45, remainder at $9.05. When the reading interval is not exactly 121.64 days, each tier’s volume is scaled by days. The same consumption over a longer period usually costs less.",
    faq2q: "How is sewage charged? Is it the same as rates?",
    faq2a: "Domestic sewage is $2.92/m³ from 1 April 2017, with the first 12 m³ of each 4-month period free, also scaled by days. DSD levies it; WSD collects it. It is not rates or Government rent (those are charged by RVD on rateable value). RVD already has an official Rates and Government Rent Calculator, which this site does not clone.",
    faq3q: "Why not use WSD’s official estimator?",
    faq3a: "WSD’s “Estimate for Water and Sewage Charges” needs account data from your latest bill and still asks for Internet Explorer 11. It projects from past consumption to a chosen date. It is not a public “type m³ and days” calculator. This page only applies WSD’s published four-tier formula and examples.",
    faq4q: "What about non-domestic, flushing, concessions and overdue bills?",
    faq4a: "Trade water is $4.58/m³ and construction $7.11/m³. Trade sewage is $2.92/m³ with no 12 m³ free band. Fresh-water flushing: first 30 m³ per flat per 4-month period free, then $4.58, and no sewage; seawater flushing is free. Non-domestic accounts may get a 50% concession from 15 Jan 2026 to 14 Jan 2027 (monthly caps apply); this page does not compute it. Overdue bills may add 5%.",
    faq5q: "Is anything uploaded?",
    faq5a: "No. The estimate runs in this browser. A draft may be written to localStorage. There is no account and no server copy.",
    sourcesTitle: "Sources",
    srcTariff: "WSD — Water & Sewage Tariff (4-tier formula, official examples, sewage $2.92):",
    srcKey: "WSD — Key Facts 2026 (tariff still as above as at 31 March 2026):",
    srcCalc: "WSD — Estimate for Water and Sewage Charges (account / IE11; not the public formula used here):",
    srcDsd: "DSD — Sewage charges:",
    srcAsOf: "Rates and examples were checked against those official pages on 22 October 2026. Later changes prevail.",
    privacyTitle: "Privacy",
    privacyBody: "Consumption and days stay in this browser (localStorage). This page does not upload, create an account, or use a backend. Print, copy or CSV only creates a file where you choose.",
    disclaimer: "For reference only; not a WSD bill or legal advice.",
    csvItem: "Item",
    csvAmount: "Amount",
  },
};

const WARN_KEY = {
  zeroConsumption: "warnZeroConsumption",
  zeroDays: "warnZeroDays",
  daysCapped: "warnDaysCapped",
  flushingNotIndividual: "warnFlushingNotIndividual",
  notWsdBill: "warnNotWsdBill",
  sewageIfConnected: "warnSewageIfConnected",
  noSmeConcession: "warnNoSmeConcession",
  noTes: "warnNoTes",
  overdueSurcharge: "warnOverdueSurcharge",
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

function selectedSupply() {
  var el = document.querySelector('input[name="supply"]:checked');
  return el ? el.value : "domestic";
}

function readForm() {
  return {
    supply: selectedSupply(),
    consumption: Number($("consumption").value) || 0,
    days: Number($("days").value) || 0,
    startDate: $("start-date").value || "",
    endDate: $("end-date").value || "",
    flats: Number($("flats").value) || 1,
    sewage: $("sewage").checked,
    overdue: $("overdue").checked,
  };
}

function writeForm(model) {
  var supply = model.supply || "domestic";
  document.querySelectorAll('input[name="supply"]').forEach(function (el) {
    el.checked = el.value === supply;
  });
  $("consumption").value = model.consumption;
  $("days").value = model.days;
  $("start-date").value = model.startDate || "";
  $("end-date").value = model.endDate || "";
  $("flats").value = model.flats;
  $("sewage").checked = Boolean(model.sewage);
  $("overdue").checked = Boolean(model.overdue);
  syncSupplyUi();
}

function syncSupplyUi() {
  var supply = selectedSupply();
  var flushing = supply === "flushing";
  $("flats-wrap").hidden = !flushing;
  $("sewage").disabled = flushing;
  if (flushing) $("sewage").checked = false;
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

function supplyName(supply, t) {
  if (supply === "trade") return t.supplyNameTrade;
  if (supply === "construction") return t.supplyNameConstruction;
  if (supply === "flushing") return t.supplyNameFlushing;
  return t.supplyNameDomestic;
}

function tierLabel(result, index, t) {
  if (result.supply === "domestic") {
    return [t.tierDomestic1, t.tierDomestic2, t.tierDomestic3, t.tierDomestic4][index] || t.lineTier;
  }
  if (result.supply === "flushing") {
    return index === 0 ? t.tierFlushFree : t.tierFlushPaid;
  }
  return t.tierFlat;
}

function render() {
  var t = pack();
  var result = compute(state.model);
  warnHtml(result);

  $("kpis").innerHTML =
    kpi(t.kpiWater, formatHkd(result.waterCharge)) +
    kpi(t.kpiSewage, formatHkd(result.sewageCharge)) +
    kpi(t.kpiTotal, formatHkd(result.total)) +
    kpi(t.kpiDays, String(result.days) + t.daysUnit);

  if (!result.ok) {
    $("bill").innerHTML =
      "<div class='bill-head'><div><h2 class='bill-title'>" +
      escapeHtml(t.billTitle) +
      "<small>" +
      escapeHtml(t.billSub) +
      "</small></h2></div><div class='bill-chop' aria-hidden='true'>水費<br />排污</div></div>" +
      "<p class='bill-note'>" +
      escapeHtml(t.empty) +
      "</p>";
    return;
  }

  var tierRows = result.waterRows
    .map(function (tier, i) {
      return (
        "<tr><th>" +
        escapeHtml(tierLabel(result, i, t)) +
        "</th><td class='num'>" +
        escapeHtml(formatM3(tier.volume) + t.m3Unit + " × " + formatHkd(tier.rate) + " = " + formatHkd(tier.charge)) +
        "</td></tr>"
      );
    })
    .join("");

  var rows =
    row(t.lineSupply, supplyName(result.supply, t)) +
    row(t.lineConsumption, formatM3(result.consumption) + t.m3Unit) +
    row(t.lineDays, String(result.days) + t.daysUnit) +
    row(t.lineFactor, String(result.factor)) +
    tierRows +
    row(t.lineWater, formatHkd(result.waterCharge)) +
    (result.sewageOn
      ? row(t.lineSewageFree, formatM3(result.sewageFree) + t.m3Unit) +
        row(t.lineSewageVol, formatM3(result.sewageVolume) + t.m3Unit) +
        row(t.lineSewage, formatHkd(result.sewageCharge))
      : "") +
    row(t.lineSubtotal, formatHkd(result.subtotal)) +
    (result.overdue ? row(t.lineSurcharge, formatHkd(result.surcharge)) : "") +
    row(t.lineTotal, formatHkd(result.total));

  $("bill").innerHTML =
    "<div class='bill-head'><div><h2 class='bill-title'>" +
    escapeHtml(t.billTitle) +
    "<small>" +
    escapeHtml(t.billSub) +
    "</small></h2></div><div class='bill-chop' aria-hidden='true'>水費<br />排污</div></div>" +
    "<table><thead><tr><th>" +
    escapeHtml(t.colItem) +
    "</th><th class='num'>" +
    escapeHtml(t.colAmt) +
    "</th></tr></thead><tbody>" +
    rows +
    "</tbody></table>" +
    "<p class='bill-note'>" +
    escapeHtml(t.notWsd) +
    "</p>";
}

function resultText() {
  var t = pack();
  var result = compute(state.model);
  return [
    t.billTitle,
    t.billSub,
    "",
    t.lineSupply + ": " + supplyName(result.supply, t),
    t.lineConsumption + ": " + formatM3(result.consumption) + t.m3Unit,
    t.lineDays + ": " + result.days + t.daysUnit,
    t.lineWater + ": " + formatHkd(result.waterCharge),
    t.lineSewage + ": " + formatHkd(result.sewageCharge),
    t.lineTotal + ": " + formatHkd(result.total),
    "",
    t.notWsd,
  ].join("\n");
}

function csvLabels() {
  var t = pack();
  return {
    item: t.csvItem,
    amount: t.csvAmount,
    supply: t.lineSupply,
    consumption: t.lineConsumption,
    days: t.lineDays,
    factor: t.lineFactor,
    water: t.lineWater,
    sewage: t.lineSewage,
    subtotal: t.lineSubtotal,
    surcharge: t.lineSurcharge,
    total: t.lineTotal,
    tier: t.lineTier,
  };
}

function onFormChange() {
  state.model = readForm();
  saveDraft();
  render();
}

function onDateChange() {
  var start = $("start-date").value;
  var end = $("end-date").value;
  var days = daysBetween(start, end);
  if (days != null && days >= 0) $("days").value = days;
  onFormChange();
}

function init() {
  state.lang = readLang();
  var draft = loadDraft();
  if (draft) state.model = draft;
  writeForm(state.model);
  applyI18n();
  render();

  $("bill-form").addEventListener("input", function (ev) {
    if (ev.target && (ev.target.id === "start-date" || ev.target.id === "end-date")) return;
    if (ev.target && ev.target.name === "supply") syncSupplyUi();
    onFormChange();
  });
  $("bill-form").addEventListener("change", function (ev) {
    if (ev.target && (ev.target.id === "start-date" || ev.target.id === "end-date")) {
      onDateChange();
      return;
    }
    if (ev.target && ev.target.name === "supply") syncSupplyUi();
    onFormChange();
  });
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
    state.model = demoChan();
    writeForm(state.model);
    saveDraft();
    render();
  });
  $("demo-lee-btn").addEventListener("click", function () {
    state.model = demoLee();
    writeForm(state.model);
    saveDraft();
    render();
  });
  $("demo-trade-btn").addEventListener("click", function () {
    state.model = demoTrade();
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
    a.download = "water-sewage.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
