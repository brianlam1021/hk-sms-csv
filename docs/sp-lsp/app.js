import {
  AS_OF,
  TOTAL_CAP,
  TRANSITION_YMD,
  compute,
  demoCap,
  demoMonthlySp,
  demoStraddle,
  emptySettings,
  formatMoney,
  formatNum,
} from "./sp-lsp.js";

const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "遣散費／長期服務金估算",
    docTitle: "遣散費／長期服務金估算｜僱傭條例 Cap.57 · SP / LSP",
    lede: "按《僱傭條例》現行公式（取消強積金對沖後，轉制日2025年5月1日），估算一般僱員的遣散費（SP）或長期服務金（LSP）。月薪上限$22,500、每年$15,000、總額$390,000。不用註冊，不會上傳。",
    notice:
      "只供參考，並非法例意見，亦非勞工處官方工具。請以《僱傭條例》、勞工處 Concise Guide／法定權益計算機／EasyCal 為準。本頁不計算強積金對沖款額。外傭請用「外傭終止結算」工具。",
    explainTitle: "為甚麼需要這個工具",
    explainBody:
      "取消對沖後，橫跨2025年5月1日的僱傭期要拆成轉制前／後兩部分，並可能從轉制後部分扣減超過$390,000上限的差額。勞工處有官方計算機；本頁把資格檢查、月薪／日薪、12個月平均選項與分拆步驟一次列明，方便粗略對照。",
    demoBtn: "橫跨轉制日示範",
    demoSpBtn: "月薪遣散費示範",
    demoCapBtn: "39萬上限示範",
    clearData: "清除資料 Clear data",
    formTitle: "僱傭與工資",
    entitleLegend: "權益類型（兩者只可擇一）",
    entitleSp: "遣散費 SP",
    entitleLsp: "長期服務金 LSP",
    wageLegend: "工資計算方式",
    wageMonthly: "月薪",
    wageDaily: "日薪／件薪",
    datesLegend: "受僱期",
    startDate: "入職日期",
    endDate: "終止／有關日期",
    datesHint: "轉制日為2025年5月1日。橫跨該日會自動分拆轉制前／後部分。",
    wageFieldsLegend: "有關工資（港元）",
    monthlyWage: "終止前最後一個月全月工資（或12個月平均）",
    monthlyWagePre: "轉制日前最後一個月全月工資（或12個月平均）",
    eighteenDays: "終止前最後30個正常工作日中選18天工資總和",
    eighteenDaysPre: "轉制日前最後30個正常工作日中選18天工資總和",
    useAverage: "我採用緊接終止／轉制日前12個月平均工資（條例容許的選項）",
    useAverageHint: "本頁不會替你計平均；請自行填入選用後的數字。",
    spReasonLegend: "遣散費資格情況",
    spRedundancy: "因裁員而被解僱",
    spFixed: "固定期合約期滿因裁員不獲續約",
    spLayoff: "停工（lay-off）",
    lspReasonLegend: "長期服務金資格情況",
    lspDismissal: "被解僱（非裁員、非嚴重過失即時解僱）",
    lspFixed: "固定期合約期滿不獲續約",
    lspDeath: "在職期間死亡",
    lspIll: "因永久不適合現職（註冊醫生／中醫證明）而辭職",
    lspAge: "年滿65歲或以上辭職",
    draftStatus: "工資與日期不會寫入本機；關閉分頁即消失。",
    heroTotal: "估算款額",
    heroIneligible: "不符合資格",
    heroSubSp: "遣散費 SP",
    heroSubLsp: "長期服務金 LSP",
    kpiYears: "可追溯年資",
    kpiYearsPre: "轉制前年資",
    kpiYearsPost: "轉制後年資",
    kpiUnit: "每年單位（封頂後）",
    kpiPre: "轉制前部分",
    kpiPost: "轉制後部分",
    kpiCap: "總額上限",
    rowMode: "計算模式",
    modeSingle: "整段僱傭期（無橫跨轉制日）",
    modeStraddle: "橫跨轉制日（分拆兩部分）",
    rowYears: "服務年資",
    rowYearsPre: "轉制前年資",
    rowYearsPost: "轉制後年資",
    rowUnit: "每年單位",
    rowUnitPre: "轉制前每年單位",
    rowUnitPost: "轉制後每年單位",
    rowPre: "轉制前部分",
    rowPost: "轉制後部分（扣減前）",
    rowPostAdj: "轉制後部分（扣減後）",
    rowExcess: "超出上限、從轉制後扣減",
    rowTotal: "合計",
    formulaTitle: "計算步驟",
    formulaSingle:
      "每年單位 = min(工資, $22,500) × 2/3  （或以18天工資，上限$15,000）\n         = {unit}\n款額 = 每年單位 × 年資\n     = {unit} × {years}\n     = {raw}",
    formulaStraddle:
      "轉制前 = 轉制前單位 × 轉制前年資 = {unitPre} × {yearsPre} = {preRaw}\n轉制後 = 終止前單位 × 轉制後年資 = {unitPost} × {yearsPost} = {postRaw}\n合計（封頂前）= {preRaw} + {postRaw} = {beforeCap}",
    formulaCap: "總額超過 $390,000：超出部分從轉制後扣減 → 轉制後 = {postAdj}；合計 = {total}",
    formulaDailyNote: "日薪／件薪：每年單位 = min(所選18天工資總和, $15,000)。",
    formulaMonthlyNote: "月薪：每年單位 = min(月薪, $22,500) × 2/3（上限$15,000）。",
    warnBadStart: "請輸入有效入職日期（YYYY-MM-DD）。",
    warnBadEnd: "請輸入有效終止日期（YYYY-MM-DD）。",
    warnEndBeforeStart: "終止日期不能早於入職日期。",
    warnBadWage: "請輸入有效工資數字（可為0）。",
    warnNegWage: "工資不能是負數。",
    warnBadWagePre: "橫跨轉制日時，請輸入轉制前工資。",
    warnWageCapped: "月薪高於$22,500，已按上限計算每年單位。",
    warnWagePreCapped: "轉制前月薪高於$22,500，已按上限計算。",
    warnEighteenCapped: "18天工資總和高於$15,000，已按上限計算。",
    warnEighteenPreCapped: "轉制前18天工資總和高於$15,000，已按上限計算。",
    warnAvgNote: "已勾選12個月平均：請確認輸入的是平均後數字。",
    warnTotalCapped: "合計超過$390,000上限；超出部分已從轉制後部分扣減（勞工處指引）。",
    warnSpShort: "遣散費須按連續性合約受僱不少於24個月；目前年資不足，故不估算款額。",
    warnLspShort: "長期服務金須按連續性合約受僱不少於5年；目前年資不足，故不估算款額。",
    warnMpfNote:
      "本頁不估算強積金對沖。轉制前部分或仍可與僱主強積金供款權益對沖；轉制後部分不可用僱主強制性供款對沖。請用勞工處 EasyCal 核對。",
    faqTitle: "常見問題",
    faq1q: "遣散費與長期服務金可以同時攞嗎？",
    faq1a: "不可以。因裁員而獲遣散費的僱員，無權同時獲長期服務金。兩者互斥，本頁只可擇一估算。",
    faq2q: "取消對沖後，計算公式有沒有改？",
    faq2a:
      "計算方法與上限不變：月薪仍是最後一個月全月工資×2/3×年資（月薪上限$22,500，每年上限$15,000，總額上限$390,000）。改變的是：2025年5月1日起僱主不可再用強制性強積金供款對沖轉制後部分；橫跨轉制日的個案要分拆兩部分。",
    faq3q: "橫跨2025年5月1日怎樣計？",
    faq3a:
      "轉制前部分用轉制日前工資與轉制前年資；轉制後部分用終止前工資與轉制日起年資。兩部分相加若超過$390,000，超出金額從轉制後部分扣減。",
    faq4q: "誰合資格？",
    faq4a:
      "遣散費：連續性合約不少於24個月，並因裁員解僱、因裁員不獲續約或停工。長期服務金：連續性合約不少於5年，並符合被解僱（非裁員／非嚴重過失）、不獲續約、死亡、因健康辭職或年滿65歲辭職等其中一項。",
    faq5q: "這是不是勞工處官方計算機？",
    faq5a:
      "不是。請用勞工處「法定僱傭權益參考計算機」及取消對沖「EasyCal」核對。本頁只供粗略估算，不能代替法律意見或勞資審裁處裁決。",
    faq6q: "資料會上傳或儲存嗎？",
    faq6a: "不會。工資與日期只在瀏覽器記憶體運算，不寫入 localStorage，不上傳。沒有帳戶、沒有伺服器存檔。",
    sourcesTitle: "資料來源 / Sources",
    srcFaq: "勞工處 — 《僱傭條例》FAQ（遣散費／長期服務金資格與計算）：",
    srcGuide: "勞工處 — 《僱傭條例簡明指南》第十一章（PDF）：",
    srcAoa: "勞工處／專題網 — 取消強積金「對沖」安排 FAQ（轉制日、分拆、上限）：",
    srcCalc: "勞工處 — 法定僱傭權益參考計算機：",
    srcEasy: "取消對沖 — EasyCal 計算工具：",
    srcAsOf:
      "以上公式與上限於" +
      AS_OF.replace(/(\d{4})-(\d{2})-(\d{2})/, "$1年$2月$3日") +
      "核對上述官方頁（月薪上限$22,500、每年$15,000、總額$390,000、轉制日" +
      TRANSITION_YMD +
      "）。若法例或勞工處其後修訂，以官方為準。",
    privacyTitle: "私隱",
    privacyBody:
      "工資、日期與估算只在這個瀏覽器記憶體運算，不會寫入 localStorage，也不上傳。本頁不設帳號、不設後端。語言偏好可選寫入本機（不含工資數字）。",
    disclaimer:
      "只供參考，並非法例意見，亦非勞工處官方計算。 / For reference only; not legal advice and not a Labour Department tool.",
  },
  en: {
    pageTitle: "Severance / long service payment",
    docTitle: "SP / LSP estimator | Employment Ordinance Cap.57 HK",
    lede: "Estimate severance payment (SP) or long service payment (LSP) for general employees under the Employment Ordinance after abolition of MPF offsetting (transition 1 May 2025). Monthly wage ceiling HK$22,500, HK$15,000 per year of service, HK$390,000 total cap. No sign-up, nothing uploaded.",
    notice:
      "For reference only — not legal advice and not a Labour Department tool. Verify with the EO, LD Concise Guide, Statutory Employment Entitlements Reference Calculator and EasyCal. This page does not invent MPF offsetting amounts. For domestic helpers use the helper settlement tool.",
    explainTitle: "Why this tool exists",
    explainBody:
      "After abolition, employment that straddles 1 May 2025 splits into pre- and post-transition portions, and any amount above the HK$390,000 cap is deducted from the post-transition portion. LD has official calculators; this page lists eligibility checks, monthly/daily wages, the 12-month average option and the split steps for a quick cross-check.",
    demoBtn: "Straddle demo",
    demoSpBtn: "Monthly SP demo",
    demoCapBtn: "HK$390k cap demo",
    clearData: "Clear data",
    formTitle: "Employment & wages",
    entitleLegend: "Entitlement (choose one — never both)",
    entitleSp: "Severance payment (SP)",
    entitleLsp: "Long service payment (LSP)",
    wageLegend: "Wage basis",
    wageMonthly: "Monthly-paid",
    wageDaily: "Daily / piece-rated",
    datesLegend: "Period of employment",
    startDate: "Employment start date",
    endDate: "Termination / relevant date",
    datesHint: "Transition date is 1 May 2025. Spans across that date are split automatically.",
    wageFieldsLegend: "Relevant wages (HKD)",
    monthlyWage: "Last full month’s wages before termination (or 12-month average)",
    monthlyWagePre: "Last full month’s wages immediately before the transition (or 12-month average)",
    eighteenDays: "Any 18 days’ wages chosen from the last 30 normal working days before termination",
    eighteenDaysPre: "Any 18 days’ wages from the last 30 normal working days before the transition",
    useAverage: "I am using the 12-month average wages option allowed by the EO",
    useAverageHint: "This page does not compute the average for you — enter the figure you elect to use.",
    spReasonLegend: "SP qualifying situation",
    spRedundancy: "Dismissed by reason of redundancy",
    spFixed: "Fixed-term contract expired without renewal due to redundancy",
    spLayoff: "Laid off",
    lspReasonLegend: "LSP qualifying situation",
    lspDismissal: "Dismissed (not redundancy; not summary dismissal for serious misconduct)",
    lspFixed: "Fixed-term contract expired without renewal",
    lspDeath: "Died during employment",
    lspIll: "Resigned with a certificate of permanent unfitness for the present job",
    lspAge: "Aged 65 or above and resigned",
    draftStatus: "Wages and dates are not saved locally; closing the tab clears them.",
    heroTotal: "Estimated amount",
    heroIneligible: "Not eligible",
    heroSubSp: "Severance payment (SP)",
    heroSubLsp: "Long service payment (LSP)",
    kpiYears: "Reckonable years",
    kpiYearsPre: "Pre-transition years",
    kpiYearsPost: "Post-transition years",
    kpiUnit: "Year unit (after cap)",
    kpiPre: "Pre-transition portion",
    kpiPost: "Post-transition portion",
    kpiCap: "Total ceiling",
    rowMode: "Mode",
    modeSingle: "Whole employment (does not straddle transition)",
    modeStraddle: "Straddles transition (two portions)",
    rowYears: "Years of service",
    rowYearsPre: "Pre-transition years",
    rowYearsPost: "Post-transition years",
    rowUnit: "Year unit",
    rowUnitPre: "Pre-transition year unit",
    rowUnitPost: "Post-transition year unit",
    rowPre: "Pre-transition portion",
    rowPost: "Post-transition portion (before deduction)",
    rowPostAdj: "Post-transition portion (after deduction)",
    rowExcess: "Excess over cap, deducted from post",
    rowTotal: "Total",
    formulaTitle: "Steps",
    formulaSingle:
      "Year unit = min(wage, HK$22,500) × 2/3  (or 18-day sum, capped at HK$15,000)\n         = {unit}\nAmount = year unit × years\n       = {unit} × {years}\n       = {raw}",
    formulaStraddle:
      "Pre = pre unit × pre years = {unitPre} × {yearsPre} = {preRaw}\nPost = term unit × post years = {unitPost} × {yearsPost} = {postRaw}\nTotal (before cap) = {preRaw} + {postRaw} = {beforeCap}",
    formulaCap:
      "Total exceeds HK$390,000: excess is deducted from the post-transition portion → post = {postAdj}; total = {total}",
    formulaDailyNote: "Daily/piece-rated: year unit = min(chosen 18 days’ wages, HK$15,000).",
    formulaMonthlyNote: "Monthly-paid: year unit = min(monthly wage, HK$22,500) × 2/3 (cap HK$15,000).",
    warnBadStart: "Enter a valid start date (YYYY-MM-DD).",
    warnBadEnd: "Enter a valid termination date (YYYY-MM-DD).",
    warnEndBeforeStart: "Termination cannot be before the start date.",
    warnBadWage: "Enter a valid wage figure (0 is allowed).",
    warnNegWage: "Wage cannot be negative.",
    warnBadWagePre: "For a straddling employment, enter the pre-transition wage.",
    warnWageCapped: "Monthly wage is above HK$22,500; the year unit uses the ceiling.",
    warnWagePreCapped: "Pre-transition monthly wage is above HK$22,500; the ceiling applies.",
    warnEighteenCapped: "18-day wage sum is above HK$15,000; the ceiling applies.",
    warnEighteenPreCapped: "Pre-transition 18-day sum is above HK$15,000; the ceiling applies.",
    warnAvgNote: "12-month average is selected — confirm the figure you entered is the average.",
    warnTotalCapped:
      "Total exceeds the HK$390,000 cap; the excess was deducted from the post-transition portion (LD guidance).",
    warnSpShort:
      "SP needs at least 24 months under a continuous contract. Service is shorter, so no amount is estimated.",
    warnLspShort:
      "LSP needs at least 5 years under a continuous contract. Service is shorter, so no amount is estimated.",
    warnMpfNote:
      "This page does not estimate MPF offsetting. The pre-transition portion may still interact with employer MPF contributions; the post-transition portion cannot be offset by employer mandatory contributions. Cross-check with LD EasyCal.",
    faqTitle: "FAQ",
    faq1q: "Can I receive both SP and LSP?",
    faq1a: "No. An employee dismissed by reason of redundancy is eligible for SP but not LSP. The two are mutually exclusive; this page estimates only one.",
    faq2q: "Did abolition change the SP/LSP formula?",
    faq2a:
      "The calculation and ceilings are unchanged: monthly-paid employees still get two-thirds of the last full month’s wages per year of service (monthly wage ceiling HK$22,500, HK$15,000 per year, HK$390,000 total). What changed is that from 1 May 2025 employers cannot use mandatory MPF contributions to offset the post-transition portion, and straddling cases split into two portions.",
    faq3q: "How does a span across 1 May 2025 work?",
    faq3a:
      "The pre-transition portion uses wages immediately before the transition and pre-transition years; the post-transition portion uses wages before termination and years from the transition. If the sum exceeds HK$390,000, the excess is deducted from the post-transition portion.",
    faq4q: "Who is eligible?",
    faq4a:
      "SP: continuous contract of not less than 24 months, plus redundancy dismissal, non-renewal due to redundancy, or lay-off. LSP: continuous contract of not less than 5 years, plus dismissal (not redundancy / not summary dismissal), non-renewal, death, ill-health resignation, or resignation at age 65+.",
    faq5q: "Is this an official Labour Department calculator?",
    faq5a:
      "No. Use LD’s Statutory Employment Entitlements Reference Calculator and EasyCal for abolition cases. This page is a rough estimate only — not legal advice or a Labour Tribunal award.",
    faq6q: "Is anything uploaded or stored?",
    faq6a:
      "No. Wages and dates stay in browser memory only — not written to localStorage and not uploaded. No account, no server copy.",
    sourcesTitle: "Sources",
    srcFaq: "Labour Department — Employment Ordinance FAQ (SP/LSP eligibility & computation):",
    srcGuide: "Labour Department — Concise Guide to the EO, Chapter 11 (PDF):",
    srcAoa: "LD / thematic site — Abolition of MPF offsetting FAQ (transition, split, cap):",
    srcCalc: "Labour Department — Statutory Employment Entitlements Reference Calculator:",
    srcEasy: "Abolition — EasyCal calculating tool:",
    srcAsOf:
      "Formula and ceilings checked against the pages above on " +
      AS_OF +
      " (monthly ceiling HK$22,500, HK$15,000 per year, HK$390,000 total, transition " +
      TRANSITION_YMD +
      "). Later LD / Gazette changes prevail.",
    privacyTitle: "Privacy",
    privacyBody:
      "Wages, dates and estimates stay in this browser’s memory only — not written to localStorage and not uploaded. No account, no backend. Language preference may be saved locally (no wage figures).",
    disclaimer:
      "For reference only; not legal advice and not a Labour Department tool. / 只供參考，並非法例意見，亦非勞工處官方計算。",
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
  next.startDate = $("start-date").value;
  next.endDate = $("end-date").value;
  next.monthlyWage = $("monthly-wage").value === "" ? "" : Number($("monthly-wage").value);
  next.monthlyWagePre =
    $("monthly-wage-pre").value === "" ? "" : Number($("monthly-wage-pre").value);
  next.eighteenDays = $("eighteen-days").value === "" ? "" : Number($("eighteen-days").value);
  next.eighteenDaysPre =
    $("eighteen-days-pre").value === "" ? "" : Number($("eighteen-days-pre").value);
  next.useAverage = $("use-average").checked;
  next.spReason = $("sp-reason").value;
  next.lspReason = $("lsp-reason").value;
  return next;
}

function writeForm(settings) {
  $("start-date").value = settings.startDate || "";
  $("end-date").value = settings.endDate || "";
  $("monthly-wage").value = settings.monthlyWage;
  $("monthly-wage-pre").value = settings.monthlyWagePre;
  $("eighteen-days").value = settings.eighteenDays;
  $("eighteen-days-pre").value = settings.eighteenDaysPre;
  $("use-average").checked = !!settings.useAverage;
  $("sp-reason").value = settings.spReason || "redundancy";
  $("lsp-reason").value = settings.lspReason || "dismissal";
  syncChrome(settings);
}

function syncChrome(settings) {
  var entitles = document.querySelectorAll(".entitle");
  for (var i = 0; i < entitles.length; i++) {
    var e = entitles[i].getAttribute("data-entitle");
    entitles[i].setAttribute("aria-pressed", e === settings.entitlement ? "true" : "false");
  }
  var wages = document.querySelectorAll(".wage-type");
  for (var j = 0; j < wages.length; j++) {
    var w = wages[j].getAttribute("data-wage");
    wages[j].setAttribute("aria-pressed", w === settings.wageType ? "true" : "false");
  }
  var monthly = settings.wageType === "monthly";
  $("monthly-fields").hidden = !monthly;
  $("daily-fields").hidden = monthly;
  $("sp-reason-wrap").hidden = settings.entitlement !== "sp";
  $("lsp-reason-wrap").hidden = settings.entitlement !== "lsp";

  // Show pre-transition wage when dates likely straddle (start < transition ≤ end).
  var showPre = false;
  if (settings.startDate && settings.endDate) {
    showPre = settings.startDate < TRANSITION_YMD && settings.endDate >= TRANSITION_YMD;
  }
  $("monthly-pre-field").hidden = !showPre || !monthly;
  $("daily-pre-field").hidden = !showPre || monthly;
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
    badStart: t.warnBadStart,
    badEnd: t.warnBadEnd,
    endBeforeStart: t.warnEndBeforeStart,
    badWage: t.warnBadWage,
    negWage: t.warnNegWage,
    badWagePre: t.warnBadWagePre,
    wageCapped: t.warnWageCapped,
    wagePreCapped: t.warnWagePreCapped,
    eighteenCapped: t.warnEighteenCapped,
    eighteenPreCapped: t.warnEighteenPreCapped,
    avgNote: t.warnAvgNote,
    totalCapped: t.warnTotalCapped,
    spShortService: t.warnSpShort,
    lspShortService: t.warnLspShort,
    mpfOffsetNote: t.warnMpfNote,
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
    unit: formatMoney(result.unitTerm, 2),
    unitPre: formatMoney(result.unitPre, 2),
    unitPost: formatMoney(result.unitTerm, 2),
    years: formatNum(result.yearsTotal, 2),
    yearsPre: formatNum(result.yearsPre, 2),
    yearsPost: formatNum(result.yearsPost, 2),
    raw: formatMoney(result.mode === "straddle" ? result.totalBeforeCap : result.singleRaw, 2),
    preRaw: formatMoney(result.preRaw, 2),
    postRaw: formatMoney(result.postRaw, 2),
    beforeCap: formatMoney(result.totalBeforeCap, 2),
    postAdj: formatMoney(result.postAmount, 2),
    total: formatMoney(result.total, 2),
  };
  var blocks = [
    result.wageType === "daily" ? t.formulaDailyNote : t.formulaMonthlyNote,
  ];
  if (result.mode === "straddle") {
    blocks.push(fill(t.formulaStraddle, vars));
    if (result.capApplied) blocks.push(fill(t.formulaCap, vars));
  } else {
    blocks.push(fill(t.formulaSingle, vars));
    if (result.capApplied) {
      blocks.push(
        fill(t.formulaCap, {
          postAdj: formatMoney(result.total, 2),
          total: formatMoney(result.total, 2),
        })
      );
    }
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

  if (result.ok) {
    $("hero-label").textContent = t.heroTotal;
    $("hero-amount").textContent = formatMoney(result.total, 2);
    $("hero-sub").textContent =
      (result.entitlement === "lsp" ? t.heroSubLsp : t.heroSubSp) +
      " · " +
      (result.mode === "straddle" ? t.modeStraddle : t.modeSingle);
  } else if (
    result.warnings.indexOf("spShortService") !== -1 ||
    result.warnings.indexOf("lspShortService") !== -1
  ) {
    $("hero-label").textContent = t.heroIneligible;
    $("hero-amount").textContent = "—";
    $("hero-sub").textContent =
      result.entitlement === "lsp" ? t.warnLspShort : t.warnSpShort;
  } else {
    $("hero-label").textContent = t.heroTotal;
    $("hero-amount").textContent = "—";
    $("hero-sub").textContent = "";
  }

  var cards = [];
  if (result.mode === "straddle") {
    cards.push(kpiCard(t.kpiYearsPre, formatNum(result.yearsPre, 2)));
    cards.push(kpiCard(t.kpiYearsPost, formatNum(result.yearsPost, 2)));
    cards.push(kpiCard(t.kpiPre, result.ok ? formatMoney(result.preAmount, 2) : "—"));
    cards.push(kpiCard(t.kpiPost, result.ok ? formatMoney(result.postAmount, 2) : "—"));
  } else {
    cards.push(kpiCard(t.kpiYears, formatNum(result.yearsTotal, 2)));
    cards.push(kpiCard(t.kpiUnit, result.ok ? formatMoney(result.unitTerm, 2) : "—"));
  }
  cards.push(kpiCard(t.kpiCap, formatMoney(TOTAL_CAP, 0)));
  $("kpis").innerHTML = cards.join("");

  var rows = [];
  if (result.ok || result.yearsTotal > 0) {
    rows.push(
      rowHtml(t.rowMode, result.mode === "straddle" ? t.modeStraddle : t.modeSingle)
    );
    if (result.mode === "straddle") {
      rows.push(rowHtml(t.rowYearsPre, formatNum(result.yearsPre, 2)));
      rows.push(rowHtml(t.rowYearsPost, formatNum(result.yearsPost, 2)));
      rows.push(rowHtml(t.rowUnitPre, formatMoney(result.unitPre, 2)));
      rows.push(rowHtml(t.rowUnitPost, formatMoney(result.unitTerm, 2)));
      if (result.ok) {
        rows.push(rowHtml(t.rowPre, formatMoney(result.preAmount, 2)));
        if (result.capApplied) {
          rows.push(rowHtml(t.rowPost, formatMoney(result.postRaw, 2)));
          rows.push(rowHtml(t.rowExcess, formatMoney(result.excessDeducted, 2)));
          rows.push(rowHtml(t.rowPostAdj, formatMoney(result.postAmount, 2)));
        } else {
          rows.push(rowHtml(t.rowPostAdj, formatMoney(result.postAmount, 2)));
        }
        rows.push(rowHtml(t.rowTotal, formatMoney(result.total, 2), true));
      }
    } else {
      rows.push(rowHtml(t.rowYears, formatNum(result.yearsTotal, 2)));
      rows.push(rowHtml(t.rowUnit, formatMoney(result.unitTerm, 2)));
      if (result.ok) {
        rows.push(rowHtml(t.rowTotal, formatMoney(result.total, 2), true));
      }
    }
  }
  $("breakdown").innerHTML = rows.length
    ? "<tbody>" + rows.join("") + "</tbody>"
    : "";

  $("formula").textContent = formulaText(result);
  warnHtml(result);
}

function syncFromForm() {
  var entitlement = state.settings.entitlement;
  var wageType = state.settings.wageType;
  state.settings = readForm();
  state.settings.entitlement = entitlement;
  state.settings.wageType = wageType;
  render();
}

function setEntitle(entitlement) {
  state.settings.entitlement = entitlement === "lsp" ? "lsp" : "sp";
  writeForm(state.settings);
  render();
}

function setWageType(wageType) {
  state.settings.wageType = wageType === "daily" ? "daily" : "monthly";
  writeForm(state.settings);
  render();
}

function init() {
  state.lang = readLang();
  state.settings = emptySettings();
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

  $("sp-form").addEventListener("input", syncFromForm);
  $("sp-form").addEventListener("change", syncFromForm);

  var entitles = document.querySelectorAll(".entitle");
  for (var i = 0; i < entitles.length; i++) {
    entitles[i].addEventListener("click", function () {
      setEntitle(this.getAttribute("data-entitle"));
    });
  }
  var wages = document.querySelectorAll(".wage-type");
  for (var j = 0; j < wages.length; j++) {
    wages[j].addEventListener("click", function () {
      setWageType(this.getAttribute("data-wage"));
    });
  }

  $("demo-btn").addEventListener("click", function () {
    state.settings = demoStraddle();
    writeForm(state.settings);
    render();
  });
  $("demo-sp-btn").addEventListener("click", function () {
    state.settings = demoMonthlySp();
    writeForm(state.settings);
    render();
  });
  $("demo-cap-btn").addEventListener("click", function () {
    state.settings = demoCap();
    writeForm(state.settings);
    render();
  });
  $("clear-data").addEventListener("click", function () {
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
