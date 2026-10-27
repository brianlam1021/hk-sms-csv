import {
  COMPANY_TYPES,
  compute,
  demoElectronic2026,
  demoHardCopy2026,
  demoPriorYear,
  emptySettings,
  formatMoney,
} from "./fees.js";

const STORAGE_KEY = "hk-company-incorp-fees:v1";
const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "公司成立首年政府費用估算",
    docTitle: "公司成立首年政府費用估算｜開公司幾錢 · HK",
    lede: "按公司註冊處主要收費估算成立法團申請費（電子／印本），再按稅務局商業登記費及徵費表加上首張商業登記證。可選擇更改名稱費與首份按時周年申報表（NAR1）提醒。只用政府收費，不用註冊，不會上傳。",
    notice:
      "只供參考，並非公司註冊處或稅務局官方工具，亦非法例意見。實際以 CR／IRD 原文、繳款通知及遞呈當日收費為準。只計政府費用，不包括公司秘書、註冊辦事處／虛擬辦公室、代理人或會計師、開銀行戶口、公司印章、重要控制人登記冊服務或核數。不涵蓋遷冊申請。續證與逾期 NAR1 請用商業登記費／NAR1 工具。",
    explainTitle: "為甚麼需要這個工具",
    explainBody:
      "公司註冊處只公布收費表，沒有把成立費與首張商業登記證加總的互動計算機。商業登記費／NAR1 頁亦註明不涵蓋成立法團申請費。搜「開公司幾錢／公司註冊費用」的人需要一次加算電子或印本成立費，以及按遞呈日期釐訂的首張一年或三年商業登記證。差餉／地租請用差餉物業估價署官方計算機；年假／代通知金／病假請用勞工處或 stamp4u。",
    tableItem: "項目",
    tableNote: "重點（核對官方）",
    tableCr: "私人／公眾／非香港公司成立（電子）",
    tableCrV: "$1,545（不獲批准可申請退回 $1,280）",
    tableCrH: "同上（印本）",
    tableCrHV: "$1,720（不獲批准可申請退回 $1,425）",
    tableBr: "一年商業登記證 2026/27",
    tableBrV: "登記費 $2,200 ＋ 徵費 $150 ＝ $2,350",
    tableDefault: "預設合計（電子＋一年證）",
    tableDefaultV: "$1,545 ＋ $2,350 ＝ $3,895",
    demoEBtn: "電子 2026",
    demoHBtn: "印本 2026",
    demoPriorBtn: "2025/26 遞呈",
    clearData: "清除資料 Clear data",
    formTitle: "輸入",
    crLegend: "公司註冊處成立申請 Companies Registry",
    companyType: "公司類別",
    memberCount: "成員人數",
    memberHint: "不超過25名：$155／$170；26–100名：$305／$340；其後每50名加$18／$20，電子上限$925、印本$1,025。",
    deliveryE: "電子交付",
    deliveryH: "印本交付",
    brLegend: "首張商業登記證 First Business Registration",
    submissionDate: "成立／商業登記遞呈日期",
    submissionHint:
      "本地公司經公司註冊處一併申請商業登記時，稅務局以向公司註冊處交付相關成立法團遞呈的日期釐訂首張證應繳金額。",
    term1: "一年證",
    term3: "三年證",
    optLegend: "可選 Extra lines",
    includeName: "包括更改公司名稱費（本地 $295；非香港公司變更名稱 $1,425）",
    includeNar1: "包括首份按時 NAR1 作為「首年申報提醒」（成立時不繳；私人／擔保 $105、公眾 $140、非香港 $180）",
    draftStatus: "設定會自動保存在此瀏覽器（可選）。",
    heroAtIncorp: "成立時政府費用小計",
    heroYearOne: "首年政府申報合計",
    kpiCr: "成立／註冊申請費",
    kpiBr: "首張商業登記證",
    kpiBrFee: "登記費",
    kpiBrLevy: "徵費",
    kpiName: "更改／變更名稱",
    kpiNar: "首份按時 NAR1",
    kpiAtIncorp: "成立時政府小計",
    kpiYearOne: "首年政府合計",
    rowType: "公司類別",
    rowDelivery: "交付方式",
    rowMembers: "成員人數",
    rowGBand: "擔保公司收費帶",
    rowCr: "公司註冊處成立／註冊費",
    rowCrRefund: "不獲批准可申請退回",
    rowBrBand: "商業登記收費年期",
    rowBrTerm: "商業登記證有效期",
    rowBrFee: "商業登記費",
    rowBrLevy: "徵費",
    rowBrTotal: "首張商業登記證",
    rowName: "更改／變更名稱",
    rowNar: "首份按時 NAR1（提醒）",
    rowAtIncorp: "成立時政府費用小計",
    rowYearOne: "首年政府申報合計（含 NAR1）",
    deliveryELabel: "電子",
    deliveryHLabel: "印本",
    term1Label: "一年",
    term3Label: "三年",
    typePrivate: "有股本本地私人公司",
    typePublic: "有股本本地公眾公司",
    typeGuarantee: "本地擔保有限公司",
    typeNonHk: "註冊非香港公司",
    hintPrivate: "成立費與公眾公司、註冊非香港公司相同。",
    hintPublic: "成立費與私人公司相同；按時 NAR1 為 $140。",
    hintGuarantee: "成立費按成員人數分帶。按時 NAR1 為 $105。",
    hintNonHk: "註冊費與私人公司成立費相同。已領有商業登記證者無需再繳首張證。變更名稱為 $1,425。",
    gBandLe25: "不超過 25 名成員",
    gBandLe100: "超過 25 名但不超過 100 名",
    gBandOver: "超過 100 名（每 50 名加收，有上限）",
    formulaTitle: "計算說明",
    formulaCrShare: "公司註冊處：{type} · {delivery}\n成立／註冊申請費 {fee}（不獲批准可申請退回 {refund}）",
    formulaCrG:
      "公司註冊處：擔保有限公司 · {delivery} · {members} 名成員\n收費帶：{band}\n成立申請費 {fee}",
    formulaBr: "首張商業登記證：遞呈日 {date} 屬 {band} · {term}\n登記費 {fee} ＋ 徵費 {levy} ＝ {total}",
    formulaName: "更改／變更名稱：{fee}",
    formulaNar: "首份按時 NAR1（成立時不繳）：{fee}",
    formulaAt: "成立時政府小計 = 成立費 {cr} ＋ 商業登記 {br}{namePart} = {total}",
    formulaYear: "首年政府合計 = 成立時小計 {at} ＋ NAR1 {nar} = {total}",
    formulaNamePart: " ＋ 名稱 {name}",
    refundShare: "若成立／註冊申請不獲批准，可向公司註冊處申請退回 {refund}。首張商業登記證只會在成功註冊後發出。",
    refundName: "更改名稱不獲批准時，可申請退回 {refund}。",
    refundNone: "擔保有限公司成立費官方頁未列明不獲批准的退回額。商業登記證只會在成功註冊後發出。",
    warnBadDate: "請輸入有效的成立／商業登記遞呈日期。",
    warnBrNoBand: "遞呈日不在已嵌入的稅務局收費年期內（目前涵蓋 2022-06-17 至 2027-03-31）。請核對官方最新收費表。",
    warnBadMembers: "請輸入有效的擔保公司成員人數（至少 1 名）。",
    faqTitle: "常見問題",
    faq1q: "在香港開一間有股本私人公司，成立時政府費用幾錢？",
    faq1a: "電子交付成立法團申請費為$1,545，印本為$1,720。另加首張商業登記證：由2026年4月1日至2027年3月31日，一年證總數$2,350（登記費$2,200＋徵費$150），三年證$6,170。預設電子＋一年證合計$3,895；印本＋一年證$4,070。申請不獲批准時，電子交付可申請退回$1,280、印本$1,425。",
    faq2q: "首張商業登記證費用以哪一日釐訂？",
    faq2a: "經公司註冊處申請的本地公司，首張商業登記證應繳金額以其向公司註冊處交付相關成立法團遞呈的日期釐訂；該證開始生效日是註冊日期。本頁以遞呈／申請日查稅務局收費表。其後續證則以續證開始生效日釐訂，請用商業登記費／NAR1 工具。",
    faq3q: "擔保有限公司成立費怎樣計？",
    faq3a: "按成員人數：不超過25名，電子$155／印本$170；超過25名但不超過100名，電子$305／印本$340；超過100名，就首100名之後每50名（不足亦作50名）電子加$18（上限$925）、印本加$20（上限$1,025）。另加首張商業登記證。",
    faq4q: "更改名稱和 NAR1 是否成立當日要交？",
    faq4a: "不是必須。更改名稱（本地$295，不獲批准可申請退回$55；註冊非香港公司變更名稱$1,425）是獨立申請。首份按時周年申報表在成立周年（或公眾／擔保的申報表日期）後42日內繳交，不是成立費。本頁可把兩項列作可選行，方便估算「首年政府文件」。",
    faq5q: "這是不是公司註冊處或稅務局官方工具？",
    faq5a: "不是。本頁只按已公布收費表估算，並非法例意見，亦非 CR／IRD 官方服務。只計政府費用，不包括公司秘書、註冊辦事處／虛擬辦公室、代理人或會計師、開銀行戶口、公司印章、重要控制人登記冊服務或核數。不涵蓋遷冊申請（電子$6,050／印本$6,725）。",
    faq6q: "資料會上傳嗎？",
    faq6a: "不會。估算只在瀏覽器內計算，草稿可選擇寫入本機 localStorage。沒有帳戶、沒有伺服器存檔。",
    sourcesTitle: "資料來源 / Sources",
    srcCr: "公司註冊處 — 《公司條例》規定的主要收費：",
    srcBrPdf: "稅務局 — 商業登記費及徵費收費表（PDF）：",
    srcBrPage: "稅務局 — 現時收費表（商業登記）及首張證遞呈日說明：",
    srcRenew: "續證／逾期 NAR1 請用：",
    srcAsOf:
      "以上收費於2026年10月27日核對上述官方頁／PDF（私人公司電子成立 $1,545、印本 $1,720；一年商業登記證 2026/27 總數 $2,350）。其後憲報或部門修訂，以官方為準。",
    privacyTitle: "私隱",
    privacyBody: "日期與費用數字只留在這個瀏覽器（localStorage，可選）。本頁不上傳、不設帳號、不設後端。",
    disclaimer:
      "只供估算，並非公司註冊處／稅務局官方服務或法律、稅務意見。只計政府費用。 / Estimate only; not a CR or IRD service, and not legal or tax advice. Government fees only.",
  },
  en: {
    pageTitle: "Company incorporation first-year government fees",
    docTitle: "HK company incorporation first-year government fees estimator",
    lede: "Add the Companies Registry incorporation application fee (electronic or hard copy) to the first Business Registration Certificate from the IRD table. Optional change-of-name and first on-time NAR1 reminder. Government fees only. No sign-up, no upload.",
    notice:
      "Reference only — not a Companies Registry or IRD tool, and not legal advice. Rely on the official tables, demand notes and the fee on the submission date. Government fees only: excludes company secretary, registered office / virtual office, agent or CPA, bank account, chops, significant controllers register services and audits. Does not cover re-domiciliation. For renewals and late NAR1 use the BR / NAR1 tool.",
    explainTitle: "Why this tool",
    explainBody:
      "CR publishes fee tables only — there is no official interactive first-year total. The BR / NAR1 page explicitly excludes the incorporation application fee. People searching “how much to open a Hong Kong company” need one browser sum of the CR fee plus the first 1-year or 3-year BRC set by the incorporation submission date. Rates / Government rent already have RVD’s official calculator; leave / PIL / sick leave: Labour Department or stamp4u.",
    tableItem: "Item",
    tableNote: "Key figure (official)",
    tableCr: "Private / public / non-HK incorporation (electronic)",
    tableCrV: "$1,545 (refundable $1,280 if unsuccessful)",
    tableCrH: "Same (hard copy)",
    tableCrHV: "$1,720 (refundable $1,425 if unsuccessful)",
    tableBr: "1-year BR certificate 2026/27",
    tableBrV: "Fee $2,200 + levy $150 = $2,350",
    tableDefault: "Default total (electronic + 1-year BRC)",
    tableDefaultV: "$1,545 + $2,350 = $3,895",
    demoEBtn: "Electronic 2026",
    demoHBtn: "Hard copy 2026",
    demoPriorBtn: "2025/26 submission",
    clearData: "Clear data",
    formTitle: "Inputs",
    crLegend: "Companies Registry incorporation / registration",
    companyType: "Company type",
    memberCount: "Number of members",
    memberHint: "≤25: $155 / $170; 26–100: $305 / $340; then +$18 / $20 per 50 members, caps $925 / $1,025.",
    deliveryE: "Electronic",
    deliveryH: "Hard copy",
    brLegend: "First Business Registration Certificate",
    submissionDate: "Incorporation / BR submission date",
    submissionHint:
      "For a local company applying for BR through CR, IRD sets the first certificate amount by the date of the related incorporation submission.",
    term1: "1-year",
    term3: "3-year",
    optLegend: "Optional lines",
    includeName: "Include change of company name (local $295; non-HK alteration $1,425)",
    includeNar1: "Include first on-time NAR1 as a year-one filing reminder (not paid at incorporation; private/guarantee $105, public $140, non-HK $180)",
    draftStatus: "Settings are saved in this browser (optional).",
    heroAtIncorp: "Government fees at incorporation",
    heroYearOne: "Year-one government filings",
    kpiCr: "Incorporation / registration fee",
    kpiBr: "First BR certificate",
    kpiBrFee: "Registration fee",
    kpiBrLevy: "Levy",
    kpiName: "Change / alteration of name",
    kpiNar: "First on-time NAR1",
    kpiAtIncorp: "At incorporation",
    kpiYearOne: "Year-one total",
    rowType: "Company type",
    rowDelivery: "Delivery",
    rowMembers: "Members",
    rowGBand: "Guarantee fee band",
    rowCr: "CR incorporation / registration",
    rowCrRefund: "Refundable if unsuccessful",
    rowBrBand: "BR fee period",
    rowBrTerm: "BRC term",
    rowBrFee: "BR registration fee",
    rowBrLevy: "Levy",
    rowBrTotal: "First BR certificate",
    rowName: "Change / alteration of name",
    rowNar: "First on-time NAR1 (reminder)",
    rowAtIncorp: "Government subtotal at incorporation",
    rowYearOne: "Year-one government filings (incl. NAR1)",
    deliveryELabel: "Electronic",
    deliveryHLabel: "Hard copy",
    term1Label: "1-year",
    term3Label: "3-year",
    typePrivate: "Local private company limited by shares",
    typePublic: "Local public company limited by shares",
    typeGuarantee: "Local company limited by guarantee",
    typeNonHk: "Registered non-Hong Kong company",
    hintPrivate: "Same incorporation fee as a public company or registered non-Hong Kong company.",
    hintPublic: "Same incorporation fee as a private company; on-time NAR1 is $140.",
    hintGuarantee: "Incorporation fee depends on member-count bands. On-time NAR1 is $105.",
    hintNonHk: "Registration fee matches private-company incorporation. Skip the first BRC if the company already has one. Alteration of name is $1,425.",
    gBandLe25: "25 members or fewer",
    gBandLe100: "More than 25 but not more than 100",
    gBandOver: "More than 100 (extra per 50, capped)",
    formulaTitle: "How it is calculated",
    formulaCrShare: "Companies Registry: {type} · {delivery}\nIncorporation / registration {fee} (refundable {refund} if unsuccessful)",
    formulaCrG:
      "Companies Registry: company limited by guarantee · {delivery} · {members} members\nBand: {band}\nIncorporation fee {fee}",
    formulaBr: "First BRC: submission {date} falls in {band} · {term}\nFee {fee} + levy {levy} = {total}",
    formulaName: "Change / alteration of name: {fee}",
    formulaNar: "First on-time NAR1 (not paid at incorporation): {fee}",
    formulaAt: "At incorporation = CR {cr} + BRC {br}{namePart} = {total}",
    formulaYear: "Year-one total = at incorporation {at} + NAR1 {nar} = {total}",
    formulaNamePart: " + name {name}",
    refundShare: "If the incorporation / registration application is unsuccessful, you may apply to CR for a refund of {refund}. The first BRC is issued only if registration succeeds.",
    refundName: "If the change of name is unsuccessful, you may apply for a refund of {refund}.",
    refundNone: "The official guarantee-company table does not list a refund if the application fails. The BRC is issued only if registration succeeds.",
    warnBadDate: "Enter a valid incorporation / BR submission date.",
    warnBrNoBand: "Submission date is outside the embedded IRD bands (currently 17 Jun 2022 – 31 Mar 2027). Check the latest official table.",
    warnBadMembers: "Enter a valid guarantee-company member count (at least 1).",
    faqTitle: "FAQ",
    faq1q: "How much are government fees to incorporate a private company in Hong Kong?",
    faq1a: "Electronic incorporation is $1,545; hard copy $1,720. Add the first BRC: from 1 Apr 2026 to 31 Mar 2027 a 1-year certificate totals $2,350 ($2,200 fee + $150 levy) and a 3-year totals $6,170. Default electronic + 1-year = $3,895; hard copy + 1-year = $4,070. If unsuccessful, refundable portions are $1,280 (electronic) or $1,425 (hard copy).",
    faq2q: "Which date sets the first BRC amount?",
    faq2a: "Where BR is applied for through the Companies Registry, the first certificate amount is set by the date of the related incorporation submission; the certificate commencement date is the incorporation date. This page looks up the IRD table by that submission date. Renewals use the renewal commencement date — use the BR / NAR1 tool.",
    faq3q: "How is a guarantee company’s incorporation fee calculated?",
    faq3a: "By member count: ≤25 members $155 electronic / $170 hard copy; 26–100 $305 / $340; over 100, add $18 / $20 for every additional 50 members (or part) after the first 100, capped at $925 / $1,025. Then add the first BRC.",
    faq4q: "Are change of name and NAR1 paid at incorporation?",
    faq4a: "Not necessarily. Change of name (local $295, refundable $55 if unsuccessful; non-HK alteration $1,425) is a separate application. The first on-time annual return is due within 42 days of the return date, not at incorporation. This page can list both as optional year-one government lines.",
    faq5q: "Is this an official CR or IRD calculator?",
    faq5a: "No. It only applies published fee tables. Not legal advice and not a CR/IRD service. Government fees only — it excludes company secretary, registered office / virtual office, agent or CPA, bank account, chops, significant controllers register services and audits. Re-domiciliation ($6,050 electronic / $6,725 hard copy) is not included.",
    faq6q: "Is any data uploaded?",
    faq6a: "No. Estimates run in the browser; a draft may be written to localStorage. No account, no server copy.",
    sourcesTitle: "Sources",
    srcCr: "Companies Registry — Major fees under the Companies Ordinance:",
    srcBrPdf: "IRD — Business Registration Fee and Levy Table (PDF):",
    srcBrPage: "IRD — Current fees (business registration) and first-certificate submission-date note:",
    srcRenew: "For renewals / late NAR1 use:",
    srcAsOf:
      "Fees checked against those official pages/PDF on 27 October 2026 (private electronic incorporation $1,545, hard copy $1,720; 1-year BR 2026/27 total $2,350). Later Gazette or departmental changes prevail.",
    privacyTitle: "Privacy",
    privacyBody: "Dates and amounts stay in this browser (optional localStorage). Nothing is uploaded. There is no account and no backend.",
    disclaimer:
      "Estimate only; not a CR or IRD service, and not legal or tax advice. Government fees only.",
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
  updateTypeHint();
}

function typeLabel(id, t) {
  if (id === "public") return t.typePublic;
  if (id === "guarantee") return t.typeGuarantee;
  if (id === "nonHongKong") return t.typeNonHk;
  return t.typePrivate;
}

function typeHint(id, t) {
  if (id === "public") return t.hintPublic;
  if (id === "guarantee") return t.hintGuarantee;
  if (id === "nonHongKong") return t.hintNonHk;
  return t.hintPrivate;
}

function gBandLabel(band, t) {
  if (band === "le100") return t.gBandLe100;
  if (band === "over100") return t.gBandOver;
  return t.gBandLe25;
}

function updateTypeHint() {
  var t = pack();
  var id = state.settings.companyType;
  $("type-hint").textContent = typeHint(id, t) + " · " + typeLabel(id, t);
  $("member-wrap").hidden = id !== "guarantee";
}

function readForm() {
  var next = Object.assign({}, state.settings);
  next.companyType = $("company-type").value;
  next.submissionDate = $("submission-date").value;
  next.memberCount = Number($("member-count").value);
  next.includeNameChange = $("include-name").checked;
  next.includeNar1 = $("include-nar1").checked;
  return next;
}

function writeForm(settings) {
  $("company-type").value = settings.companyType || "private";
  $("submission-date").value = settings.submissionDate || "";
  $("member-count").value = settings.memberCount != null ? settings.memberCount : 25;
  $("include-name").checked = settings.includeNameChange === true;
  $("include-nar1").checked = settings.includeNar1 === true;
  syncChrome(settings);
  updateTypeHint();
}

function syncChrome(settings) {
  var modes = document.querySelectorAll(".delivery-mode");
  for (var i = 0; i < modes.length; i++) {
    var d = modes[i].getAttribute("data-delivery");
    modes[i].setAttribute("aria-pressed", d === settings.delivery ? "true" : "false");
  }
  var terms = document.querySelectorAll(".brc-term");
  for (var j = 0; j < terms.length; j++) {
    var tm = terms[j].getAttribute("data-term");
    terms[j].setAttribute("aria-pressed", tm === String(settings.brcTerm) ? "true" : "false");
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
    badDate: t.warnBadDate,
    brNoBand: t.warnBrNoBand,
    badMembers: t.warnBadMembers,
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

function formulaText(result) {
  var t = pack();
  var blocks = [];
  if (result.cr) {
    if (result.cr.kind === "guarantee") {
      blocks.push(
        fill(t.formulaCrG, {
          delivery: result.delivery === "hardCopy" ? t.deliveryHLabel : t.deliveryELabel,
          members: String(result.cr.guarantee.members),
          band: gBandLabel(result.cr.guarantee.band, t),
          fee: formatMoney(result.cr.fee, 0),
        })
      );
    } else {
      blocks.push(
        fill(t.formulaCrShare, {
          type: typeLabel(result.companyType, t),
          delivery: result.delivery === "hardCopy" ? t.deliveryHLabel : t.deliveryELabel,
          fee: formatMoney(result.cr.fee, 0),
          refund: formatMoney(result.cr.refundable, 0),
        })
      );
    }
  }
  if (result.br) {
    blocks.push(
      fill(t.formulaBr, {
        date: state.settings.submissionDate,
        band: state.lang === "en" ? result.br.band.labelEn : result.br.band.labelZh,
        term: result.br.term === "3" ? t.term3Label : t.term1Label,
        fee: formatMoney(result.br.fee, 0),
        levy: formatMoney(result.br.levy, 0),
        total: formatMoney(result.br.total, 0),
      })
    );
  }
  if (result.nameChange) {
    blocks.push(fill(t.formulaName, { fee: formatMoney(result.nameChange.fee, 0) }));
  }
  if (result.nar1) {
    blocks.push(fill(t.formulaNar, { fee: formatMoney(result.nar1.fee, 0) }));
  }
  if (result.atIncorporation != null) {
    blocks.push(
      fill(t.formulaAt, {
        cr: formatMoney(result.cr.fee, 0),
        br: formatMoney(result.br.total, 0),
        namePart: result.nameChange
          ? fill(t.formulaNamePart, { name: formatMoney(result.nameChange.fee, 0) })
          : "",
        total: formatMoney(result.atIncorporation, 0),
      })
    );
  }
  if (result.yearOneIncludesNar1) {
    blocks.push(
      fill(t.formulaYear, {
        at: formatMoney(result.atIncorporation, 0),
        nar: formatMoney(result.nar1.fee, 0),
        total: formatMoney(result.yearOne, 0),
      })
    );
  }
  return blocks.join("\n\n");
}

function refundText(result) {
  var t = pack();
  var parts = [];
  if (result.cr && result.cr.refundable > 0) {
    parts.push(fill(t.refundShare, { refund: formatMoney(result.cr.refundable, 0) }));
  } else if (result.cr && result.cr.kind === "guarantee") {
    parts.push(t.refundNone);
  }
  if (result.nameChange && result.nameChange.refundable > 0) {
    parts.push(fill(t.refundName, { refund: formatMoney(result.nameChange.refundable, 0) }));
  }
  return parts.join(" ");
}

function render() {
  var t = pack();
  var result = compute(state.settings);
  syncChrome(state.settings);
  updateTypeHint();

  $("hero-label").textContent = result.yearOneIncludesNar1 ? t.heroYearOne : t.heroAtIncorp;
  $("hero-amount").textContent =
    result.yearOneIncludesNar1 && result.yearOne != null
      ? formatMoney(result.yearOne, 0)
      : result.atIncorporation != null
        ? formatMoney(result.atIncorporation, 0)
        : "—";

  var parts = [typeLabel(result.companyType, t)];
  parts.push(result.delivery === "hardCopy" ? t.deliveryHLabel : t.deliveryELabel);
  if (result.br) {
    parts.push(state.lang === "en" ? result.br.band.labelEn : result.br.band.labelZh);
    parts.push(result.br.term === "3" ? t.term3Label : t.term1Label);
  }
  $("hero-sub").textContent = parts.join(" · ");

  var cards = [];
  if (result.cr) cards.push(kpiCard(t.kpiCr, formatMoney(result.cr.fee, 0)));
  if (result.br) {
    cards.push(kpiCard(t.kpiBrFee, formatMoney(result.br.fee, 0)));
    cards.push(kpiCard(t.kpiBrLevy, formatMoney(result.br.levy, 0)));
    cards.push(kpiCard(t.kpiBr, formatMoney(result.br.total, 0)));
  }
  if (result.nameChange) cards.push(kpiCard(t.kpiName, formatMoney(result.nameChange.fee, 0)));
  if (result.nar1) cards.push(kpiCard(t.kpiNar, formatMoney(result.nar1.fee, 0)));
  if (result.atIncorporation != null) {
    cards.push(kpiCard(t.kpiAtIncorp, formatMoney(result.atIncorporation, 0)));
  }
  if (result.yearOneIncludesNar1) {
    cards.push(kpiCard(t.kpiYearOne, formatMoney(result.yearOne, 0)));
  }
  $("kpis").innerHTML = cards.join("");

  var rows = [];
  rows.push(rowHtml(t.rowType, typeLabel(result.companyType, t)));
  rows.push(rowHtml(t.rowDelivery, result.delivery === "hardCopy" ? t.deliveryHLabel : t.deliveryELabel));
  if (result.cr && result.cr.guarantee) {
    rows.push(rowHtml(t.rowMembers, String(result.cr.guarantee.members)));
    rows.push(rowHtml(t.rowGBand, gBandLabel(result.cr.guarantee.band, t)));
  }
  if (result.cr) {
    rows.push(rowHtml(t.rowCr, formatMoney(result.cr.fee, 0), true));
    if (result.cr.refundable > 0) {
      rows.push(rowHtml(t.rowCrRefund, formatMoney(result.cr.refundable, 0)));
    }
  }
  if (result.br) {
    rows.push(rowHtml(t.rowBrBand, state.lang === "en" ? result.br.band.labelEn : result.br.band.labelZh));
    rows.push(rowHtml(t.rowBrTerm, result.br.term === "3" ? t.term3Label : t.term1Label));
    rows.push(rowHtml(t.rowBrFee, formatMoney(result.br.fee, 0)));
    rows.push(rowHtml(t.rowBrLevy, formatMoney(result.br.levy, 0)));
    rows.push(rowHtml(t.rowBrTotal, formatMoney(result.br.total, 0), true));
  }
  if (result.nameChange) {
    rows.push(rowHtml(t.rowName, formatMoney(result.nameChange.fee, 0)));
  }
  if (result.atIncorporation != null) {
    rows.push(rowHtml(t.rowAtIncorp, formatMoney(result.atIncorporation, 0), true));
  }
  if (result.nar1) {
    rows.push(rowHtml(t.rowNar, formatMoney(result.nar1.fee, 0)));
    rows.push(rowHtml(t.rowYearOne, formatMoney(result.yearOne, 0), true));
  }
  $("breakdown").innerHTML = rows.length ? "<tbody>" + rows.join("") + "</tbody>" : "";

  $("formula").textContent = formulaText(result);
  $("refund-note").textContent = refundText(result);
  warnHtml(result);
}

function syncFromForm() {
  var delivery = state.settings.delivery;
  var term = state.settings.brcTerm;
  state.settings = readForm();
  state.settings.delivery = delivery;
  state.settings.brcTerm = term;
  saveDraft();
  render();
}

function init() {
  state.lang = readLang();
  var draft = loadDraft();
  if (draft) {
    if (!COMPANY_TYPES[draft.companyType]) draft.companyType = "private";
    if (draft.delivery !== "hardCopy") draft.delivery = "electronic";
    if (String(draft.brcTerm) !== "3") draft.brcTerm = "1";
    draft.includeNameChange = draft.includeNameChange === true;
    draft.includeNar1 = draft.includeNar1 === true;
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

  var modes = document.querySelectorAll(".delivery-mode");
  for (var i = 0; i < modes.length; i++) {
    modes[i].addEventListener("click", function () {
      state.settings.delivery =
        this.getAttribute("data-delivery") === "hardCopy" ? "hardCopy" : "electronic";
      writeForm(state.settings);
      saveDraft();
      render();
    });
  }
  var terms = document.querySelectorAll(".brc-term");
  for (var j = 0; j < terms.length; j++) {
    terms[j].addEventListener("click", function () {
      state.settings.brcTerm = this.getAttribute("data-term") === "3" ? "3" : "1";
      writeForm(state.settings);
      saveDraft();
      render();
    });
  }

  $("demo-e-btn").addEventListener("click", function () {
    state.settings = demoElectronic2026();
    writeForm(state.settings);
    saveDraft();
    render();
  });
  $("demo-h-btn").addEventListener("click", function () {
    state.settings = demoHardCopy2026();
    writeForm(state.settings);
    saveDraft();
    render();
  });
  $("demo-prior-btn").addEventListener("click", function () {
    state.settings = demoPriorYear();
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
