import { compute, emptySettings, formatMoney, formatNum } from "./wage.js";

const STORAGE_KEY = "hk-hourly-wage:v1";
const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "時薪計算器",
    docTitle: "時薪計算器｜月薪／日薪換算 香港 · Hourly wage calculator",
    lede: "月薪、日薪同時薪即時互轉。預設每月 26 工作日、每日 8 小時（常見糧單假設，不是法例）。不用註冊，不會上傳。",
    notice: "僅供估算，唔係勞工法例或最低工資計算；實際時薪／合約以僱主同勞工處規定為準。香港有法定最低工資，本頁沒有套用官方完整公式。",
    demoBtn: "載入示範",
    clearData: "重設 Reset",
    formTitle: "金額與工時",
    modeLegend: "由邊度計",
    modeMonthly: "月薪 → 時薪",
    modeDaily: "日薪 → 時薪",
    modeHourly: "時薪 → 月薪／日薪",
    payLegend: "金額（港元）",
    amountMonthly: "每月薪金",
    amountDaily: "每日薪金",
    amountHourly: "每小時薪金",
    hoursLegend: "工時假設",
    days: "每月工作日數",
    daysHint: "預設 26 日是香港糧單常見假設（例如月薪 ÷ 26 估日薪），並非法例規定。",
    hoursDay: "每日工時",
    hoursDayHint: "預設 8 小時。午膳是否有薪請按合約自行加減。",
    hoursWeek: "每週工時（可選，用來顯示週薪）",
    hoursWeekHint: "預設 44 小時只方便估週薪，不會用來計月薪。可留空或填 0 隱藏週薪。",
    draftStatus: "設定會自動保存在此瀏覽器（可選）。",
    hourlyLabel: "時薪",
    dailyLabel: "日薪",
    monthlyLabel: "月薪",
    weeklyLabel: "週薪（估算）",
    hoursMonthLabel: "本月工時",
    hoursMonthUnit: "{hours} 小時",
    heroFromMonthly: "由月薪 {amount} 換算",
    heroFromDaily: "由日薪 {amount} 換算",
    heroFromHourly: "由時薪 {amount} 估算月薪／日薪",
    formulaTitle: "計算公式",
    formulaHours: "本月工時 = 工作日 × 每日工時\n           = {days} × {hoursDay}\n           = {hoursMonth} 小時",
    formulaHourlyFromMonthly: "時薪 = 月薪 ÷（工作日 × 每日工時）\n     = {monthly} ÷ {hoursMonth}\n     = {hourly}",
    formulaDailyFromMonthly: "日薪 = 月薪 ÷ 工作日\n     = {monthly} ÷ {days}\n     = {daily}",
    formulaHourlyFromDaily: "時薪 = 日薪 ÷ 每日工時\n     = {daily} ÷ {hoursDay}\n     = {hourly}",
    formulaMonthlyFromDaily: "月薪 = 日薪 × 工作日\n     = {daily} × {days}\n     = {monthly}",
    formulaMonthlyFromHourly: "月薪 = 時薪 × 工作日 × 每日工時\n     = {hourly} × {days} × {hoursDay}\n     = {monthly}",
    formulaDailyFromHourly: "日薪 = 時薪 × 每日工時\n     = {hourly} × {hoursDay}\n     = {daily}",
    formulaWeekly: "週薪 = 時薪 × 每週工時\n     = {hourly} × {hoursWeek}\n     = {weekly}",
    formulaNote: "週薪只作參考，沒有用來倒推月薪。",
    warnNoAmount: "請輸入大於 0 的金額。",
    warnNoDays: "請輸入大於 0 的每月工作日數。",
    warnNoHoursDay: "請輸入大於 0 的每日工時。",
    warnBadHoursWeek: "每週工時若要顯示週薪，請輸入大於 0 的數字，或填 0 隱藏。",
    faqTitle: "常見問題",
    faq1q: "月薪怎樣換成時薪？",
    faq1a: "時薪＝月薪 ÷（每月工作日數 × 每日工時）。例如月薪 20,800 元、26 日、每日 8 小時，時薪＝20,800 ÷ 208＝100 元。26 日是香港糧單常見假設，不是法例規定。",
    faq2q: "這是不是法定最低工資計算？",
    faq2a: "不是。香港有法定最低工資（Statutory Minimum Wage），官方工時與工資範圍以勞工處公布為準。本頁只做簡單估算，沒有套用最低工資條例的完整公式，不能用來判斷僱主有沒有達標。",
    faq3q: "為甚麼預設每月 26 個工作日？",
    faq3a: "不少香港糧單會用每月 26 日把月薪估成日薪（月薪 ÷ 26）。這是常見實務假設，不是僱傭條例或最低工資的法定日數。你可以改成實際開工日數，例如 22。",
    faq4q: "資料會上傳嗎？",
    faq4a: "不會。金額與工時只在瀏覽器內計算，並可寫入本機 localStorage 方便下次開啟。沒有帳戶、沒有伺服器存檔。",
    privacyTitle: "私隱",
    privacyBody: "金額與工時只留在這個瀏覽器（localStorage，可選）。本頁不上傳、不設帳號、不設後端。",
    disclaimer: "僅供估算，唔係勞工法例或最低工資計算；實際時薪／合約以僱主同勞工處規定為準。 / Estimate only; not labour-law or SMW calculation.",
  },
  en: {
    pageTitle: "Hourly wage calculator",
    docTitle: "Hourly wage calculator | monthly / daily HK dollar converter",
    lede: "Convert monthly, daily and hourly pay instantly. Default 26 work days / month and 8 hours / day — a common HK payroll assumption, not the law. No sign-up, nothing uploaded.",
    notice: "Estimate only — not labour-law or statutory minimum wage. Your contract and the Labour Department prevail. Hong Kong has an SMW; this page does not apply the official formula.",
    demoBtn: "Load demo",
    clearData: "Reset",
    formTitle: "Amount and hours",
    modeLegend: "Start from",
    modeMonthly: "Monthly → hourly",
    modeDaily: "Daily → hourly",
    modeHourly: "Hourly → monthly / daily",
    payLegend: "Amount (HKD)",
    amountMonthly: "Monthly salary",
    amountDaily: "Daily pay",
    amountHourly: "Hourly pay",
    hoursLegend: "Hours (assumptions)",
    days: "Work days per month",
    daysHint: "26 days is a common HK payroll assumption (e.g. monthly ÷ 26 as a daily rate). It is not a legal rule.",
    hoursDay: "Hours per day",
    hoursDayHint: "Default 8 hours. Add or subtract lunch according to your contract.",
    hoursWeek: "Hours per week (optional, for a weekly view)",
    hoursWeekHint: "Default 44 hours is only for estimated weekly pay. It is not used to derive monthly pay. Leave blank or 0 to hide weekly.",
    draftStatus: "Settings are saved in this browser (optional).",
    hourlyLabel: "Hourly",
    dailyLabel: "Daily",
    monthlyLabel: "Monthly",
    weeklyLabel: "Weekly (estimate)",
    hoursMonthLabel: "Hours this month",
    hoursMonthUnit: "{hours} hours",
    heroFromMonthly: "From monthly {amount}",
    heroFromDaily: "From daily {amount}",
    heroFromHourly: "From hourly {amount} to monthly / daily",
    formulaTitle: "Formulas used",
    formulaHours: "Hours / month = days × hours per day\n             = {days} × {hoursDay}\n             = {hoursMonth} hours",
    formulaHourlyFromMonthly: "Hourly = monthly ÷ (days × hours per day)\n       = {monthly} ÷ {hoursMonth}\n       = {hourly}",
    formulaDailyFromMonthly: "Daily = monthly ÷ days\n      = {monthly} ÷ {days}\n      = {daily}",
    formulaHourlyFromDaily: "Hourly = daily ÷ hours per day\n       = {daily} ÷ {hoursDay}\n       = {hourly}",
    formulaMonthlyFromDaily: "Monthly = daily × days\n        = {daily} × {days}\n        = {monthly}",
    formulaMonthlyFromHourly: "Monthly = hourly × days × hours per day\n        = {hourly} × {days} × {hoursDay}\n        = {monthly}",
    formulaDailyFromHourly: "Daily = hourly × hours per day\n      = {hourly} × {hoursDay}\n      = {daily}",
    formulaWeekly: "Weekly = hourly × hours per week\n       = {hourly} × {hoursWeek}\n       = {weekly}",
    formulaNote: "Weekly pay is a separate view; it is not used to back-calculate monthly pay.",
    warnNoAmount: "Enter an amount greater than 0.",
    warnNoDays: "Enter work days per month greater than 0.",
    warnNoHoursDay: "Enter hours per day greater than 0.",
    warnBadHoursWeek: "To show weekly pay, enter hours per week greater than 0, or 0 to hide it.",
    faqTitle: "FAQ",
    faq1q: "How do I convert monthly salary to hourly?",
    faq1a: "Hourly = monthly ÷ (work days per month × hours per day). Example: HK$20,800, 26 days, 8 hours → 20,800 ÷ 208 = HK$100/hour. 26 days is a common payroll assumption, not a legal rule.",
    faq2q: "Is this statutory minimum wage?",
    faq2a: "No. Hong Kong has a Statutory Minimum Wage. Hours and wage items follow the Labour Department. This page is a simple estimate and does not apply the official SMW formula, so it cannot tell you whether an employer meets the legal rate.",
    faq3q: "Why default to 26 work days a month?",
    faq3a: "Many HK payrolls use 26 days to turn a monthly salary into a daily figure (monthly ÷ 26). That is a common practice, not a day-count under the Employment Ordinance or SMW. You can type the days you actually work, e.g. 22.",
    faq4q: "Is anything uploaded?",
    faq4a: "No. Amounts and hours stay in this browser and may be written to localStorage so the next visit remembers them. No account, no server copy.",
    privacyTitle: "Privacy",
    privacyBody: "Amounts and hours stay in this browser (optional localStorage). Nothing is uploaded. There is no account and no backend.",
    disclaimer: "Estimate only; not labour-law or SMW calculation. / 僅供估算，唔係勞工法例或最低工資計算。",
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
  next.amount = Number($("amount").value);
  next.daysPerMonth = Number($("days").value);
  next.hoursPerDay = Number($("hours-day").value);
  var weekRaw = $("hours-week").value;
  next.hoursPerWeek = weekRaw === "" ? 0 : Number(weekRaw);
  return next;
}

function writeForm(settings) {
  $("amount").value = settings.amount;
  $("days").value = settings.daysPerMonth;
  $("hours-day").value = settings.hoursPerDay;
  $("hours-week").value = settings.hoursPerWeek;
  syncChrome(settings);
}

function amountLabelKey(mode) {
  if (mode === "daily") return "amountDaily";
  if (mode === "hourly") return "amountHourly";
  return "amountMonthly";
}

function syncChrome(settings) {
  var buttons = document.querySelectorAll(".mode");
  for (var i = 0; i < buttons.length; i++) {
    var key = buttons[i].getAttribute("data-mode");
    buttons[i].setAttribute("aria-pressed", key === settings.mode ? "true" : "false");
  }
  var t = pack();
  $("amount-label").textContent = t[amountLabelKey(settings.mode)];
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
    noAmount: t.warnNoAmount,
    noDays: t.warnNoDays,
    noHoursDay: t.warnNoHoursDay,
    badHoursWeek: t.warnBadHoursWeek,
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
  box.innerHTML = "<ul>" + items.map(function (text) { return "<li>" + escapeHtml(text) + "</li>"; }).join("") + "</ul>";
}

function formulaText(result) {
  var t = pack();
  if (!result.ok) return "";
  var vars = {
    days: formatNum(result.daysPerMonth, 2),
    hoursDay: formatNum(result.hoursPerDay, 2),
    hoursMonth: formatNum(result.hoursPerMonth, 2),
    hoursWeek: formatNum(result.hoursPerWeek, 2),
    monthly: formatNum(result.monthly, 2),
    daily: formatNum(result.daily, 2),
    hourly: formatNum(result.hourly, 2),
    weekly: result.weekly == null ? "" : formatNum(result.weekly, 2),
  };
  var blocks = [fill(t.formulaHours, vars)];
  if (result.mode === "monthly") {
    blocks.push(fill(t.formulaHourlyFromMonthly, vars));
    blocks.push(fill(t.formulaDailyFromMonthly, vars));
  } else if (result.mode === "daily") {
    blocks.push(fill(t.formulaHourlyFromDaily, vars));
    blocks.push(fill(t.formulaMonthlyFromDaily, vars));
  } else {
    blocks.push(fill(t.formulaMonthlyFromHourly, vars));
    blocks.push(fill(t.formulaDailyFromHourly, vars));
  }
  if (result.weekly != null) {
    blocks.push(fill(t.formulaWeekly, vars));
    blocks.push(t.formulaNote);
  }
  return blocks.join("\n\n");
}

function render() {
  var t = pack();
  var result = compute(state.settings);
  syncChrome(state.settings);

  var heroValue = result.hourly;
  var heroLabel = t.hourlyLabel;
  if (state.settings.mode === "hourly") {
    heroValue = result.monthly;
    heroLabel = t.monthlyLabel;
  }
  $("hero-label").textContent = heroLabel;
  $("hero-amount").textContent = result.ok ? formatMoney(heroValue, 2) : "—";

  var fromMap = {
    monthly: t.heroFromMonthly,
    daily: t.heroFromDaily,
    hourly: t.heroFromHourly,
  };
  $("hero-sub").textContent = result.ok
    ? fill(fromMap[result.mode], { amount: formatMoney(result.amount, 2) })
    : "";

  var cards = [];
  if (result.mode !== "hourly") {
    cards.push([t.hourlyLabel, result.ok ? formatMoney(result.hourly, 2) : "—"]);
  }
  cards.push([t.dailyLabel, result.ok ? formatMoney(result.daily, 2) : "—"]);
  if (result.mode !== "hourly") {
    cards.push([t.monthlyLabel, result.ok ? formatMoney(result.monthly, 2) : "—"]);
  } else {
    cards.push([t.hourlyLabel, result.ok ? formatMoney(result.hourly, 2) : "—"]);
  }
  if (result.weekly != null) {
    cards.push([t.weeklyLabel, result.ok ? formatMoney(result.weekly, 2) : "—"]);
  }
  cards.push([
    t.hoursMonthLabel,
    result.ok ? fill(t.hoursMonthUnit, { hours: formatNum(result.hoursPerMonth, 2) }) : "—",
  ]);

  $("kpis").innerHTML = cards
    .map(function (pair) {
      return (
        '<div class="kpi"><span>' +
        escapeHtml(pair[0]) +
        "</span><strong>" +
        escapeHtml(pair[1]) +
        "</strong></div>"
      );
    })
    .join("");

  $("formula").textContent = formulaText(result);
  warnHtml(result);
}

function syncFromForm() {
  var mode = state.settings.mode;
  state.settings = readForm();
  state.settings.mode = mode;
  saveDraft();
  render();
}

function init() {
  state.lang = readLang();
  var draft = loadDraft();
  if (draft) {
    if (draft.mode !== "daily" && draft.mode !== "hourly") draft.mode = "monthly";
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

  $("wage-form").addEventListener("input", syncFromForm);
  $("wage-form").addEventListener("change", syncFromForm);

  var modes = document.querySelectorAll(".mode");
  for (var i = 0; i < modes.length; i++) {
    modes[i].addEventListener("click", function () {
      var nextMode = this.getAttribute("data-mode") || "monthly";
      var result = compute(state.settings);
      state.settings.mode = nextMode;
      if (result.ok) {
        if (nextMode === "monthly") state.settings.amount = roundMoney(result.monthly);
        else if (nextMode === "daily") state.settings.amount = roundMoney(result.daily);
        else state.settings.amount = roundMoney(result.hourly);
      }
      writeForm(state.settings);
      saveDraft();
      render();
    });
  }

  $("demo-btn").addEventListener("click", function () {
    state.settings = emptySettings();
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

function roundMoney(n) {
  return Math.round(Number(n) * 100) / 100;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
