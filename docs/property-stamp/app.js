import {
  AS_OF,
  compute,
  demoFlat,
  demoLuxury,
  demoShop,
  emptyModel,
  formatHkd,
  formatYmd,
  summaryToCsv,
} from "./duty.js";

const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "物業買賣印花稅估算",
    lede: "按稅務局從價印花稅（AVD）稅率，估算住宅與非住宅物業買賣應繳印花稅。BSD／SSD／NRSD 自2024年2月28日起已取消。不用註冊，不會上傳。",
    notice: "僅供參考，並非法律／稅務意見；亦非稅務局官方工具或繳稅單。實際以印花稅條例、e-Stamping 及印花稅署評定為準。",
    explainTitle: "為甚麼需要這個工具",
    explainBody:
      "站內已有「租約印花稅」與「物業稅」，但物業買賣從價印花稅是另一套稅表。稅務局有官方計算機，本頁把住宅第一／第二標準、非住宅第三標準、邊際寬減，以及已取消的 BSD／SSD／NRSD 一次列明，方便睇樓或簽臨時買賣合約前粗略對照。",
    demoBtn: "600萬住宅示範",
    demoLuxuryBtn: "1.2億住宅示範",
    demoShopBtn: "非住宅示範",
    clearData: "清除資料 Clear data",
    formTitle: "物業與代價",
    typeLegend: "物業類型",
    typeModeLegend: "住宅或非住宅",
    typeResidential: "住宅（第一標準第1部／第二標準）",
    typeNonResidential: "非住宅（第三標準，例如商舖／寫字樓）",
    amountLegend: "代價與市值",
    consideration: "代價／成交價（港元）",
    marketValue: "市值（港元，可0）",
    marketValueHint: "稅務局以代價或市值較高者計稅。不確定可留0。",
    whenLegend: "文書日期與分擔",
    instrumentDate: "簽立／文書日期",
    instrumentHint: "2026-02-26起用現行住宅／第三標準稅表；較早日期用舊第二標準（與現時第三標準相同）。",
    buyerShare: "買家分擔（%）",
    buyerShareHint: "法律上買賣雙方共同負責；實務上多數由買家支付。只供估算。",
    printBtn: "列印／另存 PDF",
    copyBtn: "複製文字",
    csvBtn: "下載 CSV",
    draftStatus: "代價與市值不會寫入本機；關閉分頁即消失。",
    copied: "已複製。",
    copyFail: "無法複製，請人手選取。",
    kpiAvd: "從價印花稅 AVD",
    kpiDsm: "BSD／SSD／NRSD",
    kpiTotal: "合計",
    kpiEff: "實際稅率",
    billTitle: "物業買賣印花稅估算",
    billSub: "稅務局 AVD 稅率 · 截至 " + AS_OF + " 核對",
    colItem: "項目",
    colAmt: "金額",
    lineType: "物業類型",
    lineScale: "稅表",
    lineDate: "文書日期",
    lineChargeable: "計稅基數（代價／市值較高者）",
    lineBand: "稅階",
    lineAvd: "從價印花稅（AVD）",
    lineBsd: "買家印花稅（BSD）",
    lineSsd: "額外印花稅（SSD）",
    lineNrsd: "新住宅印花稅（NRSD）",
    lineTotal: "合計",
    lineEff: "實際稅率（佔計稅基數）",
    lineBuyer: "買家分擔",
    lineSeller: "賣家分擔",
    typeRes: "住宅",
    typeNon: "非住宅",
    dsmZero: "HK$0（2024-02-28起已取消）",
    dsmMay: "可能適用（歷史文書；本頁不估算）",
    empty: "請輸入代價。",
    notIrd: "不是稅務局評稅或繳款通知。",
    warnZero: "請輸入代價或市值。",
    warnValue: "市值高於代價，已用市值計稅。",
    warnDate: "文書日期無效，已按現行稅表估算。",
    warnDsmAbolished: "BSD、SSD、NRSD 自2024年2月28日起已取消，顯示為零。",
    warnDsmHistorical: "文書早於2024年2月28日，當時或須繳 BSD／SSD／NRSD；本頁不估算該等稅項。",
    warnPreNew: "文書早於2026年2月26日，已改用舊第二標準稅表（與現時非住宅第三標準相同）。",
    warnLuxury: "住宅逾1億元適用較高稅階（可達6.5%）。",
    ratesTitle: "從價印花稅率（2026年2月26日起）",
    ratesResTitle: "住宅：第一標準第1部／第二標準",
    ratesNonTitle: "非住宅：第三標準",
    rateBand: "代價或市值（較高者）",
    rateDuty: "印花稅",
    rateBand2: "代價或市值（較高者）",
    rateDuty2: "印花稅",
    ratesHint: "印花稅含不足1元之數向上取整至1元。數字截至2026年10月20日核對稅務局 FAQ／GovHK。",
    faqTitle: "常見問題",
    faq1q: "香港物業買賣印花稅怎樣計？",
    faq1a: "從價印花稅（AVD）按代價或物業市值（以較高者為準）計算。2026年2月26日起，住宅適用第一標準第1部／第二標準（稅率相同，逾約1.0957億元可達6.5%）；非住宅適用第三標準（最高4.25%）。印花稅含不足1元之數向上取整至1元。",
    faq2q: "還要交買家印花稅、額外印花稅或新住宅印花稅嗎？",
    faq2a: "自2024年2月28日起，住宅物業交易已取消買家印花稅（BSD）、額外印花稅（SSD）及新住宅印花稅（NRSD／舊稱第一標準第1部劃一稅率）。本頁對該日起文書顯示此三項為零。稅務局／立法會文件沒有「AVSD」此一獨立稅項；現行物業買賣主要是從價印花稅（AVD）。",
    faq3q: "第一標準與第二標準有分別嗎？",
    faq3a: "自2024年2月28日起，第一標準第1部稅率已改為與第二標準相同。香港永久性居民購入唯一住宅仍可按第二標準加蓋，但現行數字與第一標準第1部一樣。2026年2月26日起住宅再加設逾1億元的6.5%稅階。",
    faq4q: "這頁會估算租約印花稅或物業稅嗎？",
    faq4a: "不會。租約印花稅見「租約印花稅」工具；出租收入的物業稅見「物業稅」工具。本頁只估算物業買賣／轉讓的從價印花稅。",
    faq5q: "資料會上傳嗎？",
    faq5a: "不會。估算只在瀏覽器內計算。代價與市值不會寫入 localStorage。沒有帳戶、沒有伺服器存檔。",
    sourcesTitle: "資料來源 / Sources",
    srcAvd: "稅務局 — 從價印花稅（AVD）FAQ（現行稅率表）：",
    srcRates: "GovHK — 印花稅稅率（物業買賣）：",
    srcDsm: "稅務局 — 住宅物業需求管理措施 FAQ（BSD／SSD／NRSD 取消）：",
    srcCalc: "稅務局 — 計算印花稅（物業）官方計算機：",
    srcEstamp: "GovHK e-Stamping 網上加蓋印花：",
    srcAsOf: "以上稅率於2026年10月20日核對上述官方頁；若憲報或稅務局其後修訂，以官方為準。",
    privacyTitle: "私隱",
    privacyBody:
      "代價、市值與日期只在這個瀏覽器記憶體運算，不會寫入 localStorage，也不上傳。本頁不設帳號、不設後端。列印、複製或匯出 CSV 才會在你選擇的位置產生檔案。語言偏好可選寫入本機（不含物業數字）。",
    disclaimer: "僅供參考，並非法律／稅務意見。 / For reference only; not legal or tax advice.",
    csvItem: "項目",
    csvAmount: "金額",
  },
  en: {
    pageTitle: "Property conveyance stamp duty",
    lede: "Estimate Hong Kong ad valorem stamp duty (AVD) on sale or transfer of residential and non-residential property. BSD / SSD / NRSD abolished from 28 Feb 2024. No sign-up, no upload.",
    notice: "For reference only — not legal or tax advice, and not an IRD tool or demand note. The Stamp Duty Ordinance, e-Stamping and the Stamp Office assessment prevail.",
    explainTitle: "Why this tool exists",
    explainBody:
      "This site already covers tenancy stamp duty and property tax. Conveyance AVD is a different table. IRD has an official calculator; this page lists residential Scale 1/2, non-residential Scale 3, marginal relief, and the abolished BSD / SSD / NRSD so you can rough-check before signing.",
    demoBtn: "$6M flat demo",
    demoLuxuryBtn: "$120M residential demo",
    demoShopBtn: "Non-residential demo",
    clearData: "Clear data",
    formTitle: "Property and price",
    typeLegend: "Property type",
    typeModeLegend: "Residential or non-residential",
    typeResidential: "Residential (Part 1 of Scale 1 / Scale 2)",
    typeNonResidential: "Non-residential (Scale 3, e.g. shop / office)",
    amountLegend: "Consideration and value",
    consideration: "Consideration / price (HK$)",
    marketValue: "Market value (HK$; 0 if unknown)",
    marketValueHint: "IRD charges on the higher of consideration or value. Leave 0 if unsure.",
    whenLegend: "Instrument date and split",
    instrumentDate: "Execution / instrument date",
    instrumentHint: "From 26 Feb 2026 use current residential / Scale 3 tables; earlier dates use the old Scale 2 table (same as today’s Scale 3).",
    buyerShare: "Buyer share (%)",
    buyerShareHint: "Parties are jointly liable; in practice the buyer often pays. Estimate only.",
    printBtn: "Print / save PDF",
    copyBtn: "Copy text",
    csvBtn: "Download CSV",
    draftStatus: "Price and value are not saved to disk; closing the tab clears them.",
    copied: "Copied.",
    copyFail: "Could not copy. Select the text instead.",
    kpiAvd: "Ad valorem duty (AVD)",
    kpiDsm: "BSD / SSD / NRSD",
    kpiTotal: "Total",
    kpiEff: "Effective rate",
    billTitle: "Property stamp duty estimate",
    billSub: "IRD AVD rates · checked " + AS_OF,
    colItem: "Item",
    colAmt: "Amount",
    lineType: "Property type",
    lineScale: "Scale",
    lineDate: "Instrument date",
    lineChargeable: "Chargeable amount (higher of consideration / value)",
    lineBand: "Rate band",
    lineAvd: "Ad valorem stamp duty (AVD)",
    lineBsd: "Buyer’s stamp duty (BSD)",
    lineSsd: "Special stamp duty (SSD)",
    lineNrsd: "New residential stamp duty (NRSD)",
    lineTotal: "Total",
    lineEff: "Effective rate (of chargeable amount)",
    lineBuyer: "Buyer share",
    lineSeller: "Seller share",
    typeRes: "Residential",
    typeNon: "Non-residential",
    dsmZero: "HK$0 (abolished from 28 Feb 2024)",
    dsmMay: "May apply (historical instrument; not estimated here)",
    empty: "Enter a consideration.",
    notIrd: "Not an IRD assessment or payment notice.",
    warnZero: "Enter a consideration or market value.",
    warnValue: "Market value is higher than consideration, so value is used.",
    warnDate: "Instrument date is invalid; current tables are used.",
    warnDsmAbolished: "BSD, SSD and NRSD were abolished from 28 Feb 2024 and show as zero.",
    warnDsmHistorical: "Instrument is before 28 Feb 2024; BSD / SSD / NRSD may have applied then and are not estimated here.",
    warnPreNew: "Instrument is before 26 Feb 2026; the old Scale 2 table is used (same as today’s Scale 3).",
    warnLuxury: "Residential above $100M uses the higher bands (up to 6.5%).",
    ratesTitle: "AVD rates (from 26 February 2026)",
    ratesResTitle: "Residential: Part 1 of Scale 1 / Scale 2",
    ratesNonTitle: "Non-residential: Scale 3",
    rateBand: "Consideration or value (higher)",
    rateDuty: "Duty",
    rateBand2: "Consideration or value (higher)",
    rateDuty2: "Duty",
    ratesHint: "Round duty up to the nearest $1. Figures checked against IRD FAQ / GovHK on 20 October 2026.",
    faqTitle: "FAQ",
    faq1q: "How is stamp duty on a Hong Kong property sale calculated?",
    faq1a: "AVD is charged on the higher of consideration or market value. From 26 Feb 2026, residential uses Part 1 of Scale 1 / Scale 2 (identical rates; up to 6.5% above about $109.57M); non-residential uses Scale 3 (capped at 4.25%). Duty with a fraction of $1 is rounded up to the nearest $1.",
    faq2q: "Do I still pay BSD, SSD or NRSD?",
    faq2a: "From 28 Feb 2024, BSD, SSD and NRSD (the old flat Scale 1 Part 1 rate) no longer apply to residential transactions. This page shows those as zero for instruments on or after that date. IRD / LegCo materials do not use a separate “AVSD” levy; the current charge is AVD.",
    faq3q: "Is there still a difference between Scale 1 and Scale 2?",
    faq3a: "From 28 Feb 2024, Part 1 of Scale 1 rates match Scale 2. A HKPR buying their only residential property may still stamp at Scale 2, but the numbers are the same. From 26 Feb 2026 residential also has the 6.5% band above $100M.",
    faq4q: "Does this page estimate tenancy stamp duty or property tax?",
    faq4a: "No. Use the tenancy-stamp tool for leases and the property-tax tool for rental income. This page only estimates AVD on sale or transfer.",
    faq5q: "Is anything uploaded?",
    faq5a: "No. The estimate runs in this browser. Consideration and value are not written to localStorage. There is no account and no server copy.",
    sourcesTitle: "Sources",
    srcAvd: "IRD — Ad valorem stamp duty (AVD) FAQ (current rates):",
    srcRates: "GovHK — Stamp duty rates (property):",
    srcDsm: "IRD — Demand-side management measures FAQ (BSD / SSD / NRSD abolished):",
    srcCalc: "IRD — Stamp Duty Computation (property) official calculator:",
    srcEstamp: "GovHK e-Stamping:",
    srcAsOf: "Rates were checked against those official pages on 20 October 2026. Later Gazette or IRD changes prevail.",
    privacyTitle: "Privacy",
    privacyBody:
      "Consideration, value and dates stay in memory only — not localStorage, and not uploaded. No account, no backend. Print, copy or CSV only creates a file where you choose. Language preference may be saved locally (no property figures).",
    disclaimer: "For reference only; not legal or tax advice.",
    csvItem: "Item",
    csvAmount: "Amount",
  },
};

const WARN_KEY = {
  zeroAmount: "warnZero",
  valueHigher: "warnValue",
  badDate: "warnDate",
  dsmAbolished: "warnDsmAbolished",
  dsmHistorical: "warnDsmHistorical",
  preNewRates: "warnPreNew",
  luxuryBand: "warnLuxury",
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

function applyI18n() {
  var t = pack();
  document.documentElement.lang = state.lang === "en" ? "en-HK" : "zh-Hant-HK";
  document.title =
    state.lang === "en"
      ? "HK property conveyance stamp duty · residential / non-residential AVD"
      : "物業買賣印花稅估算｜住宅／非住宅從價印花稅 中英 · HK property stamp duty";
  $("lang-zh").setAttribute("aria-pressed", state.lang === "zh" ? "true" : "false");
  $("lang-en").setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    if (t[key] != null) el.textContent = t[key];
  });
}

function readForm() {
  var type = "residential";
  document.querySelectorAll('input[name="propertyType"]').forEach(function (el) {
    if (el.checked) type = el.value;
  });
  return {
    propertyType: type,
    consideration: Number($("consideration").value) || 0,
    marketValue: Number($("market-value").value) || 0,
    instrumentDate: $("instrument-date").value,
    buyerShare: Number($("buyer-share").value),
  };
}

function writeForm(model) {
  document.querySelectorAll('input[name="propertyType"]').forEach(function (el) {
    el.checked = el.value === model.propertyType;
  });
  $("consideration").value = model.consideration;
  $("market-value").value = model.marketValue;
  $("instrument-date").value = model.instrumentDate;
  $("buyer-share").value = model.buyerShare;
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
  box.innerHTML =
    "<ul>" +
    items
      .map(function (text) {
        return "<li>" + escapeHtml(text) + "</li>";
      })
      .join("") +
    "</ul>";
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

function formatPct(n) {
  if (!Number.isFinite(n) || n <= 0) return "—";
  return (n * 100).toLocaleString("en-HK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }) + "%";
}

function scaleName(result) {
  return state.lang === "en" ? result.scale.nameEn : result.scale.nameZh;
}

function render() {
  var t = pack();
  var result = compute(state.model);
  warnHtml(result);

  var dsmLabel = result.dsmStatus === "mayApply" ? t.dsmMay : t.dsmZero;

  $("kpis").innerHTML =
    kpi(t.kpiAvd, formatHkd(result.avd)) +
    kpi(t.kpiDsm, result.dsmStatus === "mayApply" ? "—" : formatHkd(0)) +
    kpi(t.kpiTotal, formatHkd(result.total)) +
    kpi(t.kpiEff, formatPct(result.effectivePct));

  var typeLabel = result.propertyType === "nonResidential" ? t.typeNon : t.typeRes;
  var bandLabel = result.band && result.band.label ? result.band.label : "—";
  var dateLabel = result.instrument ? formatYmd(result.instrument) : "—";

  var rows =
    row(t.lineType, typeLabel) +
    row(t.lineScale, scaleName(result)) +
    row(t.lineDate, dateLabel) +
    row(t.lineChargeable, formatHkd(result.chargeable)) +
    row(t.lineBand, bandLabel) +
    row(t.lineAvd, formatHkd(result.avd)) +
    row(t.lineBsd, dsmLabel) +
    row(t.lineSsd, dsmLabel) +
    row(t.lineNrsd, dsmLabel) +
    row(t.lineTotal, formatHkd(result.total)) +
    row(t.lineEff, formatPct(result.effectivePct)) +
    row(t.lineBuyer, formatHkd(result.buyer, 2)) +
    row(t.lineSeller, formatHkd(result.seller, 2));

  $("bill").innerHTML =
    "<div class='bill-head'><div><h2 class='bill-title'>" +
    escapeHtml(t.billTitle) +
    "<small>" +
    escapeHtml(t.billSub) +
    "</small></h2></div><div class='bill-chop' aria-hidden='true'>買賣<br />印花</div></div>" +
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
  return (
    "<div class='kpi'><span>" +
    escapeHtml(label) +
    "</span><strong>" +
    escapeHtml(value) +
    "</strong></div>"
  );
}

function resultText() {
  var t = pack();
  var result = compute(state.model);
  var dsmLabel = result.dsmStatus === "mayApply" ? t.dsmMay : t.dsmZero;
  return [
    t.billTitle,
    t.billSub,
    "",
    t.lineType + ": " + (result.propertyType === "nonResidential" ? t.typeNon : t.typeRes),
    t.lineScale + ": " + scaleName(result),
    t.lineChargeable + ": " + formatHkd(result.chargeable),
    t.lineBand + ": " + (result.band && result.band.label ? result.band.label : "—"),
    t.lineAvd + ": " + formatHkd(result.avd),
    t.lineBsd + ": " + dsmLabel,
    t.lineSsd + ": " + dsmLabel,
    t.lineNrsd + ": " + dsmLabel,
    t.lineTotal + ": " + formatHkd(result.total),
    t.lineEff + ": " + formatPct(result.effectivePct),
    t.lineBuyer + ": " + formatHkd(result.buyer, 2),
    t.lineSeller + ": " + formatHkd(result.seller, 2),
    "",
    t.notIrd,
  ].join("\n");
}

function onFormChange() {
  state.model = readForm();
  render();
}

function csvLabels() {
  var t = pack();
  return {
    item: t.csvItem,
    amount: t.csvAmount,
    chargeable: t.lineChargeable,
    avd: t.lineAvd,
    bsd: t.lineBsd,
    ssd: t.lineSsd,
    nrsd: t.lineNrsd,
    total: t.lineTotal,
    buyer: t.lineBuyer,
    seller: t.lineSeller,
  };
}

function init() {
  state.lang = readLang();
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
    state.model = demoFlat();
    writeForm(state.model);
    render();
  });
  $("demo-luxury-btn").addEventListener("click", function () {
    state.model = demoLuxury();
    writeForm(state.model);
    render();
  });
  $("demo-shop-btn").addEventListener("click", function () {
    state.model = demoShop();
    writeForm(state.model);
    render();
  });
  $("clear-data").addEventListener("click", function () {
    state.model = emptyModel();
    writeForm(state.model);
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
    a.download = "property-stamp.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
