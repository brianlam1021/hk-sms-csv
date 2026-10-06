import {
  CATEGORY_IDS,
  compute,
  demoModel,
  num,
  parsePaste,
  quickShare,
  summaryToCsv,
  summaryToText,
} from "./levy.js";

const STORAGE_KEY = "hk-repair-levy:v1";
const LANG_KEY = "hk-repair-levy:lang";

const I18N = {
  zh: {
    pageTitle: "大廈維修費分攤計算器",
    lede: "按公契或業權份數，把大維修、強制驗樓／驗窗、升降機、消防及特別基金開支攤分至各戶。可處理住宅／商舖／車位分段、分期及繳款通知。不用註冊，不會上傳。",
    notice:
      "只供參考，並非法律或專業意見；實際分攤須以大廈公契、法團決議及《建築物管理條例》為準。 / For reference only; follow your DMC, OC resolutions and Cap. 344.",
    saveDraft: "儲存草稿",
    clearData: "清除資料 Clear data",
    explainTitle: "為甚麼需要這個工具",
    explainBody:
      "香港業主立案法團經常要把大型維修賬單攤分給各戶。《建築物管理條例》（第344章）第22(1)條規定管理委員會須按照公契釐定各業主應繳款額；第22(2)條訂明，若公契沒有相關規定，則按各業主的業權份數分攤。司庫和業主多靠手算或 Excel，本頁在瀏覽器內一次算好，並可列印每戶繳款通知。",
    quickTitle: "快速估算（單一業主）",
    quickLead: "只需總額、自己份數與大廈總份數，即時得出本戶應付。",
    quickTotal: "工程／徵款總額（港元）",
    quickMine: "我的份數",
    quickAll: "大廈總份數",
    quickN: "分期期數（可選）",
    quickAmount: "本戶應付",
    quickPct: "佔總額",
    quickInstal: "每期",
    quickNeed: "請輸入大於零的總份數。",
    fullTitle: "完整分攤（法團／管理處）",
    fullLead: "輸入各單位份數與一項或多項開支。可指定只由某些類別分攤，例如升降機只由住宅承擔。",
    demoBtn: "載入示範數據",
    downloadCsv: "下載 CSV",
    copySummary: "複製摘要文字",
    printBtn: "列印繳款通知",
    draftHint: "可選擇把草稿儲存在這個瀏覽器（不上傳）。",
    draftSaved: "草稿已儲存在這個瀏覽器。",
    metaLegend: "大廈與決議",
    buildingName: "大廈名稱",
    ocName: "業主立案法團名稱",
    resolutionDate: "決議日期",
    resolutionRef: "決議／通告編號",
    payNotes: "付款方法備註",
    rulesLegend: "分攤規則",
    basisLegend: "份數基準（只改標籤，計法相同）",
    basisUndivided: "業權份數 Undivided shares",
    basisManagement: "管理份數 Management shares",
    roundLegend: "湊整",
    round1: "至港幣 $1（最大餘數法）",
    round01: "至港幣 $0.1（最大餘數法）",
    ocSubsidy: "法團層面資助（分攤前扣減，港元）",
    instalments: "分期期數",
    firstDue: "首期到期日（其後每月）",
    unitsLegend: "單位",
    unitsHint: "可從試算表貼上（單位、業主（可選）、份數、類別，以 Tab 或逗號分隔）。",
    addUnit: "新增單位",
    togglePaste: "貼上試算表",
    pasteLabel: "貼上單位資料",
    importPaste: "匯入並取代現有單位",
    unitLabel: "單位",
    owner: "業主（可選）",
    shares: "份數",
    sharesUndivided: "業權份數",
    sharesManagement: "管理份數",
    category: "類別",
    deduction: "扣減（港元）",
    remove: "刪除",
    catResidential: "住宅 Residential",
    catShop: "商舖 Shop",
    catCarpark: "車位 Car park",
    catOther: "其他 Other",
    itemsLegend: "開支項目",
    itemsHint: "每項可指定由全部類別或只由部分類別分攤。百份比項目按其他固定金額項目合計計算（例如顧問費 8%）。",
    addItem: "新增項目",
    itemName: "項目名稱",
    itemMode: "金額方式",
    modeAmount: "固定港元",
    modePercent: "百份比（按其他固定項目合計）",
    itemValue: "金額（港元）",
    itemPercent: "百份比（%）",
    itemCats: "由哪些類別分攤",
    catAll: "全部類別",
    summaryTitle: "分攤結果",
    noticeTitle: "繳款通知預覽",
    noticeLead: "列印時每戶一頁 A4。通知同時顯示中英文。",
    faqTitle: "常見問題",
    faq1q: "甚麼是業權份數和管理份數？在哪裡查？",
    faq1a: "業權份數是公契把土地及樓宇分配予各單位的份數。部分公契另訂管理份數，用作分攤管理開支。可在公契、土地註冊處查冊，或向管理公司索取單位份數表核對。",
    faq2q: "《建築物管理條例》第22條怎樣規定分攤？",
    faq2a: "第22(1)條規定管理委員會須按照公契，釐定各業主應繳的款額。第22(2)條訂明，若公契沒有相關規定，則按照各業主所擁有的業權份數分攤。請以電子版香港法例原文為準。",
    faq3q: "為甚麼以公契為準，而不是一律按業權份數？",
    faq3a: "公契對全體業主有約束力。條例先要求按公契分攤，業權份數只是公契沒有規定時的後備方法。不少公契按座數或用途分段計算（例如只有住宅分攤升降機）。本工具可用類別模擬，但仍須核對你的公契及法團決議。",
    faq4q: "為甚麼要用最大餘數法湊整？",
    faq4a: "金額須湊整至港幣1元或1毫。若每則四捨五入，各戶合計可能與工程總額差數元。最大餘數法先向下取整，再把餘額分給小數部分最大的單位，令該項目各戶金額之和剛好等於項目總額。",
    faq5q: "樓宇更新大行動或公用地方維修資助怎樣輸入？",
    faq5a: "各計劃的申請資格、發放方式及金額不同，可能撥予法團或個別業主。獲批後可把法團層面資助填在「法團資助」，或把已核准的戶別扣減填在該單位「扣減」。請以樓宇復修平台及相關計劃公布為準，本頁不羅列資助額。",
    sourcesTitle: "法例及資料來源 / Sources",
    privacyTitle: "私隱",
    privacyBody:
      "單位、業主姓名與金額只留在這個瀏覽器（localStorage，且僅在你儲存草稿或自動保存時）。本頁不上傳、不設帳號、不設後端，也沒有分析程式。列印或下載 CSV 才會在你選擇的位置產生檔案。",
    disclaimer:
      "只供參考，並非法律或專業意見；實際分攤須以大廈公契、法團決議及《建築物管理條例》為準。 / For reference only; follow your DMC, OC resolutions and Cap. 344.",
    backHome: "← 返回短訊記帳CSV",
    moreTools: "其他免費工具：",
    toolReceipt: "外傭工資收據",
    toolSizi: "四字紙皮",
    toolRwb: "紅白藍金句袋",
    source: "開源靜態頁，原始碼在",
    footerFine: "不是民政事務總署、土地註冊處或任何政府部門的官方工具。請以公契、法團決議及法例原文為準。",
    errTitle: "請先修正以下項目",
    errBlankLabel: "單位名稱不能空白。",
    errDup: "單位名稱重複：",
    errZero: "份數不能空白或為零：",
    errCatZero: "此項目指定的類別沒有有效份數：",
    errNoCat: "請為項目選擇最少一個類別：",
    errNoUnits: "請先加入最少一個單位。",
    errNoItems: "請先加入最少一個開支項目。",
    errNegDed: "扣減不能為負數：",
    errPaste: "有些行無法匯入（每行至少要有單位及份數）。",
    roundNote1: "各項目已用最大餘數法湊整至 $1，該欄合計等於該項目總額。",
    roundNote01: "各項目已用最大餘數法湊整至 $0.1，該欄合計等於該項目總額。",
    kpiGross: "工程總額",
    kpiSubsidy: "法團資助",
    kpiNet: "待分攤",
    kpiDeduct: "各戶扣減",
    kpiPay: "各戶應付合計",
    colUnit: "單位",
    colOwner: "業主",
    colShares: "份數",
    colPct: "佔比",
    colSub: "項目小計",
    colDeduct: "扣減",
    colPay: "應付",
    colInstal: "每期",
    colTotal: "合計",
    copied: "已複製摘要。",
    copyFail: "未能複製，請改用下載 CSV。",
    confirmClear: "確定清除本機所有已儲存的分攤資料？",
    formulaZh:
      "本戶項目金額 = 項目金額 × 本戶份數 ÷ 參與該項目的單位份數合計（最大餘數法湊整）。法例：《建築物管理條例》第22條——管理委員會須按公契分攤；公契無規定則按業權份數。",
    formulaEn:
      "Unit item share = item amount × unit shares ÷ sum of shares of units in the participating categories (largest-remainder rounding). Cap. 344 s.22: the management committee apportions in accordance with the DMC; if the DMC is silent, by undivided shares.",
    previewMore: "列印時每戶一頁；螢幕只預覽第一戶。",
  },
  en: {
    pageTitle: "Building Repair Levy Apportionment Calculator",
    lede: "Split major repair, MWCS/MWIS, lift, fire-safety and special-fund bills among owners by DMC or undivided shares. Section costs, instalments and printable payment notices. No sign-up. Nothing is uploaded.",
    notice:
      "For reference only; follow your DMC, OC resolutions and Cap. 344. / 只供參考，並非法律或專業意見；實際分攤須以大廈公契、法團決議及《建築物管理條例》為準。",
    saveDraft: "Save draft",
    clearData: "Clear data / 清除資料",
    explainTitle: "Why this tool exists",
    explainBody:
      "Hong Kong owners’ corporations regularly split large repair bills. Cap. 344 s.22(1) says the management committee apportions the amount payable in accordance with the DMC; s.22(2) says that if the DMC is silent, it is by each owner’s undivided shares. Treasurers and owners usually use hand sums or Excel. This page does the arithmetic in your browser and can print a payment notice per unit.",
    quickTitle: "Quick estimate (one owner)",
    quickLead: "Enter the total, your shares and the building total to see your amount instantly.",
    quickTotal: "Total cost / levy (HK$)",
    quickMine: "My shares",
    quickAll: "Building total shares",
    quickN: "Instalments (optional)",
    quickAmount: "My share",
    quickPct: "% of total",
    quickInstal: "Per instalment",
    quickNeed: "Enter a total share figure greater than zero.",
    fullTitle: "Full apportionment (OC / management)",
    fullLead: "Enter unit shares and one or more cost items. Assign an item to selected categories only — e.g. lifts paid by residential units.",
    demoBtn: "Load demo data",
    downloadCsv: "Download CSV",
    copySummary: "Copy summary as text",
    printBtn: "Print payment notices",
    draftHint: "You can save a draft in this browser (nothing is uploaded).",
    draftSaved: "Draft saved in this browser.",
    metaLegend: "Building and resolution",
    buildingName: "Building name",
    ocName: "Owners’ corporation name",
    resolutionDate: "Resolution date",
    resolutionRef: "Resolution / circular ref.",
    payNotes: "Payment method notes",
    rulesLegend: "Apportionment rules",
    basisLegend: "Share basis (label only; the maths is the same)",
    basisUndivided: "Undivided shares 業權份數",
    basisManagement: "Management shares 管理份數",
    roundLegend: "Rounding",
    round1: "To HK$1 (largest remainder)",
    round01: "To HK$0.1 (largest remainder)",
    ocSubsidy: "OC-level subsidy (reduces the total before apportionment, HK$)",
    instalments: "Number of instalments",
    firstDue: "First due date (then monthly)",
    unitsLegend: "Units",
    unitsHint: "Paste from a spreadsheet (unit, owner (optional), shares, category — tab or comma separated).",
    addUnit: "Add unit",
    togglePaste: "Paste from spreadsheet",
    pasteLabel: "Paste unit rows",
    importPaste: "Import and replace current units",
    unitLabel: "Unit",
    owner: "Owner (optional)",
    shares: "Shares",
    sharesUndivided: "Undivided shares",
    sharesManagement: "Management shares",
    category: "Category",
    deduction: "Deduction (HK$)",
    remove: "Remove",
    catResidential: "Residential 住宅",
    catShop: "Shop 商舖",
    catCarpark: "Car park 車位",
    catOther: "Other 其他",
    itemsLegend: "Cost items",
    itemsHint: "Each item can be shared by all categories or selected ones. A percentage item is calculated on the sum of the fixed-amount items (e.g. 8% consultant fee).",
    addItem: "Add item",
    itemName: "Item name",
    itemMode: "Amount type",
    modeAmount: "Fixed HK$",
    modePercent: "Percentage of other fixed items",
    itemValue: "Amount (HK$)",
    itemPercent: "Percentage (%)",
    itemCats: "Who shares this item",
    catAll: "All categories",
    summaryTitle: "Results",
    noticeTitle: "Payment notice preview",
    noticeLead: "Each unit prints on its own A4 page. Notices are bilingual.",
    faqTitle: "FAQ",
    faq1q: "What are undivided shares and management shares, and where do I find them?",
    faq1a: "Undivided shares are the shares of the land and building allocated to each unit in the DMC. Some DMCs also set management shares for splitting management expenses. Check the DMC, a Land Registry search, or the share schedule from your manager.",
    faq2q: "What does section 22 of the Building Management Ordinance say?",
    faq2a: "s.22(1) requires the management committee to determine the amount payable by each owner in accordance with the DMC. s.22(2) says that if the DMC has no such provision, the amount is according to each owner’s undivided shares. The eLegislation text prevails.",
    faq3q: "Why does the DMC prevail over a simple split by undivided shares?",
    faq3a: "The DMC binds all owners. The Ordinance requires apportionment according to the DMC first; undivided shares are only the fallback. Many DMCs split by section or use (e.g. residential only for lifts). This tool can model categories, but you must still check your DMC and OC resolutions.",
    faq4q: "Why use the largest-remainder method to round?",
    faq4a: "Amounts are rounded to HK$1 or $0.1. Ordinary rounding can leave the column a few dollars short or over. Largest remainder floors each share, then gives leftover units to the largest fractions so the column sums exactly to the item total.",
    faq5q: "How do I enter Operation Building Bright or common-area subsidies?",
    faq5a: "Eligibility, payment route and amounts differ by scheme and may go to the OC or to individual owners. After approval, enter an OC-level subsidy or a per-unit deduction. Use the Building Rehabilitation Platform and the scheme rules — this page does not list subsidy amounts.",
    sourcesTitle: "Sources / 法例及資料來源",
    privacyTitle: "Privacy",
    privacyBody:
      "Unit labels, owner names and amounts stay in this browser (localStorage, only when a draft is saved). Nothing is uploaded. There is no account, server copy or analytics. A file is created only when you print or download CSV.",
    disclaimer:
      "For reference only; follow your DMC, OC resolutions and Cap. 344. / 只供參考，並非法律或專業意見；實際分攤須以大廈公契、法團決議及《建築物管理條例》為準。",
    backHome: "← Back to SMS ledger",
    moreTools: "Other free tools:",
    toolReceipt: "Helper wage receipt",
    toolSizi: "Four-character cardboard",
    toolRwb: "Red-white-blue tote",
    source: "Open-source static page. Source on",
    footerFine: "Not an official Home Affairs Department, Land Registry or government tool. Follow your DMC, OC resolutions and the Ordinance.",
    errTitle: "Please fix the following",
    errBlankLabel: "Unit label cannot be blank.",
    errDup: "Duplicate unit label: ",
    errZero: "Shares cannot be blank or zero: ",
    errCatZero: "This item is assigned to categories with no valid shares: ",
    errNoCat: "Select at least one category for: ",
    errNoUnits: "Add at least one unit.",
    errNoItems: "Add at least one cost item.",
    errNegDed: "Deduction cannot be negative: ",
    errPaste: "Some rows could not be imported (each line needs a unit and shares).",
    roundNote1: "Each item is rounded to $1 by the largest-remainder method so the column sums to that item’s total.",
    roundNote01: "Each item is rounded to $0.1 by the largest-remainder method so the column sums to that item’s total.",
    kpiGross: "Gross works",
    kpiSubsidy: "OC subsidy",
    kpiNet: "Net to apportion",
    kpiDeduct: "Unit deductions",
    kpiPay: "Total payable",
    colUnit: "Unit",
    colOwner: "Owner",
    colShares: "Shares",
    colPct: "%",
    colSub: "Items subtotal",
    colDeduct: "Deduction",
    colPay: "Payable",
    colInstal: "Per instalment",
    colTotal: "Total",
    copied: "Summary copied.",
    copyFail: "Could not copy. Download CSV instead.",
    confirmClear: "Clear all saved levy data in this browser?",
    formulaZh:
      "本戶項目金額 = 項目金額 × 本戶份數 ÷ 參與該項目的單位份數合計（最大餘數法湊整）。法例：《建築物管理條例》第22條——管理委員會須按公契分攤；公契無規定則按業權份數。",
    formulaEn:
      "Unit item share = item amount × unit shares ÷ sum of shares of units in the participating categories (largest-remainder rounding). Cap. 344 s.22: the management committee apportions in accordance with the DMC; if the DMC is silent, by undivided shares.",
    previewMore: "Each unit prints on its own page; this screen previews the first unit.",
  },
};

const EN_MONTHS = [
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

const state = {
  lang: "zh",
  unitSeq: 1,
  itemSeq: 1,
  units: [],
  items: [],
  suppressSave: false,
};

function $(id) {
  return document.getElementById(id);
}

function pack() {
  return I18N[state.lang] || I18N.zh;
}

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function blankOr(text) {
  const t = String(text == null ? "" : text).trim();
  return t ? escapeHtml(t) : '<span class="blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
}

function formatHKD(n, step) {
  const x = num(n, 0);
  const digits = step === 0.1 ? 1 : step === 1 ? 0 : 2;
  const neg = x < 0;
  const parts = Math.abs(x).toFixed(digits).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "-" : "") + "HK$" + parts.join(".");
}

function formatDateZh(iso) {
  if (!iso) return "________";
  const p = String(iso).split("-");
  return Number(p[0]) + "年" + Number(p[1]) + "月" + Number(p[2]) + "日";
}

function formatDateEn(iso) {
  if (!iso) return "________";
  const p = String(iso).split("-").map(Number);
  return p[2] + " " + EN_MONTHS[p[1] - 1] + " " + p[0];
}

function shareBasis() {
  const checked = document.querySelector('input[name="shareBasis"]:checked');
  return checked && checked.value === "management" ? "management" : "undivided";
}

function roundingStep() {
  const checked = document.querySelector('input[name="roundingStep"]:checked');
  return checked && checked.value === "0.1" ? 0.1 : 1;
}

function setRadio(name, value) {
  const nodes = document.querySelectorAll('input[name="' + name + '"]');
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].checked = nodes[i].value === String(value);
  }
}

function newUnit(partial) {
  return Object.assign(
    {
      id: "u" + state.unitSeq++,
      label: "",
      owner: "",
      shares: "",
      category: "residential",
      deduction: 0,
    },
    partial || {},
  );
}

function newItem(partial) {
  return Object.assign(
    {
      id: "i" + state.itemSeq++,
      name: "",
      mode: "amount",
      value: "",
      categories: "all",
    },
    partial || {},
  );
}

function readQuick() {
  return {
    total: $("quick-total").value,
    mine: $("quick-mine").value,
    all: $("quick-all").value,
    n: $("quick-n").value,
  };
}

function readMeta() {
  return {
    buildingName: $("building-name").value.trim(),
    ocName: $("oc-name").value.trim(),
    resolutionDate: $("resolution-date").value,
    resolutionRef: $("resolution-ref").value.trim(),
    payNotes: $("pay-notes").value.trim(),
    shareBasis: shareBasis(),
    roundingStep: roundingStep(),
    ocSubsidy: num($("oc-subsidy").value, 0),
    instalments: Math.max(1, Math.round(num($("instalments").value, 1))),
    firstDue: $("first-due").value,
  };
}

function applyMeta(meta) {
  if (!meta) return;
  state.suppressSave = true;
  $("building-name").value = meta.buildingName || "";
  $("oc-name").value = meta.ocName || "";
  $("resolution-date").value = meta.resolutionDate || "";
  $("resolution-ref").value = meta.resolutionRef || "";
  $("pay-notes").value = meta.payNotes || "";
  setRadio("shareBasis", meta.shareBasis || "undivided");
  setRadio("roundingStep", meta.roundingStep == 0.1 ? "0.1" : "1");
  $("oc-subsidy").value = meta.ocSubsidy != null ? meta.ocSubsidy : 0;
  $("instalments").value = meta.instalments != null ? meta.instalments : 1;
  $("first-due").value = meta.firstDue || "";
  state.suppressSave = false;
}

function applyQuick(q) {
  if (!q) return;
  state.suppressSave = true;
  $("quick-total").value = q.total != null ? q.total : "";
  $("quick-mine").value = q.mine != null ? q.mine : "";
  $("quick-all").value = q.all != null ? q.all : "";
  $("quick-n").value = q.n != null ? q.n : 1;
  state.suppressSave = false;
}

function snapshot() {
  return {
    lang: state.lang,
    unitSeq: state.unitSeq,
    itemSeq: state.itemSeq,
    units: state.units,
    items: state.items,
    meta: readMeta(),
    quick: readQuick(),
  };
}

function saveStore(force) {
  if (state.suppressSave && !force) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()));
    localStorage.setItem(LANG_KEY, state.lang);
  } catch (e) {
    /* private mode or quota */
  }
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const lang = localStorage.getItem(LANG_KEY);
    return {
      data: raw ? JSON.parse(raw) : null,
      lang: lang === "en" ? "en" : raw && JSON.parse(raw).lang === "en" ? "en" : "zh",
    };
  } catch (e) {
    return { data: null, lang: "zh" };
  }
}

function applyI18n() {
  const t = pack();
  const nodes = document.querySelectorAll("[data-i18n]");
  for (let i = 0; i < nodes.length; i++) {
    const key = nodes[i].getAttribute("data-i18n");
    if (t[key] != null) nodes[i].textContent = t[key];
  }
  $("lang-zh").setAttribute("aria-pressed", state.lang === "zh" ? "true" : "false");
  $("lang-en").setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
  document.documentElement.lang = state.lang === "en" ? "en-HK" : "zh-Hant-HK";
  renderUnits();
  renderItems();
  renderAll();
}

function categoryLabel(id) {
  const t = pack();
  if (id === "shop") return t.catShop;
  if (id === "carpark") return t.catCarpark;
  if (id === "other") return t.catOther;
  return t.catResidential;
}

function sharesLabel() {
  return shareBasis() === "management" ? pack().sharesManagement : pack().sharesUndivided;
}

function renderUnits() {
  const t = pack();
  const host = $("units-list");
  const head =
    '<div class="units-head" aria-hidden="true"><span>' +
    escapeHtml(t.unitLabel) +
    "</span><span>" +
    escapeHtml(t.owner) +
    "</span><span>" +
    escapeHtml(sharesLabel()) +
    "</span><span>" +
    escapeHtml(t.category) +
    "</span><span>" +
    escapeHtml(t.deduction) +
    "</span><span></span></div>";
  host.innerHTML =
    head +
    state.units
      .map((unit, index) => {
        const catOpts = CATEGORY_IDS.map((id) => {
          return (
            '<option value="' +
            id +
            '"' +
            (unit.category === id ? " selected" : "") +
            ">" +
            escapeHtml(categoryLabel(id)) +
            "</option>"
          );
        }).join("");
        return (
          '<div class="stack-card unit-card" data-unit="' +
          escapeHtml(unit.id) +
          '"><div class="card-top"><span class="idx">' +
          escapeHtml(t.unitLabel) +
          " " +
          (index + 1) +
          '</span><button type="button" class="secondary remove" data-remove-unit="' +
          escapeHtml(unit.id) +
          '">' +
          escapeHtml(t.remove) +
          "</button></div>" +
          '<label class="field"><span>' +
          escapeHtml(t.unitLabel) +
          '</span><input data-f="label" type="text" maxlength="40" value="' +
          escapeHtml(unit.label) +
          '" /></label>' +
          '<label class="field"><span>' +
          escapeHtml(t.owner) +
          '</span><input data-f="owner" type="text" maxlength="80" value="' +
          escapeHtml(unit.owner) +
          '" /></label>' +
          '<label class="field"><span>' +
          escapeHtml(sharesLabel()) +
          '</span><input data-f="shares" type="number" inputmode="decimal" min="0" step="any" value="' +
          escapeHtml(unit.shares) +
          '" /></label>' +
          '<label class="field"><span>' +
          escapeHtml(t.category) +
          '</span><select data-f="category">' +
          catOpts +
          "</select></label>" +
          '<label class="field"><span>' +
          escapeHtml(t.deduction) +
          '</span><input data-f="deduction" type="number" inputmode="decimal" min="0" step="0.01" value="' +
          escapeHtml(unit.deduction) +
          '" /></label>' +
          '<button type="button" class="secondary remove desktop-remove" data-remove-unit="' +
          escapeHtml(unit.id) +
          '">' +
          escapeHtml(t.remove) +
          "</button></div>"
        );
      })
      .join("");
}

function renderItems() {
  const t = pack();
  const host = $("items-list");
  host.innerHTML = state.items
    .map((item, index) => {
      const all = item.categories === "all";
      const selected = Array.isArray(item.categories) ? item.categories : CATEGORY_IDS;
      const catBoxes = CATEGORY_IDS.map((id) => {
        const on = all || selected.indexOf(id) !== -1;
        return (
          '<label class="check"><input data-cat="' +
          id +
          '" type="checkbox"' +
          (on ? " checked" : "") +
          " /> <span>" +
          escapeHtml(categoryLabel(id)) +
          "</span></label>"
        );
      }).join("");
      const valueLabel = item.mode === "percent" ? t.itemPercent : t.itemValue;
      return (
        '<div class="stack-card" data-item="' +
        escapeHtml(item.id) +
        '"><div class="card-top"><span class="idx">' +
        (index + 1) +
        '</span><button type="button" class="secondary remove" data-remove-item="' +
        escapeHtml(item.id) +
        '">' +
        escapeHtml(t.remove) +
        "</button></div>" +
        '<label class="field field-span"><span>' +
        escapeHtml(t.itemName) +
        '</span><input data-f="name" type="text" maxlength="80" value="' +
        escapeHtml(item.name) +
        '" /></label>' +
        '<label class="field"><span>' +
        escapeHtml(t.itemMode) +
        '</span><select data-f="mode"><option value="amount"' +
        (item.mode !== "percent" ? " selected" : "") +
        ">" +
        escapeHtml(t.modeAmount) +
        '</option><option value="percent"' +
        (item.mode === "percent" ? " selected" : "") +
        ">" +
        escapeHtml(t.modePercent) +
        "</option></select></label>" +
        '<label class="field"><span>' +
        escapeHtml(valueLabel) +
        '</span><input data-f="value" type="number" inputmode="decimal" min="0" step="any" value="' +
        escapeHtml(item.value) +
        '" /></label>' +
        '<div class="cats field-span"><span class="lbl">' +
        escapeHtml(t.itemCats) +
        '</span><label class="check"><input data-cat-all="1" type="checkbox"' +
        (all ? " checked" : "") +
        " /> <span>" +
        escapeHtml(t.catAll) +
        "</span></label>" +
        catBoxes +
        "</div></div>"
      );
    })
    .join("");
}

function errorText(err) {
  const t = pack();
  if (err.code === "blank-label") return t.errBlankLabel;
  if (err.code === "duplicate-label") return t.errDup + (err.label || "");
  if (err.code === "zero-shares") return t.errZero + (err.label || "");
  if (err.code === "category-zero-shares") return t.errCatZero + (err.name || "");
  if (err.code === "no-categories") return t.errNoCat + (err.name || "");
  if (err.code === "no-units") return t.errNoUnits;
  if (err.code === "no-items") return t.errNoItems;
  if (err.code === "negative-deduction") return t.errNegDed + (err.label || "");
  return err.code;
}

function isPristine() {
  const noUnitData = state.units.every((u) => {
    return !String(u.label || "").trim() && !num(u.shares, 0) && !String(u.owner || "").trim();
  });
  const noItemData = state.items.every((it) => {
    return !String(it.name || "").trim() && !num(it.value, 0);
  });
  return noUnitData && noItemData;
}

function renderErrors(errors) {
  const box = $("errors");
  const list = isPristine() ? [] : errors || [];
  if (!list.length) {
    box.className = "warn-box";
    box.innerHTML = "";
    return;
  }
  const t = pack();
  box.className = "warn-box is-on";
  box.innerHTML =
    "<h3>" +
    escapeHtml(t.errTitle) +
    "</h3><ul>" +
    errors
      .map((e) => "<li>" + escapeHtml(errorText(e)) + "</li>")
      .join("") +
    "</ul>";
}

function currentModel() {
  const meta = readMeta();
  return Object.assign({}, meta, {
    units: state.units,
    items: state.items,
  });
}

function renderQuick() {
  const t = pack();
  const q = readQuick();
  const r = quickShare(q.total, q.mine, q.all, q.n);
  const host = $("quick-out");
  if (!String(q.total || "").trim() && !String(q.mine || "").trim() && !String(q.all || "").trim()) {
    host.innerHTML = "";
    return;
  }
  if (!r.ok) {
    host.innerHTML = '<p class="hint">' + escapeHtml(t.quickNeed) + "</p>";
    return;
  }
  host.innerHTML =
    '<div class="kpi"><span>' +
    escapeHtml(t.quickAmount) +
    '</span><strong id="quick-amount">' +
    formatHKD(r.amount, 0.01) +
    "</strong></div><div class=\"kpi\"><span>" +
    escapeHtml(t.quickPct) +
    "</span><strong>" +
    r.pct.toFixed(4) +
    "%</strong></div><div class=\"kpi\"><span>" +
    escapeHtml(t.quickInstal) +
    "</span><strong>" +
    formatHKD(r.perInstalment, 0.01) +
    "</strong></div>";
}

function renderSummary(result) {
  const t = pack();
  const step = result.step;
  $("rounding-note").textContent = result.ok
    ? step === 0.1
      ? t.roundNote01
      : t.roundNote1
    : "";
  const kpis = $("summary-kpis");
  if (!result.ok) {
    kpis.innerHTML = "";
    $("summary-head").innerHTML = "";
    $("summary-body").innerHTML = "";
    $("summary-foot").innerHTML = "";
    return;
  }
  kpis.innerHTML =
    kpi(t.kpiGross, formatHKD(result.totals.gross, 0.01), "kpi-gross") +
    kpi(t.kpiSubsidy, formatHKD(result.totals.subsidy, 0.01), "kpi-subsidy") +
    kpi(t.kpiNet, formatHKD(result.totals.itemsColumnSum, step), "kpi-net") +
    kpi(t.kpiDeduct, formatHKD(result.totals.deductions, step), "kpi-deduct") +
    kpi(t.kpiPay, formatHKD(result.totals.payable, step), "kpi-pay");

  const itemHeads = result.items
    .map((item) => "<th>" + escapeHtml(item.name || t.colSub) + "</th>")
    .join("");
  $("summary-head").innerHTML =
    "<tr><th>" +
    escapeHtml(t.colUnit) +
    "</th><th>" +
    escapeHtml(t.colOwner) +
    "</th><th class=\"num\">" +
    escapeHtml(sharesLabel()) +
    "</th><th class=\"num\">" +
    escapeHtml(t.colPct) +
    "</th>" +
    itemHeads +
    "<th class=\"num\">" +
    escapeHtml(t.colSub) +
    "</th><th class=\"num\">" +
    escapeHtml(t.colDeduct) +
    "</th><th class=\"num\">" +
    escapeHtml(t.colPay) +
    "</th><th class=\"num\">" +
    escapeHtml(t.colInstal) +
    "</th></tr>";

  $("summary-body").innerHTML = result.rows
    .map((row) => {
      const itemCells = result.items
        .map((item) => '<td class="num">' + formatHKD(row.itemShares[item.id] || 0, step) + "</td>")
        .join("");
      const per = row.instalments && row.instalments.length ? row.instalments[0] : row.payable;
      return (
        "<tr><th scope=\"row\">" +
        escapeHtml(row.label) +
        "</th><td>" +
        escapeHtml(row.owner || "") +
        '</td><td class="num">' +
        escapeHtml(String(row.shares)) +
        '</td><td class="num">' +
        row.pct.toFixed(2) +
        "%</td>" +
        itemCells +
        '<td class="num">' +
        formatHKD(row.itemsTotal, step) +
        '</td><td class="num">' +
        formatHKD(row.deduction, step) +
        '</td><td class="num">' +
        formatHKD(row.payable, step) +
        '</td><td class="num">' +
        formatHKD(per, step) +
        "</td></tr>"
      );
    })
    .join("");

  const footItems = result.items
    .map((item) => '<td class="num">' + formatHKD(item.steppedTotal, step) + "</td>")
    .join("");
  $("summary-foot").innerHTML =
    "<tr><th scope=\"row\">" +
    escapeHtml(t.colTotal) +
    "</th><td></td><td class=\"num\">" +
    escapeHtml(String(result.totals.totalShares)) +
    '</td><td class="num">100%</td>' +
    footItems +
    '<td class="num">' +
    formatHKD(result.totals.itemsColumnSum, step) +
    '</td><td class="num">' +
    formatHKD(result.totals.deductions, step) +
    '</td><td class="num" id="total-payable">' +
    formatHKD(result.totals.payable, step) +
    "</td><td></td></tr>";
}

function kpi(label, value, id) {
  return (
    '<div class="kpi"><span>' +
    escapeHtml(label) +
    "</span><strong" +
    (id ? ' id="' + id + '"' : "") +
    ">" +
    escapeHtml(value) +
    "</strong></div>"
  );
}

function renderNotices(result) {
  const host = $("notices");
  if (!result.ok) {
    host.innerHTML = "";
    return;
  }
  const meta = readMeta();
  const t = pack();
  const note =
    result.rows.length > 1
      ? '<p class="muted no-print" id="notice-preview-note">' +
        escapeHtml(t.previewMore) +
        " (" +
        result.rows.length +
        ")</p>"
      : "";
  host.innerHTML =
    note + result.rows.map((row) => renderNotice(row, result, meta, t)).join("");
}

function renderNotice(row, result, meta, t) {
  const step = result.step;
  const itemRows = result.items
    .map((item, i) => {
      return (
        "<tr><td>" +
        (i + 1) +
        ". " +
        escapeHtml(item.name || "") +
        '</td><td class="num">' +
        formatHKD(row.itemShares[item.id] || 0, step) +
        "</td></tr>"
      );
    })
    .join("");
  const schedule = row.instalments
    .map((amt, i) => {
      const d = result.dates[i] || "";
      return (
        "<tr><td>第 " +
        (i + 1) +
        " 期 / Instalment " +
        (i + 1) +
        " · " +
        formatDateZh(d) +
        " · " +
        formatDateEn(d) +
        '</td><td class="num">' +
        formatHKD(amt, step) +
        "</td></tr>"
      );
    })
    .join("");
  const basis =
    meta.shareBasis === "management"
      ? "管理份數 / Management shares"
      : "業權份數 / Undivided shares";
  return (
    '<article class="notice-sheet"><header class="notice-head"><div><h2 class="notice-title">繳款通知<small>Payment Notice</small></h2></div><div class="notice-chop" aria-hidden="true">繳款<br>NOTICE</div></header>' +
    '<div class="meta">' +
    '<div><span class="k">大廈 / Building</span><span>' +
    blankOr(meta.buildingName) +
    "</span></div>" +
    '<div><span class="k">法團 / Owners’ corporation</span><span>' +
    blankOr(meta.ocName) +
    "</span></div>" +
    '<div><span class="k">決議日期／編號 / Resolution</span><span>' +
    (meta.resolutionDate ? formatDateZh(meta.resolutionDate) + " · " + formatDateEn(meta.resolutionDate) : "________") +
    (meta.resolutionRef ? " · " + escapeHtml(meta.resolutionRef) : "") +
    "</span></div>" +
    '<div><span class="k">單位 / Unit</span><span>' +
    blankOr(row.label) +
    "</span></div>" +
    '<div><span class="k">業主 / Owner</span><span>' +
    blankOr(row.owner) +
    "</span></div>" +
    '<div><span class="k">' +
    basis +
    "</span><span>" +
    escapeHtml(String(row.shares)) +
    " (" +
    row.pct.toFixed(2) +
    "%)</span></div>" +
    "</div>" +
    '<table class="lines"><thead><tr><th>項目 / Item</th><th>金額 / Amount</th></tr></thead><tbody>' +
    itemRows +
    (row.deduction
      ? '<tr><td>扣減／已付 / Deduction or already paid</td><td class="num">−' +
        formatHKD(row.deduction, step) +
        "</td></tr>"
      : "") +
    '</tbody><tfoot><tr class="total-row"><th>應付合計 / Total payable</th><td class="num">' +
    formatHKD(row.payable, step) +
    "</td></tr></tfoot></table>" +
    (result.instalmentCount > 1
      ? "<h3>分期 / Instalments</h3><table class=\"lines\"><tbody>" + schedule + "</tbody></table>"
      : result.dates[0]
        ? '<p>到期日 / Due date：' + formatDateZh(result.dates[0]) + " · " + formatDateEn(result.dates[0]) + "</p>"
        : "") +
    (meta.payNotes
      ? "<p><strong>付款方法 / Payment method</strong><br />" + escapeHtml(meta.payNotes) + "</p>"
      : "") +
    '<p class="formula"><strong>計算方式 / Formula used</strong><br />' +
    escapeHtml(I18N.zh.formulaZh) +
    "<br />" +
    escapeHtml(I18N.en.formulaEn) +
    "</p>" +
    '<div class="signs"><div class="sign"><div class="line"></div><p class="who">法團／管理處 / OC or manager</p></div><div class="sign"><div class="line"></div><p class="who">業主簽收 / Owner acknowledgement</p></div></div>' +
    '<p class="receipt-note">只供參考，並非法律或專業意見；實際分攤須以大廈公契、法團決議及《建築物管理條例》為準。 For reference only; follow your DMC, OC resolutions and Cap. 344.</p></article>'
  );
}

function renderAll() {
  renderQuick();
  const result = compute(currentModel());
  renderErrors(result.errors);
  renderSummary(result);
  renderNotices(result);
  const hasRows = result.ok && result.rows.length > 0;
  $("download-csv").disabled = !hasRows;
  $("copy-summary").disabled = !hasRows;
  $("print-btn").disabled = !hasRows;
  return result;
}

function onUnitInput(ev) {
  const card = ev.target.closest("[data-unit]");
  if (!card) return;
  const unit = state.units.find((u) => u.id === card.getAttribute("data-unit"));
  if (!unit) return;
  const field = ev.target.getAttribute("data-f");
  if (!field) return;
  unit[field] = ev.target.type === "number" ? ev.target.value : ev.target.value;
  saveStore();
  renderAll();
}

function onItemInput(ev) {
  const card = ev.target.closest("[data-item]");
  if (!card) return;
  const item = state.items.find((it) => it.id === card.getAttribute("data-item"));
  if (!item) return;
  const t = ev.target;
  if (t.getAttribute("data-f")) {
    item[t.getAttribute("data-f")] = t.value;
    if (t.getAttribute("data-f") === "mode") renderItems();
  } else if (t.getAttribute("data-cat-all")) {
    item.categories = t.checked ? "all" : CATEGORY_IDS.slice();
    renderItems();
  } else if (t.getAttribute("data-cat")) {
    const id = t.getAttribute("data-cat");
    let selected = item.categories === "all" ? CATEGORY_IDS.slice() : (item.categories || []).slice();
    if (t.checked) {
      if (selected.indexOf(id) === -1) selected.push(id);
    } else {
      selected = selected.filter((c) => c !== id);
    }
    item.categories = selected.length === CATEGORY_IDS.length ? "all" : selected;
    renderItems();
  }
  saveStore();
  renderAll();
}

function loadDemo() {
  const demo = demoModel();
  state.units = demo.units.map((u) => Object.assign({}, u));
  state.items = demo.items.map((it) =>
    Object.assign({}, it, {
      categories: it.categories === "all" ? "all" : it.categories.slice(),
    }),
  );
  state.unitSeq = state.units.length + 1;
  state.itemSeq = state.items.length + 1;
  applyMeta(demo);
  applyQuick({
    total: 6912000,
    mine: 50,
    all: 1220,
    n: 4,
  });
  renderUnits();
  renderItems();
  saveStore();
  renderAll();
}

function defaultEmpty() {
  state.units = [newUnit({ label: "", shares: "" })];
  state.items = [newItem({ name: "", value: "" })];
  applyMeta({
    buildingName: "",
    ocName: "",
    resolutionDate: "",
    resolutionRef: "",
    payNotes: "",
    shareBasis: "undivided",
    roundingStep: 1,
    ocSubsidy: 0,
    instalments: 1,
    firstDue: "",
  });
  applyQuick({ total: "", mine: "", all: "", n: 1 });
}

function downloadCsv() {
  const result = compute(currentModel());
  if (!result.ok) return;
  const csv = summaryToCsv(result, currentModel(), state.lang);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "repair-levy.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 500);
}

async function copySummary() {
  const result = compute(currentModel());
  const text = summaryToText(result, currentModel(), state.lang);
  const status = $("copy-status");
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    status.textContent = pack().copied;
  } catch (e) {
    status.textContent = pack().copyFail;
  }
}

function clearData() {
  if (!window.confirm(pack().confirmClear)) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    /* ignore */
  }
  state.unitSeq = 1;
  state.itemSeq = 1;
  defaultEmpty();
  renderUnits();
  renderItems();
  $("copy-status").textContent = "";
  saveStore(true);
  renderAll();
}

function importPaste() {
  const parsed = parsePaste($("paste-input").value);
  if (!parsed.units.length) {
    $("errors").className = "warn-box is-on";
    $("errors").innerHTML = "<p>" + escapeHtml(pack().errPaste) + "</p>";
    return;
  }
  state.units = parsed.units.map((u) => newUnit(u));
  renderUnits();
  saveStore();
  renderAll();
  if (parsed.errors.length) {
    const extra = [{ code: "paste-short" }];
    renderErrors(compute(currentModel()).errors.concat(extra));
    $("errors").insertAdjacentHTML("beforeend", "<p>" + escapeHtml(pack().errPaste) + "</p>");
  }
}

function restoreFrom(data) {
  if (!data) return false;
  state.unitSeq = num(data.unitSeq, 1);
  state.itemSeq = num(data.itemSeq, 1);
  state.units = Array.isArray(data.units) && data.units.length ? data.units : [];
  state.items = Array.isArray(data.items) && data.items.length ? data.items : [];
  if (!state.units.length) return false;
  applyMeta(data.meta);
  applyQuick(data.quick);
  return true;
}

function init() {
  const stored = loadStore();
  state.lang = stored.lang === "en" ? "en" : "zh";
  if (!restoreFrom(stored.data)) {
    defaultEmpty();
  }
  applyI18n();

  $("lang-zh").addEventListener("click", function () {
    state.lang = "zh";
    applyI18n();
    saveStore(true);
  });
  $("lang-en").addEventListener("click", function () {
    state.lang = "en";
    applyI18n();
    saveStore(true);
  });
  $("save-draft").addEventListener("click", function () {
    saveStore(true);
    $("draft-hint").textContent = pack().draftSaved;
  });
  $("clear-data").addEventListener("click", clearData);
  $("demo-btn").addEventListener("click", loadDemo);
  $("add-unit").addEventListener("click", function () {
    state.units.push(newUnit());
    renderUnits();
    saveStore();
    renderAll();
  });
  $("add-item").addEventListener("click", function () {
    state.items.push(newItem());
    renderItems();
    saveStore();
    renderAll();
  });
  $("toggle-paste").addEventListener("click", function () {
    const box = $("paste-box");
    box.hidden = !box.hidden;
  });
  $("import-paste").addEventListener("click", importPaste);
  $("download-csv").addEventListener("click", downloadCsv);
  $("copy-summary").addEventListener("click", copySummary);
  $("print-btn").addEventListener("click", function () {
    window.print();
  });
  $("units-list").addEventListener("input", onUnitInput);
  $("units-list").addEventListener("change", onUnitInput);
  $("units-list").addEventListener("click", function (ev) {
    const btn = ev.target.closest("[data-remove-unit]");
    if (!btn) return;
    const id = btn.getAttribute("data-remove-unit");
    state.units = state.units.filter((u) => u.id !== id);
    if (!state.units.length) state.units.push(newUnit());
    renderUnits();
    saveStore();
    renderAll();
  });
  $("items-list").addEventListener("input", onItemInput);
  $("items-list").addEventListener("change", onItemInput);
  $("items-list").addEventListener("click", function (ev) {
    const btn = ev.target.closest("[data-remove-item]");
    if (!btn) return;
    const id = btn.getAttribute("data-remove-item");
    state.items = state.items.filter((it) => it.id !== id);
    if (!state.items.length) state.items.push(newItem());
    renderItems();
    saveStore();
    renderAll();
  });
  ["quick-total", "quick-mine", "quick-all", "quick-n"].forEach((id) => {
    $(id).addEventListener("input", function () {
      saveStore();
      renderQuick();
    });
  });
  [
    "building-name",
    "oc-name",
    "resolution-date",
    "resolution-ref",
    "pay-notes",
    "oc-subsidy",
    "instalments",
    "first-due",
  ].forEach((id) => {
    $(id).addEventListener("input", function () {
      saveStore();
      renderAll();
    });
    $(id).addEventListener("change", function () {
      saveStore();
      renderAll();
    });
  });
  document.querySelectorAll('input[name="shareBasis"], input[name="roundingStep"]').forEach((el) => {
    el.addEventListener("change", function () {
      renderUnits();
      saveStore();
      renderAll();
    });
  });
}

init();
