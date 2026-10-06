(function () {
  "use strict";

  var STORAGE_KEY = "hk-helper-receipt:v1";
  var MAW_NEW = 5220;
  var MAW_OLD = 5100;
  var MAW_CUTOVER = "2026-10-03";
  var FOOD_MIN = 1236;

  var EN_MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  var ZH_MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  var I18N = {
    zh: {
      pageTitle: "外傭工資收據產生器",
      lede: "對準勞工處外傭工資收據樣本，在瀏覽器填寫、預覽、列印或另存 PDF，並記下全年休息日與勞工假。不用註冊，不會上傳。",
      notice:
        "僅供參考，以勞工處及標準僱傭合約為準 / For reference only; the Labour Department and Standard Employment Contract prevail.",
      clearData: "清除資料 / Clear data",
      formTitle: "收據資料",
      whoLegend: "僱主與外傭",
      employerName: "僱主姓名",
      helperName: "外傭姓名",
      helperId: "外傭香港身份證／護照號碼（可選）",
      contractStart: "合約開始日期",
      witnessName: "見證人姓名（可選）",
      wageLegend: "工資與膳食",
      wage: "每月工資（港元）",
      foodLegend: "膳食安排",
      foodProvided: "僱主提供免費膳食",
      foodAllowancePaid: "不提供膳食，支付膳食津貼",
      foodAllowance: "膳食津貼（港元）",
      foodHint: "不提供膳食時，現時不少於 HK$1,236。",
      mawLegend: "適用最低工資（以簽約日為準）",
      mawNew: "2026年10月3日或之後簽約 · HK$5,220",
      mawOld: "2026年10月3日之前簽約 · HK$5,100",
      periodLegend: "工資期與付款",
      periodMonth: "工資月份",
      periodFrom: "工資期由",
      periodTo: "工資期至",
      payDate: "付款日期",
      payHint: "工資須在工資期屆滿後7天內支付。",
      payMethod: "付款方式",
      methodBank: "銀行轉帳／自動轉帳",
      methodCash: "現金",
      methodCheque: "支票",
      bankRef: "銀行參考編號（可選）",
      chequeRef: "支票號碼（可選）",
      leaveLegend: "本月假期日數",
      restDays: "休息日",
      statDays: "法定假日（勞工假）",
      annualDays: "年假",
      restHint: "僱傭條例：每7天至少1個休息日。",
      otherLegend: "其他款項與備註（可選）",
      otherDesc: "其他項目說明（例如 stat. holiday pay、報銷）",
      otherAmount: "其他項目金額（港元）",
      notes: "備註",
      leaveLogTitle: "全年假期紀錄",
      leaveLogLead: "按月記下休息日、法定假日與年假，只存在本機，可匯出 CSV。",
      leaveYear: "年份",
      exportCsv: "匯出 CSV",
      colMonth: "月份",
      colRest: "休息日",
      colStat: "法定假日",
      colAnnual: "年假",
      colTotal: "合計",
      holTitle: "香港法定假日（勞工假）",
      holLead: "資料來自勞工處公布。",
      printBtn: "列印／另存 PDF",
      gen12: "產生全年12張",
      singleMonth: "返回單月",
      faqTitle: "常見問題",
      faq1q: "外傭工資收據要寫甚麼？",
      faq1a: "勞工處樣本包括外傭姓名、身份證／護照號碼、僱主、收款日期、付款方式、該期工資及起迄、不提供膳食時的膳食津貼，以及收款人與見證人簽署。本頁可加其他款項、銀行參考編號與該月假期日數。",
      faq2q: "最低工資幾多？",
      faq2a: "以簽訂標準僱傭合約當日的規定最低工資為準。2026年10月3日或之後簽約為每月 HK$5,220；該日前簽約仍用當時水平（2025年9月30日至2026年10月2日簽約者為 HK$5,100）。",
      faq3q: "膳食津貼幾多？",
      faq3a: "合約要求免費提供膳食；若不提供而改付津貼，現時不少於每月 HK$1,236。",
      faq4q: "幾時要出糧？",
      faq4a: "工資於工資期最後一天到期，須盡快支付，不得遲於期滿後7天。勞工處建議銀行轉帳，並每月保留已簽署收據。",
      faq5q: "資料會上傳嗎？",
      faq5a: "不會。全部只在你的瀏覽器運算，並可選擇寫入本機 localStorage，方便下次開啟。沒有帳戶、沒有伺服器存檔。",
      privacyTitle: "私隱",
      privacyBody: "姓名、身份證號碼、工資與假期只留在這個瀏覽器（localStorage）。本頁不上傳、不設帳號、不設後端。列印或匯出 CSV 才會在你選擇的位置產生檔案。",
      disclaimer: "僅供參考，以勞工處及標準僱傭合約為準 / For reference only; the Labour Department and Standard Employment Contract prevail.",
      backHome: "← 返回短訊記帳CSV",
      source: "開源靜態頁，原始碼在",
      footerFine: "不是勞工處、入境處或任何政府部門的官方工具。數字會隨政府公布改動，請自行核對。",
      mode12: "預覽：由所選月份起連續 12 張。列印時每張一頁。",
      mode1: "",
    },
    en: {
      pageTitle: "HK Domestic Helper Wage Receipt Generator",
      lede: "Fill in a Labour Department–style FDH wage receipt, preview it, print or save as PDF, and keep a yearly leave log. No sign-up. Nothing is uploaded.",
      notice:
        "For reference only; the Labour Department and Standard Employment Contract prevail. / 僅供參考，以勞工處及標準僱傭合約為準",
      clearData: "Clear data / 清除資料",
      formTitle: "Receipt details",
      whoLegend: "Employer and helper",
      employerName: "Employer name",
      helperName: "Helper name",
      helperId: "Helper HKID / passport no. (optional)",
      contractStart: "Contract start date",
      witnessName: "Witness name (optional)",
      wageLegend: "Wage and food",
      wage: "Monthly wage (HK$)",
      foodLegend: "Food arrangement",
      foodProvided: "Employer provides free food",
      foodAllowancePaid: "No food provided; food allowance paid",
      foodAllowance: "Food allowance (HK$)",
      foodHint: "If food is not provided, the current minimum is HK$1,236.",
      mawLegend: "Applicable minimum allowable wage (as at contract date)",
      mawNew: "Contract on/after 3 Oct 2026 · HK$5,220",
      mawOld: "Contract before 3 Oct 2026 · HK$5,100",
      periodLegend: "Wage period and payment",
      periodMonth: "Wage month",
      periodFrom: "Period from",
      periodTo: "Period to",
      payDate: "Payment date",
      payHint: "Wages must be paid within 7 days after the period ends.",
      payMethod: "Payment method",
      methodBank: "Bank transfer / autopay",
      methodCash: "Cash",
      methodCheque: "Cheque",
      bankRef: "Bank reference no. (optional)",
      chequeRef: "Cheque no. (optional)",
      leaveLegend: "Leave days this month",
      restDays: "Rest days",
      statDays: "Statutory holidays",
      annualDays: "Annual leave",
      restHint: "Employment Ordinance: at least 1 rest day in every 7 days.",
      otherLegend: "Other items and notes (optional)",
      otherDesc: "Other item (e.g. reimbursement, statutory holiday pay)",
      otherAmount: "Other amount (HK$)",
      notes: "Notes",
      leaveLogTitle: "Yearly leave log",
      leaveLogLead: "Rest days, statutory holidays and annual leave by month. Stored only on this device. Export to CSV.",
      leaveYear: "Year",
      exportCsv: "Export CSV",
      colMonth: "Month",
      colRest: "Rest days",
      colStat: "Statutory holidays",
      colAnnual: "Annual leave",
      colTotal: "Total",
      holTitle: "Hong Kong statutory holidays",
      holLead: "From Labour Department notices.",
      printBtn: "Print / Save as PDF",
      gen12: "Generate 12 months",
      singleMonth: "Back to one month",
      faqTitle: "FAQ",
      faq1q: "What goes on an FDH wage receipt?",
      faq1a: "The LD sample includes helper name, HKID/passport no., employer, payment date, method, wages for the period, food allowance if food is not provided, and signatures of the payee and a witness (if any). This page can add other items, a bank reference, and leave counts.",
      faq2q: "What is the minimum wage?",
      faq2a: "The Minimum Allowable Wage is the rate prevailing when the Standard Employment Contract is signed. HK$5,220 for contracts signed on or after 3 Oct 2026; earlier contracts keep the rate then in force (HK$5,100 if signed 30 Sep 2025–2 Oct 2026).",
      faq3q: "How much is the food allowance?",
      faq3a: "The contract requires free food. If food is not provided, the allowance is currently not less than HK$1,236 a month.",
      faq4q: "When must wages be paid?",
      faq4a: "Wages become due on the last day of the wage period and must be paid as soon as practicable, and in any case within 7 days. LD advises bank transfer and a signed monthly receipt.",
      faq5q: "Is anything uploaded?",
      faq5a: "No. Everything runs in your browser and may be saved to localStorage on this device only. There is no account and no server copy.",
      privacyTitle: "Privacy",
      privacyBody: "Names, ID numbers, wages and leave stay in this browser (localStorage). Nothing is uploaded. A file is created only when you print or export CSV.",
      disclaimer: "For reference only; the Labour Department and Standard Employment Contract prevail. / 僅供參考，以勞工處及標準僱傭合約為準",
      backHome: "← Back to SMS ledger",
      source: "Open-source static page. Source on",
      footerFine: "Not an official Labour Department, ImmD or government tool. Figures change when the Government announces updates — please check.",
      mode12: "Preview: 12 consecutive receipts from the selected month. Each prints on its own page.",
      mode1: "",
    },
  };

  var HOLIDAYS = {
    2026: {
      note: {
        zh: "2026年起新增復活節星期一為法定假日（《2021年僱傭（修訂）條例》）。來源：labour.gov.hk。",
        en: "Easter Monday is a statutory holiday from 2026 (Employment (Amendment) Ordinance 2021). Source: labour.gov.hk.",
      },
      items: [
        { zh: "1月1日", en: "The first day of January", date: "1 Jan" },
        { zh: "農曆年初一", en: "Lunar New Year’s Day", date: "17 Feb" },
        { zh: "農曆年初二", en: "The second day of LNY", date: "18 Feb" },
        { zh: "農曆年初三", en: "The third day of LNY", date: "19 Feb" },
        { zh: "清明節", en: "Ching Ming Festival", date: "5 Apr" },
        { zh: "復活節星期一", en: "Easter Monday", date: "6 Apr" },
        { zh: "勞動節", en: "Labour Day", date: "1 May" },
        { zh: "佛誕", en: "The Birthday of the Buddha", date: "24 May" },
        { zh: "端午節", en: "Tuen Ng Festival", date: "19 Jun" },
        { zh: "香港特別行政區成立紀念日", en: "HKSAR Establishment Day", date: "1 Jul" },
        { zh: "中秋節翌日", en: "The day following the Chinese Mid-Autumn Festival", date: "26 Sep" },
        { zh: "國慶日", en: "National Day", date: "1 Oct" },
        { zh: "重陽節", en: "Chung Yeung Festival", date: "18 Oct" },
        { zh: "冬節或聖誕節（由僱主選擇）", en: "Winter Solstice or Christmas Day (employer’s choice)", date: "22 or 25 Dec" },
        { zh: "聖誕節後第一個周日", en: "The first weekday after Christmas Day", date: "26 Dec" },
      ],
    },
    2027: {
      note: {
        zh: "2027年農曆年初二（2月7日）適逢星期日，法定假日改為農曆年初四（2月9日）。來源：labour.gov.hk。",
        en: "LNY day 2 (7 Feb 2027) falls on a Sunday, so the statutory holiday is substituted by LNY day 4 (9 Feb). Source: labour.gov.hk.",
      },
      items: [
        { zh: "1月1日", en: "The first day of January", date: "1 Jan" },
        { zh: "農曆年初一", en: "Lunar New Year’s Day", date: "6 Feb" },
        { zh: "農曆年初三", en: "The third day of LNY", date: "8 Feb" },
        { zh: "農曆年初四（替代年初二）", en: "The fourth day of LNY (substitutes day 2)", date: "9 Feb" },
        { zh: "復活節星期一", en: "Easter Monday", date: "29 Mar" },
        { zh: "清明節", en: "Ching Ming Festival", date: "5 Apr" },
        { zh: "勞動節", en: "Labour Day", date: "1 May" },
        { zh: "佛誕", en: "The Birthday of the Buddha", date: "13 May" },
        { zh: "端午節", en: "Tuen Ng Festival", date: "9 Jun" },
        { zh: "香港特別行政區成立紀念日", en: "HKSAR Establishment Day", date: "1 Jul" },
        { zh: "中秋節翌日", en: "The day following the Chinese Mid-Autumn Festival", date: "16 Sep" },
        { zh: "國慶日", en: "National Day", date: "1 Oct" },
        { zh: "重陽節", en: "Chung Yeung Festival", date: "8 Oct" },
        { zh: "冬節或聖誕節（由僱主選擇）", en: "Winter Solstice or Christmas Day (employer’s choice)", date: "22 or 25 Dec" },
        { zh: "聖誕節後第一個周日", en: "The first weekday after Christmas Day", date: "27 Dec" },
      ],
    },
  };

  var CN_DIGITS = ["零", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖"];
  var ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  var TEENS = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  var TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function sectionToChinese(n) {
    var units = ["", "拾", "佰", "仟"];
    var s = "";
    var zero = false;
    var str = String(n).padStart(4, "0");
    for (var i = 0; i < 4; i++) {
      var d = Number(str.charAt(i));
      var unitIndex = 3 - i;
      if (d === 0) {
        if (s.length) zero = true;
      } else {
        if (zero) s += "零";
        s += CN_DIGITS[d] + units[unitIndex];
        zero = false;
      }
    }
    return s;
  }

  function integerToChineseUpper(n) {
    if (n === 0) return "零";
    var sections = [];
    var x = n;
    while (x > 0) {
      sections.push(x % 10000);
      x = Math.floor(x / 10000);
    }
    var sectionUnits = ["", "萬", "億", "兆"];
    var result = "";
    var pendingZero = false;
    for (var i = sections.length - 1; i >= 0; i--) {
      var section = sections[i];
      if (section === 0) {
        if (result) pendingZero = true;
        continue;
      }
      if (pendingZero) result += "零";
      result += sectionToChinese(section) + sectionUnits[i];
      pendingZero = section < 1000 && i > 0;
    }
    return result;
  }

  function toChineseUpper(amount) {
    var n = Number(amount);
    if (!isFinite(n) || n < 0) n = 0;
    var rounded = Math.round(n * 100) / 100;
    var dollars = Math.floor(rounded + 1e-9);
    var cents = Math.round((rounded - dollars) * 100);
    if (cents === 100) {
      dollars += 1;
      cents = 0;
    }
    var jiao = Math.floor(cents / 10);
    var fen = cents % 10;
    var s = integerToChineseUpper(dollars) + "元";
    if (cents === 0) return s + "正";
    if (jiao) s += CN_DIGITS[jiao] + "角";
    else if (fen) s += "零";
    if (fen) s += CN_DIGITS[fen] + "分";
    return s;
  }

  function chunkToEnglish(n) {
    var parts = [];
    var hundred = Math.floor(n / 100);
    var rest = n % 100;
    if (hundred) parts.push(ONES[hundred] + " Hundred");
    if (rest >= 10 && rest < 20) {
      parts.push(TEENS[rest - 10]);
    } else {
      var ten = Math.floor(rest / 10);
      var one = rest % 10;
      if (ten) parts.push(TENS[ten]);
      if (one) parts.push(ONES[one]);
    }
    return parts.join(" ");
  }

  function integerToEnglish(n) {
    if (n === 0) return "Zero";
    var scales = ["", "Thousand", "Million", "Billion"];
    var parts = [];
    var i = 0;
    var x = n;
    while (x > 0) {
      var chunk = x % 1000;
      if (chunk) {
        var words = chunkToEnglish(chunk);
        if (scales[i]) words += " " + scales[i];
        parts.unshift(words);
      }
      x = Math.floor(x / 1000);
      i += 1;
    }
    return parts.join(" ");
  }

  function toEnglishWords(amount) {
    var n = Number(amount);
    if (!isFinite(n) || n < 0) n = 0;
    var rounded = Math.round(n * 100) / 100;
    var dollars = Math.floor(rounded + 1e-9);
    var cents = Math.round((rounded - dollars) * 100);
    if (cents === 100) {
      dollars += 1;
      cents = 0;
    }
    var s = integerToEnglish(dollars) + (dollars === 1 ? " Hong Kong Dollar" : " Hong Kong Dollars");
    if (cents) {
      s += " and " + integerToEnglish(cents) + (cents === 1 ? " Cent" : " Cents");
    }
    return s + " Only";
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function blankOr(text) {
    var t = String(text == null ? "" : text).trim();
    return t ? escapeHtml(t) : '<span class="blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function todayIso() {
    var d = new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function monthBounds(ym) {
    var parts = String(ym || "").split("-");
    var y = Number(parts[0]);
    var m = Number(parts[1]);
    if (!y || !m) {
      var t = new Date();
      y = t.getFullYear();
      m = t.getMonth() + 1;
      ym = y + "-" + pad2(m);
    }
    var last = new Date(y, m, 0).getDate();
    return { ym: ym, from: ym + "-01", to: ym + "-" + pad2(last), year: y, month: m, last: last };
  }

  function addMonths(ym, offset) {
    var parts = String(ym).split("-");
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1 + offset, 1);
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1);
  }

  function parseIso(iso) {
    if (!iso) return null;
    var p = String(iso).split("-");
    if (p.length < 3) return null;
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function formatDateZh(iso) {
    if (!iso) return "________";
    var p = String(iso).split("-");
    return Number(p[0]) + "年" + Number(p[1]) + "月" + Number(p[2]) + "日";
  }

  function formatDateEn(iso) {
    if (!iso) return "________";
    var p = String(iso).split("-").map(Number);
    return p[2] + " " + EN_MONTHS[p[1] - 1] + " " + p[0];
  }

  function daysBetween(fromIso, toIso) {
    var a = parseIso(fromIso);
    var b = parseIso(toIso);
    if (!a || !b) return 0;
    return Math.round((b - a) / 86400000);
  }

  function inclusiveDays(fromIso, toIso) {
    return daysBetween(fromIso, toIso) + 1;
  }

  function addDaysIso(iso, days) {
    var d = parseIso(iso);
    if (!d) return "";
    d.setDate(d.getDate() + days);
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function formatHKD(n) {
    var x = Number(n);
    if (!isFinite(x)) x = 0;
    var neg = x < 0;
    x = Math.abs(x);
    var parts = x.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (neg ? "-" : "") + "HK$" + parts.join(".");
  }

  function num(v, fallback) {
    var n = Number(v);
    return isFinite(n) ? n : fallback;
  }

  var state = {
    lang: "zh",
    mode12: false,
    holYear: 2027,
    leave: {},
    suppressSave: false,
  };

  var els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function cacheEls() {
    els.form = $("receipt-form");
    els.employer = $("employer-name");
    els.helper = $("helper-name");
    els.helperId = $("helper-id");
    els.contract = $("contract-start");
    els.witness = $("witness-name");
    els.wage = $("wage");
    els.foodAllowance = $("food-allowance");
    els.periodMonth = $("period-month");
    els.periodFrom = $("period-from");
    els.periodTo = $("period-to");
    els.payDate = $("pay-date");
    els.payMethod = $("pay-method");
    els.bankRef = $("bank-ref");
    els.bankRefLabel = $("bank-ref-label");
    els.rest = $("rest-days");
    els.stat = $("stat-days");
    els.annual = $("annual-days");
    els.otherDesc = $("other-desc");
    els.otherAmount = $("other-amount");
    els.notes = $("notes");
    els.warnings = $("warnings");
    els.receipts = $("receipts");
    els.leaveYear = $("leave-year");
    els.leaveBody = $("leave-body");
    els.holList = $("hol-list");
    els.holNote = $("hol-note");
    els.modeLabel = $("preview-mode-label");
    els.singleBtn = $("single-btn");
  }

  function foodMode() {
    var checked = document.querySelector('input[name="foodMode"]:checked');
    return checked ? checked.value : "provided";
  }

  function mawRule() {
    var checked = document.querySelector('input[name="mawRule"]:checked');
    return checked ? checked.value : "5220";
  }

  function setRadio(name, value) {
    var nodes = document.querySelectorAll('input[name="' + name + '"]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].checked = nodes[i].value === value;
    }
  }

  function readForm() {
    var food = foodMode();
    var wage = num(els.wage.value, 0);
    var foodAmt = food === "allowance" ? num(els.foodAllowance.value, 0) : 0;
    var otherAmt = num(els.otherAmount.value, 0);
    return {
      employerName: els.employer.value.trim(),
      helperName: els.helper.value.trim(),
      helperId: els.helperId.value.trim(),
      contractStart: els.contract.value,
      witnessName: els.witness.value.trim(),
      wage: wage,
      foodMode: food,
      foodAllowance: num(els.foodAllowance.value, FOOD_MIN),
      foodAmt: foodAmt,
      mawRule: mawRule(),
      periodMonth: els.periodMonth.value,
      periodFrom: els.periodFrom.value,
      periodTo: els.periodTo.value,
      payDate: els.payDate.value,
      payMethod: els.payMethod.value,
      bankRef: els.bankRef.value.trim(),
      restDays: Math.max(0, Math.round(num(els.rest.value, 0))),
      statDays: Math.max(0, Math.round(num(els.stat.value, 0))),
      annualDays: Math.max(0, Math.round(num(els.annual.value, 0))),
      otherDesc: els.otherDesc.value.trim(),
      otherAmount: otherAmt,
      notes: els.notes.value.trim(),
    };
  }

  function applyForm(data) {
    if (!data) return;
    state.suppressSave = true;
    els.employer.value = data.employerName || "";
    els.helper.value = data.helperName || "";
    els.helperId.value = data.helperId || "";
    els.contract.value = data.contractStart || "";
    els.witness.value = data.witnessName || "";
    els.wage.value = data.wage != null && data.wage !== "" ? data.wage : "";
    setRadio("foodMode", data.foodMode || "provided");
    els.foodAllowance.value = data.foodAllowance != null ? data.foodAllowance : FOOD_MIN;
    setRadio("mawRule", data.mawRule || "5220");
    els.periodMonth.value = data.periodMonth || "";
    els.periodFrom.value = data.periodFrom || "";
    els.periodTo.value = data.periodTo || "";
    els.payDate.value = data.payDate || "";
    els.payMethod.value = data.payMethod || "bank";
    els.bankRef.value = data.bankRef || "";
    els.rest.value = data.restDays != null ? data.restDays : 4;
    els.stat.value = data.statDays != null ? data.statDays : 0;
    els.annual.value = data.annualDays != null ? data.annualDays : 0;
    els.otherDesc.value = data.otherDesc || "";
    els.otherAmount.value = data.otherAmount != null ? data.otherAmount : 0;
    els.notes.value = data.notes || "";
    state.suppressSave = false;
  }

  function defaultForm() {
    var t = todayIso();
    var ym = t.slice(0, 7);
    var b = monthBounds(ym);
    return {
      employerName: "",
      helperName: "",
      helperId: "",
      contractStart: "",
      witnessName: "",
      wage: MAW_NEW,
      foodMode: "provided",
      foodAllowance: FOOD_MIN,
      mawRule: "5220",
      periodMonth: ym,
      periodFrom: b.from,
      periodTo: b.to,
      payDate: t,
      payMethod: "bank",
      bankRef: "",
      restDays: 4,
      statDays: 0,
      annualDays: 0,
      otherDesc: "",
      otherAmount: 0,
      notes: "",
    };
  }

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveStore() {
    if (state.suppressSave) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lang: state.lang,
          form: readForm(),
          leave: state.leave,
          holYear: state.holYear,
        })
      );
    } catch (e) {
      /* private mode or quota */
    }
  }

  function applyI18n() {
    var pack = I18N[state.lang] || I18N.zh;
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-i18n");
      if (pack[key] != null) nodes[i].textContent = pack[key];
    }
    $("lang-zh").setAttribute("aria-pressed", state.lang === "zh" ? "true" : "false");
    $("lang-en").setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
    updateRefLabel();
    renderHolidays();
    renderLeaveTable();
    els.modeLabel.textContent = state.mode12 ? pack.mode12 : pack.mode1;
  }

  function updateRefLabel() {
    var pack = I18N[state.lang] || I18N.zh;
    els.bankRefLabel.textContent = els.payMethod.value === "cheque" ? pack.chequeRef : pack.bankRef;
  }

  function methodLabel(code) {
    if (code === "cash") return { zh: "現金", en: "cash" };
    if (code === "cheque") return { zh: "支票", en: "cheque" };
    return { zh: "銀行轉帳／自動轉帳", en: "bank transfer / autopay" };
  }

  function leaveFor(year, month) {
    var y = state.leave[String(year)] || {};
    var row = y[String(month)] || {};
    return {
      rest: Math.max(0, Math.round(num(row.rest, 0))),
      statutory: Math.max(0, Math.round(num(row.statutory, 0))),
      annual: Math.max(0, Math.round(num(row.annual, 0))),
    };
  }

  function setLeave(year, month, rest, statutory, annual) {
    var yk = String(year);
    var mk = String(month);
    if (!state.leave[yk]) state.leave[yk] = {};
    state.leave[yk][mk] = { rest: rest, statutory: statutory, annual: annual };
  }

  function syncFormLeaveToLog() {
    var data = readForm();
    var b = monthBounds(data.periodMonth || (data.periodFrom || "").slice(0, 7));
    setLeave(b.year, b.month, data.restDays, data.statDays, data.annualDays);
  }

  function syncLogToFormIfSameMonth() {
    var data = readForm();
    var b = monthBounds(data.periodMonth || (data.periodFrom || "").slice(0, 7));
    if (Number(els.leaveYear.value) !== b.year) return;
    var row = leaveFor(b.year, b.month);
    state.suppressSave = true;
    els.rest.value = row.rest;
    els.stat.value = row.statutory;
    els.annual.value = row.annual;
    state.suppressSave = false;
  }

  function renderLeaveTable() {
    var year = Number(els.leaveYear.value) || new Date().getFullYear();
    var frag = document.createDocumentFragment();
    var sumR = 0;
    var sumS = 0;
    var sumA = 0;
    for (var m = 1; m <= 12; m++) {
      var row = leaveFor(year, m);
      sumR += row.rest;
      sumS += row.statutory;
      sumA += row.annual;
      var tr = document.createElement("tr");
      var monthName = state.lang === "en" ? EN_MONTHS[m - 1] : ZH_MONTHS[m - 1];
      tr.innerHTML =
        "<th scope=\"row\">" +
        escapeHtml(monthName) +
        "</th>" +
        '<td><input data-leave="rest" data-month="' +
        m +
        '" type="number" inputmode="numeric" min="0" step="1" value="' +
        row.rest +
        '" aria-label="' +
        escapeHtml(monthName) +
        " rest\"></td>" +
        '<td><input data-leave="statutory" data-month="' +
        m +
        '" type="number" inputmode="numeric" min="0" step="1" value="' +
        row.statutory +
        '" aria-label="' +
        escapeHtml(monthName) +
        " statutory\"></td>" +
        '<td><input data-leave="annual" data-month="' +
        m +
        '" type="number" inputmode="numeric" min="0" step="1" value="' +
        row.annual +
        '" aria-label="' +
        escapeHtml(monthName) +
        " annual\"></td>";
      frag.appendChild(tr);
    }
    els.leaveBody.innerHTML = "";
    els.leaveBody.appendChild(frag);
    $("leave-sum-rest").textContent = String(sumR);
    $("leave-sum-stat").textContent = String(sumS);
    $("leave-sum-annual").textContent = String(sumA);
  }

  function renderHolidays() {
    var pack = HOLIDAYS[state.holYear];
    els.holList.innerHTML = "";
    if (!pack) return;
    for (var i = 0; i < pack.items.length; i++) {
      var item = pack.items[i];
      var li = document.createElement("li");
      li.innerHTML =
        "<span>" +
        (i + 1) +
        ".</span><span>" +
        escapeHtml(item.zh) +
        " / " +
        escapeHtml(item.en) +
        '</span><span class="d">' +
        escapeHtml(item.date) +
        "</span>";
      els.holList.appendChild(li);
    }
    els.holNote.textContent = pack.note[state.lang] || pack.note.zh;
    $("tab-2027").setAttribute("aria-pressed", state.holYear === 2027 ? "true" : "false");
    $("tab-2026").setAttribute("aria-pressed", state.holYear === 2026 ? "true" : "false");
  }

  function validate(data) {
    var warns = [];
    var maw = data.mawRule === "5100" ? MAW_OLD : MAW_NEW;
    if (data.wage > 0 && data.wage < maw) {
      warns.push(
        "月薪 HK$" +
          data.wage +
          " 低於所選規定最低工資 HK$" +
          maw +
          "。規定最低工資以簽訂標準僱傭合約當日為準（2026年10月3日起新約 HK$5,220；此前簽約可適用 HK$5,100）。 / Monthly wage is below the selected Minimum Allowable Wage. MAW is the rate when the SEC is signed (HK$5,220 on/after 3 Oct 2026; HK$5,100 if signed before that)."
      );
    }
    if (data.foodMode === "allowance" && data.foodAllowance < FOOD_MIN) {
      warns.push(
        "膳食津貼低於現時不少於 HK$1,236 的水平（僱主不提供免費膳食時）。 / Food allowance is below the current minimum of HK$1,236 when free food is not provided."
      );
    }
    if (data.payDate && data.periodTo) {
      var late = daysBetween(data.periodTo, data.payDate);
      if (late > 7) {
        warns.push(
          "付款日期遲於工資期結束後7天。僱傭條例規定工資須在期滿後7天內支付。 / Payment date is more than 7 days after the period end. Wages must be paid within 7 days."
        );
      }
    }
    if (data.periodFrom && data.periodTo) {
      var span = inclusiveDays(data.periodFrom, data.periodTo);
      if (span > 0) {
        var need = Math.floor(span / 7);
        if (need > 0 && data.restDays < need) {
          warns.push(
            "工資期共 " +
              span +
              " 天。休息日每7天至少1天（約不少於 " +
              need +
              " 天）。 / The period has " +
              span +
              " days. At least 1 rest day is required in every period of 7 days (about " +
              need +
              " days)."
          );
        }
      }
    }
    return warns;
  }

  function renderWarnings(data) {
    var warns = validate(data);
    if (!warns.length) {
      els.warnings.className = "warn-box";
      els.warnings.innerHTML = "";
      return;
    }
    els.warnings.className = "warn-box is-on";
    var title = state.lang === "en" ? "Checks (non-blocking)" : "提示（不阻擋列印）";
    els.warnings.innerHTML = "<h2>" + title + "</h2><ul>" + warns.map(function (w) {
      return "<li>" + escapeHtml(w) + "</li>";
    }).join("") + "</ul>";
  }

  function receiptModel(data, periodFrom, periodTo, payDate, leaveRow) {
    var foodAmt = data.foodMode === "allowance" ? num(data.foodAllowance, 0) : 0;
    var otherAmt = num(data.otherAmount, 0);
    var wage = num(data.wage, 0);
    var total = wage + foodAmt + otherAmt;
    return {
      data: data,
      periodFrom: periodFrom,
      periodTo: periodTo,
      payDate: payDate,
      leave: leaveRow,
      wage: wage,
      foodAmt: foodAmt,
      otherAmt: otherAmt,
      total: total,
    };
  }

  function renderReceipt(model) {
    var data = model.data;
    var method = methodLabel(data.payMethod);
    var idPartZh = data.helperId ? "，香港身份證／護照號碼 " + escapeHtml(data.helperId) : "";
    var idPartEn = data.helperId ? ", HKID/Passport No. " + escapeHtml(data.helperId) : "";
    var otherLabel = data.otherDesc || "其他項目 / Other items";
    var refLine = "";
    if (data.bankRef) {
      var refName =
        data.payMethod === "cheque"
          ? "支票號碼 / Cheque no."
          : "銀行參考編號 / Bank reference";
      refLine =
        '<div><span class="k">' +
        refName +
        "</span><span>" +
        escapeHtml(data.bankRef) +
        "</span></div>";
    }
    var contractLine = data.contractStart
      ? '<div><span class="k">合約開始 / Contract start</span><span>' +
        formatDateZh(data.contractStart) +
        " · " +
        formatDateEn(data.contractStart) +
        "</span></div>"
      : "";
    var foodRow =
      data.foodMode === "allowance"
        ? "<tr><td>2. 膳食津貼 / Food allowance（" +
          formatDateZh(model.periodFrom) +
          " 至 " +
          formatDateZh(model.periodTo) +
          "）</td><td class=\"num\">" +
          formatHKD(model.foodAmt) +
          "</td></tr>"
        : '<tr><td>2. 膳食 / Food（僱主已提供免費膳食 / food provided free of charge）</td><td class="num">—</td></tr>';
    var otherRow =
      data.otherDesc || model.otherAmt
        ? "<tr><td>3. " +
          escapeHtml(otherLabel) +
          '</td><td class="num">' +
          formatHKD(model.otherAmt) +
          "</td></tr>"
        : "";
    var notes = data.notes
      ? "<p class=\"ack\"><strong>備註 / Notes：</strong> " + escapeHtml(data.notes) + "</p>"
      : "";
    var html =
      '<article class="receipt">' +
      '<header class="receipt-head"><div><h2 class="receipt-title">外籍家庭傭工工資收據<small>Wage Receipt of Foreign Domestic Helper (FDH)</small></h2></div><div class="receipt-chop" aria-hidden="true">收據<br>RECEIPT</div></header>' +
      '<div class="meta">' +
      '<div><span class="k">僱主 / Employer</span><span>' +
      blankOr(data.employerName) +
      "</span></div>" +
      '<div><span class="k">外傭 / Helper</span><span>' +
      blankOr(data.helperName) +
      "</span></div>" +
      contractLine +
      refLine +
      "</div>" +
      '<div class="ack"><p>本人，' +
      blankOr(data.helperName) +
      idPartZh +
      "，已收妥僱主 " +
      blankOr(data.employerName) +
      " 在（日期）" +
      formatDateZh(model.payDate) +
      " 用" +
      method.zh +
      "方式支付的以下款項。</p><p>I, " +
      blankOr(data.helperName) +
      idPartEn +
      ", acknowledge receipt of payment of the following items from my employer " +
      blankOr(data.employerName) +
      " on " +
      formatDateEn(model.payDate) +
      " by " +
      method.en +
      ".</p></div>" +
      '<table class="lines"><thead><tr><th>項目 / Item</th><th>金額 / Amount</th></tr></thead><tbody>' +
      "<tr><td>1. 工資 / Wages（" +
      formatDateZh(model.periodFrom) +
      " 至 " +
      formatDateZh(model.periodTo) +
      " / " +
      formatDateEn(model.periodFrom) +
      " to " +
      formatDateEn(model.periodTo) +
      '）</td><td class="num">' +
      formatHKD(model.wage) +
      "</td></tr>" +
      foodRow +
      otherRow +
      '</tbody><tfoot><tr class="total-row"><th>合計 / Total</th><td class="num">' +
      formatHKD(model.total) +
      "</td></tr></tfoot></table>" +
      '<p class="words"><strong>大寫金額：' +
      escapeHtml(toChineseUpper(model.total)) +
      "</strong><span>Amount in words: " +
      escapeHtml(toEnglishWords(model.total)) +
      "</span></p>" +
      "<h3>本月假期 / Leave this month</h3>" +
      '<table class="leave-mini"><thead><tr><th>休息日<br>Rest days</th><th>法定假日<br>Statutory holidays</th><th>年假<br>Annual leave</th></tr></thead><tbody><tr><td>' +
      model.leave.rest +
      "</td><td>" +
      model.leave.statutory +
      "</td><td>" +
      model.leave.annual +
      "</td></tr></tbody></table>" +
      notes +
      '<div class="signs"><div class="sign"><div class="line"></div><p class="who">受款人（外傭）簽署 / Received by (Helper)<br>' +
      blankOr(data.helperName) +
      '</p></div><div class="sign"><div class="line"></div><p class="who">僱主簽署 / Employer<br>' +
      blankOr(data.employerName) +
      '</p></div><div class="sign"><div class="line"></div><p class="who">見證人簽署（如有） / Witnessed by (if any)<br>' +
      blankOr(data.witnessName) +
      "</p></div></div>" +
      '<p class="receipt-note">僅供參考，以勞工處及標準僱傭合約為準。This is a sample for reference only; the Labour Department and the Standard Employment Contract prevail. <span>www.fdh.labour.gov.hk</span></p>' +
      "</article>";
    return html;
  }

  function payDateForPeriod(base, periodTo) {
    if (!base.payDate || !base.periodTo) return periodTo;
    var offset = daysBetween(base.periodTo, base.payDate);
    return addDaysIso(periodTo, offset);
  }

  function renderPreview() {
    var data = readForm();
    renderWarnings(data);
    var models = [];
    if (state.mode12) {
      var start = data.periodMonth || (data.periodFrom || todayIso()).slice(0, 7);
      for (var i = 0; i < 12; i++) {
        var ym = addMonths(start, i);
        var b = monthBounds(ym);
        var row = leaveFor(b.year, b.month);
        if (
          ym === (data.periodMonth || "") &&
          row.rest === 0 &&
          row.statutory === 0 &&
          row.annual === 0
        ) {
          row = { rest: data.restDays, statutory: data.statDays, annual: data.annualDays };
        }
        models.push(receiptModel(data, b.from, b.to, payDateForPeriod(data, b.to), row));
      }
    } else {
      models.push(
        receiptModel(data, data.periodFrom, data.periodTo, data.payDate, {
          rest: data.restDays,
          statutory: data.statDays,
          annual: data.annualDays,
        })
      );
    }
    els.receipts.innerHTML = models.map(renderReceipt).join("");
    els.singleBtn.hidden = !state.mode12;
    var pack = I18N[state.lang] || I18N.zh;
    els.modeLabel.textContent = state.mode12 ? pack.mode12 : pack.mode1;
  }

  function onFormInput(ev) {
    var t = ev.target;
    if (t && t.id === "period-month") {
      var b = monthBounds(els.periodMonth.value);
      els.periodFrom.value = b.from;
      els.periodTo.value = b.to;
      var row = leaveFor(b.year, b.month);
      if (Number(els.leaveYear.value) !== b.year) {
        els.leaveYear.value = b.year;
        renderLeaveTable();
      }
      if (row.rest || row.statutory || row.annual) {
        els.rest.value = row.rest;
        els.stat.value = row.statutory;
        els.annual.value = row.annual;
      }
    }
    if (t && t.id === "contract-start" && els.contract.value) {
      setRadio("mawRule", els.contract.value >= MAW_CUTOVER ? "5220" : "5100");
    }
    if (t && (t.id === "rest-days" || t.id === "stat-days" || t.id === "annual-days")) {
      syncFormLeaveToLog();
      if (Number(els.leaveYear.value) === monthBounds(els.periodMonth.value).year) {
        renderLeaveTable();
      }
    }
    updateRefLabel();
    saveStore();
    renderPreview();
  }

  function onLeaveInput(ev) {
    var t = ev.target;
    if (!t || !t.getAttribute("data-leave")) return;
    var year = Number(els.leaveYear.value);
    var month = Number(t.getAttribute("data-month"));
    var kind = t.getAttribute("data-leave");
    var cur = leaveFor(year, month);
    cur[kind] = Math.max(0, Math.round(num(t.value, 0)));
    setLeave(year, month, cur.rest, cur.statutory, cur.annual);
    var sums = { rest: 0, statutory: 0, annual: 0 };
    for (var m = 1; m <= 12; m++) {
      var r = leaveFor(year, m);
      sums.rest += r.rest;
      sums.statutory += r.statutory;
      sums.annual += r.annual;
    }
    $("leave-sum-rest").textContent = String(sums.rest);
    $("leave-sum-stat").textContent = String(sums.statutory);
    $("leave-sum-annual").textContent = String(sums.annual);
    syncLogToFormIfSameMonth();
    saveStore();
    renderPreview();
  }

  function exportLeaveCsv() {
    var year = Number(els.leaveYear.value) || new Date().getFullYear();
    var lines = ["\uFEFFYear,Month,Rest days,Statutory holidays,Annual leave"];
    for (var m = 1; m <= 12; m++) {
      var r = leaveFor(year, m);
      lines.push([year, m, r.rest, r.statutory, r.annual].join(","));
    }
    var blob = new Blob([lines.join("\n") + "\n"], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "helper-leave-log-" + year + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 500);
  }

  function clearData() {
    var msg =
      state.lang === "en"
        ? "Clear all saved form and leave-log data in this browser?"
        : "確定清除本機所有已儲存的表格與假期紀錄？";
    if (!window.confirm(msg)) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    state.leave = {};
    state.mode12 = false;
    applyForm(defaultForm());
    els.leaveYear.value = new Date().getFullYear();
    renderLeaveTable();
    saveStore();
    renderPreview();
  }

  function init() {
    cacheEls();
    var stored = loadStore();
    var defaults = defaultForm();
    if (stored && stored.form) {
      state.lang = stored.lang === "en" ? "en" : "zh";
      state.leave = stored.leave && typeof stored.leave === "object" ? stored.leave : {};
      state.holYear = stored.holYear === 2026 ? 2026 : 2027;
      applyForm(Object.assign({}, defaults, stored.form));
      if (!els.periodMonth.value) {
        els.periodMonth.value = defaults.periodMonth;
        els.periodFrom.value = defaults.periodFrom;
        els.periodTo.value = defaults.periodTo;
      }
    } else {
      applyForm(defaults);
    }
    var ym = els.periodMonth.value || defaults.periodMonth;
    els.leaveYear.value = monthBounds(ym).year;
    applyI18n();
    syncFormLeaveToLog();
    renderLeaveTable();
    renderPreview();

    els.form.addEventListener("input", onFormInput);
    els.form.addEventListener("change", onFormInput);
    els.leaveBody.addEventListener("input", onLeaveInput);
    els.leaveYear.addEventListener("change", function () {
      renderLeaveTable();
      saveStore();
    });
    $("export-leave").addEventListener("click", exportLeaveCsv);
    $("clear-data").addEventListener("click", clearData);
    $("print-btn").addEventListener("click", function () {
      window.print();
    });
    $("gen12-btn").addEventListener("click", function () {
      state.mode12 = true;
      renderPreview();
    });
    $("single-btn").addEventListener("click", function () {
      state.mode12 = false;
      renderPreview();
    });
    $("lang-zh").addEventListener("click", function () {
      state.lang = "zh";
      applyI18n();
      saveStore();
    });
    $("lang-en").addEventListener("click", function () {
      state.lang = "en";
      applyI18n();
      saveStore();
    });
    $("tab-2027").addEventListener("click", function () {
      state.holYear = 2027;
      renderHolidays();
      saveStore();
    });
    $("tab-2026").addEventListener("click", function () {
      state.holYear = 2026;
      renderHolidays();
      saveStore();
    });
  }

  window.HelperReceipt = {
    toChineseUpper: toChineseUpper,
    toEnglishWords: toEnglishWords,
    formatHKD: formatHKD,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
