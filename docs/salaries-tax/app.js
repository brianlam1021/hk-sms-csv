import {
  AS_OF,
  STANDARD_HIGH,
  STANDARD_LOW,
  STANDARD_TIER,
  compute,
  demoIrdGuide,
  demoMarriedChild,
  demoStandardRate,
  emptySettings,
  formatMoney,
  formatPct,
} from "./salaries.js";

const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "薪俸稅估算",
    docTitle: "薪俸稅估算｜累進稅率標準稅率 香港 · Salaries tax",
    lede: "按稅務局累進稅率與兩級制標準稅率（取較低者），估算應課稅入息實額、基本／已婚／子女／供養父母免稅額、強積金扣除與應繳薪俸稅。不用註冊，不會上傳，不把入息寫入本機儲存。",
    notice: "只供估算，並非稅務局官方工具、報稅表或評稅單，亦不是稅務意見。實際以稅務條例、個別人士報稅表及評稅通知為準。本頁不做夫婦合併評稅或個人入息課稅。",
    explainTitle: "為甚麼需要這個工具",
    explainBody: "稅務局有官方薪俸稅計算機，但要把入息填進 GovHK。本頁把累進稅與兩級制標準稅率一次對照、免稅額與強積金扣除即時計出，數字只留在這個瀏覽器。2025/26一次性寬減上限$3,000。",
    tableBand: "應課稅入息實額",
    tableRate: "累進稅率",
    tableB1: "首 $50,000",
    tableB2: "其次 $50,000",
    tableB3: "其次 $50,000",
    tableB4: "其次 $50,000",
    tableB5: "其餘",
    tableStdHint: "兩級制標準稅率（2024/25起）：入息淨額首 $5,000,000 按 15%，其餘按 16%。應繳稅取累進稅與標準稅率的較低者。",
    demoBtn: "稅務局例子",
    demoMarriedBtn: "已婚一子",
    demoStdBtn: "標準稅率",
    clearData: "清除資料 Clear data",
    formTitle: "入息、扣除與免稅額",
    yearLegend: "課稅年度",
    yearLabel: "課稅年度（4月1日至翌年3月31日）",
    yearHint: "預設 2025/26（已刊憲一次性寬減上限$3,000）。2026/27免稅額已提高，尚未公布寬減。累進稅率各年相同。",
    incomeLegend: "應評稅入息（港元）",
    monthly: "每月薪金（可選）",
    monthlyHint: "填此欄會把年薪設為月薪 × 12。花紅、佣金請加進年薪。",
    income: "全年應評稅入息",
    incomeHint: "薪金、工資、花紅、假期薪酬等。不是實收（未扣強積金前）。",
    mpf: "強制性強積金供款（僱員）",
    mpfHint: "可扣稅強制性供款每年上限 $18,000。超過部分本頁會封頂。可扣稅自願性供款／年金另有上限，本頁不估算。",
    allowLegend: "免稅額（可選）",
    married: "申請已婚人士免稅額（取代基本免稅額）",
    marriedHint: "配偶須符合稅務條例條件。已婚人士免稅額與基本免稅額不可同時申請。",
    children: "子女人數（1至9名）",
    childrenHint: "每名 2025/26 為 $130,000；2026/27 為 $140,000。出生年度額外免稅額本頁不計。",
    parents60: "供養父母／祖父母（60歲或以上，非全年同住）",
    parents60Live: "供養父母／祖父母（60歲或以上，全年同住）",
    parents60Hint: "全年同住另加額外免稅額（2025/26 各 $50,000，合計 $100,000）。須符合在港通常居住及供養條件。",
    parents55: "供養父母／祖父母（55至59歲，非全年同住）",
    parents55Live: "供養父母／祖父母（55至59歲，全年同住）",
    parents55Hint: "55至59歲免稅額為60歲或以上的一半。全年同住另加額外免稅額。",
    printBtn: "列印／另存 PDF",
    copyBtn: "複製文字",
    copied: "已複製。",
    copyFail: "無法複製，請人手選取。",
    draftStatus: "入息與免稅額不會寫入本機儲存；關閉分頁即消失。只保存語言偏好。",
    heroTotal: "本年應繳薪俸稅（寬減後）",
    heroFrom: "{status}　入息 {income}　{year}",
    statusSingle: "單身（基本免稅額）",
    statusMarried: "已婚人士免稅額",
    kpiNci: "應課稅入息實額",
    kpiProg: "累進稅率稅款",
    kpiStd: "標準稅率稅款",
    kpiChosen: "取較低者",
    kpiReduction: "一次性寬減",
    kpiNet: "入息淨額",
    kpiAllow: "免稅額合計",
    billTitle: "薪俸稅估算",
    billSub: "按稅務局／GovHK 稅率 · 截至 " + AS_OF + " 核對",
    colItem: "項目",
    colAmt: "金額",
    lineYear: "課稅年度",
    lineIncome: "應評稅入息",
    lineMpf: "減：強制性強積金（已封頂）",
    lineNet: "入息淨額（標準稅率基數）",
    linePersonal: "減：基本／已婚人士免稅額",
    lineChild: "減：子女免稅額",
    lineParent: "減：供養父母／祖父母免稅額",
    lineNci: "應課稅入息實額",
    lineProg: "累進稅率稅款",
    lineStd: "兩級制標準稅率稅款",
    lineChosen: "應繳稅（取較低者）",
    lineReduction: "一次性寬減",
    lineFinal: "本年應繳（寬減後）",
    lineBasisProg: "採用累進稅率（低於標準稅率）",
    lineBasisStd: "採用標準稅率（低於累進稅率）",
    empty: "請輸入全年應評稅入息。",
    notIrd: "不是稅務局評稅、報稅表或繳款通知。",
    formulaTitle: "計算步驟",
    formulaNet: "入息淨額 = max(應評稅入息 − 強積金扣除, 0)\n        = max({income} − {mpf}, 0)\n        = {net}",
    formulaAllow: "免稅額 = {personalLabel} {personal}{childPart}{parentPart}\n     = {allow}",
    formulaChild: " ＋ 子女 {child}",
    formulaParent: " ＋ 供養父母 {parent}",
    formulaNci: "應課稅入息實額 = max(入息淨額 − 免稅額, 0)\n              = max({net} − {allow}, 0)\n              = {nci}",
    formulaProg: "累進稅率：{bands}\n累進稅 = {prog}",
    formulaStd: "標準稅率：首 {tier} × {low} ＋ 其餘 × {high}\n        = {stdBand1} × {low} ＋ {stdBand2} × {high}\n        = {std}",
    formulaPick: "應繳稅取較低者 = min({prog}, {std}) = {chosen}（{basis}）",
    formulaReduction: "一次性寬減 = min(應繳稅, {cap}) = {reduction}\n本年應繳 = {chosen} − {reduction} = {final}",
    formulaNoReduction: "此課稅年度沒有公布薪俸稅寬減。本年應繳 = {chosen}",
    basisProg: "累進稅率",
    basisStd: "標準稅率",
    personalBasic: "基本免稅額",
    personalMarried: "已婚人士免稅額",
    warnNoIncome: "請輸入全年應評稅入息（可為 0）。",
    warnNegIncome: "應評稅入息不能是負數。",
    warnNegMpf: "強積金供款不能是負數。",
    warnMpfCapped: "強制性強積金扣除已按每年上限 $18,000 封頂。",
    warnChildrenCapped: "子女免稅額最多計至第 9 名。",
    warnParentsCapped: "供養父母人數已按上限計算。",
    warnZeroIncome: "應評稅入息是 0：本年薪俸稅是 $0。",
    warnCovered: "免稅額已覆蓋入息淨額，應課稅入息實額是 $0。",
    warnMarried: "已婚人士免稅額已取代基本免稅額，兩者不會相加。",
    warnUsedStd: "標準稅率低於累進稅率，本頁按標準稅率計應繳稅。",
    warnUsedProg: "累進稅率低於標準稅率，本頁按累進稅率計應繳稅。",
    warnReductionFinalOnly: "一次性寬減只適用於最後評稅。本頁不當暫繳稅。",
    warnNoReduction2027: "2026/27課稅年度尚未公布薪俸稅寬減。本頁當寬減為 $0。",
    warnNotJoint: "本頁按個別評稅估算。夫婦合併評稅稅款可能不同。",
    warnNotPa: "本頁不估算個人入息課稅。有租金、按揭利息或其他入息時，官方計算機可能更低。",
    warnOtherDed: "本頁只扣強制性強積金。慈善捐款、居所貸款利息、進修費用等請自行從入息扣減後再填，或用官方計算機。",
    warnNotReturn: "這不是報稅表或評稅通知，亦不是稅務意見。",
    faqTitle: "常見問題",
    faq1q: "香港薪俸稅怎樣計？",
    faq1a: "應評稅入息減扣除（例如強制性強積金，每年上限$18,000）得出入息淨額，再減免稅額得出應課稅入息實額。應繳稅是累進稅率課稅與兩級制標準稅率（入息淨額首$500萬15%、其餘16%）兩者的較低者，再減一次性寬減（如有）。",
    faq2q: "2025/26有沒有薪俸稅寬減？",
    faq2a: "有。2026-27年度財政預算案一次性寬減2025/26課稅年度100%薪俸稅，每宗個案上限$3,000。寬減只適用於最後評稅。2024/25上限是$1,500。2026/27尚未公布寬減。",
    faq3q: "已婚人士免稅額會否與基本免稅額一併扣？",
    faq3a: "不會。已婚人士免稅額取代基本免稅額，不是兩者相加。子女免稅額及供養父母／祖父母免稅額可另外申請。全年與你同住而無付足費用的父母，可另獲額外供養父母免稅額。",
    faq4q: "這是不是稅務局官方計算機或報稅表？",
    faq4a: "不是。稅務局有官方薪俸稅／個人入息課稅計算機。本頁只按已公布稅率與免稅額在瀏覽器內估算，不會把入息送出，也不能代替報稅表或評稅通知。亦不做夫婦合併評稅、單親免稅額、居所貸款利息或其他扣除。",
    faq5q: "資料會上傳或儲存嗎？",
    faq5a: "不會。金額只在瀏覽器內計算，不會上傳，也不把入息寫入 localStorage。沒有帳戶、沒有伺服器存檔。關閉分頁後數字即消失。語言偏好可寫入本機鍵 hk-sms-csv-lang。",
    sourcesTitle: "資料來源 / Sources",
    srcRates: "GovHK — 薪俸稅及個人入息課稅稅率（累進稅率、兩級制標準稅率、寬減）：",
    srcAllow: "GovHK — 免稅額金額（基本、已婚、子女、供養父母）：",
    srcPam: "稅務局 — 薪俸稅／個人入息課稅免稅額、扣除及稅率表（PAM 61）：",
    srcBudget: "稅務局 — 2026-27年度財政預算案稅務措施 FAQ（2025/26寬減$3,000、2026/27免稅額）：",
    srcIrd: "稅務局 — 薪俸稅：",
    srcCalc: "GovHK／稅務局 — 官方薪俸稅／個人入息課稅計算機：",
    srcAsOf: "以上稅率、免稅額與寬減於2026年10月17日核對上述官方頁（累進2%/6%/10%/14%/17%；標準稅率首$500萬15%、其餘16%；強制性強積金扣除上限$18,000；2025/26寬減上限$3,000）。其後憲報或稅務局修訂，以官方為準。",
    privacyTitle: "私隱",
    privacyBody: "入息、強積金與免稅額只在這個瀏覽器內運算，不會上傳，也不寫入 localStorage。本頁不設帳號、不設後端。語言偏好可寫入本機鍵。列印或複製才會在你選擇的位置產生檔案。",
    disclaimer: "只供估算，並非稅務局評稅、報稅表或法律、稅務意見。 / Estimate only; not an IRD assessment or tax return, and not legal or tax advice.",
  },
  en: {
    pageTitle: "Salaries tax estimator",
    docTitle: "HK salaries tax estimator | progressive vs standard rate",
    lede: "Estimate salaries tax from IRD progressive rates versus two-tiered standard rates (whichever is lower), with basic / married / child / dependent-parent allowances and deductible MPF (capped). No sign-up, nothing uploaded, income is not saved.",
    notice: "Estimate only — not an IRD tool, tax return or demand note, and not tax advice. The Inland Revenue Ordinance, the individual return and the notice of assessment prevail. This page does not do joint assessment or Personal Assessment.",
    explainTitle: "Why this tool exists",
    explainBody: "IRD has an official salaries-tax calculator, but it means typing income into GovHK. This page compares progressive tax with two-tiered standard rates in the browser, with allowances and the MPF cap, and nothing is sent. 2025/26 one-off waiver cap HK$3,000.",
    tableBand: "Net chargeable income",
    tableRate: "Progressive rate",
    tableB1: "First HK$50,000",
    tableB2: "Next HK$50,000",
    tableB3: "Next HK$50,000",
    tableB4: "Next HK$50,000",
    tableB5: "Remainder",
    tableStdHint: "Two-tiered standard rates (from 2024/25): 15% on the first HK$5,000,000 of net income, 16% on the rest. You pay the lower of progressive tax and standard-rate tax.",
    demoBtn: "IRD example",
    demoMarriedBtn: "Married + 1 child",
    demoStdBtn: "Standard rate",
    clearData: "Clear data",
    formTitle: "Income, deduction and allowances",
    yearLegend: "Year of assessment",
    yearLabel: "Year of assessment (1 April to 31 March)",
    yearHint: "Default 2025/26 (gazetted 100% waiver, cap HK$3,000). 2026/27 allowances are higher; no waiver announced. Progressive bands are the same each year.",
    incomeLegend: "Assessable income (HKD)",
    monthly: "Monthly salary (optional)",
    monthlyHint: "Fills annual income as monthly × 12. Add bonus and commission into the annual figure.",
    income: "Annual assessable income",
    incomeHint: "Salary, wages, bonus, leave pay. Use pre-MPF income, not take-home.",
    mpf: "Mandatory MPF (employee)",
    mpfHint: "Deductible mandatory contributions are capped at HK$18,000 a year. Amounts above the cap are trimmed here. TVC / deferred annuity is a separate cap and is not modelled.",
    allowLegend: "Allowances (optional)",
    married: "Claim married person’s allowance (replaces basic allowance)",
    marriedHint: "Spouse must meet the IRO conditions. You cannot claim both married person’s and basic allowance.",
    children: "Number of children (1st to 9th)",
    childrenHint: "HK$130,000 each in 2025/26; HK$140,000 in 2026/27. Extra allowance in the year of birth is not modelled.",
    parents60: "Dependent parents / grandparents (aged 60+, not full-year resident)",
    parents60Live: "Dependent parents / grandparents (aged 60+, lived with you all year)",
    parents60Hint: "Living with you all year also attracts the additional allowance (HK$50,000 + HK$50,000 in 2025/26). Ordinary residence and maintenance conditions apply.",
    parents55: "Dependent parents / grandparents (aged 55–59, not full-year resident)",
    parents55Live: "Dependent parents / grandparents (aged 55–59, lived with you all year)",
    parents55Hint: "Aged 55–59 is half the aged-60 allowance. Living with you all year also attracts the additional allowance.",
    printBtn: "Print / save PDF",
    copyBtn: "Copy text",
    copied: "Copied.",
    copyFail: "Could not copy — select the summary yourself.",
    draftStatus: "Income and allowances are not written to this device. Closing the tab clears them. Only the language preference is saved.",
    heroTotal: "Salaries tax this year (after waiver)",
    heroFrom: "{status} · income {income} · {year}",
    statusSingle: "Single (basic allowance)",
    statusMarried: "Married person’s allowance",
    kpiNci: "Net chargeable income",
    kpiProg: "Tax at progressive rates",
    kpiStd: "Tax at standard rates",
    kpiChosen: "Lower of the two",
    kpiReduction: "One-off waiver",
    kpiNet: "Net income",
    kpiAllow: "Allowances",
    billTitle: "Salaries tax estimate",
    billSub: "IRD / GovHK rates · checked " + AS_OF,
    colItem: "Item",
    colAmt: "Amount",
    lineYear: "Year of assessment",
    lineIncome: "Assessable income",
    lineMpf: "Less: mandatory MPF (capped)",
    lineNet: "Net income (standard-rate base)",
    linePersonal: "Less: basic / married person’s allowance",
    lineChild: "Less: child allowance",
    lineParent: "Less: dependent parent / grandparent allowance",
    lineNci: "Net chargeable income",
    lineProg: "Tax at progressive rates",
    lineStd: "Tax at two-tiered standard rates",
    lineChosen: "Tax payable (lower amount)",
    lineReduction: "One-off waiver",
    lineFinal: "Payable this year (after waiver)",
    lineBasisProg: "Charged at progressive rates (lower than standard)",
    lineBasisStd: "Charged at standard rates (lower than progressive)",
    empty: "Enter annual assessable income.",
    notIrd: "Not an IRD assessment, tax return or demand note.",
    formulaTitle: "Steps",
    formulaNet: "Net income = max(assessable income − MPF deduction, 0)\n           = max({income} − {mpf}, 0)\n           = {net}",
    formulaAllow: "Allowances = {personalLabel} {personal}{childPart}{parentPart}\n           = {allow}",
    formulaChild: " + child {child}",
    formulaParent: " + dependent parent {parent}",
    formulaNci: "Net chargeable income = max(net income − allowances, 0)\n                       = max({net} − {allow}, 0)\n                       = {nci}",
    formulaProg: "Progressive: {bands}\nProgressive tax = {prog}",
    formulaStd: "Standard rates: first {tier} × {low} + remainder × {high}\n               = {stdBand1} × {low} + {stdBand2} × {high}\n               = {std}",
    formulaPick: "Charge the lower amount = min({prog}, {std}) = {chosen} ({basis})",
    formulaReduction: "One-off waiver = min(tax, {cap}) = {reduction}\nPayable this year = {chosen} − {reduction} = {final}",
    formulaNoReduction: "No salaries-tax waiver has been announced for this year. Payable this year = {chosen}",
    basisProg: "progressive",
    basisStd: "standard rate",
    personalBasic: "basic allowance",
    personalMarried: "married person’s allowance",
    warnNoIncome: "Enter annual assessable income (0 is allowed).",
    warnNegIncome: "Assessable income cannot be negative.",
    warnNegMpf: "MPF cannot be negative.",
    warnMpfCapped: "Mandatory MPF deduction is capped at HK$18,000 a year.",
    warnChildrenCapped: "Child allowance is counted for up to 9 children.",
    warnParentsCapped: "Dependent-parent counts have been capped.",
    warnZeroIncome: "Assessable income is 0: salaries tax this year is $0.",
    warnCovered: "Allowances cover net income, so net chargeable income is $0.",
    warnMarried: "Married person’s allowance has replaced basic allowance; they are not stacked.",
    warnUsedStd: "Standard-rate tax is lower than progressive tax, so this page charges the standard rate.",
    warnUsedProg: "Progressive tax is lower than standard-rate tax, so this page charges progressive rates.",
    warnReductionFinalOnly: "The one-off waiver applies to final tax only. This page does not estimate provisional tax.",
    warnNoReduction2027: "No salaries-tax waiver has been announced for 2026/27. This page treats the waiver as $0.",
    warnNotJoint: "This page estimates separate assessment. Joint assessment with a spouse can produce a different bill.",
    warnNotPa: "This page does not estimate Personal Assessment. With rent, mortgage interest or other income, the official calculator may be lower.",
    warnOtherDed: "Only mandatory MPF is deducted here. Charitable gifts, home-loan interest, self-education and similar should be taken off income first, or use the official calculator.",
    warnNotReturn: "This is not a tax return or a notice of assessment, and not tax advice.",
    faqTitle: "FAQ",
    faq1q: "How is Hong Kong salaries tax calculated?",
    faq1a: "Assessable income minus deductions (for example mandatory MPF, capped at HK$18,000 a year) is net income; minus allowances is net chargeable income. You pay the lower of tax at progressive rates on net chargeable income and tax at two-tiered standard rates on net income (15% on the first HK$5 million, 16% on the rest), then any one-off waiver.",
    faq2q: "Is there a salaries-tax waiver for 2025/26?",
    faq2a: "Yes. The 2026-27 Budget waives 100% of 2025/26 salaries tax, capped at HK$3,000 per case. It applies to final tax only. The 2024/25 cap was HK$1,500. No 2026/27 waiver has been announced.",
    faq3q: "Is married person’s allowance stacked on basic allowance?",
    faq3a: "No. Married person’s allowance replaces basic allowance. Child allowance and dependent parent / grandparent allowance can be claimed in addition. A parent who lived with you all year without paying full cost also attracts the additional dependent-parent allowance.",
    faq4q: "Is this an official IRD calculator or a tax return?",
    faq4a: "No. IRD has an official salaries tax / Personal Assessment calculator. This page only estimates from published rates and allowances in the browser. Nothing is sent. It is not a return or a notice of assessment, and it does not model joint assessment, single-parent allowance, home-loan interest or other deductions.",
    faq5q: "Is anything uploaded or stored?",
    faq5a: "No. Amounts stay in this browser. Income is not written to localStorage. No account, no server copy. Closing the tab clears the figures. The language preference may use the local key hk-sms-csv-lang.",
    sourcesTitle: "Sources",
    srcRates: "GovHK — salaries tax and Personal Assessment rates (progressive bands, two-tiered standard rates, waiver):",
    srcAllow: "GovHK — amount of allowance (basic, married, child, dependent parent):",
    srcPam: "IRD — salaries tax / Personal Assessment allowances, deductions and tax rate table (PAM 61):",
    srcBudget: "IRD — 2026-27 Budget tax measures FAQ (2025/26 waiver HK$3,000, 2026/27 allowances):",
    srcIrd: "IRD — salaries tax:",
    srcCalc: "GovHK / IRD — official salaries tax / Personal Assessment calculator:",
    srcAsOf: "Rates, allowances and waiver checked against those official pages on 17 October 2026 (progressive 2%/6%/10%/14%/17%; standard rates 15% on the first HK$5 million then 16%; mandatory MPF deduction cap HK$18,000; 2025/26 waiver cap HK$3,000). Later gazette or IRD changes prevail.",
    privacyTitle: "Privacy",
    privacyBody: "Income, MPF and allowances are computed in this browser only. Nothing is uploaded and they are not written to localStorage. There is no account and no backend. A language preference may be saved locally. Print or copy only creates a file where you choose.",
    disclaimer: "Estimate only; not an IRD assessment or tax return, and not legal or tax advice. / 只供估算，並非稅務局評稅或報稅表。",
  },
};

const state = {
  lang: "zh",
  settings: emptySettings(),
  monthly: 30000,
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
  next.income = $("income").value === "" ? "" : Number($("income").value);
  next.mpf = $("mpf").value === "" ? 0 : Number($("mpf").value);
  next.married = $("married").checked;
  next.children = $("children").value === "" ? 0 : Number($("children").value);
  next.parents60 = $("parents60").value === "" ? 0 : Number($("parents60").value);
  next.parents60Live = $("parents60Live").value === "" ? 0 : Number($("parents60Live").value);
  next.parents55 = $("parents55").value === "" ? 0 : Number($("parents55").value);
  next.parents55Live = $("parents55Live").value === "" ? 0 : Number($("parents55Live").value);
  return next;
}

function monthlyGuess(income) {
  var n = Number(income);
  if (!Number.isFinite(n) || n < 0) return "";
  if (n === 0) return 0;
  var m = n / 12;
  if (Math.abs(m * 12 - n) < 0.005) return Math.round(m * 100) / 100;
  return "";
}

function writeForm(settings) {
  $("year").value = settings.yearOfAssessment;
  $("income").value = settings.income;
  $("mpf").value = settings.mpf || 0;
  $("married").checked = !!settings.married;
  $("children").value = settings.children || 0;
  $("parents60").value = settings.parents60 || 0;
  $("parents60Live").value = settings.parents60Live || 0;
  $("parents55").value = settings.parents55 || 0;
  $("parents55Live").value = settings.parents55Live || 0;
  var guess = monthlyGuess(settings.income);
  state.monthly = guess === "" ? state.monthly : guess;
  $("monthly").value = state.monthly === "" || state.monthly == null ? "" : state.monthly;
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
    noIncome: t.warnNoIncome,
    negIncome: t.warnNegIncome,
    negMpf: t.warnNegMpf,
    mpfCapped: t.warnMpfCapped,
    childrenCapped: t.warnChildrenCapped,
    parentsCapped: t.warnParentsCapped,
    zeroIncome: t.warnZeroIncome,
    coveredByAllowances: t.warnCovered,
    marriedReplacesBasic: t.warnMarried,
    usedStandard: t.warnUsedStd,
    usedProgressive: t.warnUsedProg,
    reductionFinalOnly: t.warnReductionFinalOnly,
    noReduction2027: t.warnNoReduction2027,
    notJointAssessment: t.warnNotJoint,
    notPersonalAssessment: t.warnNotPa,
    otherDeductions: t.warnOtherDed,
    notTaxReturn: t.warnNotReturn,
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

function bandText(result) {
  if (!result.progressiveBands.length) return formatMoney(0, 2) + " × 0";
  return result.progressiveBands
    .map(function (b) {
      return formatMoney(b.size, 2) + " × " + formatPct(b.rate) + " = " + formatMoney(b.tax, 2);
    })
    .join("; ");
}

function formulaText(result) {
  var t = pack();
  if (!result.ok) return "";
  var personalLabel = result.allowances.married ? t.personalMarried : t.personalBasic;
  var childPart = result.allowances.child > 0 ? fill(t.formulaChild, { child: formatMoney(result.allowances.child, 2) }) : "";
  var parentPart = result.allowances.parent > 0 ? fill(t.formulaParent, { parent: formatMoney(result.allowances.parent, 2) }) : "";
  var vars = {
    income: formatMoney(result.income, 2),
    mpf: formatMoney(result.mpf, 2),
    net: formatMoney(result.netIncome, 2),
    personalLabel: personalLabel,
    personal: formatMoney(result.allowances.personal, 2),
    childPart: childPart,
    parentPart: parentPart,
    allow: formatMoney(result.allowances.total, 2),
    nci: formatMoney(result.netChargeableIncome, 2),
    bands: bandText(result),
    prog: formatMoney(result.progressiveTax, 2),
    tier: formatMoney(STANDARD_TIER, 0),
    low: formatPct(STANDARD_LOW),
    high: formatPct(STANDARD_HIGH),
    stdBand1: formatMoney(result.standardBand1, 2),
    stdBand2: formatMoney(result.standardBand2, 2),
    std: formatMoney(result.standardTax, 2),
    chosen: formatMoney(result.taxBeforeReduction, 2),
    basis: result.basis === "standard" ? t.basisStd : t.basisProg,
    cap: formatMoney(result.reductionCap, 0),
    reduction: formatMoney(result.reduction, 2),
    final: formatMoney(result.finalTax, 2),
  };
  var blocks = [
    fill(t.formulaNet, vars),
    fill(t.formulaAllow, vars),
    fill(t.formulaNci, vars),
    fill(t.formulaProg, vars),
    fill(t.formulaStd, vars),
    fill(t.formulaPick, vars),
  ];
  if (result.reductionCap > 0) blocks.push(fill(t.formulaReduction, vars));
  else blocks.push(fill(t.formulaNoReduction, vars));
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

function billHtml(result) {
  var t = pack();
  if (!result.ok) {
    return (
      '<div class="bill-head"><div><p class="bill-title">' +
      escapeHtml(t.billTitle) +
      "<small>" +
      escapeHtml(t.empty) +
      "</small></p></div></div>"
    );
  }
  var rows = [];
  rows.push(rowHtml(t.lineYear, result.yearOfAssessment));
  rows.push(rowHtml(t.lineIncome, formatMoney(result.income, 2)));
  rows.push(rowHtml(t.lineMpf, formatMoney(result.mpf, 2)));
  rows.push(rowHtml(t.lineNet, formatMoney(result.netIncome, 2)));
  rows.push(rowHtml(t.linePersonal, formatMoney(result.allowances.personal, 2)));
  if (result.allowances.child > 0) {
    rows.push(rowHtml(t.lineChild, formatMoney(result.allowances.child, 2)));
  }
  if (result.allowances.parent > 0) {
    rows.push(rowHtml(t.lineParent, formatMoney(result.allowances.parent, 2)));
  }
  rows.push(rowHtml(t.lineNci, formatMoney(result.netChargeableIncome, 2), true));
  rows.push(rowHtml(t.lineProg, formatMoney(result.progressiveTax, 2)));
  rows.push(rowHtml(t.lineStd, formatMoney(result.standardTax, 2)));
  rows.push(
    rowHtml(
      t.lineChosen + " — " + (result.basis === "standard" ? t.lineBasisStd : t.lineBasisProg),
      formatMoney(result.taxBeforeReduction, 2)
    )
  );
  if (result.reductionCap > 0) {
    rows.push(rowHtml(t.lineReduction, formatMoney(result.reduction, 2)));
  }
  rows.push(rowHtml(t.lineFinal, formatMoney(result.finalTax, 2), true));
  return (
    '<div class="bill-head"><div><p class="bill-title">' +
    escapeHtml(t.billTitle) +
    "<small>" +
    escapeHtml(t.billSub) +
    "</small></p></div><div class='bill-chop' aria-hidden='true'>薪俸<br />稅</div></div><table><thead><tr><th>" +
    escapeHtml(t.colItem) +
    '</th><th class="num">' +
    escapeHtml(t.colAmt) +
    "</th></tr></thead><tbody>" +
    rows.join("") +
    '</tbody></table><p class="bill-note">' +
    escapeHtml(t.notIrd) +
    "</p>"
  );
}

function summaryText(result) {
  var t = pack();
  if (!result.ok) return t.empty;
  var lines = [
    t.billTitle + " — " + result.yearOfAssessment,
    t.lineIncome + ": " + formatMoney(result.income, 2),
    t.lineMpf + ": " + formatMoney(result.mpf, 2),
    t.lineNet + ": " + formatMoney(result.netIncome, 2),
    t.lineNci + ": " + formatMoney(result.netChargeableIncome, 2),
    t.lineProg + ": " + formatMoney(result.progressiveTax, 2),
    t.lineStd + ": " + formatMoney(result.standardTax, 2),
    t.lineChosen + ": " + formatMoney(result.taxBeforeReduction, 2),
    t.lineFinal + ": " + formatMoney(result.finalTax, 2),
    t.notIrd,
  ];
  return lines.join("\n");
}

function render() {
  var t = pack();
  var result = compute(state.settings);

  $("hero-label").textContent = t.heroTotal;
  $("hero-amount").textContent = result.ok ? formatMoney(result.finalTax, 2) : "—";
  var status = result.allowances.married ? t.statusMarried : t.statusSingle;
  $("hero-sub").textContent = result.ok
    ? fill(t.heroFrom, {
        status: status,
        income: formatMoney(result.income, 2),
        year: result.yearOfAssessment,
      })
    : "";

  var cards = [];
  cards.push(kpiCard(t.kpiNet, result.ok ? formatMoney(result.netIncome, 2) : "—"));
  cards.push(kpiCard(t.kpiAllow, result.ok ? formatMoney(result.allowances.total, 2) : "—"));
  cards.push(kpiCard(t.kpiNci, result.ok ? formatMoney(result.netChargeableIncome, 2) : "—"));
  cards.push(kpiCard(t.kpiProg, result.ok ? formatMoney(result.progressiveTax, 2) : "—"));
  cards.push(kpiCard(t.kpiStd, result.ok ? formatMoney(result.standardTax, 2) : "—"));
  cards.push(kpiCard(t.kpiChosen, result.ok ? formatMoney(result.taxBeforeReduction, 2) : "—"));
  if (result.ok && result.reductionCap > 0) {
    cards.push(kpiCard(t.kpiReduction, formatMoney(result.reduction, 2)));
  }
  $("kpis").innerHTML = cards.join("");
  $("bill").innerHTML = billHtml(result);
  $("formula").textContent = formulaText(result);
  warnHtml(result);
}

function syncFromForm(evt) {
  if (evt && evt.target && evt.target.id === "monthly") {
    var monthly = $("monthly").value === "" ? "" : Number($("monthly").value);
    state.monthly = monthly;
    if (monthly !== "" && Number.isFinite(monthly) && monthly >= 0) {
      $("income").value = String(Math.round(monthly * 12 * 100) / 100);
    }
  }
  state.settings = readForm();
  render();
}

function applyDemo(settings) {
  state.settings = settings;
  writeForm(state.settings);
  render();
}

function init() {
  state.lang = readLang();
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

  $("demo-btn").addEventListener("click", function () {
    applyDemo(demoIrdGuide());
  });
  $("demo-married-btn").addEventListener("click", function () {
    applyDemo(demoMarriedChild());
  });
  $("demo-std-btn").addEventListener("click", function () {
    applyDemo(demoStandardRate());
  });
  $("clear-data").addEventListener("click", function () {
    state.monthly = 30000;
    applyDemo(emptySettings());
  });
  $("print-btn").addEventListener("click", function () {
    window.print();
  });
  $("copy-btn").addEventListener("click", function () {
    var text = summaryText(compute(state.settings));
    var status = $("copy-status");
    var t = pack();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          status.textContent = t.copied;
        },
        function () {
          status.textContent = t.copyFail;
        }
      );
    } else {
      status.textContent = t.copyFail;
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
