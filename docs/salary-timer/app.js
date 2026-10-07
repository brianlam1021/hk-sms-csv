import {
  applyPreset,
  compute,
  detectPreset,
  emptySettings,
  formatHms,
  formatMoney,
} from "./timer.js";

const STORAGE_KEY = "hk-salary-timer:v1";
const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "整個月薪計時器",
    docTitle: "整個月薪計時器｜今日／本月已賺 實時計時 · Monthly salary timer",
    lede: "輸入月薪與工時，即時顯示今天、本月與每秒已賺。午膳可暫停。不用註冊，不會上傳。",
    notice: "只供估算，不是糧單、出糧或僱傭條例下的工資計算。實際以合約及僱主為準。",
    demoBtn: "載入示範",
    clearData: "清除資料 Clear data",
    formTitle: "月薪與工時",
    payLegend: "月薪",
    salary: "每月薪金",
    currency: "貨幣",
    presetLegend: "工時預設",
    preset96: "週一至五 9–6",
    preset95: "週一至五 9–5",
    presetSat: "週一至六 9–6",
    presetCustom: "自訂",
    presetHint: "9–6 預設扣 13:00–14:00 午膳，每日 8 小時有薪工時。",
    hoursLegend: "每日時間",
    startTime: "上班",
    endTime: "下班",
    lunchEnabled: "午膳暫停（不計入已賺）",
    lunchStart: "午膳開始",
    lunchEnd: "午膳結束",
    daysLegend: "工作日",
    dow1: "一",
    dow2: "二",
    dow3: "三",
    dow4: "四",
    dow5: "五",
    dow6: "六",
    dow0: "日",
    daysModeLegend: "本月工作日數（用來計每秒金額）",
    daysAuto: "按日曆自動數本月勾選的工作日",
    daysManual: "自行輸入每月工作日數",
    workDays: "每月工作日數",
    showSecond: "顯示每秒金額",
    draftStatus: "設定會自動保存在此瀏覽器。",
    todayLabel: "今天已賺",
    pauseBtn: "暫停午膳／休息",
    resumeBtn: "繼續計時",
    monthLabel: "本月已賺",
    secondLabel: "每秒",
    remainToday: "今天尚餘",
    remainMonth: "本月尚餘",
    hourLabel: "每小時",
    dayLabel: "每日",
    hoursDay: "每日有薪工時 {hours}",
    daysUsed: "本月按 {days} 個工作日計（日曆 {cal} 日）",
    todayProg: "今天已過 {done} / {total}",
    statusWorking: "工作中",
    statusLunch: "午膳暫停",
    statusPaused: "已暫停",
    statusBefore: "未上班",
    statusAfter: "已下班",
    statusOff: "今日休息",
    warnNoSalary: "請輸入大於 0 的月薪，計時器才會走動。",
    warnNoWeekdays: "請至少勾選一日工作日。",
    warnBadHours: "下班時間須晚於上班時間。本頁不支援通宵更。",
    warnBadLunch: "午膳結束須晚於開始時間。",
    warnNoDays: "本月沒有符合的工作日，或自行輸入的日數無效。",
    warnManualCap: "已過工作日多於你輸入的每月日數，本月已賺以該日數封頂。",
    faqTitle: "常見問題",
    faq1q: "這個計時器怎樣算已賺金額？",
    faq1a: "每秒金額＝月薪 ÷（本月工作日數 × 每日有薪工時 × 3600）。今天已賺＝今天已過的有薪工時 × 每秒金額；本月已賺＝本月已過的工作日全日工時，加上今天已過工時。午膳時段預設不計入有薪工時。",
    faq2q: "這是不是糧單或正式工資計算？",
    faq2a: "不是。這只是按你輸入的月薪與工時做的即時估算，不是僱主出糧、強積金、加班費、有薪假期或僱傭條例下的工資計算。實際以僱傭合約、糧單及法例為準。",
    faq3q: "週一至五 9–6 預設包不包括午膳？",
    faq3a: "預設為週一至五 09:00–18:00，並暫停 13:00–14:00 午膳，即每日 8 小時有薪工時。可改用 9–5、週一至六，或自訂上班／下班／午膳時間與工作日。",
    faq4q: "資料會上傳嗎？",
    faq4a: "不會。月薪與工時只在瀏覽器內計算，並可寫入本機 localStorage 方便下次開啟。沒有帳戶、沒有伺服器存檔。",
    privacyTitle: "私隱",
    privacyBody: "月薪與工時只留在這個瀏覽器（localStorage）。本頁不上傳、不設帳號、不設後端。",
    disclaimer: "只供估算，不是糧單或出糧。 / Estimate only; not payroll.",
  },
  en: {
    pageTitle: "Monthly salary timer",
    docTitle: "Monthly salary timer | live today / month earnings",
    lede: "Enter a monthly salary and hours. Watch today, this month and each second update live. Lunch can pause the ticker. No sign-up, nothing uploaded.",
    notice: "Estimate only — not a payslip, payroll run, or wages under the Employment Ordinance. Your contract and employer prevail.",
    demoBtn: "Load demo",
    clearData: "Clear data",
    formTitle: "Salary and hours",
    payLegend: "Pay",
    salary: "Monthly salary",
    currency: "Currency",
    presetLegend: "Hours preset",
    preset96: "Mon–Fri 9–6",
    preset95: "Mon–Fri 9–5",
    presetSat: "Mon–Sat 9–6",
    presetCustom: "Custom",
    presetHint: "The 9–6 preset skips 13:00–14:00 lunch (8 paid hours).",
    hoursLegend: "Daily times",
    startTime: "Start",
    endTime: "End",
    lunchEnabled: "Pause for lunch (unpaid)",
    lunchStart: "Lunch start",
    lunchEnd: "Lunch end",
    daysLegend: "Work days",
    dow1: "Mon",
    dow2: "Tue",
    dow3: "Wed",
    dow4: "Thu",
    dow5: "Fri",
    dow6: "Sat",
    dow0: "Sun",
    daysModeLegend: "Work days this month (for the per-second rate)",
    daysAuto: "Count matching weekdays on this month’s calendar",
    daysManual: "Enter work days per month myself",
    workDays: "Work days per month",
    showSecond: "Show amount per second",
    draftStatus: "Settings are saved in this browser.",
    todayLabel: "Earned today",
    pauseBtn: "Pause for lunch / break",
    resumeBtn: "Resume",
    monthLabel: "Earned this month",
    secondLabel: "Per second",
    remainToday: "Left today",
    remainMonth: "Left this month",
    hourLabel: "Per hour",
    dayLabel: "Per day",
    hoursDay: "{hours} paid hours / day",
    daysUsed: "Rate uses {days} work days (calendar {cal})",
    todayProg: "Today {done} / {total}",
    statusWorking: "Working",
    statusLunch: "Lunch pause",
    statusPaused: "Paused",
    statusBefore: "Before start",
    statusAfter: "After hours",
    statusOff: "Day off",
    warnNoSalary: "Enter a monthly salary above 0 for the ticker to move.",
    warnNoWeekdays: "Tick at least one work day.",
    warnBadHours: "End time must be after start time. Overnight shifts are not supported.",
    warnBadLunch: "Lunch end must be after lunch start.",
    warnNoDays: "No matching work days this month, or the typed day count is invalid.",
    warnManualCap: "Elapsed work days exceed the number you typed; this month is capped there.",
    faqTitle: "FAQ",
    faq1q: "How is the amount calculated?",
    faq1a: "Per-second rate = monthly salary ÷ (work days this month × paid hours per day × 3,600). Today = paid seconds so far today × that rate. This month = completed work days plus today. Scheduled lunch is unpaid by default.",
    faq2q: "Is this a payslip or official wage calculation?",
    faq2a: "No. It is a live estimate from the figures you type. It is not payroll, MPF, overtime, paid leave, or wages under the Employment Ordinance. Follow your contract and employer.",
    faq3q: "Does the Mon–Fri 9–6 preset include lunch?",
    faq3a: "It is 09:00–18:00, Monday to Friday, with 13:00–14:00 unpaid lunch (8 paid hours). You can switch to 9–5, Mon–Sat, or a custom timetable.",
    faq4q: "Is anything uploaded?",
    faq4a: "No. Salary and hours stay in this browser and may be written to localStorage so the next visit remembers them. No account, no server copy.",
    privacyTitle: "Privacy",
    privacyBody: "Salary and hours stay in this browser (localStorage). Nothing is uploaded. There is no account and no backend.",
    disclaimer: "Estimate only; not payroll. / 只供估算，不是糧單或出糧。",
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
  next.salary = Number($("salary").value);
  next.currency = $("currency").value || "HKD";
  next.startTime = $("start-time").value || "09:00";
  next.endTime = $("end-time").value || "18:00";
  next.lunchEnabled = $("lunch-enabled").checked;
  next.lunchStart = $("lunch-start").value || "13:00";
  next.lunchEnd = $("lunch-end").value || "14:00";
  next.daysMode = document.querySelector("input[name='daysMode']:checked").value === "manual" ? "manual" : "auto";
  next.workDaysPerMonth = Number($("work-days").value);
  next.showSecondRate = $("show-second").checked;
  var boxes = document.querySelectorAll("input[name='dow']");
  var days = [];
  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) days.push(Number(boxes[i].value));
  }
  next.weekdays = days;
  next.preset = detectPreset(next);
  next.pausedAt = state.settings.pausedAt;
  return next;
}

function writeForm(settings) {
  $("salary").value = settings.salary;
  $("currency").value = settings.currency;
  $("start-time").value = settings.startTime;
  $("end-time").value = settings.endTime;
  $("lunch-enabled").checked = !!settings.lunchEnabled;
  $("lunch-start").value = settings.lunchStart;
  $("lunch-end").value = settings.lunchEnd;
  var auto = document.querySelector("input[name='daysMode'][value='auto']");
  var manual = document.querySelector("input[name='daysMode'][value='manual']");
  if (settings.daysMode === "manual") manual.checked = true;
  else auto.checked = true;
  $("work-days").value = settings.workDaysPerMonth;
  $("show-second").checked = settings.showSecondRate !== false;
  var boxes = document.querySelectorAll("input[name='dow']");
  for (var i = 0; i < boxes.length; i++) {
    boxes[i].checked = settings.weekdays.indexOf(Number(boxes[i].value)) !== -1;
  }
  syncChrome(settings);
}

function syncChrome(settings) {
  var buttons = document.querySelectorAll(".preset");
  for (var i = 0; i < buttons.length; i++) {
    var key = buttons[i].getAttribute("data-preset");
    buttons[i].setAttribute("aria-pressed", key === settings.preset ? "true" : "false");
  }
  $("lunch-fields").hidden = !settings.lunchEnabled;
  $("manual-days-wrap").hidden = settings.daysMode !== "manual";
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
    noSalary: t.warnNoSalary,
    noWeekdays: t.warnNoWeekdays,
    badHours: t.warnBadHours,
    badLunch: t.warnBadLunch,
    noDays: t.warnNoDays,
    manualDaysCap: t.warnManualCap,
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

function statusLabel(status) {
  var t = pack();
  if (status === "working") return t.statusWorking;
  if (status === "lunch") return t.statusLunch;
  if (status === "paused") return t.statusPaused;
  if (status === "before") return t.statusBefore;
  if (status === "after") return t.statusAfter;
  return t.statusOff;
}

function render(now) {
  var t = pack();
  var result = compute(state.settings, now || new Date());
  var cur = result.currency;
  $("today-amount").textContent = formatMoney(result.todayEarned, cur, 2);
  $("today-bar").style.width = Math.round(result.progressToday * 100) + "%";
  $("today-progress").textContent = fill(t.todayProg, {
    done: formatHms(result.todayElapsedSec),
    total: formatHms(result.todayTotalSec),
  });
  var pill = $("status-pill");
  pill.textContent = statusLabel(result.status);
  pill.className = "status-pill is-" + result.status;
  $("clock").textContent = result.now.toLocaleString(state.lang === "en" ? "en-HK" : "zh-HK", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  $("pause-btn").textContent = state.settings.pausedAt ? t.resumeBtn : t.pauseBtn;

  var cards = [
    [t.monthLabel, formatMoney(result.monthEarned, cur, 2)],
    [t.remainToday, formatMoney(result.remainingToday, cur, 2)],
    [t.remainMonth, formatMoney(result.remainingMonth, cur, 2)],
    [t.hourLabel, formatMoney(result.hourRate, cur, 2)],
    [t.dayLabel, formatMoney(result.dayRate, cur, 2)],
  ];
  if (state.settings.showSecondRate) {
    cards.splice(1, 0, [t.secondLabel, formatMoney(result.secondRate, cur, 4)]);
  }
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
  $("kpis").insertAdjacentHTML(
    "beforeend",
    '<p class="muted">' +
      escapeHtml(fill(t.hoursDay, { hours: result.hoursPerDay.toFixed(2) })) +
      " · " +
      escapeHtml(fill(t.daysUsed, { days: String(result.workDaysMonth), cal: String(result.workDaysCalendar) })) +
      "</p>"
  );
  warnHtml(result);
}

function syncFromForm() {
  state.settings = readForm();
  saveDraft();
  syncChrome(state.settings);
  render();
}

function init() {
  state.lang = readLang();
  var draft = loadDraft();
  if (draft) state.settings = draft;
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

  $("timer-form").addEventListener("input", syncFromForm);
  $("timer-form").addEventListener("change", syncFromForm);

  var presets = document.querySelectorAll(".preset");
  for (var i = 0; i < presets.length; i++) {
    presets[i].addEventListener("click", function () {
      var key = this.getAttribute("data-preset");
      if (key === "custom") {
        state.settings.preset = "custom";
      } else {
        state.settings = applyPreset(state.settings, key);
      }
      writeForm(state.settings);
      saveDraft();
      render();
    });
  }

  $("pause-btn").addEventListener("click", function () {
    if (state.settings.pausedAt) {
      state.settings.pausedAt = null;
    } else {
      state.settings.pausedAt = new Date().toISOString();
    }
    saveDraft();
    render();
  });

  $("demo-btn").addEventListener("click", function () {
    state.settings = applyPreset(emptySettings(), "monfri96");
    state.settings.salary = 22000;
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

  setInterval(function () {
    render();
  }, 200);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
