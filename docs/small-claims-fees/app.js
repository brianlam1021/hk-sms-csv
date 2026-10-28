import {
  compute,
  demo3k,
  demo60k,
  demoWitness,
  emptySettings,
  formatMoney,
} from "./fees.js";

const STORAGE_KEY = "hk-small-claims-fees:v1";
const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "小額錢債審裁處申請費用估算",
    docTitle: "小額錢債審裁處申請費用估算｜SCT filing fee · HK",
    lede: "按司法機構2024年10月收費表，把申索額對應入稟費（$20／$40／$70／$120），並可加各方傳票、證人傳票、修訂文件、執行令狀、作廢／覆核／上訴許可與執達主任送達等常見附加費。可切換勞資審裁處入稟費。不用註冊，不會上傳。",
    notice:
      "只供參考，並非司法機構官方工具，亦非法例意見。實際以司法機構收費表、登記處及繳費當日為準。不評估申索成敗、利息或訟費判給。申索上限$75,000；超過此額不能以小額錢債審裁處入稟（可放棄超出部分）。不計算區域法院或其他法庭費用。",
    explainTitle: "為甚麼需要這個工具",
    explainBody:
      "司法機構以 PDF 公布小額錢債審裁處收費表，沒有把申索額對應入稟費及常見附加費的互動計算機。勞工處／稅務局已有年假、最低工資、股票印花稅、個人入息課稅、電費及差餉／地租官方計算機，本站不重複那些。搜「入稟幾錢／小額錢債費用」的人需要一條按申索額即時顯示的收費階梯。",
    tableItem: "申索額",
    tableNote: "入稟費（核對官方）",
    tableLe5k: "不超過 $5,000",
    tableLe5kV: "$20",
    tableLe25k: "超過 $5,000 但不超過 $25,000",
    tableLe25kV: "$40",
    tableLe50k: "超過 $25,000 但不超過 $50,000",
    tableLe50kV: "$70",
    tableLe75k: "超過 $50,000 但不超過 $75,000",
    tableLe75kV: "$120",
    demo3kBtn: "$3,000 申索",
    demo60kBtn: "$60,000 申索",
    demoWitnessBtn: "申索＋證人傳票",
    clearData: "清除資料 Clear data",
    formTitle: "輸入",
    tribunalLegend: "審裁處 Tribunal",
    modeSct: "小額錢債審裁處",
    modeLt: "勞資審裁處",
    hintSct: "處理不超過 $75,000 的金錢申索。各方一般不得由律師代表出庭。",
    hintLt: "處理僱傭金錢糾紛。入稟費見第25章附屬法例B；每個地址 $10 送達費見司法機構網頁。",
    claimLegend: "申索額 Claim amount",
    claimAmount: "申索款額（港元）",
    claimHint: "小額錢債審裁處上限 $75,000。入稟費按「不超過／超過」界線（例如 $5,000 收 $20，$5,000.01 收 $40）。",
    sctAddonLegend: "常見附加費（同一收費表）",
    interParty: "各方之間的傳票（每張 $55，包括送達）",
    witnessSct: "證人傳票（每名 $33，包括送達）",
    amended: "提交經修訂的文件（每份 $20）",
    writ: "提交執行令狀（每份 $55）",
    bailiff: "執達主任交付文件（每個地址 $10）",
    setAside: "申請將裁斷或命令作廢（$61）",
    reviewSct: "覆核申請（$61）",
    leaveSct: "上訴許可申請（$61）",
    ltAddonLegend: "勞資審裁處常見附加費",
    witnessLt: "證人傳票（每名 $25，包括送達）",
    serviceLt: "送達被告人文件（每個地址 $10）",
    reviewLt: "覆核申請（$45）",
    leaveLt: "上訴許可申請（$45）",
    ltAddonHint:
      "證人傳票、覆核與上訴許可見《勞資審裁處（費用）規則》（第25章附屬法例B）。每個地址 $10 送達費見司法機構勞資審裁處網頁。",
    draftStatus: "設定會自動保存在此瀏覽器（可選）。",
    printBtn: "列印／另存 PDF",
    copyBtn: "複製文字",
    copied: "已複製。",
    copyFail: "無法複製，請人手選取。",
    heroTotal: "估算合計",
    heroCannot: "不能以小額錢債審裁處入稟",
    heroNeedAmount: "請輸入申索額",
    kpiFiling: "入稟費",
    kpiAddons: "附加費",
    kpiTotal: "合計",
    kpiBand: "收費帶",
    rowTribunal: "審裁處",
    rowClaim: "申索額",
    rowBand: "入稟收費帶",
    rowFiling: "提交申索書／反申索書",
    rowInterParty: "各方之間的傳票（第1A項）",
    rowWitnessSct: "證人傳票（第2項）",
    rowAmended: "經修訂文件（第2A項）",
    rowWrit: "執行令狀（第2B項）",
    rowSetAside: "將裁斷或命令作廢（第2C項）",
    rowReviewSct: "覆核申請（第3項）",
    rowLeaveSct: "上訴許可（第4項）",
    rowBailiff: "執達主任交付文件（第10A項）",
    rowWitnessLt: "證人傳票（第2項）",
    rowReviewLt: "覆核申請（第3項）",
    rowLeaveLt: "上訴許可（第4項）",
    rowServiceLt: "送達被告人（每個地址）",
    rowAddons: "附加費小計",
    rowTotal: "估算合計",
    qtyEach: "× {n}",
    bandLe5k: "不超過 $5,000 → $20",
    bandLe25k: "超過 $5,000 但不超過 $25,000 → $40",
    bandLe50k: "超過 $25,000 但不超過 $50,000 → $70",
    bandLe75k: "超過 $50,000 但不超過 $75,000 → $120",
    bandLtLe2k: "不超過 $2,000 → $20",
    bandLtLe5k: "超過 $2,000 但不超過 $5,000 → $30",
    bandLtLe10k: "超過 $5,000 但不超過 $10,000 → $40",
    bandLtOver10k: "超過 $10,000 → $50",
    tribunalSct: "小額錢債審裁處",
    tribunalLt: "勞資審裁處",
    formulaTitle: "計算說明",
    formulaSct: "小額錢債審裁處：申索 {claim}\n收費帶：{band}\n入稟費 {fee}",
    formulaLt: "勞資審裁處：申索 {claim}\n收費帶：{band}\n入稟費 {fee}",
    formulaOver: "申索 {claim} 超過小額錢債審裁處上限 $75,000，不能以本審裁處入稟。本頁不估算其他法庭費用。",
    formulaAbandon: "若放棄超出部分、以 $75,000 入稟，入稟費為 {fee}。",
    formulaAddon: "{label}：{fee} × {qty} = {total}",
    formulaTotal: "合計 = 入稟費 {filing} ＋ 附加費 {addons} = {total}",
    formulaAddonsOnly: "合計（僅附加費，未計入稟）= {total}",
    warnBadAmount: "請輸入有效的申索款額（0 或正數）。",
    warnOverLimit:
      "申索超過 $75,000，不能以小額錢債審裁處入稟。可放棄超出部分，把申索額改為 $75,000（入稟費 $120）。本頁不估算區域法院或其他法庭費用。",
    abandonNote: "若放棄超出部分、以 $75,000 入稟，入稟費為 $120。上方合計只包括你勾選的附加費，沒有把其他法庭的入稟費加進去。",
    faqTitle: "常見問題",
    faq1q: "小額錢債審裁處入稟費幾錢？",
    faq1a: "按司法機構2024年10月收費表（《小額錢債審裁處（費用）規則》第338章附屬法例B，經2024年第112號法律公告修訂，2024年10月31日起實施）：申索不超過$5,000收$20；超過$5,000但不超過$25,000收$40；超過$25,000但不超過$50,000收$70；超過$50,000但不超過$75,000收$120。",
    faq2q: "申索超過 $75,000 怎麼辦？",
    faq2a: "小額錢債審裁處只處理不超過$75,000的金錢申索。超過此額不能以本審裁處入稟。申索人可放棄超出部分，把申索額減至$75,000（入稟費$120）。本頁不估算區域法院或其他法庭的入稟費。",
    faq3q: "入稟要親身到登記處嗎？",
    faq3a: "司法機構說明：提交申索須於辦公時間內在小額錢債審裁處登記處當面辦理，不可以用郵遞、傳真或電郵。申索人可委派代表代為提交，並須繳付法例訂明費用。詳情以官方網頁及登記處當日安排為準。",
    faq4q: "還有哪些收費沒有列入表單？",
    faq4a: "同一收費表還有文本、翻譯、抄錄、認證、檔案翻查、看管費、政府官員出庭、誓章、音像光碟、蓋印等較少用項目。大量申索經綜合法院案件管理系統（iCMS）在優惠期可以電子方式繳付較低費用。完整表見司法機構 PDF，本頁不估算那些項目。",
    faq5q: "勞資審裁處費用怎樣計？",
    faq5a: "按《勞資審裁處（費用）規則》（第25章附屬法例B）及司法機構勞資審裁處網頁：申索不超過$2,000收$20；$2,001至$5,000收$30；$5,001至$10,000收$40；超過$10,000收$50。證人傳票每名$25；覆核申請$45；上訴許可申請$45。送達被告人文件每個地址$10（司法機構網頁）。本頁只列這些已核對項目。",
    faq6q: "這是不是司法機構官方工具？資料會上傳嗎？",
    faq6a: "不是官方工具，亦非法例意見。不評估申索成敗、利息或對方應付訟費。估算只在瀏覽器內計算，草稿可選擇寫入本機 localStorage。沒有帳戶、沒有伺服器存檔。",
    sourcesTitle: "資料來源 / Sources",
    srcSctPdf: "司法機構 — 小額錢債審裁處收費表（2024年10月 PDF）：",
    srcSctPage: "司法機構 — 小額錢債審裁處說明（申索上限、親身入稟）：",
    srcCap338b: "《小額錢債審裁處（費用）規則》（第338章附屬法例B），經2024年第112號法律公告修訂，2024年10月31日起實施。",
    srcLtPage: "司法機構 — 勞資審裁處（入稟費表及每個地址 $10 送達費）：",
    srcCap25b: "《勞資審裁處（費用）規則》（第25章附屬法例B）附表：入稟費、證人傳票 $25、覆核 $45、上訴許可 $45。",
    srcAsOf:
      "以上收費於2026年10月28日核對上述官方頁／PDF（小額錢債入稟費 $20／$40／$70／$120；勞資審裁處入稟費 $20／$30／$40／$50）。其後憲報或司法機構修訂，以官方為準。",
    privacyTitle: "私隱",
    privacyBody: "申索額與附加費數字只留在這個瀏覽器（localStorage，可選）。本頁不上傳、不設帳號、不設後端。",
    disclaimer: "只供估算，並非司法機構官方服務或法律意見。 / Estimate only; not a Judiciary service, and not legal advice.",
  },
  en: {
    pageTitle: "Small Claims Tribunal filing-fee estimator",
    docTitle: "HK Small Claims Tribunal filing-fee estimator",
    lede: "Map a claim amount to the Judiciary October 2024 SCT filing bands ($20 / $40 / $70 / $120), then add common extras: inter-partes summons, witness summons, amended document, writ of execution, set-aside / review / leave to appeal, and bailiff delivery. Optional Labour Tribunal filing mode. No sign-up, no upload.",
    notice:
      "Reference only — not a Judiciary tool, and not legal advice. Rely on the official fee table, the registry and the fee on the payment date. This page does not judge the merits of a claim, interest or costs awards. SCT limit is $75,000; a larger claim cannot be filed here (you may abandon the excess). District Court and other court fees are not estimated.",
    explainTitle: "Why this tool",
    explainBody:
      "The Judiciary publishes an SCT PDF fee schedule, but there is no official interactive ladder from claim amount to filing fee plus common add-ons. Labour Department / IRD already cover annual leave, SMW, share stamp, personal assessment, electricity and rates / government rent — those are not rebuilt here. People searching “how much to file a small claim” need a live band lookup.",
    tableItem: "Claim amount",
    tableNote: "Filing fee (official)",
    tableLe5k: "Does not exceed $5,000",
    tableLe5kV: "$20",
    tableLe25k: "Exceeds $5,000 but not $25,000",
    tableLe25kV: "$40",
    tableLe50k: "Exceeds $25,000 but not $50,000",
    tableLe50kV: "$70",
    tableLe75k: "Exceeds $50,000 but not $75,000",
    tableLe75kV: "$120",
    demo3kBtn: "$3,000 claim",
    demo60kBtn: "$60,000 claim",
    demoWitnessBtn: "Claim + witness summons",
    clearData: "Clear data",
    formTitle: "Inputs",
    tribunalLegend: "Tribunal",
    modeSct: "Small Claims Tribunal",
    modeLt: "Labour Tribunal",
    hintSct: "Money claims not exceeding $75,000. Legal representation is generally not allowed.",
    hintLt: "Employment money claims. Filing fees: Cap. 25B. $10 per address to serve documents: Judiciary Labour Tribunal page.",
    claimLegend: "Claim amount",
    claimAmount: "Amount claimed (HKD)",
    claimHint: "SCT limit $75,000. Bands use “does not exceed / exceeds” (e.g. $5,000 is $20; $5,000.01 is $40).",
    sctAddonLegend: "Common extras (same fee table)",
    interParty: "Inter-partes summons ($55 each, including service)",
    witnessSct: "Witness summons ($33 each, including service)",
    amended: "Filing an amended document ($20 each)",
    writ: "Filing a writ of execution ($55 each)",
    bailiff: "Bailiff delivery of documents ($10 per address)",
    setAside: "Application to set aside an award or order ($61)",
    reviewSct: "Application for review ($61)",
    leaveSct: "Application for leave to appeal ($61)",
    ltAddonLegend: "Labour Tribunal common extras",
    witnessLt: "Witness summons ($25 each, including service)",
    serviceLt: "Serving documents on the defendant ($10 per address)",
    reviewLt: "Application for review ($45)",
    leaveLt: "Application for leave to appeal ($45)",
    ltAddonHint:
      "Witness summons, review and leave to appeal: Labour Tribunal (Fees) Rules (Cap. 25B). $10 per address: Judiciary Labour Tribunal page.",
    draftStatus: "Settings are saved in this browser (optional).",
    printBtn: "Print / save PDF",
    copyBtn: "Copy text",
    copied: "Copied.",
    copyFail: "Could not copy. Select the text yourself.",
    heroTotal: "Estimated total",
    heroCannot: "Cannot file as SCT",
    heroNeedAmount: "Enter a claim amount",
    kpiFiling: "Filing fee",
    kpiAddons: "Add-ons",
    kpiTotal: "Total",
    kpiBand: "Band",
    rowTribunal: "Tribunal",
    rowClaim: "Claim amount",
    rowBand: "Filing band",
    rowFiling: "Filing of claim / counterclaim",
    rowInterParty: "Inter-partes summons (item 1A)",
    rowWitnessSct: "Witness summons (item 2)",
    rowAmended: "Amended document (item 2A)",
    rowWrit: "Writ of execution (item 2B)",
    rowSetAside: "Set aside award / order (item 2C)",
    rowReviewSct: "Application for review (item 3)",
    rowLeaveSct: "Leave to appeal (item 4)",
    rowBailiff: "Bailiff delivery (item 10A)",
    rowWitnessLt: "Witness summons (item 2)",
    rowReviewLt: "Application for review (item 3)",
    rowLeaveLt: "Leave to appeal (item 4)",
    rowServiceLt: "Service on defendant (per address)",
    rowAddons: "Add-ons subtotal",
    rowTotal: "Estimated total",
    qtyEach: "× {n}",
    bandLe5k: "Does not exceed $5,000 → $20",
    bandLe25k: "Exceeds $5,000 but not $25,000 → $40",
    bandLe50k: "Exceeds $25,000 but not $50,000 → $70",
    bandLe75k: "Exceeds $50,000 but not $75,000 → $120",
    bandLtLe2k: "Does not exceed $2,000 → $20",
    bandLtLe5k: "Exceeds $2,000 but not $5,000 → $30",
    bandLtLe10k: "Exceeds $5,000 but not $10,000 → $40",
    bandLtOver10k: "Exceeds $10,000 → $50",
    tribunalSct: "Small Claims Tribunal",
    tribunalLt: "Labour Tribunal",
    formulaTitle: "How it is calculated",
    formulaSct: "Small Claims Tribunal: claim {claim}\nBand: {band}\nFiling fee {fee}",
    formulaLt: "Labour Tribunal: claim {claim}\nBand: {band}\nFiling fee {fee}",
    formulaOver: "Claim {claim} exceeds the SCT limit of $75,000 and cannot be filed there. Other court fees are not estimated.",
    formulaAbandon: "If you abandon the excess and file $75,000, the filing fee is {fee}.",
    formulaAddon: "{label}: {fee} × {qty} = {total}",
    formulaTotal: "Total = filing {filing} + add-ons {addons} = {total}",
    formulaAddonsOnly: "Total (add-ons only; no filing) = {total}",
    warnBadAmount: "Enter a valid claim amount (zero or a positive number).",
    warnOverLimit:
      "The claim exceeds $75,000 and cannot be filed in the Small Claims Tribunal. You may abandon the excess and file $75,000 (filing fee $120). District Court and other court fees are not estimated.",
    abandonNote: "If you abandon the excess and file $75,000, the filing fee is $120. The total above includes only the extras you selected — it does not invent another court’s filing fee.",
    faqTitle: "FAQ",
    faq1q: "How much is the SCT filing fee?",
    faq1a: "From the Judiciary October 2024 table (Small Claims Tribunal (Fees) Rules, Cap. 338B, as amended by L.N. 112 of 2024, in force from 31 October 2024): claim not exceeding $5,000 → $20; exceeding $5,000 but not $25,000 → $40; exceeding $25,000 but not $50,000 → $70; exceeding $50,000 but not $75,000 → $120.",
    faq2q: "What if the claim is over $75,000?",
    faq2a: "The Small Claims Tribunal only hears money claims not exceeding $75,000. A larger claim cannot be filed there. You may abandon the excess and claim $75,000 (filing fee $120). This page does not estimate District Court or other court filing fees.",
    faq3q: "Must I file in person at the registry?",
    faq3a: "The Judiciary says a claim must be filed in person at the SCT Registry during office hours — not by post, fax or email. A representative may file on the claimant’s behalf. The prescribed fee is payable on filing. Follow the official page and the registry on the day.",
    faq4q: "Which fees are left out of the form?",
    faq4a: "The same schedule also lists copies, translation, transcription, authentication, searches, watchman’s fees, government-officer attendance, affidavits, AV discs and sealing. Bulk claims via iCMS may pay a concessionary electronic rate during the concession period. See the Judiciary PDF for the full table; those items are out of scope here.",
    faq5q: "How are Labour Tribunal fees calculated?",
    faq5a: "From the Labour Tribunal (Fees) Rules (Cap. 25B) and the Judiciary Labour Tribunal page: claim not exceeding $2,000 → $20; $2,001–$5,000 → $30; $5,001–$10,000 → $40; over $10,000 → $50. Witness summons $25 each; review $45; leave to appeal $45. Serving documents on the defendant is $10 per address (Judiciary page). Only these verified items are listed.",
    faq6q: "Is this an official Judiciary tool? Is data uploaded?",
    faq6a: "No. Not legal advice and not a Judiciary service. It does not assess merits, interest or costs against the other party. Estimates run in the browser; a draft may be written to localStorage. No account, no server copy.",
    sourcesTitle: "Sources",
    srcSctPdf: "Judiciary — Small Claims Tribunal Level of Fees (October 2024 PDF):",
    srcSctPage: "Judiciary — Small Claims Tribunal guide (limit and in-person filing):",
    srcCap338b: "Small Claims Tribunal (Fees) Rules (Cap. 338B), as amended by L.N. 112 of 2024, in force from 31 October 2024.",
    srcLtPage: "Judiciary — Labour Tribunal (filing table and $10 per address for service):",
    srcCap25b: "Labour Tribunal (Fees) Rules (Cap. 25B) Schedule: filing fees, witness summons $25, review $45, leave to appeal $45.",
    srcAsOf:
      "Fees checked against those official pages/PDF on 28 October 2026 (SCT filing $20 / $40 / $70 / $120; Labour Tribunal filing $20 / $30 / $40 / $50). Later Gazette or Judiciary changes prevail.",
    privacyTitle: "Privacy",
    privacyBody: "Claim amounts and extras stay in this browser (optional localStorage). Nothing is uploaded. There is no account and no backend.",
    disclaimer: "Estimate only; not a Judiciary service, and not legal advice.",
  },
};

const LINE_LABEL = {
  filing: { zh: "rowFiling", en: "rowFiling" },
  interPartySummons: { zh: "rowInterParty", en: "rowInterParty" },
  witnessSummons: { sct: "rowWitnessSct", lt: "rowWitnessLt" },
  amendedDocument: { zh: "rowAmended", en: "rowAmended" },
  writOfExecution: { zh: "rowWrit", en: "rowWrit" },
  setAside: { zh: "rowSetAside", en: "rowSetAside" },
  review: { sct: "rowReviewSct", lt: "rowReviewLt" },
  leaveToAppeal: { sct: "rowLeaveSct", lt: "rowLeaveLt" },
  bailiffDelivery: { zh: "rowBailiff", en: "rowBailiff" },
  serviceAddress: { zh: "rowServiceLt", en: "rowServiceLt" },
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
  updateTribunalHint();
}

function bandLabel(tribunal, bandId, t) {
  if (tribunal === "lt") {
    if (bandId === "le2k") return t.bandLtLe2k;
    if (bandId === "le5k") return t.bandLtLe5k;
    if (bandId === "le10k") return t.bandLtLe10k;
    if (bandId === "over10k") return t.bandLtOver10k;
    return "";
  }
  if (bandId === "le5k") return t.bandLe5k;
  if (bandId === "le25k") return t.bandLe25k;
  if (bandId === "le50k") return t.bandLe50k;
  if (bandId === "le75k") return t.bandLe75k;
  return "";
}

function lineLabel(line, tribunal, t) {
  var map = LINE_LABEL[line.id];
  if (!map) return line.id;
  var key = map[tribunal] || map.zh || map.en;
  return t[key] || line.id;
}

function updateTribunalHint() {
  var t = pack();
  $("tribunal-hint").textContent = state.settings.tribunal === "lt" ? t.hintLt : t.hintSct;
  $("sct-addons").hidden = state.settings.tribunal === "lt";
  $("lt-addons").hidden = state.settings.tribunal !== "lt";
}

function readForm() {
  var next = Object.assign({}, state.settings);
  next.claimAmount = $("claim-amount").value;
  next.interPartySummons = $("inter-party").value;
  next.amendedDocument = $("amended").value;
  next.writOfExecution = $("writ").value;
  next.bailiffDelivery = $("bailiff").value;
  next.setAside = $("set-aside").checked;
  next.serviceAddress = $("lt-service").value;
  if (next.tribunal === "lt") {
    next.witnessSummons = $("lt-witness").value;
    next.review = $("lt-review").checked;
    next.leaveToAppeal = $("lt-leave").checked;
  } else {
    next.witnessSummons = $("witness").value;
    next.review = $("review").checked;
    next.leaveToAppeal = $("leave-appeal").checked;
  }
  return next;
}

function writeForm(settings) {
  $("claim-amount").value = settings.claimAmount == null ? "" : settings.claimAmount;
  $("inter-party").value = settings.interPartySummons || 0;
  $("witness").value = settings.tribunal === "sct" ? settings.witnessSummons || 0 : $("witness").value || 0;
  $("amended").value = settings.amendedDocument || 0;
  $("writ").value = settings.writOfExecution || 0;
  $("bailiff").value = settings.bailiffDelivery || 0;
  $("set-aside").checked = settings.setAside === true;
  if (settings.tribunal === "sct") {
    $("review").checked = settings.review === true;
    $("leave-appeal").checked = settings.leaveToAppeal === true;
  } else {
    $("lt-witness").value = settings.witnessSummons || 0;
    $("lt-service").value = settings.serviceAddress || 0;
    $("lt-review").checked = settings.review === true;
    $("lt-leave").checked = settings.leaveToAppeal === true;
  }
  syncChrome(settings);
  updateTribunalHint();
}

function syncChrome(settings) {
  var modes = document.querySelectorAll(".tribunal-mode");
  for (var i = 0; i < modes.length; i++) {
    var id = modes[i].getAttribute("data-tribunal");
    modes[i].setAttribute("aria-pressed", id === settings.tribunal ? "true" : "false");
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
    badAmount: t.warnBadAmount,
    overLimit: t.warnOverLimit,
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
  if (result.overLimit) {
    blocks.push(fill(t.formulaOver, { claim: formatMoney(result.claimAmount, 2) }));
    if (result.abandonExcess) {
      blocks.push(fill(t.formulaAbandon, { fee: formatMoney(result.abandonExcess.filingFee, 0) }));
    }
  } else if (result.ok) {
    blocks.push(
      fill(result.tribunal === "lt" ? t.formulaLt : t.formulaSct, {
        claim: formatMoney(result.claimAmount, 2),
        band: bandLabel(result.tribunal, result.filing.id, t),
        fee: formatMoney(result.filingFee, 0),
      })
    );
  }
  result.lines.forEach(function (line) {
    if (line.id === "filing") return;
    blocks.push(
      fill(t.formulaAddon, {
        label: lineLabel(line, result.tribunal, t),
        fee: formatMoney(line.fee, 0),
        qty: String(line.qty),
        total: formatMoney(line.total, 0),
      })
    );
  });
  if (result.ok && result.total != null) {
    blocks.push(
      fill(t.formulaTotal, {
        filing: formatMoney(result.filingFee, 0),
        addons: formatMoney(result.addonsTotal, 0),
        total: formatMoney(result.total, 0),
      })
    );
  } else if (!result.ok && result.addonsTotal > 0) {
    blocks.push(fill(t.formulaAddonsOnly, { total: formatMoney(result.total, 0) }));
  }
  return blocks.join("\n\n");
}

function resultText() {
  var t = pack();
  var result = compute(state.settings);
  var lines = [t.pageTitle, ""];
  lines.push((result.tribunal === "lt" ? t.tribunalLt : t.tribunalSct) + ": " + (result.claimAmount != null ? formatMoney(result.claimAmount, 2) : "—"));
  if (result.ok) {
    lines.push(t.kpiBand + ": " + bandLabel(result.tribunal, result.filing.id, t));
    lines.push(t.kpiFiling + ": " + formatMoney(result.filingFee, 0));
  }
  result.lines.forEach(function (line) {
    if (line.id === "filing") return;
    lines.push(lineLabel(line, result.tribunal, t) + ": " + formatMoney(line.total, 0));
  });
  if (result.total != null) lines.push(t.kpiTotal + ": " + formatMoney(result.total, 0));
  if (result.overLimit) lines.push(t.warnOverLimit);
  lines.push("");
  lines.push(t.disclaimer);
  return lines.join("\n");
}

function render() {
  var t = pack();
  var result = compute(state.settings);
  syncChrome(state.settings);
  updateTribunalHint();

  if (result.overLimit) {
    $("hero-label").textContent = t.heroCannot;
    $("hero-amount").textContent = result.total != null ? formatMoney(result.total, 0) : "—";
  } else if (!result.ok) {
    $("hero-label").textContent = t.heroNeedAmount;
    $("hero-amount").textContent = "—";
  } else {
    $("hero-label").textContent = t.heroTotal;
    $("hero-amount").textContent = formatMoney(result.total, 0);
  }

  var sub = [result.tribunal === "lt" ? t.tribunalLt : t.tribunalSct];
  if (result.ok) sub.push(bandLabel(result.tribunal, result.filing.id, t));
  if (result.claimAmount != null && Number.isFinite(result.claimAmount)) {
    sub.unshift(formatMoney(result.claimAmount, 2));
  }
  $("hero-sub").textContent = sub.join(" · ");

  var cards = [];
  if (result.ok) {
    cards.push(kpiCard(t.kpiBand, bandLabel(result.tribunal, result.filing.id, t)));
    cards.push(kpiCard(t.kpiFiling, formatMoney(result.filingFee, 0)));
  }
  if (result.addonsTotal > 0) cards.push(kpiCard(t.kpiAddons, formatMoney(result.addonsTotal, 0)));
  if (result.total != null) cards.push(kpiCard(t.kpiTotal, formatMoney(result.total, 0)));
  $("kpis").innerHTML = cards.join("");

  var rows = [];
  rows.push(rowHtml(t.rowTribunal, result.tribunal === "lt" ? t.tribunalLt : t.tribunalSct));
  if (result.claimAmount != null && Number.isFinite(result.claimAmount)) {
    rows.push(rowHtml(t.rowClaim, formatMoney(result.claimAmount, 2)));
  }
  if (result.ok) {
    rows.push(rowHtml(t.rowBand, bandLabel(result.tribunal, result.filing.id, t)));
  }
  result.lines.forEach(function (line) {
    var label = lineLabel(line, result.tribunal, t);
    var value = formatMoney(line.total, 0);
    if (line.qty > 1) value = formatMoney(line.fee, 0) + " " + fill(t.qtyEach, { n: line.qty }) + " = " + value;
    rows.push(rowHtml(label, value, line.id === "filing"));
  });
  if (result.addonsTotal > 0) rows.push(rowHtml(t.rowAddons, formatMoney(result.addonsTotal, 0)));
  if (result.total != null) rows.push(rowHtml(t.rowTotal, formatMoney(result.total, 0), true));
  $("breakdown").innerHTML = rows.length ? "<tbody>" + rows.join("") + "</tbody>" : "";

  $("formula").textContent = formulaText(result);
  $("abandon-note").textContent = result.overLimit ? t.abandonNote : "";
  warnHtml(result);
}

function syncFromForm() {
  var tribunal = state.settings.tribunal;
  state.settings = readForm();
  state.settings.tribunal = tribunal;
  saveDraft();
  render();
}

function init() {
  state.lang = readLang();
  var draft = loadDraft();
  if (draft) {
    if (draft.tribunal !== "lt") draft.tribunal = "sct";
    draft.setAside = draft.setAside === true;
    draft.review = draft.review === true;
    draft.leaveToAppeal = draft.leaveToAppeal === true;
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

  var modes = document.querySelectorAll(".tribunal-mode");
  for (var i = 0; i < modes.length; i++) {
    modes[i].addEventListener("click", function () {
      state.settings.tribunal = this.getAttribute("data-tribunal") === "lt" ? "lt" : "sct";
      writeForm(state.settings);
      saveDraft();
      render();
    });
  }

  $("demo-3k-btn").addEventListener("click", function () {
    state.settings = demo3k();
    writeForm(state.settings);
    saveDraft();
    render();
  });
  $("demo-60k-btn").addEventListener("click", function () {
    state.settings = demo60k();
    writeForm(state.settings);
    saveDraft();
    render();
  });
  $("demo-witness-btn").addEventListener("click", function () {
    state.settings = demoWitness();
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
        }
      );
    } else {
      $("copy-status").textContent = pack().copyFail;
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
