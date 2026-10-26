import {
  NAR1_TYPES,
  compute,
  demoBr2026,
  demoNarOnTime,
  demoNarVeryLate,
  emptySettings,
  formatMoney,
} from "./fees.js";

const STORAGE_KEY = "hk-business-reg-fees:v1";
const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "商業登記費／公司周年申報表費用估算",
    docTitle: "商業登記費／周年申報表費用估算｜BR + NAR1 · HK",
    lede: "按稅務局商業登記費及徵費表估算一年／三年證與分行證；按公司註冊處收費階梯估算 NAR1 按時或逾期交付費。可合併顯示總額。不用註冊，不會上傳。",
    notice:
      "只供參考，並非稅務局或公司註冊處官方工具，亦非法例意見。實際以 IRD／CR 原文、繳款通知及交付當日收費為準。不涵蓋成立法團申請費、更改名稱、押記、商業登記冊摘錄（$27／$20）或豁免申請。徵費與收費表會按財政年度調整。",
    explainTitle: "為甚麼需要這個工具",
    explainBody:
      "稅務局以 PDF／網頁公布商業登記費及徵費表；公司註冊處公布 NAR1 逾期階梯。中小企常問「續商業登記要幾錢」和「周年申報遲交要加多少」，卻沒有合併的瀏覽器估算。由 2026年4月1日起，破產欠薪保障基金徵費回復，一年商業登記證總數為 $2,350。差餉／地租請用差餉物業估價署官方計算機；年假／代通知金／病假請用勞工處或 stamp4u。",
    tableItem: "項目",
    tableNote: "重點（核對官方）",
    tableBr: "一年商業登記證 2026/27",
    tableBrV: "登記費 $2,200 ＋ 徵費 $150 ＝ $2,350",
    tableNar: "私人公司 NAR1 按時",
    tableNarV: "申報表日期後 42 日內 $105",
    tableNarLate: "私人公司 NAR1 逾期 >9 個月",
    tableNarLateV: "$3,480",
    demoBrBtn: "BR 2026 一年證",
    demoOnTimeBtn: "NAR1 按時",
    demoLateBtn: "NAR1 逾期9個月+",
    clearData: "清除資料 Clear data",
    formTitle: "輸入",
    brLegend: "商業登記證 Business Registration",
    enableBr: "計算商業登記證費用",
    kindMain: "商業登記證",
    kindBranch: "分行登記證",
    term1: "一年證",
    term3: "三年證",
    brDate: "登記證開始生效日／續證生效日",
    brDateHint:
      "一般以開始生效日釐訂應繳金額。本地公司首張證經公司註冊處申請時，以成立法團遞呈日期釐訂（見常見問題）。",
    narLegend: "公司周年申報表 Annual Return (NAR1)",
    enableNar: "計算周年申報表登記費",
    narType: "公司類別",
    returnDate: "申報表日期／周年日",
    returnDateHint:
      "私人公司＝成立周年日；公眾／擔保＝會計參照期結束後指定月數屆滿之日；非香港＝註冊周年日。",
    filingDate: "擬交付日期",
    filingDateHint: "郵遞交付以郵戳日期計。欠費或費用不足的申報表不會被視為已交付。",
    draftStatus: "設定會自動保存在此瀏覽器（可選）。",
    heroTotal: "估算合計",
    heroBrOnly: "商業登記證",
    heroNarOnly: "周年申報表登記費",
    heroBoth: "商業登記 ＋ 周年申報",
    heroFrom: "{parts}",
    kpiBr: "商業登記證總數",
    kpiBrFee: "登記費",
    kpiBrLevy: "徵費",
    kpiNar: "NAR1 登記費",
    kpiDaysAfter: "距申報表日期",
    kpiDaysLate: "逾42日天數",
    kpiBand: "收費階梯",
    rowBrBand: "收費年期",
    rowBrKind: "證類",
    rowBrTerm: "有效期",
    rowBrFee: "登記費",
    rowBrLevy: "徵費",
    rowBrTotal: "商業登記合計",
    rowNarType: "公司類別",
    rowNarReturn: "申報表日期",
    rowNarFiling: "擬交付日期",
    rowNarOnTimeEnd: "按時截止（+42日）",
    rowNarDays: "距申報表日期（日）",
    rowNarLate: "逾42日（日）",
    rowNarBand: "收費階梯",
    rowNarFee: "NAR1 應繳",
    rowCombined: "兩項合計",
    kindMainLabel: "商業登記證（主）",
    kindBranchLabel: "分行登記證",
    term1Label: "一年",
    term3Label: "三年",
    typePrivate: "有股本本地私人公司",
    typePublic: "有股本本地公眾公司",
    typeGuarantee: "本地擔保有限公司",
    typeNonHk: "註冊非香港公司",
    bandOnTime: "按時（42日內）",
    bandLate1: "超過42日但不超過3個月",
    bandLate2: "超過3個月但不超過6個月",
    bandLate3: "超過6個月但不超過9個月",
    bandLate4: "超過9個月",
    formulaTitle: "計算說明",
    formulaBr: "商業登記證：生效日 {date} 屬 {band}\n登記費 {fee} ＋ 徵費 {levy} ＝ {total}",
    formulaNar:
      "周年申報表：{type}\n申報表日期 {ret} → 擬交付 {fil}\n距申報表日期 {days} 日（逾42日：{late} 日）\n階梯：{band} → {fee}",
    formulaCombined: "合計 = 商業登記 {br} ＋ NAR1 {nar} = {total}",
    warnBrBadDate: "請輸入有效的商業登記證開始生效日。",
    warnBrNoBand: "生效日不在已嵌入的稅務局收費年期內（目前涵蓋 2022-06-17 至 2027-03-31）。請核對官方最新收費表。",
    warnNarBadDate: "請輸入有效的申報表日期與擬交付日期。",
    warnNarBeforeReturn: "擬交付日期不能早於申報表日期／周年日。",
    warnNarLate: "擬交付日已超過按時期限，將按逾期階梯收費。公司註冊處不接納費用不足的申報表。",
    warnNothing: "請至少啟用商業登記或周年申報其中一項。",
    faqTitle: "常見問題",
    faq1q: "商業登記證費用怎樣釐訂？",
    faq1a: "除本地公司或有限合夥基金首張登記證外，應繳金額一般以登記證的開始生效日釐訂。一年證與三年證、商業登記證與分行登記證收費不同。由 2026年4月1日至2027年3月31日，一年商業登記證總數為$2,350（登記費$2,200＋破產欠薪保障基金徵費$150）。2025/26 一年證徵費為$0、總數$2,200。",
    faq2q: "本地公司首張商業登記證怎樣計？",
    faq2a: "經公司註冊處申請的本地公司，首張商業登記證應繳金額以其向公司註冊處交付相關成立法團遞呈的日期釐訂，而該證開始生效日是註冊日期。其後續證則以續證開始生效日釐訂。本頁以生效日查表，首張證請自行對照遞呈日所屬收費年期。",
    faq3q: "公司周年申報表逾期怎樣收費？",
    faq3a: "有股本本地私人公司：申報表日期後42日內$105；超過42日但不超過3個月$870；超過3個月但不超過6個月$1,740；超過6個月但不超過9個月$2,610；超過9個月$3,480。本地擔保有限公司同一階梯。有股本本地公眾公司按時$140，逾期$1,200／$2,400／$3,600／$4,800。註冊非香港公司按時$180，逾期階梯與公眾公司相同。",
    faq4q: "「申報表日期」是甚麼？",
    faq4a: "私人公司是成立為法團之日的周年日。公眾公司是會計參照期結束後6個月屆滿之日。擔保有限公司是會計參照期結束後9個月屆滿之日。註冊非香港公司是註冊周年日。本頁把該日與擬交付日對照收費階梯。",
    faq5q: "這是不是稅務局或公司註冊處官方工具？",
    faq5a: "不是。本頁只按已公布收費表估算，並非法例意見，亦非 IRD／CR 官方服務。不涵蓋成立法團申請費、更改名稱、押記登記、商業登記冊摘錄或核證本（$27）、複本（$20），亦不處理豁免申請或特惠安排。",
    faq6q: "資料會上傳嗎？",
    faq6a: "不會。估算只在瀏覽器內計算，草稿可選擇寫入本機 localStorage。沒有帳戶、沒有伺服器存檔。",
    sourcesTitle: "資料來源 / Sources",
    srcBrPdf: "稅務局 — 商業登記費及徵費收費表（PDF）：",
    srcBrPage: "稅務局 — 現時收費表（商業登記）：",
    srcCr: "公司註冊處 — 《公司條例》規定的主要收費（NAR1 階梯）：",
    srcAsOf:
      "以上收費於2026年10月26日核對上述官方頁／PDF（一年商業登記證 2026/27 總數 $2,350；私人公司 NAR1 按時 $105、逾期逾9個月 $3,480）。其後憲報或部門修訂，以官方為準。",
    privacyTitle: "私隱",
    privacyBody: "日期與費用數字只留在這個瀏覽器（localStorage，可選）。本頁不上傳、不設帳號、不設後端。",
    disclaimer:
      "只供估算，並非稅務局／公司註冊處官方服務或法律、稅務意見。 / Estimate only; not an IRD or CR service, and not legal or tax advice.",
    daysUnit: "{n} 日",
  },
  en: {
    pageTitle: "Business registration + NAR1 fee estimator",
    docTitle: "BR fee / annual return (NAR1) estimator · Hong Kong",
    lede: "Look up 1-year / 3-year Business Registration Certificate fees from the IRD table, and Companies Registry NAR1 filing fees (on-time or late). Optional combined total. No sign-up, no upload.",
    notice:
      "Reference only — not an IRD or Companies Registry tool, and not legal advice. Rely on the official tables, demand notes and the fee on the filing date. Does not cover incorporation application fees, change of name, charge filings, BR extracts ($27 / $20) or exemption applications. Levy and fee bands change by financial year.",
    explainTitle: "Why this tool",
    explainBody:
      "IRD publishes the BR fee and levy table as a PDF/web page; CR publishes NAR1 late-fee ladders. There is no simple combined browser estimator for “how much is my BR renewal?” and “what if I file the annual return late?” From 1 Apr 2026 the Protection of Wages on Insolvency Fund levy returns — 1-year BR total $2,350. Rates / Government rent already have RVD’s official calculator; leave / PIL / sick leave: Labour Department or stamp4u.",
    tableItem: "Item",
    tableNote: "Key figure (official)",
    tableBr: "1-year BR certificate 2026/27",
    tableBrV: "Fee $2,200 + levy $150 = $2,350",
    tableNar: "Private company NAR1 on time",
    tableNarV: "$105 within 42 days of the return date",
    tableNarLate: "Private company NAR1 >9 months late",
    tableNarLateV: "$3,480",
    demoBrBtn: "BR 2026 1-year",
    demoOnTimeBtn: "NAR1 on time",
    demoLateBtn: "NAR1 >9 months late",
    clearData: "Clear data",
    formTitle: "Inputs",
    brLegend: "Business Registration Certificate",
    enableBr: "Estimate BR certificate fee",
    kindMain: "Business registration",
    kindBranch: "Branch registration",
    term1: "1-year",
    term3: "3-year",
    brDate: "Certificate commencement / renewal start date",
    brDateHint:
      "Amount is generally fixed by the certificate commencement date. For a local company’s first certificate via CR, the incorporation submission date sets the amount (see FAQ).",
    narLegend: "Annual return (NAR1)",
    enableNar: "Estimate annual return filing fee",
    narType: "Company type",
    returnDate: "Return date / anniversary",
    returnDateHint:
      "Private = incorporation anniversary; public / guarantee = date after accounting-reference end; non-HK = registration anniversary.",
    filingDate: "Intended filing date",
    filingDateHint: "Posted filings use the postmark date. Returns without the correct fee are not treated as filed.",
    draftStatus: "Settings are saved in this browser (optional).",
    heroTotal: "Estimated total",
    heroBrOnly: "Business registration",
    heroNarOnly: "Annual return filing fee",
    heroBoth: "BR + annual return",
    heroFrom: "{parts}",
    kpiBr: "BR certificate total",
    kpiBrFee: "Registration fee",
    kpiBrLevy: "Levy",
    kpiNar: "NAR1 filing fee",
    kpiDaysAfter: "Days after return date",
    kpiDaysLate: "Days past 42-day window",
    kpiBand: "Fee band",
    rowBrBand: "Fee period",
    rowBrKind: "Certificate kind",
    rowBrTerm: "Term",
    rowBrFee: "Registration fee",
    rowBrLevy: "Levy",
    rowBrTotal: "BR total",
    rowNarType: "Company type",
    rowNarReturn: "Return date",
    rowNarFiling: "Filing date",
    rowNarOnTimeEnd: "On-time deadline (+42 days)",
    rowNarDays: "Days after return date",
    rowNarLate: "Days past 42-day window",
    rowNarBand: "Fee band",
    rowNarFee: "NAR1 payable",
    rowCombined: "Combined total",
    kindMainLabel: "Business registration (main)",
    kindBranchLabel: "Branch registration",
    term1Label: "1-year",
    term3Label: "3-year",
    typePrivate: "Private company with share capital",
    typePublic: "Public company with share capital",
    typeGuarantee: "Company limited by guarantee",
    typeNonHk: "Registered non-Hong Kong company",
    bandOnTime: "On time (within 42 days)",
    bandLate1: ">42 days and ≤3 months",
    bandLate2: ">3 months and ≤6 months",
    bandLate3: ">6 months and ≤9 months",
    bandLate4: ">9 months",
    formulaTitle: "How it is calculated",
    formulaBr: "BR certificate: commencement {date} falls in {band}\nFee {fee} + levy {levy} = {total}",
    formulaNar:
      "Annual return: {type}\nReturn date {ret} → filing {fil}\n{days} days after return ({late} days past 42-day window)\nBand: {band} → {fee}",
    formulaCombined: "Total = BR {br} + NAR1 {nar} = {total}",
    warnBrBadDate: "Enter a valid BR certificate commencement date.",
    warnBrNoBand: "Commencement date is outside the embedded IRD bands (currently 17 Jun 2022 – 31 Mar 2027). Check the latest official table.",
    warnNarBadDate: "Enter a valid return date and intended filing date.",
    warnNarBeforeReturn: "Filing date cannot be earlier than the return / anniversary date.",
    warnNarLate: "Intended filing is past the on-time window; a higher late fee applies. CR rejects returns without the correct fee.",
    warnNothing: "Enable at least BR or annual return.",
    faqTitle: "FAQ",
    faq1q: "How is the BR certificate fee set?",
    faq1a: "Except for the first certificate of a local company or limited partnership fund, the amount is generally fixed by the certificate commencement date. 1-year and 3-year, main and branch certificates differ. From 1 Apr 2026 to 31 Mar 2027 a 1-year main certificate totals $2,350 ($2,200 fee + $150 PWIF levy). In 2025/26 the 1-year levy was $0 (total $2,200).",
    faq2q: "How is a local company’s first BR certificate charged?",
    faq2a: "Where BR is applied for through the Companies Registry, the first certificate amount is set by the date of the related incorporation submission; the certificate commencement date is the incorporation date. Renewals use the renewal commencement date. This page looks up by commencement date — for a first certificate, match the submission date to the IRD band yourself.",
    faq3q: "What are the NAR1 late fees?",
    faq3a: "Private company with share capital: $105 within 42 days of the return date; $870 / $1,740 / $2,610 / $3,480 for the successive late bands. Guarantee companies use the same ladder. Public companies: $140 on time, then $1,200 / $2,400 / $3,600 / $4,800. Registered non-Hong Kong companies: $180 on time, then the public-company late ladder.",
    faq4q: "What is the “return date”?",
    faq4a: "Private company: anniversary of incorporation. Public: 6 months after the accounting reference period end. Guarantee: 9 months after that end. Non-Hong Kong: anniversary of registration. This page compares that date with your intended filing date.",
    faq5q: "Is this an official IRD or CR calculator?",
    faq5a: "No. It only applies published fee tables. Not legal advice and not an IRD/CR service. It does not cover incorporation application fees, change of name, charge filings, BR extracts / certified copies ($27), duplicates ($20), or exemption applications.",
    faq6q: "Is any data uploaded?",
    faq6a: "No. Estimates run in the browser; a draft may be written to localStorage. No account, no server copy.",
    sourcesTitle: "Sources",
    srcBrPdf: "IRD — Business Registration Fee and Levy Table (PDF):",
    srcBrPage: "IRD — Current fees (business registration):",
    srcCr: "Companies Registry — Main fees under the Companies Ordinance (NAR1 ladders):",
    srcAsOf:
      "Fees checked against those official pages/PDF on 26 October 2026 (1-year BR 2026/27 total $2,350; private NAR1 on time $105, >9 months $3,480). Later Gazette or departmental changes prevail.",
    privacyTitle: "Privacy",
    privacyBody: "Dates and amounts stay in this browser (optional localStorage). Nothing is uploaded. There is no account and no backend.",
    disclaimer:
      "Estimate only; not an IRD or CR service, and not legal or tax advice.",
    daysUnit: "{n} days",
  },
};

const state = {
  lang: "zh",
  settings: emptySettings(),
};

function $(id) {
  return document.getElementById(id);
}

function readLang() {
  try {
    var stored = localStorage.getItem(LANG_KEY);
    if (stored === "en" || stored === "zh") return stored;
  } catch (e) {
    /* private mode */
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

function pack() {
  return I18N[state.lang] || I18N.zh;
}

function fill(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, function (_, key) {
    return vars[key] == null ? "" : vars[key];
  });
}

function applyI18n() {
  var t = pack();
  var nodes = document.querySelectorAll("[data-i18n]");
  for (var i = 0; i < nodes.length; i++) {
    var key = nodes[i].getAttribute("data-i18n");
    if (t[key] != null) nodes[i].textContent = t[key];
  }
  $("lang-zh").setAttribute("aria-pressed", state.lang === "zh" ? "true" : "false");
  $("lang-en").setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
  document.documentElement.lang = state.lang === "en" ? "en" : "zh-Hant-HK";
  document.title = t.docTitle;
  updateNarHint();
}

function typeLabel(id, t) {
  if (id === "public") return t.typePublic;
  if (id === "guarantee") return t.typeGuarantee;
  if (id === "nonHongKong") return t.typeNonHk;
  return t.typePrivate;
}

function bandLabel(band, t) {
  if (band === "late1") return t.bandLate1;
  if (band === "late2") return t.bandLate2;
  if (band === "late3") return t.bandLate3;
  if (band === "late4") return t.bandLate4;
  return t.bandOnTime;
}

function updateNarHint() {
  var t = pack();
  var type = NAR1_TYPES[state.settings.narType] || NAR1_TYPES.private;
  $("nar-type-hint").textContent =
    (state.lang === "en" ? type.returnHintEn : type.returnHintZh) +
    " · " +
    typeLabel(type.id, t);
}

function readForm() {
  var next = Object.assign({}, state.settings);
  next.enableBr = $("enable-br").checked;
  next.enableNar = $("enable-nar").checked;
  next.brDate = $("br-date").value;
  next.narType = $("nar-type").value;
  next.returnDate = $("return-date").value;
  next.filingDate = $("filing-date").value;
  return next;
}

function writeForm(settings) {
  $("enable-br").checked = settings.enableBr !== false;
  $("enable-nar").checked = settings.enableNar !== false;
  $("br-date").value = settings.brDate || "";
  $("nar-type").value = settings.narType || "private";
  $("return-date").value = settings.returnDate || "";
  $("filing-date").value = settings.filingDate || "";
  syncChrome(settings);
  $("br-fields").hidden = settings.enableBr === false;
  $("nar-fields").hidden = settings.enableNar === false;
  updateNarHint();
}

function syncChrome(settings) {
  var kinds = document.querySelectorAll(".br-kind");
  for (var i = 0; i < kinds.length; i++) {
    var k = kinds[i].getAttribute("data-kind");
    kinds[i].setAttribute("aria-pressed", k === settings.brKind ? "true" : "false");
  }
  var terms = document.querySelectorAll(".br-term");
  for (var j = 0; j < terms.length; j++) {
    var tm = terms[j].getAttribute("data-term");
    terms[j].setAttribute("aria-pressed", tm === String(settings.brTerm) ? "true" : "false");
  }
}

function saveDraft() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
  } catch (e) {
    /* ignore */
  }
}

function loadDraft() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return Object.assign(emptySettings(), JSON.parse(raw));
  } catch (e) {
    return null;
  }
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
  var map = {
    brBadDate: t.warnBrBadDate,
    brNoBand: t.warnBrNoBand,
    narBadDate: t.warnNarBadDate,
    narBeforeReturn: t.warnNarBeforeReturn,
    narLate: t.warnNarLate,
    nothingEnabled: t.warnNothing,
  };
  var items = result.warnings
    .map(function (key) {
      return map[key];
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

function kpiCard(label, value) {
  return (
    '<div class="kpi"><span>' +
    escapeHtml(label) +
    "</span><strong>" +
    escapeHtml(value) +
    "</strong></div>"
  );
}

function rowHtml(label, value, strong) {
  return (
    "<tr><th>" +
    escapeHtml(label) +
    '</th><td class="num">' +
    (strong ? "<strong>" : "") +
    escapeHtml(value) +
    (strong ? "</strong>" : "") +
    "</td></tr>"
  );
}

function heroAmount(result) {
  if (result.combined != null) return formatMoney(result.combined, 0);
  if (result.brTotal != null && result.narFee == null) return formatMoney(result.brTotal, 0);
  if (result.narFee != null && result.brTotal == null) return formatMoney(result.narFee, 0);
  if (result.brTotal != null && result.narFee != null) {
    return formatMoney(result.brTotal + result.narFee, 0);
  }
  return "—";
}

function formulaText(result) {
  var t = pack();
  var blocks = [];
  if (result.br) {
    var bandLabelText = state.lang === "en" ? result.br.band.labelEn : result.br.band.labelZh;
    blocks.push(
      fill(t.formulaBr, {
        date: result.br.band && state.settings.brDate,
        band: bandLabelText,
        fee: formatMoney(result.br.fee, 0),
        levy: formatMoney(result.br.levy, 0),
        total: formatMoney(result.br.total, 0),
      })
    );
  }
  if (result.nar && result.nar.ok) {
    blocks.push(
      fill(t.formulaNar, {
        type: typeLabel(result.nar.companyType, t),
        ret: result.nar.returnDate.iso,
        fil: result.nar.filingDate.iso,
        days: String(result.nar.daysAfter),
        late: String(result.nar.daysLate),
        band: bandLabel(result.nar.band, t),
        fee: formatMoney(result.nar.fee, 0),
      })
    );
  }
  if (result.br && result.nar && result.nar.ok) {
    blocks.push(
      fill(t.formulaCombined, {
        br: formatMoney(result.br.total, 0),
        nar: formatMoney(result.nar.fee, 0),
        total: formatMoney(result.br.total + result.nar.fee, 0),
      })
    );
  }
  return blocks.join("\n\n");
}

function render() {
  var t = pack();
  var result = compute(state.settings);
  syncChrome(state.settings);
  $("br-fields").hidden = state.settings.enableBr === false;
  $("nar-fields").hidden = state.settings.enableNar === false;

  var heroLabel = t.heroTotal;
  if (result.br && result.nar && result.nar.ok) heroLabel = t.heroBoth;
  else if (result.br) heroLabel = t.heroBrOnly;
  else if (result.nar && result.nar.ok) heroLabel = t.heroNarOnly;
  $("hero-label").textContent = heroLabel;
  $("hero-amount").textContent = heroAmount(result);

  var parts = [];
  if (result.br) {
    parts.push(
      (state.lang === "en" ? result.br.band.labelEn : result.br.band.labelZh) +
        " · " +
        (result.br.kind === "branch" ? t.kindBranchLabel : t.kindMainLabel) +
        " · " +
        (result.br.term === "3" ? t.term3Label : t.term1Label)
    );
  }
  if (result.nar && result.nar.ok) {
    parts.push(typeLabel(result.nar.companyType, t) + " · " + bandLabel(result.nar.band, t));
  }
  $("hero-sub").textContent = parts.join(" ｜ ");

  var cards = [];
  if (result.br) {
    cards.push(kpiCard(t.kpiBrFee, formatMoney(result.br.fee, 0)));
    cards.push(kpiCard(t.kpiBrLevy, formatMoney(result.br.levy, 0)));
    cards.push(kpiCard(t.kpiBr, formatMoney(result.br.total, 0)));
  }
  if (result.nar && result.nar.ok) {
    cards.push(kpiCard(t.kpiNar, formatMoney(result.nar.fee, 0)));
    cards.push(kpiCard(t.kpiBand, bandLabel(result.nar.band, t)));
    cards.push(kpiCard(t.kpiDaysAfter, fill(t.daysUnit, { n: result.nar.daysAfter })));
    if (result.nar.daysLate > 0) {
      cards.push(kpiCard(t.kpiDaysLate, fill(t.daysUnit, { n: result.nar.daysLate })));
    }
  }
  $("kpis").innerHTML = cards.join("");

  var rows = [];
  if (result.br) {
    rows.push(
      rowHtml(
        t.rowBrBand,
        state.lang === "en" ? result.br.band.labelEn : result.br.band.labelZh
      )
    );
    rows.push(rowHtml(t.rowBrKind, result.br.kind === "branch" ? t.kindBranchLabel : t.kindMainLabel));
    rows.push(rowHtml(t.rowBrTerm, result.br.term === "3" ? t.term3Label : t.term1Label));
    rows.push(rowHtml(t.rowBrFee, formatMoney(result.br.fee, 0)));
    rows.push(rowHtml(t.rowBrLevy, formatMoney(result.br.levy, 0)));
    rows.push(rowHtml(t.rowBrTotal, formatMoney(result.br.total, 0), true));
  }
  if (result.nar && result.nar.ok) {
    rows.push(rowHtml(t.rowNarType, typeLabel(result.nar.companyType, t)));
    rows.push(rowHtml(t.rowNarReturn, result.nar.returnDate.iso));
    rows.push(rowHtml(t.rowNarFiling, result.nar.filingDate.iso));
    rows.push(rowHtml(t.rowNarOnTimeEnd, result.nar.onTimeEnd.iso));
    rows.push(rowHtml(t.rowNarDays, String(result.nar.daysAfter)));
    rows.push(rowHtml(t.rowNarLate, String(result.nar.daysLate)));
    rows.push(rowHtml(t.rowNarBand, bandLabel(result.nar.band, t)));
    rows.push(rowHtml(t.rowNarFee, formatMoney(result.nar.fee, 0), true));
  }
  if (result.br && result.nar && result.nar.ok) {
    rows.push(rowHtml(t.rowCombined, formatMoney(result.br.total + result.nar.fee, 0), true));
  }
  $("breakdown").innerHTML = rows.length ? "<tbody>" + rows.join("") + "</tbody>" : "";

  $("formula").textContent = formulaText(result);
  warnHtml(result);
}

function syncFromForm() {
  var kind = state.settings.brKind;
  var term = state.settings.brTerm;
  state.settings = readForm();
  state.settings.brKind = kind;
  state.settings.brTerm = term;
  saveDraft();
  render();
}

function init() {
  state.lang = readLang();
  var draft = loadDraft();
  if (draft) {
    if (draft.brKind !== "branch") draft.brKind = "main";
    if (String(draft.brTerm) !== "3") draft.brTerm = "1";
    if (!NAR1_TYPES[draft.narType]) draft.narType = "private";
    draft.enableBr = draft.enableBr !== false;
    draft.enableNar = draft.enableNar !== false;
    state.settings = draft;
  }
  applyI18n();
  writeForm(state.settings);
  render();

  $("lang-zh").addEventListener("click", function () {
    state.lang = "zh";
    saveLang("zh");
    applyI18n();
    writeForm(state.settings);
    render();
  });
  $("lang-en").addEventListener("click", function () {
    state.lang = "en";
    saveLang("en");
    applyI18n();
    writeForm(state.settings);
    render();
  });

  $("fee-form").addEventListener("input", syncFromForm);
  $("fee-form").addEventListener("change", syncFromForm);

  var kinds = document.querySelectorAll(".br-kind");
  for (var i = 0; i < kinds.length; i++) {
    kinds[i].addEventListener("click", function () {
      state.settings.brKind = this.getAttribute("data-kind") === "branch" ? "branch" : "main";
      writeForm(state.settings);
      saveDraft();
      render();
    });
  }
  var terms = document.querySelectorAll(".br-term");
  for (var j = 0; j < terms.length; j++) {
    terms[j].addEventListener("click", function () {
      state.settings.brTerm = this.getAttribute("data-term") === "3" ? "3" : "1";
      writeForm(state.settings);
      saveDraft();
      render();
    });
  }

  $("demo-br-btn").addEventListener("click", function () {
    state.settings = demoBr2026();
    writeForm(state.settings);
    saveDraft();
    render();
  });
  $("demo-ontime-btn").addEventListener("click", function () {
    state.settings = demoNarOnTime();
    writeForm(state.settings);
    saveDraft();
    render();
  });
  $("demo-late-btn").addEventListener("click", function () {
    state.settings = demoNarVeryLate();
    writeForm(state.settings);
    saveDraft();
    render();
  });
  $("clear-data").addEventListener("click", function () {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    state.settings = emptySettings();
    writeForm(state.settings);
    render();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
