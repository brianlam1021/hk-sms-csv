import {
  compute,
  defaultDays,
  demoBelowMin,
  demoCapped,
  demoEmployee,
  emptySettings,
  formatMoney,
  formatNum,
  needsDays,
} from "./mpf.js";

const STORAGE_KEY = "hk-mpf-contribution:v1";
const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "強積金供款估算",
    docTitle: "強積金供款估算｜僱主僱員自僱 香港 · MPF contribution",
    lede: "按積金局強制性供款表，估算僱主、僱員或自僱人士本期供款、入息上下限與實收。月入低於$7,100僱員免供、僱主仍供5%。不用註冊，不會上傳。",
    notice: "只供估算，並非積金局或積金易官方工具；實際以強制性公積金計劃條例、積金局公布及受託人結算為準。家庭傭工、18歲以下、65歲或以上及部分獲豁免人士不適用。",
    explainTitle: "為甚麼需要這個工具",
    explainBody: "積金局網站有強制性供款表和退休策劃計算機，但沒有「這個糧期要供多少」的互動工具。本頁把月薪、周薪、半月薪、日薪與自僱按年一次計出，並標出低於下限時只有僱員免供、高於上限每方$1,500封頂。",
    tableIncome: "每月有關入息",
    tableEr: "僱主強制性",
    tableEe: "僱員強制性",
    tableLow: "低於 $7,100",
    tableLowEr: "有關入息 × 5%",
    tableLowEe: "無須供款",
    tableMid: "$7,100 至 $30,000",
    tableHigh: "高於 $30,000",
    demoBtn: "月薪示範",
    demoLowBtn: "低於下限",
    demoCapBtn: "超過上限",
    clearData: "清除資料 Clear data",
    formTitle: "本期有關入息",
    roleLegend: "身份",
    roleEmployee: "僱員",
    roleSelf: "自僱人士",
    periodLegend: "糧期／供款期",
    periodMonthly: "月薪",
    periodWeekly: "周薪",
    periodSemi: "半月薪",
    periodDaily: "日薪",
    periodYearly: "按年（自僱）",
    incomeLegend: "有關入息（港元）",
    incomeMonthly: "本月有關入息",
    incomeWeekly: "本周有關入息",
    incomeSemi: "本半月有關入息",
    incomeDaily: "本日／本糧期有關入息",
    incomeYearly: "本年有關入息",
    incomeHint: "包括工資、佣金、花紅、假期薪酬；不包括遣散費、長期服務金、代通知金及發還墊支。",
    days: "本糧期日數",
    daysHint: "非月薪以每日下限$280、上限$1,000乘糧期日數。周薪預設7日，半月薪可填15或16。",
    voluntary: "自願性供款（可0）",
    voluntaryHint: "自願性供款不受$1,500上限限制。本頁只把此數從實收扣走，不當強制性。",
    holiday: "此糧期屬僱員免供款期（受僱首約30日及隨後不完整糧期）",
    holidayHint: "免供款期不適用於僱主。臨時僱員（飲食／建造業受僱少於60日）一般沒有免供款期。",
    draftStatus: "設定會自動保存在此瀏覽器（可選）。",
    heroTotal: "本期強制性供款合計",
    heroSelf: "本期自僱強制性供款",
    heroFromEmployee: "僱員　有關入息 {income}",
    heroFromSelf: "自僱人士　有關入息 {income}",
    kpiEmployer: "僱主強制性",
    kpiEmployee: "僱員強制性",
    kpiSelf: "自僱強制性",
    kpiVoluntary: "自願性",
    kpiTakeHome: "扣供款後實收",
    kpiMin: "本期下限",
    kpiMax: "本期上限",
    kpiAnnual: "若每月相同（12個月）",
    rowIncome: "有關入息",
    rowCapped: "計入供款的入息",
    rowEmployer: "僱主強制性供款",
    rowEmployee: "僱員強制性供款",
    rowSelf: "自僱強制性供款",
    rowVoluntary: "自願性供款",
    rowTotal: "強制性合計",
    rowTakeHome: "實收",
    formulaTitle: "計算步驟",
    formulaLevels: "本期下限 = {min}\n本期上限 = {max}",
    formulaDays: "（每日 $280 / $1,000 × {days} 日）",
    formulaCapped: "計入供款的入息 = min(有關入息, 上限)\n                 = min({income}, {max})\n                 = {capped}",
    formulaEr: "僱主強制性 = 計入入息 × 5%\n           = {capped} × 5%\n           = {employer}",
    formulaEe: "僱員強制性 = 計入入息 × 5%\n           = {capped} × 5%\n           = {employee}",
    formulaEeZero: "僱員強制性 = $0（有關入息低於下限）",
    formulaEeHoliday: "僱員強制性 = $0（免供款期；僱主仍須供）",
    formulaSelf: "自僱強制性 = 計入入息 × 5%\n           = {capped} × 5%\n           = {self}",
    formulaSelfZero: "自僱強制性 = $0（有關入息低於下限）",
    formulaTakeHome: "實收 = 有關入息 − 從薪金扣除的供款\n     = {income} − {deducted}\n     = {takeHome}",
    formulaAnnual: "若此月入息重複12個月：僱主 {annualEr}，僱員 {annualEe}，合計 {annualTotal}",
    formulaAnnualSelf: "若此月入息重複12個月：自僱供款 {annualSelf}",
    bandBelow: "有關入息低於本期下限",
    bandIn: "有關入息介乎本期上下限",
    bandAbove: "有關入息高於本期上限，超出部分雙方都不用供",
    warnNoIncome: "請輸入有關入息（可為 0）。",
    warnNegIncome: "有關入息不能是負數。",
    warnNoDays: "非月薪請輸入大於 0 的糧期日數。",
    warnDaysHigh: "糧期日數多於 31，請核對是否整個糧期。",
    warnNegVoluntary: "自願性供款不能是負數。",
    warnHolidayOn: "已勾選僱員免供款期：本頁把僱員強制性當成 $0，僱主仍按表供款。",
    warnEmployeeBelowMin: "有關入息低於下限：僱員無須供款，僱主仍須按實際入息供 5%。",
    warnSelfBelowMin: "有關入息低於下限：自僱人士本期無須強制性供款。",
    warnCapped: "有關入息高於上限：強制性供款按上限計算。",
    warnYearlySep: "自僱按年供款用每年上下限（$85,200 / $360,000）。",
    faqTitle: "常見問題",
    faq1q: "香港強積金強制性供款怎樣計？",
    faq1a: "僱員及僱主一般各按僱員有關入息的5%供款，受最低及最高有關入息水平限制。月薪僱員現行最低為$7,100、最高為$30,000。低於下限，僱員無須供款，僱主仍按實際有關入息供5%；介乎兩者，雙方各供5%；高於上限，雙方各供$1,500。",
    faq2q: "月入低於7,100元，僱主是否也不用供款？",
    faq2a: "要供。下限只豁免僱員那一半。僱主仍須按實際有關入息供5%。自僱人士低於下限則無須供款。",
    faq3q: "甚麼算有關入息？",
    faq3a: "有關入息是僱主以金錢支付或須支付的工資、薪金、假期津貼、佣金、花紅、獎金、約滿酬金、賞錢或津貼。不包括《僱傭條例》遣散費或長期服務金、代通知金，以及發還僱員墊支的開支。非金錢利益（例如免費膳食、旅遊套餐）一般也不計。",
    faq4q: "新僱員免供款期有多久？",
    faq4a: "僱員無須為受僱首30日供款，並可能伸延至其後首個不完整糧期。免供款期不適用於僱主。首次把僱主及僱員供款交到積金易，一般是僱員受僱滿60日所在月份完結後的下一個供款日（通常每月10日）或之前。",
    faq5q: "自僱人士怎樣供？",
    faq5a: "自僱人士按有關入息的5%供款，可選按月或按年。現行最低／最高為每月$7,100（每年$85,200）及每月$30,000（每年$360,000）。低於下限無須供款；高於上限每月$1,500或每年$18,000。有關入息可用最近期評稅通知書的應評稅利潤等積金局認可方法確定。",
    faq6q: "這是不是積金局或積金易官方計算機？",
    faq6a: "不是。積金局官方是供款表和退休策劃計算機，沒有本期供款互動工具。本頁只按公布的上下限做估算，不能代替付款結算書或受託人紀錄。建造業／飲食業行業計劃的臨時僱員供款方法不同，本頁不涵蓋。",
    faq7q: "資料會上傳嗎？",
    faq7a: "不會。金額只在瀏覽器內計算，草稿可寫入本機 localStorage。沒有帳戶、沒有伺服器存檔。",
    sourcesTitle: "資料來源 / Sources",
    srcEmp: "積金局 — 僱員強制性供款（月薪／非月薪表、有關入息、免供款期）：",
    srcSep: "積金局 — 自僱人士強制性供款（按月／按年上下限）：",
    srcRet: "積金局 — 退休策劃計算機（長期累算，不是本期供款）：",
    srcAsOf: "以上上下限於2026年10月15日核對積金局網頁（每月最低$7,100、最高$30,000）。水平每四年可按通脹調整，以官方為準。",
    privacyTitle: "私隱",
    privacyBody: "入息與供款數字只留在這個瀏覽器（localStorage，可選）。本頁不上傳、不設帳號、不設後端。",
    disclaimer: "只供估算，並非積金局／積金易官方計算或法律、稅務意見。 / Estimate only; not MPFA or eMPF, and not legal or tax advice.",
  },
  en: {
    pageTitle: "MPF contribution estimator",
    docTitle: "MPF contribution estimator | employer / employee / SEP HK",
    lede: "Estimate this period’s mandatory MPF from the MPFA tables: employer, employee or self-employed, plus the min/max relevant-income band and take-home. Below HK$7,100/month the employee pays nothing; the employer still pays 5%. No sign-up, nothing uploaded.",
    notice: "Estimate only — not an MPFA or eMPF tool. The Mandatory Provident Fund Schemes Ordinance, MPFA notices and your trustee prevail. Domestic helpers, people under 18 or aged 65+, and some other exempt persons are out of scope.",
    explainTitle: "Why this tool exists",
    explainBody: "MPFA publishes contribution tables and a retirement planner, but not an interactive “how much this wage period?” calculator. This page covers monthly, weekly, semi-monthly and daily employees plus yearly self-employed, and flags the usual mistakes: only the employee is exempt below the minimum, and each side caps at HK$1,500 a month.",
    tableIncome: "Monthly relevant income",
    tableEr: "Employer mandatory",
    tableEe: "Employee mandatory",
    tableLow: "Below HK$7,100",
    tableLowEr: "Relevant income × 5%",
    tableLowEe: "No contribution",
    tableMid: "HK$7,100 to HK$30,000",
    tableHigh: "Above HK$30,000",
    demoBtn: "Monthly demo",
    demoLowBtn: "Below minimum",
    demoCapBtn: "Above maximum",
    clearData: "Clear data",
    formTitle: "Relevant income this period",
    roleLegend: "Status",
    roleEmployee: "Employee",
    roleSelf: "Self-employed",
    periodLegend: "Wage / contribution period",
    periodMonthly: "Monthly",
    periodWeekly: "Weekly",
    periodSemi: "Semi-monthly",
    periodDaily: "Daily",
    periodYearly: "Yearly (SEP)",
    incomeLegend: "Relevant income (HKD)",
    incomeMonthly: "Relevant income this month",
    incomeWeekly: "Relevant income this week",
    incomeSemi: "Relevant income this half-month",
    incomeDaily: "Relevant income this day / wage period",
    incomeYearly: "Relevant income this year",
    incomeHint: "Includes wages, commission, bonus and leave pay. Excludes severance, long-service payment, payment in lieu, and expense reimbursements.",
    days: "Days in this wage period",
    daysHint: "Non-monthly periods use daily min HK$280 and max HK$1,000 × days. Weekly defaults to 7; semi-monthly is often 15 or 16.",
    voluntary: "Voluntary contribution (0 is fine)",
    voluntaryHint: "Voluntary contributions are not capped at HK$1,500. This page only subtracts them from take-home; they are not treated as mandatory.",
    holiday: "This period is in the employee’s contribution holiday (first ~30 days plus the following incomplete wage period)",
    holidayHint: "The holiday does not apply to the employer. Casual employees in catering/construction employed for under 60 days usually have no holiday.",
    draftStatus: "Settings are saved in this browser (optional).",
    heroTotal: "Mandatory contributions this period",
    heroSelf: "Self-employed mandatory this period",
    heroFromEmployee: "Employee · relevant income {income}",
    heroFromSelf: "Self-employed · relevant income {income}",
    kpiEmployer: "Employer mandatory",
    kpiEmployee: "Employee mandatory",
    kpiSelf: "Self-employed mandatory",
    kpiVoluntary: "Voluntary",
    kpiTakeHome: "Take-home after contributions",
    kpiMin: "Period minimum",
    kpiMax: "Period maximum",
    kpiAnnual: "If the same every month (×12)",
    rowIncome: "Relevant income",
    rowCapped: "Income counted for MC",
    rowEmployer: "Employer mandatory",
    rowEmployee: "Employee mandatory",
    rowSelf: "Self-employed mandatory",
    rowVoluntary: "Voluntary",
    rowTotal: "Mandatory total",
    rowTakeHome: "Take-home",
    formulaTitle: "Steps",
    formulaLevels: "Period minimum = {min}\nPeriod maximum = {max}",
    formulaDays: "(HK$280 / HK$1,000 per day × {days} days)",
    formulaCapped: "Income counted = min(relevant income, maximum)\n               = min({income}, {max})\n               = {capped}",
    formulaEr: "Employer MC = counted income × 5%\n            = {capped} × 5%\n            = {employer}",
    formulaEe: "Employee MC = counted income × 5%\n            = {capped} × 5%\n            = {employee}",
    formulaEeZero: "Employee MC = $0 (relevant income below the minimum)",
    formulaEeHoliday: "Employee MC = $0 (contribution holiday; employer still pays)",
    formulaSelf: "SEP MC = counted income × 5%\n       = {capped} × 5%\n       = {self}",
    formulaSelfZero: "SEP MC = $0 (relevant income below the minimum)",
    formulaTakeHome: "Take-home = relevant income − amounts deducted\n          = {income} − {deducted}\n          = {takeHome}",
    formulaAnnual: "If this monthly income repeats 12 times: employer {annualEr}, employee {annualEe}, total {annualTotal}",
    formulaAnnualSelf: "If this monthly income repeats 12 times: SEP {annualSelf}",
    bandBelow: "Relevant income is below this period’s minimum",
    bandIn: "Relevant income is within this period’s min/max",
    bandAbove: "Relevant income is above this period’s maximum; the excess is not subject to MC",
    warnNoIncome: "Enter relevant income (0 is allowed).",
    warnNegIncome: "Relevant income cannot be negative.",
    warnNoDays: "For a non-monthly period, enter wage-period days greater than 0.",
    warnDaysHigh: "Days is over 31 — check that this is one wage period.",
    warnNegVoluntary: "Voluntary contribution cannot be negative.",
    warnHolidayOn: "Employee contribution holiday is on: this page sets employee MC to $0; the employer still pays.",
    warnEmployeeBelowMin: "Below the minimum: the employee pays nothing; the employer still pays 5% of actual relevant income.",
    warnSelfBelowMin: "Below the minimum: a self-employed person need not make a mandatory contribution this period.",
    warnCapped: "Above the maximum: mandatory contributions are calculated on the cap.",
    warnYearlySep: "Yearly self-employed contributions use the annual min/max (HK$85,200 / HK$360,000).",
    faqTitle: "FAQ",
    faq1q: "How are Hong Kong mandatory MPF contributions calculated?",
    faq1a: "Employer and employee each contribute 5% of the employee’s relevant income, subject to the minimum and maximum levels. For monthly employees the current levels are HK$7,100 and HK$30,000. Below the minimum the employee pays nothing and the employer still pays 5% of actual relevant income; between the two, both pay 5%; above the maximum each pays HK$1,500.",
    faq2q: "If I earn under HK$7,100, does my employer also skip MPF?",
    faq2a: "No. The minimum only exempts the employee’s share. The employer still contributes 5% of actual relevant income. A self-employed person below the minimum need not contribute.",
    faq3q: "What counts as relevant income?",
    faq3a: "Money the employer pays or is payable as wages, salary, leave pay, commission, bonus, contract gratuity, tips or allowances. It excludes Employment Ordinance severance and long-service payments, payment in lieu of notice, and reimbursements of expenses. Non-money benefits (free meals, holiday packages) usually do not count.",
    faq4q: "How long is the new-employee contribution holiday?",
    faq4a: "Employees need not contribute for the first 30 days of employment, and that holiday may extend through the following incomplete wage period. It does not apply to the employer. The first payment to eMPF covering both sides is generally due by the next contribution day (usually the 10th) after the month in which the employee completes 60 days.",
    faq5q: "How do self-employed persons contribute?",
    faq5a: "SEPs contribute 5% of relevant income, monthly or yearly. Current min/max are HK$7,100 a month (HK$85,200 a year) and HK$30,000 a month (HK$360,000 a year). Below the minimum, no contribution; above the maximum, HK$1,500 a month or HK$18,000 a year. Relevant income may follow the latest IRD assessable profits or another MPFA-accepted method.",
    faq6q: "Is this an official MPFA or eMPF calculator?",
    faq6a: "No. MPFA publishes tables and a retirement planner, not a this-period contribution calculator. This page only estimates from the published levels. It is not a remittance statement or trustee record. Industry-scheme casual employees in construction/catering use different rules and are out of scope.",
    faq7q: "Is anything uploaded?",
    faq7a: "No. Amounts stay in this browser and may be written to localStorage. No account, no server copy.",
    sourcesTitle: "Sources",
    srcEmp: "MPFA — mandatory contributions for employees (monthly / non-monthly tables, relevant income, contribution holiday):",
    srcSep: "MPFA — mandatory contributions for self-employed persons (monthly / yearly levels):",
    srcRet: "MPFA — retirement planning calculator (long-term projection, not this-period contributions):",
    srcAsOf: "Min/max levels checked against MPFA pages on 15 October 2026 (monthly HK$7,100 / HK$30,000). Levels may adjust every four years for inflation; the official figures prevail.",
    privacyTitle: "Privacy",
    privacyBody: "Income and contribution figures stay in this browser (optional localStorage). Nothing is uploaded. There is no account and no backend.",
    disclaimer: "Estimate only; not MPFA or eMPF, and not legal or tax advice. / 只供估算，並非積金局／積金易官方計算。",
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

function incomeLabelKey(period) {
  if (period === "weekly") return "incomeWeekly";
  if (period === "semiMonthly") return "incomeSemi";
  if (period === "daily") return "incomeDaily";
  if (period === "yearly") return "incomeYearly";
  return "incomeMonthly";
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
  next.income = $("income").value === "" ? "" : Number($("income").value);
  next.days = $("days").value === "" ? "" : Number($("days").value);
  next.voluntary = $("voluntary").value === "" ? 0 : Number($("voluntary").value);
  next.holiday = $("holiday").checked;
  return next;
}

function writeForm(settings) {
  $("income").value = settings.income;
  $("days").value = settings.days || defaultDays(settings.period) || "";
  $("voluntary").value = settings.voluntary || 0;
  $("holiday").checked = !!settings.holiday;
  syncChrome(settings);
}

function syncChrome(settings) {
  var roles = document.querySelectorAll(".role");
  for (var i = 0; i < roles.length; i++) {
    var role = roles[i].getAttribute("data-role");
    roles[i].setAttribute("aria-pressed", role === settings.role ? "true" : "false");
  }
  var periods = document.querySelectorAll(".period");
  for (var j = 0; j < periods.length; j++) {
    var p = periods[j].getAttribute("data-period");
    periods[j].setAttribute("aria-pressed", p === settings.period ? "true" : "false");
  }
  var employee = settings.role === "employee";
  $("mode-weekly").hidden = !employee;
  $("mode-semi").hidden = !employee;
  $("mode-daily").hidden = !employee;
  $("mode-yearly").hidden = employee;
  $("days-field").hidden = !needsDays(settings.period);
  $("holiday-field").hidden = !employee;
  var t = pack();
  $("income-label").textContent = t[incomeLabelKey(settings.period)];
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
    noIncome: t.warnNoIncome,
    negIncome: t.warnNegIncome,
    noDays: t.warnNoDays,
    daysHigh: t.warnDaysHigh,
    negVoluntary: t.warnNegVoluntary,
    holidayOn: t.warnHolidayOn,
    employeeBelowMin: t.warnEmployeeBelowMin,
    selfBelowMin: t.warnSelfBelowMin,
    capped: t.warnCapped,
    yearlySep: t.warnYearlySep,
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
  var vars = {
    min: formatMoney(result.minLevel, 2),
    max: formatMoney(result.maxLevel, 2),
    days: formatNum(result.days, 0),
    income: formatMoney(result.income, 2),
    capped: formatMoney(result.relevantCapped, 2),
    employer: formatMoney(result.employerMC, 2),
    employee: formatMoney(result.employeeMC, 2),
    self: formatMoney(result.selfMC, 2),
    deducted: formatMoney(result.deductedFromPay, 2),
    takeHome: formatMoney(result.takeHome, 2),
    annualEr: formatMoney(result.annualEmployer || 0, 2),
    annualEe: formatMoney(result.annualEmployee || 0, 2),
    annualSelf: formatMoney(result.annualSelf || 0, 2),
    annualTotal: formatMoney(result.annualTotal || 0, 2),
  };
  var blocks = [fill(t.formulaLevels, vars)];
  if (needsDays(result.period)) blocks.push(fill(t.formulaDays, vars));
  blocks.push(fill(t.formulaCapped, vars));
  if (result.role === "selfEmployed") {
    blocks.push(result.selfMC > 0 ? fill(t.formulaSelf, vars) : t.formulaSelfZero);
  } else {
    blocks.push(fill(t.formulaEr, vars));
    if (result.holiday) blocks.push(t.formulaEeHoliday);
    else if (result.employeeMC > 0) blocks.push(fill(t.formulaEe, vars));
    else blocks.push(t.formulaEeZero);
  }
  blocks.push(fill(t.formulaTakeHome, vars));
  if (result.period === "monthly" && result.annualTotal != null) {
    blocks.push(
      result.role === "selfEmployed"
        ? fill(t.formulaAnnualSelf, vars)
        : fill(t.formulaAnnual, vars)
    );
  }
  return blocks.join("\n\n");
}

function bandLabel(result, t) {
  if (result.band === "belowMin") return t.bandBelow;
  if (result.band === "aboveMax") return t.bandAbove;
  if (result.band === "inBand") return t.bandIn;
  return "";
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

  $("hero-label").textContent = result.role === "selfEmployed" ? t.heroSelf : t.heroTotal;
  $("hero-amount").textContent = result.ok ? formatMoney(result.totalMC, 2) : "—";
  var from = result.role === "selfEmployed" ? t.heroFromSelf : t.heroFromEmployee;
  var sub = result.ok ? fill(from, { income: formatMoney(result.income, 2) }) : "";
  var band = result.ok ? bandLabel(result, t) : "";
  $("hero-sub").textContent = [sub, band].filter(Boolean).join(" · ");

  var cards = [];
  if (result.role === "employee") {
    cards.push(kpiCard(t.kpiEmployer, result.ok ? formatMoney(result.employerMC, 2) : "—"));
    cards.push(kpiCard(t.kpiEmployee, result.ok ? formatMoney(result.employeeMC, 2) : "—"));
  } else {
    cards.push(kpiCard(t.kpiSelf, result.ok ? formatMoney(result.selfMC, 2) : "—"));
  }
  if (result.voluntary > 0) {
    cards.push(kpiCard(t.kpiVoluntary, formatMoney(result.voluntary, 2)));
  }
  cards.push(kpiCard(t.kpiTakeHome, result.ok ? formatMoney(result.takeHome, 2) : "—"));
  cards.push(kpiCard(t.kpiMin, result.ok ? formatMoney(result.minLevel, 2) : "—"));
  cards.push(kpiCard(t.kpiMax, result.ok ? formatMoney(result.maxLevel, 2) : "—"));
  if (result.annualTotal != null) {
    cards.push(kpiCard(t.kpiAnnual, formatMoney(result.annualTotal, 2)));
  }
  $("kpis").innerHTML = cards.join("");

  var rows = [];
  if (result.ok) {
    rows.push(rowHtml(t.rowIncome, formatMoney(result.income, 2)));
    rows.push(rowHtml(t.rowCapped, formatMoney(result.relevantCapped, 2)));
    if (result.role === "employee") {
      rows.push(rowHtml(t.rowEmployer, formatMoney(result.employerMC, 2)));
      rows.push(rowHtml(t.rowEmployee, formatMoney(result.employeeMC, 2)));
    } else {
      rows.push(rowHtml(t.rowSelf, formatMoney(result.selfMC, 2)));
    }
    if (result.voluntary > 0) rows.push(rowHtml(t.rowVoluntary, formatMoney(result.voluntary, 2)));
    rows.push(rowHtml(t.rowTotal, formatMoney(result.totalMC, 2), true));
    rows.push(rowHtml(t.rowTakeHome, formatMoney(result.takeHome, 2), true));
  }
  $("breakdown").innerHTML = rows.length
    ? "<tbody>" + rows.join("") + "</tbody>"
    : "";

  $("formula").textContent = formulaText(result);
  warnHtml(result);
}

function syncFromForm() {
  var role = state.settings.role;
  var period = state.settings.period;
  state.settings = readForm();
  state.settings.role = role;
  state.settings.period = period;
  saveDraft();
  render();
}

function setRole(role) {
  state.settings.role = role === "selfEmployed" ? "selfEmployed" : "employee";
  if (state.settings.role === "employee" && state.settings.period === "yearly") {
    state.settings.period = "monthly";
  }
  if (state.settings.role === "selfEmployed" && needsDays(state.settings.period)) {
    state.settings.period = "monthly";
  }
  if (state.settings.role === "selfEmployed") state.settings.holiday = false;
  writeForm(state.settings);
  saveDraft();
  render();
}

function setPeriod(period) {
  state.settings.period = period;
  if (needsDays(period) && !(Number(state.settings.days) > 0)) {
    state.settings.days = defaultDays(period);
  } else if (needsDays(period)) {
    var fallback = defaultDays(period);
    if (period === "weekly" && Number(state.settings.days) !== 7 && fallback === 7) {
      /* keep user days */
    }
    if (!state.settings.days) state.settings.days = fallback;
  }
  if (period === "weekly" && !state.settings.days) state.settings.days = 7;
  if (period === "semiMonthly" && (state.settings.days === 7 || state.settings.days === 1)) {
    state.settings.days = 15;
  }
  if (period === "daily" && (state.settings.days === 7 || state.settings.days === 15)) {
    state.settings.days = 1;
  }
  if (period === "weekly" && (state.settings.days === 15 || state.settings.days === 1)) {
    state.settings.days = 7;
  }
  writeForm(state.settings);
  saveDraft();
  render();
}

function init() {
  state.lang = readLang();
  var draft = loadDraft();
  if (draft) {
    if (draft.role !== "selfEmployed") draft.role = "employee";
    if (
      draft.period !== "weekly" &&
      draft.period !== "semiMonthly" &&
      draft.period !== "daily" &&
      draft.period !== "yearly"
    ) {
      draft.period = "monthly";
    }
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

  $("mpf-form").addEventListener("input", syncFromForm);
  $("mpf-form").addEventListener("change", syncFromForm);

  var roles = document.querySelectorAll(".role");
  for (var i = 0; i < roles.length; i++) {
    roles[i].addEventListener("click", function () {
      setRole(this.getAttribute("data-role"));
    });
  }
  var periods = document.querySelectorAll(".period");
  for (var j = 0; j < periods.length; j++) {
    periods[j].addEventListener("click", function () {
      setPeriod(this.getAttribute("data-period"));
    });
  }

  $("demo-btn").addEventListener("click", function () {
    state.settings = demoEmployee();
    writeForm(state.settings);
    saveDraft();
    render();
  });
  $("demo-low-btn").addEventListener("click", function () {
    state.settings = demoBelowMin();
    writeForm(state.settings);
    saveDraft();
    render();
  });
  $("demo-cap-btn").addEventListener("click", function () {
    state.settings = demoCapped();
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
