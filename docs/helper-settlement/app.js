import {
  FOOD_MIN,
  MEAL_TRAVEL_DEFAULT,
  MAW_NEW,
  buildWarnings,
  computeSettlement,
  demoForm,
  emptyForm,
  formatDateEn,
  formatDateZh,
  formatHKD,
  methodLabel,
  num,
  reasonLabel,
  suggestLeavePay,
  toChineseUpper,
  toEnglishWords,
} from "./settlement.js";

const STORAGE_KEY = "hk-helper-settlement:v1";
const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "外傭合約終止結算單產生器",
    docTitle: "外傭合約終止結算單產生器｜免費列印 · FDH Contract Termination Settlement Generator",
    lede: "合約期滿或提前終止時，在瀏覽器填寫未付工資、未放年假、代通知金與回程旅費，預覽中英雙語結算單，列印或另存 PDF。不是遣散費／長期服務金計算機。",
    notice:
      "僅供參考及備存，並非法律意見。遣散費、長期服務金與法定權益請另用勞工處工具核對。 / For record-keeping only; not legal advice. Check SP/LSP with Labour tools if applicable.",
    clearData: "清除資料 / Clear data",
    demoBtn: "載入示範",
    formTitle: "結算資料",
    whoLegend: "僱主與外傭",
    employerName: "僱主姓名",
    helperName: "外傭姓名",
    helperId: "外傭香港身份證／護照尾數（可選）",
    contractStart: "合約開始日期",
    contractEnd: "合約期滿／終止日期",
    reason: "終止原因",
    reasonExpiry: "合約期滿",
    reasonEmployer: "僱主給予通知",
    reasonHelper: "外傭給予通知",
    reasonLieu: "以工資代替通知",
    witnessName: "見證人姓名（可選）",
    wageLegend: "月薪與膳食",
    wage: "每月工資（港元）",
    wageHint: "規定最低工資以簽訂標準僱傭合約當日為準。2026年10月3日起新約現時為 HK$5,220。",
    foodLegend: "膳食安排",
    foodProvided: "僱主提供免費膳食",
    foodAllowancePaid: "不提供膳食，支付膳食津貼",
    foodAllowance: "每月膳食津貼（港元）",
    foodHint: "勞工處外傭專頁現時列明：不提供免費膳食時不少於每月 HK$1,236。可改，請以公布為準。",
    foodDue: "本結算未付膳食津貼（港元）",
    itemsLegend: "結算項目",
    unpaidFrom: "未付工資期由",
    unpaidTo: "未付工資期至",
    unpaidAmount: "未付工資金額（港元）",
    unpaidHint: "請按實際未付期自行填寫，本頁不代你推算日薪。",
    leaveDays: "未放年假日數",
    leavePay: "未放年假薪酬（港元）",
    leaveHint: "年假薪酬以僱傭條例公式為準。按鈕只提供常見糧單粗估（月薪÷26×日數），不是法定計算。",
    suggestLeave: "填入年假粗估",
    lieuAmount: "代通知金（港元，可選）",
    lieuHint: "標準合約常見為不少於一個月書面通知，或以一個月工資代替。金額請自行填寫。",
    suggestLieu: "填入一個月工資",
    passageLegend: "回程旅費",
    airfareLegend: "回程機票",
    airfareTicket: "已提供返回原居地機票",
    airfareCash: "以現金代替機票",
    airfareAmount: "現金代替機票金額（港元）",
    airfareHint: "勞工處指南一般建議提供直航機票，而不是只付現金。",
    journeyDays: "回程日數",
    journeyRate: "每日膳食及交通津貼（港元）",
    journeyHint: "標準僱傭合約常見為回程期間每日 HK$100。日數與單價都可改，請以合約為準。",
    extraLegend: "其他加項／扣減（可選）",
    extraHint: "例如報銷、預支工資、損毁賠償等。請自行核對是否可合法扣減。",
    extraDesc: "說明",
    extraAmount: "金額",
    extraAdd: "加項",
    extraDeduct: "扣減",
    extraRemove: "刪除",
    addExtra: "新增一行",
    payLegend: "付款與備註",
    payDate: "付款／簽署日期",
    payMethod: "付款方式",
    methodBank: "銀行轉帳／自動轉帳（建議）",
    methodCash: "現金",
    methodCheque: "支票",
    bankRef: "銀行參考編號（可選）",
    chequeRef: "支票號碼（可選）",
    notes: "備註",
    printBtn: "列印／另存 PDF",
    faqTitle: "常見問題",
    faq1q: "這和每月外傭工資收據有何分別？",
    faq1a: "每月糧單記錄該期工資與假期。本頁是合約期滿或提前終止時的一頁結算單，用來列出未付工資、未放年假、代通知金與回程旅費。兩者互補，不是同一份文件。",
    faq2q: "會計算遣散費或長期服務金嗎？",
    faq2a: "不會。本頁不計算遣散費、長期服務金或強積金對沖。如可能適用，請用勞工處法定僱傭權益參考計算機核對。",
    faq3q: "膳食津貼和回程膳食交通津貼幾多？",
    faq3a: "不提供免費膳食時，勞工處外傭專頁現時列明每月不少於 HK$1,236。回程期間膳食及交通津貼在標準合約常見為每日 HK$100。本頁欄位可改，請以公布及合約為準。",
    faq4q: "回程機票要怎樣處理？",
    faq4a: "合約期滿或終止時僱主須提供返回原居地的旅費。勞工處指南一般建議提供直航機票。本頁可註明已提供機票，或填寫現金代替金額。",
    faq5q: "資料會上傳嗎？",
    faq5a: "不會。全部只在你的瀏覽器運算，並可選擇寫入本機 localStorage。沒有帳戶、沒有伺服器存檔。",
    sourcesTitle: "資料來源 / Sources",
    receiptLink: "每月外傭工資收據產生器",
    privacyTitle: "私隱",
    privacyBody:
      "姓名、證件尾數、工資與結算金額只留在這個瀏覽器（localStorage）。本頁不上傳、不設帳號、不設後端，也不為表格設置 Cookie。列印才會在你選擇的位置產生檔案。",
    disclaimer:
      "僅供參考及備存，並非法律意見；以勞工處、入境處及標準僱傭合約（ID 407）為準。本頁不計算遣散費、長期服務金或強積金對沖。 / For reference and record-keeping only; not legal advice. The Labour Department, ImmD and Standard Employment Contract (ID 407) prevail. This page does not calculate SP/LSP or MPF offsetting.",
    warnTitle: "提示（不阻擋列印）",
    wageBelowMaw:
      "月薪低於以簽約日估算的規定最低工資。規定最低工資以簽訂標準僱傭合約當日為準（2026年10月3日起新約現時 HK$5,220）。 / Monthly wage is below the MAW estimated from the contract date.",
    foodBelowMin: "每月膳食津貼低於現時不少於 HK$1,236 的水平。 / Food allowance is below the current published minimum of HK$1,236.",
    lieuMissing: "已選「以工資代替通知」，但代通知金為 0。 / Payment in lieu is selected but the amount is 0.",
    airfareMissing: "已選現金代替機票，但金額為 0。 / Cash in lieu of ticket is selected but the amount is 0.",
    journeyRateCustom: "回程每日津貼不是合約常見的 HK$100。請核對你的標準僱傭合約。 / Daily journey allowance is not the usual HK$100. Check the contract.",
    unpaidMissing: "已填未付工資期，但金額為 0。 / An unpaid-wage period is set but the amount is 0.",
    leavePayMissing: "已填未放年假日數，但薪酬為 0。 / Unused leave days are set but pay is 0.",
    checkSpLsp:
      "合約滿兩年或以上。遣散費／長期服務金（如適用）請另用勞工處計算機核對；本頁不計算。 / The contract spans 2+ years. Check SP/LSP with the Labour calculator if applicable.",
    badUnpaidPeriod: "未付工資期的結束日早於開始日。 / Unpaid-wage period ends before it starts.",
    badContractPeriod: "終止日早於合約開始日。 / Termination date is before the contract start.",
  },
  en: {
    pageTitle: "FDH Contract Termination Settlement Generator",
    docTitle: "FDH Contract Termination Settlement Generator · 外傭合約終止結算單產生器",
    lede: "For contract expiry or early termination: fill unpaid wages, unused annual leave, payment in lieu and return passage, then preview a bilingual statement and print or save as PDF. Not an SP/LSP calculator.",
    notice:
      "For record-keeping only; not legal advice. Check SP/LSP with Labour tools if applicable. / 僅供參考及備存，並非法律意見。遣散費、長期服務金與法定權益請另用勞工處工具核對。",
    clearData: "Clear data / 清除資料",
    demoBtn: "Load demo",
    formTitle: "Settlement details",
    whoLegend: "Employer and helper",
    employerName: "Employer name",
    helperName: "Helper name",
    helperId: "Helper HKID / passport last digits (optional)",
    contractStart: "Contract start date",
    contractEnd: "Contract end / termination date",
    reason: "Reason",
    reasonExpiry: "Contract expiry",
    reasonEmployer: "Notice by employer",
    reasonHelper: "Notice by helper",
    reasonLieu: "Payment in lieu of notice",
    witnessName: "Witness name (optional)",
    wageLegend: "Wage and food",
    wage: "Monthly wage (HK$)",
    wageHint: "Minimum Allowable Wage is the rate on the Standard Employment Contract date. New contracts from 3 Oct 2026 are currently HK$5,220.",
    foodLegend: "Food arrangement",
    foodProvided: "Employer provides free food",
    foodAllowancePaid: "No food provided; food allowance paid",
    foodAllowance: "Monthly food allowance (HK$)",
    foodHint: "LD’s FDH page currently states not less than HK$1,236 a month if free food is not provided. Editable; check the published rate.",
    foodDue: "Unpaid food allowance on this settlement (HK$)",
    itemsLegend: "Settlement items",
    unpaidFrom: "Unpaid wages from",
    unpaidTo: "Unpaid wages to",
    unpaidAmount: "Unpaid wages amount (HK$)",
    unpaidHint: "Enter the actual unpaid amount. This page does not infer a daily rate.",
    leaveDays: "Unused annual leave days",
    leavePay: "Pay for unused annual leave (HK$)",
    leaveHint: "Annual-leave pay follows the Employment Ordinance formula. The button only fills a common payroll estimate (monthly wage ÷ 26 × days), not the statutory calculation.",
    suggestLeave: "Fill leave-pay estimate",
    lieuAmount: "Payment in lieu of notice (HK$, optional)",
    lieuHint: "The Standard Contract commonly allows not less than one month’s written notice, or one month’s wages in lieu. Enter the amount yourself.",
    suggestLieu: "Fill one month’s wage",
    passageLegend: "Return passage",
    airfareLegend: "Return air ticket",
    airfareTicket: "Air ticket to place of origin provided",
    airfareCash: "Cash in lieu of ticket",
    airfareAmount: "Cash in lieu of ticket (HK$)",
    airfareHint: "LD guidance generally advises providing a direct air ticket rather than cash only.",
    journeyDays: "Journey days",
    journeyRate: "Daily food and travelling allowance (HK$)",
    journeyHint: "The Standard Contract commonly provides HK$100 per day during the return journey. Days and rate are editable; follow the contract.",
    extraLegend: "Other additions / deductions (optional)",
    extraHint: "e.g. reimbursement, wage advance, damage. Check whether a deduction is lawful.",
    extraDesc: "Description",
    extraAmount: "Amount",
    extraAdd: "Addition",
    extraDeduct: "Deduction",
    extraRemove: "Remove",
    addExtra: "Add a line",
    payLegend: "Payment and notes",
    payDate: "Payment / signing date",
    payMethod: "Payment method",
    methodBank: "Bank transfer / autopay (preferred)",
    methodCash: "Cash",
    methodCheque: "Cheque",
    bankRef: "Bank reference no. (optional)",
    chequeRef: "Cheque no. (optional)",
    notes: "Notes",
    printBtn: "Print / Save as PDF",
    faqTitle: "FAQ",
    faq1q: "How is this different from the monthly wage receipt?",
    faq1a: "The monthly receipt records wages and leave for one period. This page is a one-page end-of-contract settlement for unpaid wages, unused leave, payment in lieu and return passage. They complement each other; they are not the same form.",
    faq2q: "Does this calculate severance or long-service payment?",
    faq2a: "No. This page does not calculate SP, LSP or MPF offsetting. If those entitlements may apply, use the Labour Department statutory entitlements calculator.",
    faq3q: "What are the food and journey allowances?",
    faq3a: "If free food is not provided, LD’s FDH page currently states not less than HK$1,236 a month. The Standard Contract commonly provides HK$100 a day for food and travelling on the return journey. Fields are editable; check the published rate and the contract.",
    faq4q: "How should return passage be handled?",
    faq4a: "On expiry or termination the employer must provide return passage to the place of origin. LD guidance generally advises a direct air ticket. This page can record a ticket provided or a cash amount.",
    faq5q: "Is anything uploaded?",
    faq5a: "No. Everything runs in your browser and may be saved to localStorage on this device only. There is no account and no server copy.",
    sourcesTitle: "Sources",
    receiptLink: "Monthly FDH wage receipt generator",
    privacyTitle: "Privacy",
    privacyBody:
      "Names, ID digits, wages and settlement amounts stay in this browser (localStorage). Nothing is uploaded. This page does not set cookies for the form. A file is created only when you print.",
    disclaimer:
      "For reference and record-keeping only; not legal advice. The Labour Department, ImmD and Standard Employment Contract (ID 407) prevail. This page does not calculate SP/LSP or MPF offsetting. / 僅供參考及備存，並非法律意見；以勞工處、入境處及標準僱傭合約（ID 407）為準。",
    warnTitle: "Checks (non-blocking)",
    wageBelowMaw:
      "Monthly wage is below the MAW estimated from the contract date. MAW is the rate when the SEC is signed (currently HK$5,220 for contracts on/after 3 Oct 2026).",
    foodBelowMin: "Monthly food allowance is below the current published minimum of HK$1,236.",
    lieuMissing: "Payment in lieu is selected but the amount is 0.",
    airfareMissing: "Cash in lieu of ticket is selected but the amount is 0.",
    journeyRateCustom: "Daily journey allowance is not the usual HK$100. Check the Standard Employment Contract.",
    unpaidMissing: "An unpaid-wage period is set but the amount is 0.",
    leavePayMissing: "Unused leave days are set but pay is 0.",
    checkSpLsp: "The contract spans 2+ years. Check SP/LSP with the Labour calculator if applicable. This page does not calculate them.",
    badUnpaidPeriod: "Unpaid-wage period ends before it starts.",
    badContractPeriod: "Termination date is before the contract start.",
  },
};

const WARN_COPY = {
  wageBelowMaw: true,
  foodBelowMin: true,
  lieuMissing: true,
  airfareMissing: true,
  journeyRateCustom: true,
  unpaidMissing: true,
  leavePayMissing: true,
  checkSpLsp: true,
  badUnpaidPeriod: true,
  badContractPeriod: true,
};

const state = {
  lang: "zh",
  extras: [],
  extraSeq: 1,
  suppressSave: false,
};

function $(id) {
  return document.getElementById(id);
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

function foodMode() {
  var checked = document.querySelector('input[name="foodMode"]:checked');
  return checked ? checked.value : "provided";
}

function airfareMode() {
  var checked = document.querySelector('input[name="airfareMode"]:checked');
  return checked ? checked.value : "ticket";
}

function setRadio(name, value) {
  var nodes = document.querySelectorAll('input[name="' + name + '"]');
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].checked = nodes[i].value === value;
  }
}

function todayIso() {
  var d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function defaultForm() {
  var form = emptyForm();
  form.payDate = todayIso();
  form.wage = MAW_NEW;
  form.foodAllowance = FOOD_MIN;
  form.journeyRate = MEAL_TRAVEL_DEFAULT;
  form.journeyDays = 1;
  return form;
}

function readExtrasFromDom() {
  var rows = [];
  var nodes = document.querySelectorAll("[data-extra-id]");
  for (var i = 0; i < nodes.length; i++) {
    var wrap = nodes[i];
    var id = wrap.getAttribute("data-extra-id");
    var desc = wrap.querySelector("[data-extra-desc]");
    var amount = wrap.querySelector("[data-extra-amount]");
    var kind = wrap.querySelector("[data-extra-kind]");
    rows.push({
      id: id,
      desc: desc ? desc.value.trim() : "",
      amount: num(amount && amount.value, 0),
      kind: kind && kind.value === "deduct" ? "deduct" : "add",
    });
  }
  return rows;
}

function readForm() {
  return {
    employerName: $("employer-name").value.trim(),
    helperName: $("helper-name").value.trim(),
    helperId: $("helper-id").value.trim(),
    contractStart: $("contract-start").value,
    contractEnd: $("contract-end").value,
    reason: $("reason").value || "expiry",
    wage: num($("wage").value, 0),
    foodMode: foodMode(),
    foodAllowance: num($("food-allowance").value, FOOD_MIN),
    foodDue: num($("food-due").value, 0),
    unpaidFrom: $("unpaid-from").value,
    unpaidTo: $("unpaid-to").value,
    unpaidAmount: num($("unpaid-amount").value, 0),
    leaveDays: num($("leave-days").value, 0),
    leavePay: num($("leave-pay").value, 0),
    lieuAmount: num($("lieu-amount").value, 0),
    airfareMode: airfareMode(),
    airfareAmount: num($("airfare-amount").value, 0),
    journeyDays: num($("journey-days").value, 0),
    journeyRate: num($("journey-rate").value, MEAL_TRAVEL_DEFAULT),
    extras: readExtrasFromDom(),
    payMethod: $("pay-method").value || "bank",
    bankRef: $("bank-ref").value.trim(),
    payDate: $("pay-date").value,
    witnessName: $("witness-name").value.trim(),
    notes: $("notes").value.trim(),
  };
}

function applyForm(data) {
  if (!data) return;
  state.suppressSave = true;
  $("employer-name").value = data.employerName || "";
  $("helper-name").value = data.helperName || "";
  $("helper-id").value = data.helperId || "";
  $("contract-start").value = data.contractStart || "";
  $("contract-end").value = data.contractEnd || "";
  $("reason").value = data.reason || "expiry";
  $("witness-name").value = data.witnessName || "";
  $("wage").value = data.wage != null && data.wage !== "" ? data.wage : "";
  setRadio("foodMode", data.foodMode || "provided");
  $("food-allowance").value = data.foodAllowance != null ? data.foodAllowance : FOOD_MIN;
  $("food-due").value = data.foodDue != null ? data.foodDue : 0;
  $("unpaid-from").value = data.unpaidFrom || "";
  $("unpaid-to").value = data.unpaidTo || "";
  $("unpaid-amount").value = data.unpaidAmount != null ? data.unpaidAmount : 0;
  $("leave-days").value = data.leaveDays != null ? data.leaveDays : 0;
  $("leave-pay").value = data.leavePay != null ? data.leavePay : 0;
  $("lieu-amount").value = data.lieuAmount != null ? data.lieuAmount : 0;
  setRadio("airfareMode", data.airfareMode || "ticket");
  $("airfare-amount").value = data.airfareAmount != null ? data.airfareAmount : 0;
  $("journey-days").value = data.journeyDays != null ? data.journeyDays : 1;
  $("journey-rate").value = data.journeyRate != null ? data.journeyRate : MEAL_TRAVEL_DEFAULT;
  $("pay-method").value = data.payMethod || "bank";
  $("bank-ref").value = data.bankRef || "";
  $("pay-date").value = data.payDate || "";
  $("notes").value = data.notes || "";
  state.extras = Array.isArray(data.extras) ? data.extras.slice() : [];
  var maxId = 0;
  state.extras.forEach(function (row) {
    var n = Number(String(row.id || "").replace(/\D/g, ""));
    if (n > maxId) maxId = n;
  });
  state.extraSeq = maxId + 1;
  renderExtras();
  state.suppressSave = false;
  updateDependentFields();
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
      })
    );
    localStorage.setItem(LANG_KEY, state.lang);
  } catch (e) {
    /* private mode or quota */
  }
}

function applyI18n() {
  if ($("extra-rows") && $("extra-rows").children.length) {
    state.extras = readExtrasFromDom();
  }
  var pack = I18N[state.lang] || I18N.zh;
  var nodes = document.querySelectorAll("[data-i18n]");
  for (var i = 0; i < nodes.length; i++) {
    var key = nodes[i].getAttribute("data-i18n");
    if (pack[key] != null) nodes[i].textContent = pack[key];
  }
  document.title = pack.docTitle;
  document.documentElement.lang = state.lang === "en" ? "en" : "zh-Hant-HK";
  $("lang-zh").setAttribute("aria-pressed", state.lang === "zh" ? "true" : "false");
  $("lang-en").setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
  updateRefLabel();
  renderExtras();
}

function updateRefLabel() {
  var pack = I18N[state.lang] || I18N.zh;
  $("bank-ref-label").textContent = $("pay-method").value === "cheque" ? pack.chequeRef : pack.bankRef;
}

function updateDependentFields() {
  var allowance = foodMode() === "allowance";
  $("food-allowance").disabled = !allowance;
  $("food-due").disabled = !allowance;
  $("airfare-amount").disabled = airfareMode() !== "cash";
  updateRefLabel();
}

function renderExtras() {
  var pack = I18N[state.lang] || I18N.zh;
  var box = $("extra-rows");
  if (!state.extras.length) {
    box.innerHTML = "";
    return;
  }
  box.innerHTML = state.extras
    .map(function (row) {
      return (
        '<div class="extra-row" data-extra-id="' +
        escapeHtml(row.id) +
        '">' +
        '<label class="field"><span>' +
        escapeHtml(pack.extraDesc) +
        '</span><input data-extra-desc type="text" maxlength="80" value="' +
        escapeHtml(row.desc || "") +
        '" /></label>' +
        '<label class="field"><span>' +
        escapeHtml(pack.extraAmount) +
        '</span><input data-extra-amount type="number" inputmode="decimal" min="0" step="0.01" value="' +
        escapeHtml(row.amount != null ? row.amount : 0) +
        '" /></label>' +
        '<label class="field"><span>' +
        escapeHtml(pack.extraAdd) +
        " / " +
        escapeHtml(pack.extraDeduct) +
        '</span><select data-extra-kind><option value="add"' +
        (row.kind === "deduct" ? "" : " selected") +
        ">" +
        escapeHtml(pack.extraAdd) +
        '</option><option value="deduct"' +
        (row.kind === "deduct" ? " selected" : "") +
        ">" +
        escapeHtml(pack.extraDeduct) +
        "</option></select></label>" +
        '<div class="extra-tools"><button type="button" class="secondary" data-extra-remove>' +
        escapeHtml(pack.extraRemove) +
        "</button></div></div>"
      );
    })
    .join("");
}

function addExtra() {
  state.extras = readExtrasFromDom();
  state.extras.push({ id: "x" + state.extraSeq++, kind: "add", desc: "", amount: 0 });
  renderExtras();
  saveStore();
  renderPreview();
}

function removeExtra(id) {
  state.extras = readExtrasFromDom().filter(function (row) {
    return row.id !== id;
  });
  renderExtras();
  saveStore();
  renderPreview();
}

function renderWarnings(form) {
  var pack = I18N[state.lang] || I18N.zh;
  var warns = buildWarnings(form).filter(function (key) {
    return WARN_COPY[key];
  });
  var box = $("warnings");
  if (!warns.length) {
    box.className = "warn-box";
    box.innerHTML = "";
    return;
  }
  box.className = "warn-box is-on";
  box.innerHTML =
    "<h2>" +
    escapeHtml(pack.warnTitle) +
    "</h2><ul>" +
    warns
      .map(function (key) {
        return "<li>" + escapeHtml(pack[key] || key) + "</li>";
      })
      .join("") +
    "</ul>";
}

function renderStatement(form) {
  var model = computeSettlement(form);
  var reason = reasonLabel(form.reason);
  var method = methodLabel(form.payMethod);
  var idPartZh = form.helperId ? "，證件尾數 " + escapeHtml(form.helperId) : "";
  var idPartEn = form.helperId ? ", ID/passport ending " + escapeHtml(form.helperId) : "";
  var refLine = "";
  if (form.bankRef) {
    var refName = form.payMethod === "cheque" ? "支票號碼 / Cheque no." : "銀行參考編號 / Bank reference";
    refLine =
      '<div><span class="k">' + refName + "</span><span>" + escapeHtml(form.bankRef) + "</span></div>";
  }
  var lineRows = model.lines
    .map(function (line, i) {
      var amountCell = line.provided ? "—" : formatHKD(line.sign < 0 ? -line.amount : line.amount);
      return (
        "<tr><td>" +
        (i + 1) +
        ". " +
        escapeHtml(line.labelZh) +
        " / " +
        escapeHtml(line.labelEn) +
        '</td><td class="num">' +
        amountCell +
        "</td></tr>"
      );
    })
    .join("");
  var notes = form.notes
    ? '<p class="ack"><strong>備註 / Notes：</strong> ' + escapeHtml(form.notes) + "</p>"
    : "";
  return (
    '<article class="receipt">' +
    '<header class="receipt-head"><div><h2 class="receipt-title">外籍家庭傭工合約終止結算單<small>Contract Termination Settlement Statement of Foreign Domestic Helper (FDH)</small></h2></div><div class="receipt-chop" aria-hidden="true">結算<br>SETTLE</div></header>' +
    '<div class="meta">' +
    '<div><span class="k">僱主 / Employer</span><span>' +
    blankOr(form.employerName) +
    "</span></div>" +
    '<div><span class="k">外傭 / Helper</span><span>' +
    blankOr(form.helperName) +
    "</span></div>" +
    '<div><span class="k">合約期間 / Contract period</span><span>' +
    formatDateZh(form.contractStart) +
    " 至 " +
    formatDateZh(form.contractEnd) +
    " · " +
    formatDateEn(form.contractStart) +
    " to " +
    formatDateEn(form.contractEnd) +
    "</span></div>" +
    '<div><span class="k">終止原因 / Reason</span><span>' +
    escapeHtml(reason.zh) +
    " / " +
    escapeHtml(reason.en) +
    "</span></div>" +
    '<div><span class="k">每月工資 / Monthly wage</span><span>' +
    formatHKD(form.wage) +
    "</span></div>" +
    refLine +
    "</div>" +
    '<div class="ack"><p>下列款項為本次合約期滿或終止的結算。本人，' +
    blankOr(form.helperName) +
    idPartZh +
    "，確認已收妥／將會收妥僱主 " +
    blankOr(form.employerName) +
    " 在 " +
    formatDateZh(form.payDate) +
    " 以" +
    method.zh +
    "支付的合計金額。</p><p>The items below are the settlement for this contract expiry or termination. I, " +
    blankOr(form.helperName) +
    idPartEn +
    ", acknowledge receipt / that I will receive from my employer " +
    blankOr(form.employerName) +
    " on " +
    formatDateEn(form.payDate) +
    " by " +
    method.en +
    " the total stated.</p></div>" +
    '<table class="lines"><thead><tr><th>項目 / Item</th><th>金額 / Amount</th></tr></thead><tbody>' +
    lineRows +
    '</tbody><tfoot><tr class="total-row"><th>應付合計 / Total payable</th><td class="num">' +
    formatHKD(model.total) +
    "</td></tr></tfoot></table>" +
    '<p class="words"><strong>大寫金額：' +
    escapeHtml(toChineseUpper(Math.max(0, model.total))) +
    "</strong><span>Amount in words: " +
    escapeHtml(toEnglishWords(Math.max(0, model.total))) +
    "</span></p>" +
    notes +
    '<p class="receipt-note">本單不包括遣散費、長期服務金或強積金對沖。This statement does not include severance pay, long service payment or MPF offsetting. 僅供參考及備存，以勞工處及標準僱傭合約（ID 407）為準。For reference and record-keeping only; the Labour Department and the Standard Employment Contract prevail.</p>' +
    '<div class="signs"><div class="sign"><div class="line"></div><p class="who">外傭簽署／日期 / Helper signature / date<br>' +
    blankOr(form.helperName) +
    '</p></div><div class="sign"><div class="line"></div><p class="who">僱主簽署／日期 / Employer signature / date<br>' +
    blankOr(form.employerName) +
    '</p></div><div class="sign"><div class="line"></div><p class="who">見證人簽署／日期（如有） / Witness signature / date<br>' +
    blankOr(form.witnessName) +
    "</p></div></div>" +
    "</article>"
  );
}

function renderPreview() {
  var form = readForm();
  state.extras = form.extras;
  renderWarnings(form);
  $("statement").innerHTML = renderStatement(form);
}

function onFormInput() {
  updateDependentFields();
  saveStore();
  renderPreview();
}

function clearData() {
  var msg =
    state.lang === "en"
      ? "Clear all saved settlement data in this browser?"
      : "確定清除本機所有已儲存的結算資料？";
  if (!window.confirm(msg)) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    /* ignore */
  }
  applyForm(defaultForm());
  saveStore();
  renderPreview();
}

function init() {
  var stored = loadStore();
  var defaults = defaultForm();
  var siteLang = null;
  try {
    siteLang = localStorage.getItem(LANG_KEY);
  } catch (e) {
    siteLang = null;
  }
  if (stored && stored.form) {
    state.lang = stored.lang === "en" || siteLang === "en" ? "en" : "zh";
    if (siteLang === "en" || siteLang === "zh") state.lang = siteLang;
    applyForm(Object.assign({}, defaults, stored.form));
  } else {
    if (siteLang === "en" || siteLang === "zh") state.lang = siteLang;
    applyForm(defaults);
  }
  applyI18n();
  renderPreview();

  $("settlement-form").addEventListener("input", onFormInput);
  $("settlement-form").addEventListener("change", onFormInput);
  $("extra-rows").addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-extra-remove]");
    if (!btn) return;
    var wrap = btn.closest("[data-extra-id]");
    if (wrap) removeExtra(wrap.getAttribute("data-extra-id"));
  });
  $("add-extra").addEventListener("click", addExtra);
  $("suggest-leave").addEventListener("click", function () {
    $("leave-pay").value = suggestLeavePay($("wage").value, $("leave-days").value);
    onFormInput();
  });
  $("suggest-lieu").addEventListener("click", function () {
    $("lieu-amount").value = num($("wage").value, 0);
    onFormInput();
  });
  $("demo-btn").addEventListener("click", function () {
    applyForm(demoForm());
    saveStore();
    renderPreview();
  });
  $("clear-data").addEventListener("click", clearData);
  $("print-btn").addEventListener("click", function () {
    window.print();
  });
  $("lang-zh").addEventListener("click", function () {
    state.lang = "zh";
    applyI18n();
    saveStore();
    renderPreview();
  });
  $("lang-en").addEventListener("click", function () {
    state.lang = "en";
    applyI18n();
    saveStore();
    renderPreview();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
