import {
  ANNUAL_CAP,
  compute,
  demoCapModel,
  demoModel,
  emptyModel,
  formatHkd,
  lateCharges,
  summaryToCsv,
} from "./fees.js";

const STORAGE_KEY = "hk-hospital-fees:v1";
const LANG_KEY = "hk-sms-csv-lang";

const LINE_ZH = {
  aeConsult: "急症室診症",
  aeExempt: "急症室第I／II類豁免",
  aeLeftGross: "急症室（診症前離開）",
  aeLeftRefund: "急症室退款（申請後退回）",
  acuteDays: "急症病床／普通科住院",
  convDays: "療養／復康／護養病床",
  psychDays: "精神科病床",
  icuDays: "深切治療病房",
  hduDays: "加護病房",
  nurseryDays: "嬰兒護理室",
  sopc: "專科門診",
  sopcDrugs: "專科藥物（4星期單位）",
  fmc: "家庭醫學門診",
  fmcDrugs: "家庭醫學藥物（4星期單位）",
  injection: "注射或敷藥",
  dayProc: "日間程序及治理",
  haemodialysisChronic: "血液透析（長期）",
  haemodialysisAcute: "血液透析（急性）",
  oncologyDay: "腫瘤科日間",
  ophthalmicDay: "眼科日間",
  geriatricDay: "老人科日間醫院",
  rehabDay: "復康日間醫院",
  psychDay: "精神科日間醫院",
  communityNursing: "社康護理（普通科）",
  communityNursingPsych: "社康護理（精神科）",
  communityAllied: "社區專職醫療",
  pathInter: "病理學進階項目",
  pathAdv: "病理學高端項目",
  radioInter: "放射科進階項目",
  radioAdv: "放射科高端項目",
  obstetricBooked: "產科最低收費（已預約）",
  obstetricUnbooked: "產科最低收費（未預約）",
  medicalReports: "醫療報告／證明書",
  medicationDelivery: "藥物送遞",
};

const LINE_EN = {
  aeConsult: "A&E attendance",
  aeExempt: "A&E Category I / II (exempt)",
  aeLeftGross: "A&E (left before consultation)",
  aeLeftRefund: "A&E refund (after application)",
  acuteDays: "Acute / general inpatient day",
  convDays: "Convalescent / rehab / infirmary bed",
  psychDays: "Psychiatric bed",
  icuDays: "Intensive care",
  hduDays: "High dependency",
  nurseryDays: "Nursery",
  sopc: "Specialist clinic",
  sopcDrugs: "Specialist drug item (4-week unit)",
  fmc: "Family medicine clinic",
  fmcDrugs: "Family medicine drug item (4-week unit)",
  injection: "Injection or dressing",
  dayProc: "Day procedure and treatment",
  haemodialysisChronic: "Haemodialysis (chronic)",
  haemodialysisAcute: "Haemodialysis (acute)",
  oncologyDay: "Clinical oncology day attendance",
  ophthalmicDay: "Ophthalmic day attendance",
  geriatricDay: "Geriatric day hospital",
  rehabDay: "Rehabilitation day hospital",
  psychDay: "Psychiatric day hospital",
  communityNursing: "Community nursing (general)",
  communityNursingPsych: "Community nursing (psychiatric)",
  communityAllied: "Community allied health",
  pathInter: "Pathology intermediate item",
  pathAdv: "Pathology advanced item",
  radioInter: "Non-urgent radiology intermediate",
  radioAdv: "Non-urgent radiology advanced",
  obstetricBooked: "Obstetric package (booked)",
  obstetricUnbooked: "Obstetric package (unbooked)",
  medicalReports: "Medical report / certificate",
  medicationDelivery: "Medication delivery",
};

const I18N = {
  zh: {
    pageTitle: "公立醫院收費估算器",
    lede: "按2026年1月1日起醫管局憲報收費，估算急症室、住院、專科與家庭醫學門診費用，並對照全年1萬元上限。不用註冊，不會上傳。",
    notice: "只供參考，並非醫管局官方工具或繳費單；實際以憲報、醫院收費處及醫管局公布為準。",
    explainTitle: "為甚麼需要這個工具",
    explainBody: "公營醫療收費改革已於2026年1月1日生效。醫管局官網列出收費表，另有經濟審查減免程式，但沒有把一次求診、住院日數、藥物與全年上限加總的估算器。本頁把憲報數字在瀏覽器內加起來，方便對照賬單或準備現金。",
    demoBtn: "載入示範",
    demoCapBtn: "住院上限示範",
    clearData: "清除資料 Clear data",
    formTitle: "求診資料",
    whoLegend: "身分",
    statusLegend: "收費類別",
    statusEp: "符合資格人士 Eligible Person",
    statusNep: "非符合資格人士 Non-eligible Person",
    childUnder12: "病人未滿12歲（符合資格人士住院費減半）",
    fullWaiver: "已獲全面醫療費用減免（例如綜援、75歲或以上長生津）",
    ytdPaid: "本曆年已繳付的合資格公營醫療費（港元）",
    ytdHint: "用來計算距離1萬元上限還有多少。自費藥物不計入。",
    aeLegend: "急症室",
    aeConsult: "已診症次數",
    aeExempt: "第I／II類豁免次數",
    aeLeft: "診症前離開（申請退款）",
    aeHint: "符合資格人士每次400元；第I、II類豁免。診症前離開可申請退回350元（英文頁：登記後24小時內）。",
    inpatientLegend: "住院日數",
    inpatientHint: "入院當日即日出院亦作1日。日數＝跨越午夜的次數，同日出入院請填1。",
    acuteDays: "急症病床日數",
    convDays: "療養／復康／護養日數",
    psychDays: "精神科病床日數",
    icuDays: "深切治療日數",
    hduDays: "加護病房日數",
    nurseryDays: "嬰兒護理室日數",
    clinicLegend: "門診、日間與社區",
    sopc: "專科門診次數",
    sopcDrugs: "專科藥物（每項4星期）",
    fmc: "家庭醫學門診次數",
    fmcDrugs: "家庭醫學藥物（每項4星期）",
    injection: "注射或敷藥次數",
    dayProc: "日間程序及治理次數",
    geriatricDay: "老人科日間醫院次數",
    rehabDay: "復康日間醫院次數",
    communityNursing: "社康護理（普通科）次數",
    communityAllied: "社區專職醫療次數",
    hdChronic: "血液透析（長期）次數",
    hdAcute: "血液透析（急性）次數",
    oncologyDay: "腫瘤科日間次數",
    ophthalmicDay: "眼科日間次數",
    communityNursingPsych: "社康護理（精神科）次數",
    obstetric: "產科最低收費（非符合資格）",
    obstetricNone: "不適用",
    obstetricBooked: "已預約並有產檢 · HK$74,000",
    obstetricUnbooked: "未預約／無產檢 · HK$130,000",
    ixLegend: "病理及非緊急放射（門診）",
    pathInter: "病理學進階項目",
    pathAdv: "病理學高端項目",
    radioInter: "放射科進階項目",
    radioAdv: "放射科高端項目",
    ixHint: "符合資格人士基礎病理及基礎非緊急放射免費。急症室當次臨床需要的檢驗一般已包括在急症室診症費。",
    adminLegend: "不計入全年上限的行政項目",
    medicalReports: "醫療報告／證明書份數",
    medicationDelivery: "藥物送遞次數",
    lateTitle: "逾期行政費試算",
    lateLead: "由賬單發出日起計：60天後收欠款5%（每單上限1,000元）；90天後另收10%（每單上限10,000元）。兩期合計上限為欠款15%或11,000元。",
    lateAmount: "未付賬單金額（港元）",
    lateDays: "發出後已過日數",
    printBtn: "列印／另存 PDF",
    copyBtn: "複製文字",
    csvBtn: "下載 CSV",
    draftStatus: "草稿會自動保存在此瀏覽器。",
    ratesTitle: "2026年1月1日起主要收費（符合資格人士）",
    rateItem: "項目",
    rateEp: "符合資格",
    rateNep: "非符合資格",
    rateAe: "急症室（每次）",
    rateAcute: "急症病床／普通科住院（每日）",
    rateConv: "療養／復康／護養／精神科病床（每日）",
    rateSopc: "專科門診（每次）",
    rateSopcDrug: "專科藥物（每項／4星期）",
    rateFmc: "家庭醫學門診（每次）",
    rateFmcDrug: "家庭醫學藥物（每項／4星期）",
    ratesHint: "完整表及註釋見醫管局收費頁。自費藥物與病人自資醫療項目另行收費，本頁不估算。",
    faqTitle: "常見問題",
    faq1q: "2026年1月起急症室收幾多？",
    faq1a: "符合資格人士每次400元；分流第I類（危殆）及第II類（危急）豁免。非符合資格人士每次2,100元。已繳費後如在醫生診症前離開，符合資格人士可申請退回350元，非符合資格人士退回1,850元。醫管局英文頁列明須於登記後24小時內提出。",
    faq2q: "住院費怎樣按日計算？未滿12歲是否半價？",
    faq2a: "由入院當日起按日計算，每日截數為午夜12時；即日出院亦作一日。符合資格人士急症病床每日300元，療養／復康、護養及精神科病床每日200元。未滿12歲兒童及未能與母親同時出院的嬰兒，住院費減半；其他項目與成人相同。",
    faq3q: "全年收費上限1萬元怎樣用？",
    faq3a: "由2026年1月1日起，符合資格人士可在無需經濟審查下申請每年10,000元上限。累計已繳付合資格費用達1萬元後，經 HA Go 或醫院繳費處申請；獲批後該曆年餘下合資格費用無需再付。自費藥物、自資醫療項目及部分行政收費不計入。非符合資格人士不適用。",
    faq4q: "誰是符合資格人士？綜援或長生津可否免收？",
    faq4a: "包括持有效香港身份證的人士（憑已過期入境或逗留准許獲發證者除外）、身為香港居民的11歲以下兒童，以及醫管局行政總裁認可的其他人士。綜援受助人、院舍券級別0持有人，以及75歲或以上長者生活津貼受惠人，一般可在出示身份證明後獲豁免公營醫療標準收費。其他人可向醫務社會服務部申請減免。",
    faq5q: "資料會上傳嗎？",
    faq5a: "不會。估算只在瀏覽器內計算，草稿可選擇寫入本機 localStorage。沒有帳戶、沒有伺服器存檔。列印、複製或下載 CSV 才會在你選擇的位置產生內容。",
    sourcesTitle: "資料來源 / Sources",
    srcFees: "醫院管理局 — 醫療收費（2026年1月1日起）：",
    srcCap: "醫院管理局 — 全年收費上限：",
    srcWaiver: "醫院管理局 — 醫療費用減免：",
    srcOala: "社會福利署 — 75歲或以上長者生活津貼醫療費用豁免：",
    privacyTitle: "私隱",
    privacyBody: "求診次數與金額只留在這個瀏覽器（localStorage）。本頁不上傳、不設帳號、不設後端。列印、複製或匯出 CSV 才會在你選擇的位置產生檔案。",
    disclaimer: "只供參考，並非醫管局官方工具、繳費單或醫療意見。 / For reference only; not an HA bill or medical advice.",
    billTitle: "公立醫院收費估算",
    billSub: "Hospital Authority public charges from 1 January 2026",
    colItem: "項目",
    colQty: "數量",
    colUnit: "單價",
    colAmt: "金額",
    kpiGross: "合資格公營費用",
    kpiCap: "若上限獲批後應付",
    kpiAdmin: "行政／其他",
    kpiPay: "估算應付（未計上限申請）",
    empty: "輸入次數或按「載入示範」後，估算會顯示在這裡。",
    copied: "已複製到剪貼簿。",
    copyFail: "未能複製，請手動選取。",
    warnAeRefund: "急症室退款須向醫院申請；醫管局英文頁列明須於登記後24小時內提出。在獲退款前仍可能先繳足額。",
    warnChildHalf: "未滿12歲符合資格人士只獲住院費減半；急症室、門診與藥物仍按成人收費。",
    warnChildNep: "醫管局收費表註4的住院半價適用於符合資格人士；非符合資格人士本頁按成人全日費估算。",
    warnWaiverNep: "醫療費用減免機制以符合資格人士為對象；已改為非符合資格收費。",
    warnFullWaiver: "已假設標準公營收費獲全面豁免。自費藥物、自資項目及部分行政收費通常仍須繳付。請向醫院職員出示身份證明以核實。",
    warnCap: "全年上限須另行申請，並以已繳付的合資格費用達到1萬元為前提。本頁顯示的「若上限獲批」只是參考。",
    warnNepNoCap: "全年1萬元上限不適用於非符合資格人士。",
    lateNone: "未滿60天：按公布不另收逾期行政費。",
    lateResult: "第一期 {first}，第二期 {second}，合計 {total}。",
    statusEpShort: "符合資格人士",
    statusNepShort: "非符合資格人士",
    ytdLine: "本曆年已繳合資格費用：{ytd}；連今次合計 {combined}。",
    capLine: "距離／超出全年上限（{cap}）：若申請獲批，今次合資格部分應付 {after}（可節省 {save}）。",
    waiverLine: "全面減免後，合資格公營費用作 {zero} 計。",
    notHa: "此估算不是繳費單，亦不是醫管局官方計算。",
  },
  en: {
    pageTitle: "Public hospital fee estimator",
    lede: "Estimate A&E, inpatient and clinic charges from the Hospital Authority gazette rates in force on 1 January 2026, and compare them with the HK$10,000 annual cap. No sign-up, nothing uploaded.",
    notice: "For reference only. This is not an official HA tool or a bill. Follow the Gazette, the shroff and HA notices.",
    explainTitle: "Why this tool",
    explainBody: "The public healthcare fees reform took effect on 1 January 2026. HA publishes a fee table and a means-test waiver calculator, but not a bill-style adder for attendances, bed-days, drugs and the annual cap. This page totals the gazette figures in your browser.",
    demoBtn: "Load demo",
    demoCapBtn: "Load cap demo",
    clearData: "Clear data",
    formTitle: "Visit details",
    whoLegend: "Status",
    statusLegend: "Charge category",
    statusEp: "Eligible Person",
    statusNep: "Non-eligible Person",
    childUnder12: "Patient is under 12 (Eligible Person inpatient fee is halved)",
    fullWaiver: "Full medical-fee waiver already granted (e.g. CSSA, OALA aged 75+)",
    ytdPaid: "Eligible public charges already paid this calendar year (HK$)",
    ytdHint: "Used to see how close you are to the HK$10,000 cap. Self-financed drugs do not count.",
    aeLegend: "Accident & Emergency",
    aeConsult: "Attendances with consultation",
    aeExempt: "Category I / II exempt attendances",
    aeLeft: "Left before consultation (refund)",
    aeHint: "Eligible Persons: HK$400 each; Categories I and II exempt. Leaving before consultation: apply for a HK$350 refund (HA English page: within 24 hours of registration).",
    inpatientLegend: "Inpatient days",
    inpatientHint: "Same-day admission and discharge counts as 1 day. Count midnights crossed; enter 1 for a same-day stay.",
    acuteDays: "Acute general bed days",
    convDays: "Convalescent / rehab / infirmary days",
    psychDays: "Psychiatric bed days",
    icuDays: "Intensive-care days",
    hduDays: "High-dependency days",
    nurseryDays: "Nursery days",
    clinicLegend: "Clinics, day and community",
    sopc: "Specialist clinic attendances",
    sopcDrugs: "Specialist drug items (4-week unit)",
    fmc: "Family medicine attendances",
    fmcDrugs: "Family medicine drug items (4-week unit)",
    injection: "Injection or dressing attendances",
    dayProc: "Day procedure attendances",
    geriatricDay: "Geriatric day hospital attendances",
    rehabDay: "Rehabilitation day hospital attendances",
    communityNursing: "Community nursing (general)",
    communityAllied: "Community allied health visits",
    hdChronic: "Haemodialysis (chronic)",
    hdAcute: "Haemodialysis (acute)",
    oncologyDay: "Oncology day attendances",
    ophthalmicDay: "Ophthalmic day attendances",
    communityNursingPsych: "Community nursing (psychiatric)",
    obstetric: "Obstetric minimum package (NEP)",
    obstetricNone: "Not applicable",
    obstetricBooked: "Booked with HA antenatal care · HK$74,000",
    obstetricUnbooked: "Unbooked / no antenatal care · HK$130,000",
    ixLegend: "Pathology and non-urgent radiology (clinics)",
    pathInter: "Pathology intermediate items",
    pathAdv: "Pathology advanced items",
    radioInter: "Radiology intermediate items",
    radioAdv: "Radiology advanced items",
    ixHint: "For Eligible Persons, basic pathology and basic non-urgent radiology are free. Tests clinically needed during an A&E visit are generally included in the A&E fee.",
    adminLegend: "Admin items outside the annual cap",
    medicalReports: "Medical reports / certificates",
    medicationDelivery: "Medication deliveries",
    lateTitle: "Late-payment administrative charge",
    lateLead: "From the bill date: 5% after 60 days (cap HK$1,000 per bill); another 10% after 90 days (cap HK$10,000). Combined cap is 15% of the unpaid amount or HK$11,000.",
    lateAmount: "Unpaid bill amount (HK$)",
    lateDays: "Days since the bill was issued",
    printBtn: "Print / save PDF",
    copyBtn: "Copy text",
    csvBtn: "Download CSV",
    draftStatus: "A draft is saved in this browser.",
    ratesTitle: "Main fees from 1 January 2026",
    rateItem: "Item",
    rateEp: "Eligible Person",
    rateNep: "Non-eligible Person",
    rateAe: "A&E (per attendance)",
    rateAcute: "Acute / general inpatient (per day)",
    rateConv: "Convalescent / rehab / infirmary / psychiatric bed (per day)",
    rateSopc: "Specialist clinic (per attendance)",
    rateSopcDrug: "Specialist drug (per item / 4 weeks)",
    rateFmc: "Family medicine clinic (per attendance)",
    rateFmcDrug: "Family medicine drug (per item / 4 weeks)",
    ratesHint: "See the HA fees page for the full table and notes. Self-financed drugs and privately purchased medical items are extra and are not estimated here.",
    faqTitle: "FAQ",
    faq1q: "How much is A&E from January 2026?",
    faq1a: "Eligible Persons: HK$400 per attendance; Categories I (critical) and II (emergency) are exempt. Non-eligible Persons: HK$2,100. If you leave before medical consultation, Eligible Persons may apply for a HK$350 refund and Non-eligible Persons for HK$1,850. The HA English page says to apply within 24 hours of registration.",
    faq2q: "How are inpatient days counted? Is under-12 half price?",
    faq2a: "Maintenance is charged daily from the admission day, cutting off at midnight. Same-day discharge still counts as one day. Eligible Persons: HK$300 a day for an acute general bed, HK$200 for convalescent / rehabilitation / infirmary / psychiatric beds. Children under 12, and babies who cannot leave with their mothers, pay half the bed fee. Other items are charged at the adult rate.",
    faq3q: "How does the HK$10,000 annual cap work?",
    faq3a: "From 1 January 2026, Eligible Persons may apply for a HK$10,000 calendar-year cap without a financial assessment. After valid eligible spending reaches HK$10,000, apply via HA Go or a hospital shroff. If approved, further eligible charges that year are waived. Self-financed drugs, privately purchased items and some admin fees are excluded. The cap does not apply to Non-eligible Persons.",
    faq4q: "Who is an Eligible Person? Do CSSA or OALA waive fees?",
    faq4a: "Eligible Persons include HKID holders (except those whose ID was issued on an expired permission to remain), Hong Kong-resident children under 11, and other persons approved by the HA Chief Executive. CSSA recipients, Level 0 residential-care voucher holders, and OALA recipients aged 75 or above are generally waived standard public charges after identity check. Others may apply for a waiver at Medical Social Services.",
    faq5q: "Is anything uploaded?",
    faq5a: "No. The estimate runs in your browser. A draft may be saved in localStorage. There is no account and no server copy. Print, copy or CSV only creates a file where you choose.",
    sourcesTitle: "Sources",
    srcFees: "Hospital Authority — Fees and Charges (from 1 January 2026):",
    srcCap: "Hospital Authority — Annual Spending Cap:",
    srcWaiver: "Hospital Authority — Medical fee waiver:",
    srcOala: "Social Welfare Department — medical fee waiver for OALA recipients aged 75+:",
    privacyTitle: "Privacy",
    privacyBody: "Visit counts and amounts stay in this browser (localStorage). Nothing is uploaded and there is no account. Print, copy or CSV only creates a file where you choose.",
    disclaimer: "For reference only. Not an official HA tool, bill or medical advice.",
    billTitle: "Public hospital fee estimate",
    billSub: "Hospital Authority public charges from 1 January 2026",
    colItem: "Item",
    colQty: "Qty",
    colUnit: "Unit",
    colAmt: "Amount",
    kpiGross: "Eligible public charges",
    kpiCap: "Payable if cap approved",
    kpiAdmin: "Admin / other",
    kpiPay: "Estimate before cap application",
    empty: "Enter quantities or load a demo to see the estimate.",
    copied: "Copied to the clipboard.",
    copyFail: "Could not copy. Select the text instead.",
    warnAeRefund: "The A&E refund must be applied for. The HA English page says within 24 hours of registration. You may still have to pay the full fee first.",
    warnChildHalf: "For Eligible Persons under 12, only the inpatient maintenance fee is halved. A&E, clinics and drugs stay at the adult rate.",
    warnChildNep: "Note N4 (half maintenance) is stated for Eligible Persons. This page uses the full adult Non-eligible Person bed rate.",
    warnWaiverNep: "The medical-fee waiver is for Eligible Persons. Charges now use the Non-eligible Person scale.",
    warnFullWaiver: "Standard public charges are treated as fully waived. Self-financed drugs, privately purchased items and some admin fees are usually still payable. Show identity documents at the hospital to confirm.",
    warnCap: "The annual cap needs a separate application after eligible paid spending reaches HK$10,000. The “if cap approved” figure is only a reference.",
    warnNepNoCap: "The HK$10,000 annual cap does not apply to Non-eligible Persons.",
    lateNone: "Under 60 days: no late administrative charge under the published rule.",
    lateResult: "1st charge {first}, 2nd charge {second}, total {total}.",
    statusEpShort: "Eligible Person",
    statusNepShort: "Non-eligible Person",
    ytdLine: "Eligible charges already paid this year: {ytd}; with this estimate {combined}.",
    capLine: "Annual cap ({cap}): if approved, eligible portion of this estimate payable {after} (save {save}).",
    waiverLine: "After a full waiver, eligible public charges are treated as {zero}.",
    notHa: "This estimate is not a bill and not an official HA calculation.",
  },
};

const NUMBER_FIELDS = [
  "yearToDatePaid",
  "aeConsult",
  "aeExempt",
  "aeLeftBefore",
  "acuteDays",
  "convDays",
  "psychDays",
  "icuDays",
  "hduDays",
  "nurseryDays",
  "sopc",
  "sopcDrugs",
  "fmc",
  "fmcDrugs",
  "injection",
  "dayProc",
  "haemodialysisChronic",
  "haemodialysisAcute",
  "oncologyDay",
  "ophthalmicDay",
  "geriatricDay",
  "rehabDay",
  "psychDay",
  "communityNursing",
  "communityNursingPsych",
  "communityAllied",
  "pathInter",
  "pathAdv",
  "radioInter",
  "radioAdv",
  "medicalReports",
  "medicationDelivery",
];

const state = {
  lang: "zh",
  model: emptyModel(),
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

function lineLabels() {
  return state.lang === "en" ? LINE_EN : LINE_ZH;
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
  document.title =
    state.lang === "en"
      ? "Public hospital fee estimator | HA A&E, inpatient, clinics 2026"
      : "公立醫院收費估算器｜急症室住院專科 2026 中英 · HA public hospital fee estimator";
}

function readForm() {
  var form = $("fee-form");
  var data = emptyModel();
  var status = form.querySelector("input[name='status']:checked");
  data.status = status && status.value === "nep" ? "nep" : "ep";
  data.childUnder12 = $("child-under-12").checked;
  data.fullWaiver = $("full-waiver").checked;
  NUMBER_FIELDS.forEach(function (name) {
    var el = form.elements.namedItem(name);
    if (el) data[name] = el.value === "" ? 0 : Number(el.value);
  });
  data.obstetric = $("obstetric").value || "none";
  return data;
}

function writeForm(model) {
  var form = $("fee-form");
  var ep = form.querySelector("input[name='status'][value='ep']");
  var nep = form.querySelector("input[name='status'][value='nep']");
  if (model.status === "nep") nep.checked = true;
  else ep.checked = true;
  $("child-under-12").checked = !!model.childUnder12;
  $("full-waiver").checked = !!model.fullWaiver;
  NUMBER_FIELDS.forEach(function (name) {
    var el = form.elements.namedItem(name);
    if (el) el.value = model[name] == null ? 0 : model[name];
  });
  $("obstetric").value = model.obstetric || "none";
}

function saveDraft() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.model));
  } catch (e) {
    /* ignore */
  }
}

function loadDraft() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return Object.assign(emptyModel(), JSON.parse(raw));
  } catch (e) {
    return null;
  }
}

function setMode(status) {
  document.body.classList.toggle("ep-mode", status !== "nep");
  document.body.classList.toggle("nep-mode", status === "nep");
}

function warnHtml(result) {
  var t = pack();
  var map = {
    aeRefundApply: t.warnAeRefund,
    childHalf: t.warnChildHalf,
    childNep: t.warnChildNep,
    waiverNep: t.warnWaiverNep,
    fullWaiver: t.warnFullWaiver,
    capMayApply: t.warnCap,
    nepNoCap: t.warnNepNoCap,
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

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, function (_, key) {
    return vars[key] == null ? "" : vars[key];
  });
}

function renderLate() {
  var t = pack();
  var amount = Number($("late-amount").value) || 0;
  var days = Number($("late-days").value) || 0;
  var r = lateCharges(amount, days);
  var el = $("late-out");
  if (amount <= 0) {
    el.textContent = t.lateNone;
    return;
  }
  if (r.total === 0) {
    el.textContent = t.lateNone;
    return;
  }
  el.textContent = fill(t.lateResult, {
    first: formatHkd(r.first),
    second: formatHkd(r.second),
    total: formatHkd(r.total),
  });
}

function render() {
  var t = pack();
  var labels = lineLabels();
  var result = compute(state.model);
  setMode(state.model.status);
  warnHtml(result);
  renderLate();

  $("kpis").innerHTML =
    kpi(t.kpiPay, formatHkd(result.payableNoCap)) +
    kpi(t.kpiCap, formatHkd(result.payableWithCap)) +
    kpi(t.kpiGross, formatHkd(result.eligibleAfterWaiver)) +
    kpi(t.kpiAdmin, formatHkd(result.ineligible));

  var rows = result.lines
    .map(function (line) {
      return (
        "<tr><td>" +
        escapeHtml(labels[line.key] || line.key) +
        "</td><td class='num'>" +
        line.qty +
        "</td><td class='num'>" +
        formatHkd(line.unit) +
        "</td><td class='num'>" +
        formatHkd(line.amount) +
        "</td></tr>"
      );
    })
    .join("");

  var notes = [];
  notes.push(result.ep ? t.statusEpShort : t.statusNepShort);
  if (result.ep) {
    notes.push(
      fill(t.ytdLine, {
        ytd: formatHkd(result.yearToDatePaid),
        combined: formatHkd(result.combined),
      }),
    );
    if (result.waiver) {
      notes.push(fill(t.waiverLine, { zero: formatHkd(0) }));
    } else if (result.capApplies || result.yearToDatePaid > 0) {
      notes.push(
        fill(t.capLine, {
          cap: formatHkd(ANNUAL_CAP),
          after: formatHkd(result.eligibleAfterCap),
          save: formatHkd(result.capSaving),
        }),
      );
    }
  }
  notes.push(t.notHa);

  $("bill").innerHTML =
    "<div class='bill-head'><div><h2 class='bill-title'>" +
    escapeHtml(t.billTitle) +
    "<small>" +
    escapeHtml(t.billSub) +
    "</small></h2></div><div class='bill-chop' aria-hidden='true'>醫院<br />收費</div></div>" +
    (rows
      ? "<table><thead><tr><th>" +
        escapeHtml(t.colItem) +
        "</th><th class='num'>" +
        escapeHtml(t.colQty) +
        "</th><th class='num'>" +
        escapeHtml(t.colUnit) +
        "</th><th class='num'>" +
        escapeHtml(t.colAmt) +
        "</th></tr></thead><tbody>" +
        rows +
        "</tbody><tfoot><tr><th colspan='3'>" +
        escapeHtml(t.kpiPay) +
        "</th><td class='num'>" +
        formatHkd(result.payableNoCap) +
        "</td></tr><tr><th colspan='3'>" +
        escapeHtml(t.kpiCap) +
        "</th><td class='num'>" +
        formatHkd(result.payableWithCap) +
        "</td></tr></tfoot></table>"
      : "<p>" + escapeHtml(t.empty) + "</p>") +
    "<p class='bill-note'>" +
    notes.map(escapeHtml).join("<br />") +
    "</p>";
}

function kpi(label, value) {
  return "<div class='kpi'><span>" + escapeHtml(label) + "</span><strong>" + escapeHtml(value) + "</strong></div>";
}

function resultText() {
  var t = pack();
  var labels = lineLabels();
  var result = compute(state.model);
  var lines = [t.billTitle, t.billSub, ""];
  result.lines.forEach(function (line) {
    lines.push(labels[line.key] + " × " + line.qty + " = " + formatHkd(line.amount));
  });
  lines.push("");
  lines.push(t.kpiPay + ": " + formatHkd(result.payableNoCap));
  lines.push(t.kpiCap + ": " + formatHkd(result.payableWithCap));
  lines.push(t.notHa);
  return lines.join("\n");
}

function onFormChange() {
  state.model = readForm();
  saveDraft();
  render();
}

function init() {
  state.lang = readLang();
  var draft = loadDraft();
  if (draft) state.model = draft;
  writeForm(state.model);
  applyI18n();
  render();

  $("fee-form").addEventListener("input", onFormChange);
  $("fee-form").addEventListener("change", onFormChange);
  $("late-amount").addEventListener("input", renderLate);
  $("late-days").addEventListener("input", renderLate);
  $("lang-zh").addEventListener("click", function () {
    state.lang = "zh";
    saveLang("zh");
    applyI18n();
    render();
  });
  $("lang-en").addEventListener("click", function () {
    state.lang = "en";
    saveLang("en");
    applyI18n();
    render();
  });
  $("demo-btn").addEventListener("click", function () {
    state.model = demoModel();
    writeForm(state.model);
    saveDraft();
    render();
  });
  $("demo-cap-btn").addEventListener("click", function () {
    state.model = demoCapModel();
    writeForm(state.model);
    saveDraft();
    render();
  });
  $("clear-data").addEventListener("click", function () {
    state.model = emptyModel();
    writeForm(state.model);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    $("late-amount").value = 0;
    $("late-days").value = 0;
    render();
  });
  $("print-btn").addEventListener("click", function () {
    window.print();
  });
  $("copy-btn").addEventListener("click", function () {
    var text = resultText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          $("copy-status").textContent = pack().copied;
        },
        function () {
          $("copy-status").textContent = pack().copyFail;
        },
      );
    } else {
      $("copy-status").textContent = pack().copyFail;
    }
  });
  $("csv-btn").addEventListener("click", function () {
    var csv = summaryToCsv(compute(state.model), lineLabels());
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "hospital-fees.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
