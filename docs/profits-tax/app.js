import {
  compute,
  demoOverCap,
  demoSmeCorp,
  demoStandard,
  emptySettings,
  formatMoney,
  formatPct,
  ratesFor,
} from "./profits.js";

const STORAGE_KEY = "hk-profits-tax:v1";
const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "利得稅兩級制估算",
    docTitle: "利得稅估算｜兩級制法團獨資 香港 · Profits tax",
    lede: "按稅務局兩級制利得稅率，估算法團或獨資／合夥本期應繳稅、一次性寬減、翌年暫繳稅與兩期繳款。首$200萬法團8.25%、非法團7.5%。不用註冊，不會上傳。",
    notice: "只供估算，並非稅務局官方工具或評稅單；實際以稅務條例、利得稅報稅表及評稅通知為準。應評稅利潤不是會計溢利。有關連實體同一年度只可一間選用兩級制。",
    explainTitle: "為甚麼需要這個工具",
    explainBody: "稅務局有薪俸稅／個人入息課稅計算機，利得稅本身只有稅率表、兩級制FAQ和IR957計算表PDF，沒有「這個課稅年度要繳多少」的互動工具。本頁做法團／非法團、兩級制或標準稅率、結轉虧損、2025/26一次性寬減（上限$3,000）與暫繳稅緩繳90%門檻一次計出。",
    tableWho: "業務",
    tableLow: "首 $2,000,000",
    tableHigh: "其餘",
    tableCorp: "法團",
    tableUnc: "非法團（獨資／合夥）",
    demoBtn: "中小企法團",
    demoOverBtn: "超過200萬",
    demoStdBtn: "標準稅率",
    clearData: "清除資料 Clear data",
    formTitle: "本期應評稅利潤",
    yearLegend: "課稅年度",
    yearLabel: "課稅年度（4月1日至翌年3月31日）",
    yearHint: "2025/26最後評稅可獲100%寬減、上限$3,000（2026年5月22日刊憲）。寬減不適用於暫繳稅。2026/27尚未公布寬減。",
    entityLegend: "業務類別",
    entityCorp: "法團",
    entityUnc: "非法團（獨資／合夥）",
    twoTierLegend: "兩級制",
    twoTier: "本業務選用兩級制（無有關連實體，或本業務是被提名的那一間）",
    twoTierHint: "同一組有關連實體每年只有一間可選兩級制。未選用的實體全部利潤按16.5%或15%。一人開多盤獨資，亦只可一盤用兩級制。",
    profitsLegend: "金額（港元）",
    profits: "應評稅利潤（已調整）",
    profitsHint: "填報稅用的應評稅利潤，不是損益表溢利。資本開支、折舊免稅額、非源自香港利潤等須先按稅務條例調整。",
    loss: "結轉虧損（可0）",
    lossHint: "上年度結轉、用以抵銷本期利潤的虧損。抵銷後餘額可再結轉。",
    expected: "估計下年度應評稅利潤（可0）",
    expectedHint: "填0則不判斷緩繳。若少於本期應評稅利潤（抵銷虧損後）的90%，會提示或可申請緩繳暫繳稅（IR1121，須附不少於8個月的已簽署帳目草稿）。",
    draftStatus: "設定會自動保存在此瀏覽器（可選）。",
    heroTotal: "本年利得稅（寬減後）",
    heroFrom: "{entity}　應評稅利潤 {profits}　{year}",
    entityLabelCorp: "法團",
    entityLabelUnc: "非法團",
    kpiBefore: "寬減前利得稅",
    kpiReduction: "一次性寬減",
    kpiProvisional: "翌年暫繳稅",
    kpiTotal: "評稅單合計",
    kpiFirst: "第一期（約）",
    kpiSecond: "第二期（約）",
    kpiSaving: "兩級制較標準稅率少",
    kpiHoldover: "緩繳門檻（90%）",
    rowProfits: "應評稅利潤",
    rowLoss: "減：結轉虧損",
    rowNet: "本期淨應評稅利潤",
    rowBand1: "首 $2,000,000（較低稅率）",
    rowBand2: "其餘（標準稅率）",
    rowTax: "利得稅（寬減前）",
    rowReduction: "一次性寬減",
    rowFinal: "本年應繳（寬減後）",
    rowProvisional: "翌年暫繳稅（無寬減）",
    rowFirst: "第一期（本年稅 + 暫繳×75%）",
    rowSecond: "第二期（暫繳×25%）",
    rowTotal: "評稅單合計",
    formulaTitle: "計算步驟",
    formulaNet: "淨應評稅利潤 = max(應評稅利潤 − 結轉虧損, 0)\n                = max({profits} − {loss}, 0)\n                = {net}",
    formulaTwoTier: "兩級制：首 {threshold} × {low} ＋ 其餘 × {high}",
    formulaBand: "第一級 = {band1} × {low} = {band1tax}\n第二級 = {band2} × {high} = {band2tax}\n利得稅 = {tax}",
    formulaStandard: "標準稅率（未選兩級制）：{net} × {high} = {tax}",
    formulaReduction: "一次性寬減 = min(利得稅, {cap})\n           = {reduction}\n本年應繳 = {tax} − {reduction} = {final}",
    formulaNoReduction: "此課稅年度沒有公布利得稅寬減。本年應繳 = {tax}",
    formulaProv: "翌年暫繳稅按本期淨利潤、同一稅率估算，不扣寬減 = {provisional}\n第一期 ≈ 本年應繳 + 暫繳 × 75% = {first}\n第二期 ≈ 暫繳 × 25% = {second}",
    formulaSaving: "若全部按標準稅率：{standard}\n兩級制少付：{saving}",
    warnNoProfits: "請輸入應評稅利潤（可為 0）。",
    warnNegProfits: "應評稅利潤不能是負數。虧損請填在結轉虧損。",
    warnNegLoss: "結轉虧損不能是負數。",
    warnNegExpected: "估計下年度利潤不能是負數。",
    warnZeroProfits: "本期應評稅利潤是 0：本年稅與按此估算的暫繳稅都是 $0。稅務局仍可能按上年度數字徵暫繳稅。",
    warnLossUsed: "已用結轉虧損抵銷本期利潤。",
    warnLossCarry: "虧損多於本期利潤，餘額可結轉下年。",
    warnStandardRate: "未選兩級制：全部淨利潤按法團16.5%或非法團15%。",
    warnTwoTierNote: "兩級制只適用於被提名（或沒有有關連實體）的一間業務。報稅表須作出聲明。",
    warnReductionFinalOnly: "一次性寬減只適用於最後評稅，不適用於暫繳稅。已繳暫繳稅會先抵本年稅，再抵下年暫繳稅。",
    warnNoReduction2027: "2026/27課稅年度尚未公布利得稅寬減。本頁當寬減為 $0。",
    warnNotPa: "獨資／合夥或可選擇個人入息課稅，稅款可能不同。本頁不估算個人入息課稅。",
    warnNotAccounting: "應評稅利潤須按稅務條例由會計溢利調整，本頁不當折舊、資本項目或來源地。",
    warnHoldover: "估計下年度利潤低於本期淨利潤的90%，或可申請緩繳暫繳稅（IR1121；須附不少於8個月已簽署帳目草稿，限期以官方為準）。",
    faqTitle: "常見問題",
    faq1q: "香港利得稅兩級制怎樣計？",
    faq1a: "2018/19起，法團首$2,000,000應評稅利潤按8.25%，其餘按16.5%；獨資或合夥首$2,000,000按7.5%，其餘按15%。同一組有關連實體每年只有一間可選用兩級制，其餘全部按標準稅率。",
    faq2q: "2025/26有沒有利得稅寬減？",
    faq2a: "有。2026-27年度財政預算案一次性寬減2025/26課稅年度100%利得稅，每宗個案上限$3,000，已於2026年5月22日刊憲。寬減只適用於最後評稅，不適用於暫繳稅。2024/25上限是$1,500。2026/27尚未公布寬減。",
    faq3q: "有關連實體怎樣選兩級制？",
    faq3a: "控制或同受控制（一般指超過50%股本、表決權或利潤分配），以及同一人開的多盤獨資，都算有關連。被提名的實體在報稅表聲明本年度按兩級制課稅、且沒有其他有關連實體作出同樣選擇。一經選擇，該年度不能撤回。",
    faq4q: "暫繳稅和緩繳怎樣計？",
    faq4a: "稅務局通常按本期利潤估算下年度暫繳稅，並連同本年稅一張評稅單徵收。第一期常見是本年稅加暫繳稅75%，第二期是暫繳稅25%，到期日以通知為準。若估計下年度應評稅利潤少於上年度（或用作暫繳的估計）的90%，可在限期前用IR1121申請緩繳，並須附不少於8個月的已簽署帳目草稿。",
    faq5q: "這是不是稅務局官方計算機？",
    faq5a: "不是。官方稅款計算機只做法團以外的薪俸稅和個人入息課稅。利得稅官方是稅率表、兩級制FAQ和IR957 PDF。本頁只按公布稅率估算，不能代替報稅表或評稅通知。亦不涵蓋保險、船舶、財資中心等特惠稅率。",
    faq6q: "資料會上傳嗎？",
    faq6a: "不會。金額只在瀏覽器內計算，草稿可寫入本機 localStorage。沒有帳戶、沒有伺服器存檔。",
    sourcesTitle: "資料來源 / Sources",
    srcRates: "GovHK — 利得稅稅率（兩級制及寬減上限）：",
    srcIrd: "稅務局 — 利得稅（稅率、虧損結轉、暫繳稅）：",
    srcFaq: "稅務局 — 兩級制利得稅率 FAQ（有關連實體、提名）：",
    srcBudget: "稅務局 — 2026-27年度財政預算案稅務措施（2025/26寬減$3,000）：",
    srcHold: "GovHK — 緩繳暫繳利得稅（90%門檻、IR1121）：",
    srcCalc: "GovHK — 薪俸稅／個人入息課稅計算機（不是利得稅）：",
    srcAsOf: "以上稅率與寬減於2026年10月16日核對上述官方頁（法團8.25%/16.5%，非法團7.5%/15%；2025/26寬減上限$3,000）。其後憲報或稅務局修訂，以官方為準。",
    privacyTitle: "私隱",
    privacyBody: "利潤與稅款數字只留在這個瀏覽器（localStorage，可選）。本頁不上傳、不設帳號、不設後端。",
    disclaimer: "只供估算，並非稅務局評稅或法律、稅務意見。 / Estimate only; not an IRD assessment, and not legal or tax advice.",
  },
  en: {
    pageTitle: "Profits tax two-tier estimator",
    docTitle: "HK profits tax estimator | two-tier corporation / sole prop",
    lede: "Estimate this year’s profits tax from the IRD two-tier rates: corporation or unincorporated, the one-off reduction, next-year provisional tax and the two instalments. First HK$2 million at 8.25% (corp) or 7.5% (unincorporated). No sign-up, nothing uploaded.",
    notice: "Estimate only — not an IRD tool or demand note. The Inland Revenue Ordinance, the profits-tax return and the notice of assessment prevail. Assessable profits are not accounting profit. Only one connected entity may use two-tier rates in a year.",
    explainTitle: "Why this tool exists",
    explainBody: "IRD’s Tax Calculator covers salaries tax and Personal Assessment. For profits tax it publishes rate tables, a two-tier FAQ and the IR957 PDF — not an interactive “how much this year?” tool. This page does corporation vs unincorporated, two-tier or full rate, loss brought forward, the 2025/26 one-off reduction (cap HK$3,000) and the 90% provisional-tax holdover threshold.",
    tableWho: "Business",
    tableLow: "First HK$2,000,000",
    tableHigh: "Remainder",
    tableCorp: "Corporation",
    tableUnc: "Unincorporated (sole prop / partnership)",
    demoBtn: "SME corporation",
    demoOverBtn: "Over HK$2m",
    demoStdBtn: "Standard rate",
    clearData: "Clear data",
    formTitle: "Assessable profits this year",
    yearLegend: "Year of assessment",
    yearLabel: "Year of assessment (1 April to 31 March)",
    yearHint: "2025/26 final tax is reduced 100% up to HK$3,000 (gazetted 22 May 2026). The waiver does not apply to provisional tax. No 2026/27 waiver has been announced.",
    entityLegend: "Entity",
    entityCorp: "Corporation",
    entityUnc: "Unincorporated (sole prop / partnership)",
    twoTierLegend: "Two-tier rates",
    twoTier: "This business elects two-tier rates (no connected entity, or this is the nominated one)",
    twoTierHint: "Only one connected entity per group may elect two-tier each year. Others pay 16.5% or 15% on the whole profit. Multiple sole proprietorships owned by the same person also share one election.",
    profitsLegend: "Amounts (HKD)",
    profits: "Assessable profits (already adjusted)",
    profitsHint: "Use profits-tax assessable profits, not the profit in the accounts. Capital spend, depreciation allowances and offshore profits must be adjusted under the IRO first.",
    loss: "Loss brought forward (0 is fine)",
    lossHint: "Prior-year loss used to offset this year’s profits. Any unused balance can be carried forward again.",
    expected: "Estimated next-year assessable profits (0 is fine)",
    expectedHint: "Leave 0 to skip the holdover test. If this is under 90% of this year’s net assessable profits, the page flags a possible IR1121 holdover (signed draft accounts covering at least 8 months).",
    draftStatus: "Settings are saved in this browser (optional).",
    heroTotal: "Profits tax this year (after waiver)",
    heroFrom: "{entity} · assessable profits {profits} · {year}",
    entityLabelCorp: "Corporation",
    entityLabelUnc: "Unincorporated",
    kpiBefore: "Tax before waiver",
    kpiReduction: "One-off waiver",
    kpiProvisional: "Next-year provisional",
    kpiTotal: "Demand-note total",
    kpiFirst: "1st instalment (approx.)",
    kpiSecond: "2nd instalment (approx.)",
    kpiSaving: "Two-tier saving vs full rate",
    kpiHoldover: "Holdover threshold (90%)",
    rowProfits: "Assessable profits",
    rowLoss: "Less: loss brought forward",
    rowNet: "Net assessable profits",
    rowBand1: "First HK$2,000,000 (lower rate)",
    rowBand2: "Remainder (standard rate)",
    rowTax: "Profits tax (before waiver)",
    rowReduction: "One-off waiver",
    rowFinal: "Payable this year (after waiver)",
    rowProvisional: "Next-year provisional (no waiver)",
    rowFirst: "1st instalment (this year + 75% provisional)",
    rowSecond: "2nd instalment (25% provisional)",
    rowTotal: "Demand-note total",
    formulaTitle: "Steps",
    formulaNet: "Net assessable profits = max(assessable − loss brought forward, 0)\n                     = max({profits} − {loss}, 0)\n                     = {net}",
    formulaTwoTier: "Two-tier: first {threshold} × {low} + remainder × {high}",
    formulaBand: "Band 1 = {band1} × {low} = {band1tax}\nBand 2 = {band2} × {high} = {band2tax}\nTax = {tax}",
    formulaStandard: "Full rate (no two-tier election): {net} × {high} = {tax}",
    formulaReduction: "One-off waiver = min(tax, {cap})\n               = {reduction}\nPayable this year = {tax} − {reduction} = {final}",
    formulaNoReduction: "No profits-tax waiver has been announced for this year. Payable this year = {tax}",
    formulaProv: "Next-year provisional uses this year’s net profit and the same rates, with no waiver = {provisional}\n1st instalment ≈ payable this year + provisional × 75% = {first}\n2nd instalment ≈ provisional × 25% = {second}",
    formulaSaving: "If the whole profit were taxed at the standard rate: {standard}\nTwo-tier saving: {saving}",
    warnNoProfits: "Enter assessable profits (0 is allowed).",
    warnNegProfits: "Assessable profits cannot be negative. Put a loss in loss brought forward.",
    warnNegLoss: "Loss brought forward cannot be negative.",
    warnNegExpected: "Estimated next-year profits cannot be negative.",
    warnZeroProfits: "Assessable profits are 0: this year’s tax and the provisional estimate from this year are $0. IRD may still raise provisional tax from last year’s figures.",
    warnLossUsed: "A brought-forward loss has been set off against this year’s profits.",
    warnLossCarry: "The loss exceeds this year’s profits; the balance can be carried forward.",
    warnStandardRate: "Two-tier is off: the whole net profit is taxed at 16.5% (corporation) or 15% (unincorporated).",
    warnTwoTierNote: "Two-tier rates apply only to the nominated business (or one with no connected entity). The return must include the declaration.",
    warnReductionFinalOnly: "The one-off waiver applies to the final assessment only, not to provisional tax. Provisional tax already paid is set off against this year’s tax, then next year’s provisional.",
    warnNoReduction2027: "No profits-tax waiver has been announced for 2026/27. This page treats the waiver as $0.",
    warnNotPa: "A sole proprietor or partner may elect Personal Assessment, which can produce a different bill. This page does not estimate Personal Assessment.",
    warnNotAccounting: "Assessable profits must be adjusted from accounting profit under the IRO. This page does not compute depreciation, capital items or source.",
    warnHoldover: "Estimated next-year profits are under 90% of this year’s net profits — you may apply to hold over provisional tax (IR1121; signed draft accounts covering at least 8 months; official deadlines prevail).",
    faqTitle: "FAQ",
    faq1q: "How do Hong Kong two-tier profits tax rates work?",
    faq1a: "From 2018/19, a corporation pays 8.25% on the first HK$2,000,000 of assessable profits and 16.5% on the rest; a sole proprietorship or partnership pays 7.5% then 15%. Only one connected entity in a group may elect two-tier each year; the others pay the full rate on the whole profit.",
    faq2q: "Is there a profits-tax waiver for 2025/26?",
    faq2a: "Yes. The 2026-27 Budget waives 100% of 2025/26 profits tax, capped at HK$3,000 per case (gazetted 22 May 2026). It applies to the final assessment only, not provisional tax. The 2024/25 cap was HK$1,500. No 2026/27 waiver has been announced.",
    faq3q: "How do connected entities elect two-tier rates?",
    faq3a: "Control, common control (generally more than 50% of capital, votes or profit share), and multiple sole proprietorships of the same person all count as connected. The nominated entity declares on its return that it is chargeable at two-tier rates and that no other connected entity so elects. The election cannot be withdrawn for that year.",
    faq4q: "How are provisional tax and holdover calculated?",
    faq4a: "IRD usually estimates next year’s provisional tax from this year’s profits and issues it with this year’s tax on one demand note. The first instalment is commonly this year’s tax plus 75% of provisional; the second is 25% of provisional — due dates follow the notice. If estimated next-year assessable profits are under 90% of last year’s (or of the estimated sum used), you may apply on IR1121 within the time limit, with signed draft accounts covering at least 8 months.",
    faq5q: "Is this an official IRD calculator?",
    faq5a: "No. The official Tax Calculator is for salaries tax and Personal Assessment. For profits tax, IRD publishes rate tables, a two-tier FAQ and the IR957 PDF. This page only estimates from published rates. It is not a return or a notice of assessment, and it does not cover concessionary rates for insurance, shipping, treasury centres and the like.",
    faq6q: "Is anything uploaded?",
    faq6a: "No. Amounts stay in this browser and may be written to localStorage. No account, no server copy.",
    sourcesTitle: "Sources",
    srcRates: "GovHK — profits tax rates (two-tier bands and waiver ceilings):",
    srcIrd: "IRD — profits tax (rates, loss carry-forward, provisional tax):",
    srcFaq: "IRD — two-tiered profits tax rates FAQ (connected entities, nomination):",
    srcBudget: "IRD — 2026-27 Budget tax measures (2025/26 waiver HK$3,000):",
    srcHold: "GovHK — holding over provisional profits tax (90% test, IR1121):",
    srcCalc: "GovHK — salaries tax / Personal Assessment calculator (not profits tax):",
    srcAsOf: "Rates and waiver checked against those official pages on 16 October 2026 (corporations 8.25%/16.5%, unincorporated 7.5%/15%; 2025/26 waiver cap HK$3,000). Later gazette or IRD changes prevail.",
    privacyTitle: "Privacy",
    privacyBody: "Profit and tax figures stay in this browser (optional localStorage). Nothing is uploaded. There is no account and no backend.",
    disclaimer: "Estimate only; not an IRD assessment, and not legal or tax advice. / 只供估算，並非稅務局評稅。",
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
  return template.replace(/\{(\w+)\}/g, function (_, key) {
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
}

function readForm() {
  var next = Object.assign({}, state.settings);
  next.yearOfAssessment = $("year").value;
  next.assessableProfits = $("profits").value === "" ? "" : Number($("profits").value);
  next.lossBroughtForward = $("loss").value === "" ? 0 : Number($("loss").value);
  next.expectedNextProfits = $("expected").value === "" ? 0 : Number($("expected").value);
  next.twoTier = $("two-tier").checked;
  return next;
}

function writeForm(settings) {
  $("year").value = settings.yearOfAssessment;
  $("profits").value = settings.assessableProfits;
  $("loss").value = settings.lossBroughtForward || 0;
  $("expected").value = settings.expectedNextProfits || 0;
  $("two-tier").checked = settings.twoTier !== false;
  syncChrome(settings);
}

function syncChrome(settings) {
  var entities = document.querySelectorAll(".entity");
  for (var i = 0; i < entities.length; i++) {
    var ent = entities[i].getAttribute("data-entity");
    entities[i].setAttribute("aria-pressed", ent === settings.entity ? "true" : "false");
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
    noProfits: t.warnNoProfits,
    negProfits: t.warnNegProfits,
    negLoss: t.warnNegLoss,
    negExpected: t.warnNegExpected,
    zeroProfits: t.warnZeroProfits,
    lossUsed: t.warnLossUsed,
    lossCarry: t.warnLossCarry,
    standardRate: t.warnStandardRate,
    twoTierNote: t.warnTwoTierNote,
    reductionFinalOnly: t.warnReductionFinalOnly,
    noReduction2027: t.warnNoReduction2027,
    notPersonalAssessment: t.warnNotPa,
    notAccountingProfit: t.warnNotAccounting,
    holdoverLikely: t.warnHoldover,
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

function formulaText(result) {
  var t = pack();
  if (!result.ok) return "";
  var rates = ratesFor(result.entity);
  var vars = {
    profits: formatMoney(result.assessableProfits, 2),
    loss: formatMoney(result.lossBroughtForward, 2),
    net: formatMoney(result.netProfits, 2),
    threshold: formatMoney(2000000, 0),
    low: formatPct(rates.low),
    high: formatPct(rates.high),
    band1: formatMoney(result.band1, 2),
    band2: formatMoney(result.band2, 2),
    band1tax: formatMoney(result.band1 * rates.low, 2),
    band2tax: formatMoney(result.band2 * rates.high, 2),
    tax: formatMoney(result.taxBeforeReduction, 2),
    cap: formatMoney(result.reductionCap, 0),
    reduction: formatMoney(result.reduction, 2),
    final: formatMoney(result.finalTax, 2),
    provisional: formatMoney(result.provisionalTax, 2),
    first: formatMoney(result.firstInstalment, 2),
    second: formatMoney(result.secondInstalment, 2),
    standard: formatMoney(result.standardTax, 2),
    saving: formatMoney(result.twoTierSaving, 2),
  };
  var blocks = [fill(t.formulaNet, vars)];
  if (result.twoTier) {
    blocks.push(fill(t.formulaTwoTier, vars));
    blocks.push(fill(t.formulaBand, vars));
  } else {
    blocks.push(fill(t.formulaStandard, vars));
  }
  if (result.reductionCap > 0) blocks.push(fill(t.formulaReduction, vars));
  else blocks.push(fill(t.formulaNoReduction, vars));
  blocks.push(fill(t.formulaProv, vars));
  if (result.twoTier && result.twoTierSaving > 0) {
    blocks.push(fill(t.formulaSaving, vars));
  }
  return blocks.join("\n\n");
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

function render() {
  var t = pack();
  var result = compute(state.settings);
  syncChrome(state.settings);

  $("hero-label").textContent = t.heroTotal;
  $("hero-amount").textContent = result.ok ? formatMoney(result.finalTax, 2) : "—";
  var entityLabel = result.entity === "unincorporated" ? t.entityLabelUnc : t.entityLabelCorp;
  $("hero-sub").textContent = result.ok
    ? fill(t.heroFrom, {
        entity: entityLabel,
        profits: formatMoney(result.assessableProfits, 2),
        year: result.yearOfAssessment,
      })
    : "";

  var cards = [];
  cards.push(kpiCard(t.kpiBefore, result.ok ? formatMoney(result.taxBeforeReduction, 2) : "—"));
  if (result.ok && result.reductionCap > 0) {
    cards.push(kpiCard(t.kpiReduction, formatMoney(result.reduction, 2)));
  }
  cards.push(kpiCard(t.kpiProvisional, result.ok ? formatMoney(result.provisionalTax, 2) : "—"));
  cards.push(kpiCard(t.kpiTotal, result.ok ? formatMoney(result.totalPayable, 2) : "—"));
  cards.push(kpiCard(t.kpiFirst, result.ok ? formatMoney(result.firstInstalment, 2) : "—"));
  cards.push(kpiCard(t.kpiSecond, result.ok ? formatMoney(result.secondInstalment, 2) : "—"));
  if (result.ok && result.twoTier && result.twoTierSaving > 0) {
    cards.push(kpiCard(t.kpiSaving, formatMoney(result.twoTierSaving, 2)));
  }
  if (result.ok && result.expectedNextProfits > 0) {
    cards.push(kpiCard(t.kpiHoldover, formatMoney(result.holdoverThreshold, 2)));
  }
  $("kpis").innerHTML = cards.join("");

  var rows = [];
  if (result.ok) {
    rows.push(rowHtml(t.rowProfits, formatMoney(result.assessableProfits, 2)));
    if (result.lossBroughtForward > 0) {
      rows.push(rowHtml(t.rowLoss, formatMoney(result.lossBroughtForward, 2)));
    }
    rows.push(rowHtml(t.rowNet, formatMoney(result.netProfits, 2)));
    if (result.twoTier) {
      rows.push(
        rowHtml(
          t.rowBand1 + " " + formatPct(result.lowRate),
          formatMoney(result.band1, 2)
        )
      );
      if (result.band2 > 0) {
        rows.push(
          rowHtml(
            t.rowBand2 + " " + formatPct(result.highRate),
            formatMoney(result.band2, 2)
          )
        );
      }
    }
    rows.push(rowHtml(t.rowTax, formatMoney(result.taxBeforeReduction, 2)));
    if (result.reductionCap > 0) {
      rows.push(rowHtml(t.rowReduction, formatMoney(result.reduction, 2)));
    }
    rows.push(rowHtml(t.rowFinal, formatMoney(result.finalTax, 2), true));
    rows.push(rowHtml(t.rowProvisional + " " + result.nextYear, formatMoney(result.provisionalTax, 2)));
    rows.push(rowHtml(t.rowFirst, formatMoney(result.firstInstalment, 2)));
    rows.push(rowHtml(t.rowSecond, formatMoney(result.secondInstalment, 2)));
    rows.push(rowHtml(t.rowTotal, formatMoney(result.totalPayable, 2), true));
  }
  $("breakdown").innerHTML = rows.length ? "<tbody>" + rows.join("") + "</tbody>" : "";

  $("formula").textContent = formulaText(result);
  warnHtml(result);
}

function syncFromForm() {
  var entity = state.settings.entity;
  state.settings = readForm();
  state.settings.entity = entity;
  saveDraft();
  render();
}

function setEntity(entity) {
  state.settings.entity = entity === "unincorporated" ? "unincorporated" : "corporation";
  writeForm(state.settings);
  saveDraft();
  render();
}

function init() {
  state.lang = readLang();
  var draft = loadDraft();
  if (draft) {
    if (draft.entity !== "unincorporated") draft.entity = "corporation";
    if (
      draft.yearOfAssessment !== "2024/25" &&
      draft.yearOfAssessment !== "2026/27"
    ) {
      draft.yearOfAssessment = "2025/26";
    }
    draft.twoTier = draft.twoTier !== false;
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

  $("tax-form").addEventListener("input", syncFromForm);
  $("tax-form").addEventListener("change", syncFromForm);

  var entities = document.querySelectorAll(".entity");
  for (var i = 0; i < entities.length; i++) {
    entities[i].addEventListener("click", function () {
      setEntity(this.getAttribute("data-entity"));
    });
  }

  $("demo-btn").addEventListener("click", function () {
    state.settings = demoSmeCorp();
    writeForm(state.settings);
    saveDraft();
    render();
  });
  $("demo-over-btn").addEventListener("click", function () {
    state.settings = demoOverCap();
    writeForm(state.settings);
    saveDraft();
    render();
  });
  $("demo-std-btn").addEventListener("click", function () {
    state.settings = demoStandard();
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
