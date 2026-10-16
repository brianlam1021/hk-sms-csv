import {
  TUNNEL_KEYS,
  compute,
  demoLantau,
  demoNt,
  demoUrban,
  emptySettings,
  formatMoney,
  formatNum,
  tunnelAllowed,
} from "./taxi.js";

const STORAGE_KEY = "hk-taxi-fare:v1";
const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "的士車費估算",
    docTitle: "的士車費估算｜市區新界大嶼山 香港 · Taxi fare",
    lede: "按運輸署2024年7月14日起收費表，估算市區、新界或大嶼山跳錶、等候、行李、電召與隧道附加費。不用註冊，不會上傳。",
    notice: "只供估算，並非運輸署官方工具或跳錶；實際以憲報收費表、車廂收費表及的士跳錶為準。本頁不規劃路線、不讀GPS。",
    explainTitle: "為甚麼需要這個工具",
    explainBody: "運輸署網站有市區／新界／大嶼山收費表和換算表PDF，但沒有把路程、等候、行李與過海回程一次加起來的互動頁。官方表在手機上要橫看，隧道附加費又分過海回程與其他隧道。本頁把憲報數字在瀏覽器內加總，方便對照跳錶或預先帶現金。",
    tableType: "類別",
    tableFlag: "首2公里",
    tableInc: "其後每200米／每分鐘",
    demoUrbanBtn: "市區過海示範",
    demoNtBtn: "新界示範",
    demoLantauBtn: "大嶼山示範",
    clearData: "清除資料 Clear data",
    formTitle: "行程",
    typeLegend: "的士類別",
    typeUrban: "市區（紅的）",
    typeNt: "新界（綠的）",
    typeLantau: "大嶼山（藍的）",
    tripLegend: "路程與等候",
    distance: "路程（公里）",
    distanceHint: "首2公里已包在旗落價。其後每200米（或其部分）跳一格。請自行填地圖顯示的路程。",
    waiting: "等候（分鐘）",
    waitingHint: "停車等候時，每1分鐘（或其部分）等同跳一格。行車中的時間不用再加。",
    extraLegend: "其他收費",
    baggage: "行李件數",
    baggageHint: "每件$6。車廂內輕便手提行李一般免收；擺放在尾箱，或長＋闊＋高超過140厘米的車廂行李要收費。嬰兒車同樣準則。輪椅／拐杖免費。",
    animals: "動物或鳥類",
    animalsHint: "每隻$5。",
    booking: "電召／電話預約（每程$5）",
    harbourLegend: "過海隧道（市區的士）",
    harbourNone: "沒有過海",
    harbourOneWay: "過海、不用回程（$25）",
    harbourReturn: "過海並付回程（$25+$25）",
    harbourHint: "紅磡海底隧道、東區海底隧道、西區海底隧道同一附加費。在過海的士站上車，或目的地不在海港另一方，不用回程費。",
    tunnelLegend: "其他隧道／收費區附加費",
    tunTaiLam: "大欖隧道 $28",
    tunTates: "大老山隧道 $20",
    tunAberdeen: "香港仔隧道 $8",
    tunShingMun: "城門隧道 $8",
    tunLionRock: "獅子山隧道 $8",
    tunTsingSha: "青沙管制區 $8",
    tunnelHint: "這是乘客應付的附加費（運輸署收費表），不是私家車時段收費。新界的士表只列大欖與城門；大嶼山的士表沒有隧道附加費。",
    draftStatus: "設定會自動保存在此瀏覽器（可選）。",
    heroTotal: "估計應付",
    heroSub: "{type}　{km} km　等候 {wait} 分鐘",
    kpiMeter: "跳錶",
    kpiExtras: "其他收費",
    kpiTunnels: "隧道附加費",
    kpiUnits: "跳錶格數",
    rowFlag: "旗落（首2公里）",
    rowInc1: "其後 {n} 格 × {rate}",
    rowInc2: "門檻後 {n} 格 × {rate}",
    rowMeter: "跳錶小計",
    rowBaggage: "行李 {n} 件 × $6",
    rowAnimals: "動物／鳥類 {n} 隻 × $5",
    rowBooking: "電召預約",
    rowHarbourOneWay: "過海隧道（單程）",
    rowHarbourReturn: "過海隧道（含回程）",
    tunTaiLamRow: "大欖隧道",
    tunTatesRow: "大老山隧道",
    tunAberdeenRow: "香港仔隧道",
    tunShingMunRow: "城門隧道",
    tunLionRockRow: "獅子山隧道",
    tunTsingShaRow: "青沙管制區",
    rowTotal: "估計應付",
    formulaTitle: "計算步驟",
    formulaFlag: "旗落 = {flag}（首2公里或其部分）",
    formulaDist: "路程 {km} km → 首2公里後 {extraM} 米 → {n} 格",
    formulaWait: "等候 {wait} 分鐘 → {n} 格",
    formulaInc1: "其後 {n} 格 × {rate} = {amount}",
    formulaInc2: "應收款額達 {th} 後 {n} 格 × {rate} = {amount}",
    formulaMeter: "跳錶 = {meter}",
    formulaExtra: "其他收費 = {extras}",
    formulaTunnel: "隧道附加費 = {tunnels}",
    formulaTotal: "合計 = {meter} + {extras} + {tunnels} = {total}",
    warnBadDistance: "請輸入 0 或以上的路程（公里）。",
    warnBadWaiting: "請輸入 0 或以上的等候分鐘。",
    warnBadBaggage: "行李件數請填 0 或正整數。",
    warnBadAnimals: "動物／鳥類請填 0 或正整數。",
    warnFracBaggage: "行李件數請用整數。",
    warnFracAnimals: "動物／鳥類請用整數。",
    warnZeroDistance: "路程為 0 仍收旗落價（首2公里或其部分）。",
    warnLongTrip: "超過 80 公里的估算較易偏離實際跳錶（塞車、繞路）。",
    warnHarbourIgnored: "過海附加費只適用於市區的士，已忽略。",
    warnTunnelIgnored: "所選隧道不在此類的士的運輸署收費表，已忽略。",
    faqTitle: "常見問題",
    faq1q: "香港市區的士跳錶怎樣計？",
    faq1a: "由2024年7月14日起，市區的士首2公里（或其部分）$29。其後每200米或每分鐘等候（或其部分）先加$2.1，直至應收款額達$102.5；之後每格$1.4。行李每件$6、動物／鳥類每隻$5、電召每程$5。過海隧道一般是隧道費$25加回程$25。",
    faq2q: "過海的士何時不用付回程費？",
    faq2a: "運輸署列明：在過海的士站上車，或最終目的地並非海港另一方，乘客毋須繳付$25回程費，但仍須付該程$25隧道費。",
    faq3q: "新界同大嶼山有何分別？",
    faq3a: "新界的士旗落$25.5，其後每格$1.9直至$82.5，之後$1.4。大嶼山旗落$24，其後$1.9直至$195，之後$1.6。行李、動物、電召三類附加費相同。新界表另列大欖$28、城門$8；大嶼山表沒有隧道附加費。",
    faq4q: "這是不是官方跳錶或GPS車資？",
    faq4a: "不是。運輸署只公布靜態收費表與換算表，沒有互動估算器。本頁按你填的路程與等候在瀏覽器內加總，不是稅表跳錶，也不用地圖或收費API。實際以車廂收費表及跳錶為準。",
    faq5q: "資料會上傳嗎？",
    faq5a: "不會。路程與附加費只在瀏覽器內計算，草稿可寫入本機 localStorage。沒有帳戶、沒有伺服器存檔。",
    sourcesTitle: "資料來源 / Sources",
    srcTd: "運輸署 — 的士收費表（2024年7月14日起）：",
    srcPdf: "運輸署 — 車廂收費表（2026年5月10日版，市區／新界）：",
    srcAsOf: "以上收費於2026年10月16日核對運輸署網頁（由2024年7月14日起生效；車廂表2026年5月10日版）。跳錶以憲報為準。",
    privacyTitle: "私隱",
    privacyBody: "路程與附加費數字只留在這個瀏覽器（localStorage，可選）。本頁不上傳、不設帳號、不設後端。",
    disclaimer: "只供估算，並非運輸署官方計算或跳錶讀數。 / Estimate only; not a TD tool or taximeter reading.",
  },
  en: {
    pageTitle: "Taxi fare estimator",
    docTitle: "Taxi fare estimator | urban / NT / Lantau Hong Kong",
    lede: "Estimate urban, NT or Lantau meter fare, waiting, baggage, phone booking and tunnel extras from the Transport Department scale in force from 14 July 2024. No sign-up, nothing uploaded.",
    notice: "Estimate only — not a TD tool or taximeter. The gazette scale, the in-taxi table and the meter prevail. This page does not route a trip or read GPS.",
    explainTitle: "Why this tool exists",
    explainBody: "TD publishes urban / NT / Lantau fare tables and conversion PDFs, but not an interactive adder for distance, waiting, baggage and the harbour return toll. The official table is awkward on a phone. This page totals the gazetted figures in your browser so you can check a meter or bring cash.",
    tableType: "Type",
    tableFlag: "First 2 km",
    tableInc: "Each later 200 m / minute",
    demoUrbanBtn: "Urban harbour demo",
    demoNtBtn: "NT demo",
    demoLantauBtn: "Lantau demo",
    clearData: "Clear data",
    formTitle: "Trip",
    typeLegend: "Taxi type",
    typeUrban: "Urban (red)",
    typeNt: "New Territories (green)",
    typeLantau: "Lantau (blue)",
    tripLegend: "Distance and waiting",
    distance: "Distance (km)",
    distanceHint: "The first 2 km is in the flag-fall. After that, each 200 m (or part) is one unit. Type the distance yourself from a map.",
    waiting: "Waiting (minutes)",
    waitingHint: "While hired but stopped, each 1 minute (or part) is one unit — the same as 200 m. Do not add moving time.",
    extraLegend: "Other charges",
    baggage: "Pieces of baggage",
    baggageHint: "$6 each. Light personal hand baggage in the passenger compartment is usually free. Charge applies to items in the boot, or cabin bags whose L+W+H exceed 140 cm. Baby prams follow the same rule. Wheelchairs / crutches are free.",
    animals: "Animals or birds",
    animalsHint: "$5 each.",
    booking: "Telephone / app booking ($5 per hiring)",
    harbourLegend: "Harbour tunnels (urban taxis)",
    harbourNone: "No harbour crossing",
    harbourOneWay: "Harbour crossing, no return ($25)",
    harbourReturn: "Harbour crossing plus return ($25+$25)",
    harbourHint: "Cross-Harbour Tunnel, Eastern Harbour Crossing and Western Harbour Crossing share this extra. No return toll if you board at a cross-harbour taxi stand, or the destination is not on the other side of the harbour.",
    tunnelLegend: "Other tunnel / toll-area extras",
    tunTaiLam: "Tai Lam Tunnel $28",
    tunTates: "Tate's Cairn Tunnel $20",
    tunAberdeen: "Aberdeen Tunnel $8",
    tunShingMun: "Shing Mun Tunnels $8",
    tunLionRock: "Lion Rock Tunnel $8",
    tunTsingSha: "Tsing Sha Control Area $8",
    tunnelHint: "These are the passenger extras on the TD taxi fare table, not private-car time-varying tolls. The NT table lists only Tai Lam and Shing Mun; the Lantau table lists none.",
    draftStatus: "Settings are saved in this browser (optional).",
    heroTotal: "Estimated total",
    heroSub: "{type} · {km} km · waiting {wait} min",
    kpiMeter: "Meter",
    kpiExtras: "Other charges",
    kpiTunnels: "Tunnel extras",
    kpiUnits: "Meter units",
    rowFlag: "Flag-fall (first 2 km)",
    rowInc1: "Next {n} units × {rate}",
    rowInc2: "After threshold {n} units × {rate}",
    rowMeter: "Meter subtotal",
    rowBaggage: "Baggage {n} × $6",
    rowAnimals: "Animals / birds {n} × $5",
    rowBooking: "Telephone booking",
    rowHarbourOneWay: "Harbour tunnel (one way)",
    rowHarbourReturn: "Harbour tunnel (incl. return)",
    tunTaiLamRow: "Tai Lam Tunnel",
    tunTatesRow: "Tate's Cairn Tunnel",
    tunAberdeenRow: "Aberdeen Tunnel",
    tunShingMunRow: "Shing Mun Tunnels",
    tunLionRockRow: "Lion Rock Tunnel",
    tunTsingShaRow: "Tsing Sha Control Area",
    rowTotal: "Estimated total",
    formulaTitle: "Steps",
    formulaFlag: "Flag-fall = {flag} (first 2 km or part)",
    formulaDist: "Distance {km} km → {extraM} m after 2 km → {n} units",
    formulaWait: "Waiting {wait} min → {n} units",
    formulaInc1: "Next {n} units × {rate} = {amount}",
    formulaInc2: "After chargeable {th}, {n} units × {rate} = {amount}",
    formulaMeter: "Meter = {meter}",
    formulaExtra: "Other charges = {extras}",
    formulaTunnel: "Tunnel extras = {tunnels}",
    formulaTotal: "Total = {meter} + {extras} + {tunnels} = {total}",
    warnBadDistance: "Enter a distance of 0 km or more.",
    warnBadWaiting: "Enter waiting minutes of 0 or more.",
    warnBadBaggage: "Baggage count must be 0 or a whole number.",
    warnBadAnimals: "Animals / birds must be 0 or a whole number.",
    warnFracBaggage: "Use a whole number for baggage.",
    warnFracAnimals: "Use a whole number for animals / birds.",
    warnZeroDistance: "A 0 km hiring still pays flag-fall (first 2 km or part).",
    warnLongTrip: "Trips over 80 km drift from a real meter (jams, detours).",
    warnHarbourIgnored: "Harbour extras apply to urban taxis only and were ignored.",
    warnTunnelIgnored: "A selected tunnel is not on this taxi type’s TD table and was ignored.",
    faqTitle: "FAQ",
    faq1q: "How is the urban taxi meter calculated?",
    faq1a: "From 14 July 2024, urban taxis charge $29 for the first 2 km (or part). Each later 200 m or waiting minute (or part) is $2.1 until the chargeable amount reaches $102.5, then $1.4. Baggage is $6, animals/birds $5, telephone booking $5. Harbour tunnels are usually $25 toll plus $25 return.",
    faq2q: "When is the harbour return toll not payable?",
    faq2a: "TD says passengers need not pay the $25 return toll if the hiring begins at a cross-harbour taxi stand, or the final destination is not on the opposite side of the harbour. The $25 tunnel toll for the hiring still applies.",
    faq3q: "How do NT and Lantau taxis differ?",
    faq3a: "NT flag-fall is $25.5, then $1.9 until $82.5, then $1.4. Lantau flag-fall is $24, then $1.9 until $195, then $1.6. Baggage, animals and booking extras are the same. The NT table also lists Tai Lam $28 and Shing Mun $8; Lantau lists no tunnel extras.",
    faq4q: "Is this an official meter or GPS fare?",
    faq4a: "No. TD publishes static tables and conversion charts, not an interactive estimator. This page adds the distance and waiting you type, in the browser. It is not a taximeter and uses no map or toll API. The in-taxi table and meter prevail.",
    faq5q: "Is anything uploaded?",
    faq5a: "No. Distance and extras stay in this browser and may be written to localStorage. No account, no server copy.",
    sourcesTitle: "Sources",
    srcTd: "Transport Department — Taxi fare of Hong Kong (from 14 July 2024):",
    srcPdf: "Transport Department — in-taxi fare table (10 May 2026 edition, urban / NT):",
    srcAsOf: "Figures checked against the TD pages on 16 October 2026 (in force from 14 July 2024; in-taxi table dated 10 May 2026). The gazette scale prevails.",
    privacyTitle: "Privacy",
    privacyBody: "Distance and extras stay in this browser (optional localStorage). Nothing is uploaded. There is no account and no backend.",
    disclaimer: "Estimate only; not a TD tool or taximeter reading. / 只供估算，並非運輸署官方計算或跳錶讀數。",
  },
};

const TUNNEL_ROW = {
  harbourOneWay: "rowHarbourOneWay",
  harbourReturn: "rowHarbourReturn",
  taiLam: "tunTaiLamRow",
  tatesCairn: "tunTatesRow",
  aberdeen: "tunAberdeenRow",
  shingMun: "tunShingMunRow",
  lionRock: "tunLionRockRow",
  tsingSha: "tunTsingShaRow",
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

function typeLabel(type) {
  var t = pack();
  if (type === "nt") return t.typeNt;
  if (type === "lantau") return t.typeLantau;
  return t.typeUrban;
}

function readForm() {
  var next = Object.assign({}, state.settings);
  next.distanceKm = Number($("distance").value);
  next.waitingMin = Number($("waiting").value);
  next.baggage = Number($("baggage").value);
  next.animals = Number($("animals").value);
  next.booking = $("booking").checked;
  var harbour = document.querySelector('input[name="harbour"]:checked');
  next.harbour = harbour ? harbour.value : "none";
  for (var i = 0; i < TUNNEL_KEYS.length; i++) {
    var key = TUNNEL_KEYS[i];
    var el = $(key);
    next[key] = !!(el && el.checked);
  }
  return next;
}

function writeForm(settings) {
  $("distance").value = settings.distanceKm;
  $("waiting").value = settings.waitingMin;
  $("baggage").value = settings.baggage;
  $("animals").value = settings.animals;
  $("booking").checked = !!settings.booking;
  var harbour = settings.harbour === "oneWay" || settings.harbour === "return" ? settings.harbour : "none";
  var radios = document.querySelectorAll('input[name="harbour"]');
  for (var i = 0; i < radios.length; i++) {
    radios[i].checked = radios[i].value === harbour;
  }
  for (var j = 0; j < TUNNEL_KEYS.length; j++) {
    var key = TUNNEL_KEYS[j];
    var el = $(key);
    if (el) el.checked = !!settings[key];
  }
  syncChrome(settings);
}

function syncChrome(settings) {
  var buttons = document.querySelectorAll(".type");
  for (var i = 0; i < buttons.length; i++) {
    var key = buttons[i].getAttribute("data-type");
    buttons[i].setAttribute("aria-pressed", key === settings.type ? "true" : "false");
  }
  var harbourField = $("harbour-field");
  if (harbourField) harbourField.hidden = settings.type !== "urban";
  var tunnelLabels = document.querySelectorAll(".tunnel");
  var anyTunnel = false;
  for (var j = 0; j < tunnelLabels.length; j++) {
    var allowed = (tunnelLabels[j].getAttribute("data-tunnels") || "")
      .split(",")
      .indexOf(settings.type) !== -1;
    tunnelLabels[j].hidden = !allowed;
    if (allowed) anyTunnel = true;
  }
  var tunnelField = $("tunnel-field");
  if (tunnelField) tunnelField.hidden = !anyTunnel;
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
    badDistance: t.warnBadDistance,
    badWaiting: t.warnBadWaiting,
    badBaggage: t.warnBadBaggage,
    badAnimals: t.warnBadAnimals,
    fracBaggage: t.warnFracBaggage,
    fracAnimals: t.warnFracAnimals,
    zeroDistance: t.warnZeroDistance,
    longTrip: t.warnLongTrip,
    harbourIgnored: t.warnHarbourIgnored,
    tunnelIgnored: t.warnTunnelIgnored,
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
  var extraM = Math.max(0, Math.round(result.distanceKm * 1000) - 2000);
  var vars = {
    flag: formatMoney(result.scale.flag, 1),
    km: formatNum(result.distanceKm, 1),
    extraM: formatNum(extraM, 0),
    n: formatNum(result.distUnits, 0),
    wait: formatNum(result.waitingMin, 1),
    rate: formatMoney(result.scale.inc1, 1),
    amount: formatMoney(result.unitsInc1 * result.scale.inc1, 1),
    th: formatMoney(result.scale.threshold, 1),
    meter: formatMoney(result.meter, 1),
    extras: formatMoney(result.extras, 1),
    tunnels: formatMoney(result.tunnelFee, 1),
    total: formatMoney(result.total, 1),
  };
  var blocks = [fill(t.formulaFlag, vars), fill(t.formulaDist, vars)];
  blocks.push(fill(t.formulaWait, { wait: vars.wait, n: formatNum(result.waitUnits, 0) }));
  if (result.unitsInc1) {
    blocks.push(
      fill(t.formulaInc1, {
        n: formatNum(result.unitsInc1, 0),
        rate: formatMoney(result.scale.inc1, 1),
        amount: formatMoney(result.unitsInc1 * result.scale.inc1, 1),
      })
    );
  }
  if (result.unitsInc2) {
    blocks.push(
      fill(t.formulaInc2, {
        th: vars.th,
        n: formatNum(result.unitsInc2, 0),
        rate: formatMoney(result.scale.inc2, 1),
        amount: formatMoney(result.unitsInc2 * result.scale.inc2, 1),
      })
    );
  }
  blocks.push(fill(t.formulaMeter, vars));
  blocks.push(fill(t.formulaExtra, vars));
  blocks.push(fill(t.formulaTunnel, vars));
  blocks.push(fill(t.formulaTotal, vars));
  return blocks.join("\n");
}

function breakdownRows(result) {
  var t = pack();
  if (!result.ok) return [];
  var rows = [[t.rowFlag, formatMoney(result.scale.flag, 1)]];
  if (result.unitsInc1) {
    rows.push([
      fill(t.rowInc1, {
        n: formatNum(result.unitsInc1, 0),
        rate: formatMoney(result.scale.inc1, 1),
      }),
      formatMoney(result.unitsInc1 * result.scale.inc1, 1),
    ]);
  }
  if (result.unitsInc2) {
    rows.push([
      fill(t.rowInc2, {
        n: formatNum(result.unitsInc2, 0),
        rate: formatMoney(result.scale.inc2, 1),
      }),
      formatMoney(result.unitsInc2 * result.scale.inc2, 1),
    ]);
  }
  rows.push([t.rowMeter, formatMoney(result.meter, 1)]);
  if (result.baggageFee) {
    rows.push([
      fill(t.rowBaggage, { n: formatNum(result.baggageFee / 6, 0) }),
      formatMoney(result.baggageFee, 1),
    ]);
  }
  if (result.animalFee) {
    rows.push([
      fill(t.rowAnimals, { n: formatNum(result.animalFee / 5, 0) }),
      formatMoney(result.animalFee, 1),
    ]);
  }
  if (result.bookingFee) {
    rows.push([t.rowBooking, formatMoney(result.bookingFee, 1)]);
  }
  for (var i = 0; i < result.tunnelLines.length; i++) {
    var line = result.tunnelLines[i];
    var labelKey = TUNNEL_ROW[line.key];
    rows.push([t[labelKey] || line.key, formatMoney(line.amount, 1)]);
  }
  rows.push([t.rowTotal, formatMoney(result.total, 1)]);
  return rows;
}

function render() {
  var t = pack();
  var result = compute(state.settings);
  syncChrome(state.settings);

  $("hero-label").textContent = t.heroTotal;
  $("hero-amount").textContent = result.ok ? formatMoney(result.total, 1) : "—";
  $("hero-sub").textContent = result.ok
    ? fill(t.heroSub, {
        type: typeLabel(result.type),
        km: formatNum(result.distanceKm, 1),
        wait: formatNum(result.waitingMin, 1),
      })
    : "";

  var cards = [
    [t.kpiMeter, result.ok ? formatMoney(result.meter, 1) : "—"],
    [t.kpiExtras, result.ok ? formatMoney(result.extras, 1) : "—"],
    [t.kpiTunnels, result.ok ? formatMoney(result.tunnelFee, 1) : "—"],
    [t.kpiUnits, result.ok ? formatNum(result.units, 0) : "—"],
  ];
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

  var rows = breakdownRows(result);
  $("breakdown").innerHTML = rows
    .map(function (pair, idx) {
      var last = idx === rows.length - 1;
      return (
        "<tr" +
        (last ? ' class="total-row"' : "") +
        "><th>" +
        escapeHtml(pair[0]) +
        '</th><td class="num">' +
        escapeHtml(pair[1]) +
        "</td></tr>"
      );
    })
    .join("");

  $("formula").textContent = formulaText(result);
  warnHtml(result);
}

function syncFromForm() {
  var type = state.settings.type;
  state.settings = readForm();
  state.settings.type = type;
  saveDraft();
  render();
}

function init() {
  state.lang = readLang();
  var draft = loadDraft();
  if (draft) {
    if (draft.type !== "nt" && draft.type !== "lantau") draft.type = "urban";
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

  $("taxi-form").addEventListener("input", syncFromForm);
  $("taxi-form").addEventListener("change", syncFromForm);

  var types = document.querySelectorAll(".type");
  for (var i = 0; i < types.length; i++) {
    types[i].addEventListener("click", function () {
      state.settings.type = this.getAttribute("data-type") || "urban";
      if (state.settings.type !== "urban") state.settings.harbour = "none";
      for (var k = 0; k < TUNNEL_KEYS.length; k++) {
        var key = TUNNEL_KEYS[k];
        if (!tunnelAllowed(key, state.settings.type)) state.settings[key] = false;
      }
      writeForm(state.settings);
      saveDraft();
      render();
    });
  }

  $("demo-urban-btn").addEventListener("click", function () {
    state.settings = demoUrban();
    writeForm(state.settings);
    saveDraft();
    render();
  });
  $("demo-nt-btn").addEventListener("click", function () {
    state.settings = demoNt();
    writeForm(state.settings);
    saveDraft();
    render();
  });
  $("demo-lantau-btn").addEventListener("click", function () {
    state.settings = demoLantau();
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
