import {
  AS_OF,
  LUNAR_CNY,
  LUNAR_STEM_BRANCH,
  compute,
  demoDismissedHalfYear,
  demoFullYear,
  demoResignedHalfYear,
  emptyModel,
  formatHkd,
  summaryToCsv,
} from "./year-end-pay.js";

const STORAGE_KEY = "hk-year-end-pay:v1";
const LANG_KEY = "hk-sms-csv-lang";

const I18N = {
  zh: {
    pageTitle: "年終酬金／雙糧按比例估算器",
    docTitle: "年終酬金／雙糧按比例估算器｜僱傭條例 Cap.57 · HK double pay",
    lede: "按《僱傭條例》第IIA部，估算合約年終酬金／雙糧是否合資格，以及未做滿酬金期時的按比例款額。不用註冊，不會上傳。",
    notice: "只供參考，並非法例意見，亦非勞工處官方工具。實際以僱傭合約、《僱傭條例》原文、勞工處簡明指南／法定權益計算機為準。合約可給予多於法定的款額。本頁不處理酌情花紅。",
    explainTitle: "為甚麼需要這個工具",
    explainBody: "勞工處大型計算機多半讓你自行填入年終酬金金額；第三方「按比例雙糧」頁又少。本頁用你輸入的合約款額（或未指明時的一個月平均工資）、酬金期與受僱日數，按第11F條計出資格與按比例部分。差餉／地租已有差餉物業估價署官方計算機，本站不重複。年假／代通知金／病假請用勞工處或 stamp4u。",
    ruleItem: "項目",
    ruleHow: "法定規則（第IIA部）",
    ruleElig: "部分年終酬金資格",
    ruleEligV: "酬金期內連續性合約受僱不少於3個月，並在期滿後仍受僱，或被僱主解僱（非第9條即時解僱）",
    ruleResign: "期內辭職",
    ruleResignV: "一般無權按比例領取，除非合約另有規定（第11F(1B)條）",
    ruleProb: "試用期",
    ruleProbV: "計3個月資格時扣除（上限3個月）；合資格後計金額則包括整段受僱期",
    ruleAmt: "款額",
    ruleAmtV: "合約指定款額；否則為一個月平均工資。按比例＝全數×（期內受僱日數÷酬金期日數）",
    demoBtn: "解僱半年示範",
    demoResignBtn: "辭職示範",
    demoFullBtn: "做滿一年示範",
    clearData: "清除資料 Clear data",
    formTitle: "合約與受僱期",
    amountLegend: "年終酬金款額",
    amountFixed: "合約已指定款額",
    amountAverage: "合約未指定（用一個月平均工資）",
    amountFixedLabel: "合約年終酬金／雙糧（港元）",
    amountAverageLabel: "一個月平均工資（港元）",
    amountHint: "未指定時，勞工處簡明指南第八章以到期支付日前12個月（或較短受僱期）每月平均工資為全數。本頁不會替你計平均，請填入該數字。",
    periodLegend: "酬金期",
    periodLunar: "農曆年（合約未指明時的法定預設）",
    periodCalendar: "公曆年（1月1日至12月31日）",
    periodCustom: "自訂起迄日期",
    periodYear: "年份",
    periodYearHint: "農曆年以該公曆年內的正月初一開始，至下一年初一的前一日結束。",
    customStart: "酬金期開始",
    customEnd: "酬金期結束",
    serviceLegend: "酬金期內受僱日數",
    serviceDates: "用入職／離職日期推算",
    serviceDays: "直接填日數",
    empStart: "入職日期",
    empEnd: "終止／有關日期",
    empEndHint: "如期滿後仍在職，可填酬金期最後一日，或留空由本頁用酬金期結束日。",
    employedDays: "酬金期內受僱日數",
    employedDaysHint: "只填日數時，滿3個月資格以90日作粗略代替；有日期則用曆月。",
    termLegend: "僱傭狀況",
    termStill: "酬金期滿後仍受僱",
    termDismissed: "被僱主解僱（非即時解僱）",
    termResigned: "僱員辭職（非第10條）",
    termSummary: "因嚴重過失被即時解僱（第9條）",
    contractGrant: "合約訂明辭職亦可按比例獲年終酬金",
    contractGrantHint: "法定下限是辭職一般不獲按比例部分；合約可給予更多。勾選後才按你輸入的日數估算。",
    probLegend: "試用期（可選）",
    excludeProbation: "合約有試用期：計3個月資格時扣除（上限3個月）",
    excludeProbationHint: "勞工處／1823：試用期不計入3個月資格，但合資格後計算金額時包括整段受僱期（連試用期）。",
    probationMonths: "試用期（月），上限3",
    printBtn: "列印／另存 PDF",
    copyBtn: "複製文字",
    csvBtn: "下載 CSV",
    draftStatus: "草稿會自動保存在此瀏覽器。",
    copied: "已複製。",
    copyFail: "無法複製，請人手選取。",
    kpiElig: "資格",
    kpiDays: "期內受僱",
    kpiRatio: "比例",
    kpiPay: "估算款額",
    yes: "合資格",
    no: "不合資格",
    na: "不適用",
    billTitle: "年終酬金／雙糧估算",
    billSub: "僱傭條例第IIA部 · 截至 " + AS_OF + " 核對",
    colItem: "項目",
    colAmt: "內容",
    lineElig: "資格",
    lineReason: "理由",
    linePeriod: "酬金期",
    linePeriodDays: "酬金期日數",
    lineEmployed: "期內受僱日數",
    lineQualifying: "計資格用日數（扣試用期後）",
    lineMonths: "約相當於月數",
    lineFull: "全數（合約或一個月工資）",
    lineRatio: "日數比例",
    linePay: "估算應付",
    lineTerm: "僱傭狀況",
    formulaTitle: "算式",
    empty: "請輸入有效酬金期、受僱資料與款額。",
    notLegal: "不是勞工處計算或法律意見。合約可給予更多。",
    daysUnit: " 日",
    lunarLabel: "農曆年",
    calendarLabel: "公曆年",
    customLabel: "自訂酬金期",
    termNameStill: "期滿後仍受僱",
    termNameDismissed: "被僱主解僱（非即時解僱）",
    termNameResigned: "僱員辭職",
    termNameSummary: "第9條即時解僱",
    reason_yes_full: "已做滿整個酬金期，按第11B條可獲全數。",
    reason_yes_full_after_resign_note: "已做滿整個酬金期，已賺取全數；期滿後辭職一般不影響該筆已賺取款額。",
    reason_yes_full_after_summary_note: "輸入顯示已做滿整個酬金期。即時解僱事實或有爭議，請核對第9條與合約。",
    reason_yes_prorata_employed: "期滿後仍受僱，且酬金期內合資格受僱不少於3個月，按第11F條可獲按比例部分。",
    reason_yes_prorata_dismissed: "被僱主解僱（非即時解僱），且酬金期內合資格受僱不少於3個月，按第11F條可獲按比例部分。",
    reason_yes_prorata_resign_contract: "法定上辭職一般不獲按比例部分；已勾選合約給予按比例，故按日數估算。",
    reason_no_resigned: "酬金期完結前辭職，除非合約另有規定，否則不可享有按比例年終酬金（第11F(1B)條／勞工處 FAQ）。",
    reason_no_summary: "因嚴重過失被即時解僱（第9條），第11F條不適用，故不估算按比例部分。",
    reason_no_short_service: "扣試用期後，酬金期內合資格受僱不足3個月，故不獲部分年終酬金。",
    reason_badLunarYear: "所選農曆年超出本頁對照表（2016–2035）。",
    reason_badCalendarYear: "請輸入有效公曆年。",
    reason_badCustomDates: "請輸入有效的自訂酬金期日期。",
    reason_endBeforeStart: "酬金期結束不能早於開始。",
    warn_badAmount: "請輸入有效、非負數的款額。",
    warn_badEmpStart: "請輸入有效入職日期。",
    warn_badEmpEnd: "請輸入有效終止日期。",
    warn_empEndBeforeStart: "終止日期不能早於入職日期。",
    warn_badEmployedDays: "請輸入大於 0 的受僱日數。",
    warn_daysCappedToPeriod: "受僱日數已以酬金期日數為上限。",
    warn_daysApprox3Months: "只填日數時，3個月資格以90日粗略代替；有入職／離職日期會改用曆月。",
    warn_resignedNotEntitled: "法定上期內辭職不獲按比例部分。若合約另有規定，請勾選上方選項。",
    warn_summaryNotEntitled: "第9條即時解僱不獲部分年終酬金。",
    warn_shortService: "扣試用期後不足3個月，故不估算款額。",
    warn_probationExcludedForTest: "試用期已從3個月資格測試扣除，但金額仍按整段期內受僱日數計算。",
    warn_fullAfterResign: "已做滿酬金期：期滿後辭職一般不影響已賺取的全數。",
    warn_fullAfterSummary: "輸入顯示已做滿酬金期；即時解僱是否仍須支付全數，請核對事實與法律意見。",
    warn_contractBeatsStatute: "已按合約優於法定的辭職條款估算；實際以合約原文為準。",
    ratesTitle: "法定算式（僱傭條例第IIA部）",
    rateStep: "步驟",
    rateHow: "怎樣計",
    rateA: "1. 全數",
    rateAV: "合約指定款額；否則一個月平均工資",
    rateB: "2. 做滿整個酬金期",
    rateBV: "第11B條：獲全數",
    rateC: "3. 未做滿",
    rateCV: "第11F條：全數 × 期內受僱日數 ÷ 酬金期日數（須滿3個月資格，且非辭職／第9條即時解僱）",
    rateD: "4. 試用期",
    rateDV: "第11F(1A)條：計3個月時扣除（上限3個月）；計金額時包括",
    ratesHintFoot: "數字與條文於2026年10月23日核對勞工處 FAQ、簡明指南第八章 PDF 及1823終止按比例說明。其後修訂以官方為準。",
    faqTitle: "常見問題",
    faq1q: "僱主是否必須發放年尾雙糧？",
    faq1a: "《僱傭條例》沒有規定僱主必須支付年終酬金（包括雙糧及花紅）。能否享有須視乎僱傭合約（口頭或書面、明言或暗示）。年終酬金不包括屬賞贈性質或隨僱主酌情發放的款項。1997年6月27日後訂立的合約，除非書面表明相反意圖，否則推定每年酬金不屬賞贈、亦非只隨僱主酌情付給。",
    faq2q: "僱員在酬金期完結前辭職，可否按比例拿年終酬金？",
    faq2a: "除非合約另有規定，否則僱員在酬金期完結前辭職，不可享有按比例計算的年終酬金。酬金期以合約指明為準；沒有指明則以農曆年度計算。若僱員已做滿整個酬金期，其後才離職，已賺取的全數不受期滿後辭職影響。",
    faq3q: "被解僱可否按比例領取年終酬金？試用期怎樣計？",
    faq3a: "僱員在一個酬金期內按照連續性合約受僱不少於3個月，而被僱主解僱（但並非因嚴重過失而被即時解僱），可按比例獲得部分年終酬金。計算是否滿3個月時，試用期（以3個月為上限）不得包括在內；但一旦合資格，計算金額時必須將整段受僱期（包括試用期）計算在內。僱員按第10條終止（例如僱主嚴重違約）一般視作可獲按比例部分，與自行辭職不同；本頁「辭職」選項指非第10條的辭職。",
    faq4q: "合約沒有寫明金額時，年終酬金怎樣計？",
    faq4a: "如僱傭合約已指定款額，用該款額。如沒有指定，則為到期支付日前12個月（或較短受僱期）的每月平均工資（計算平均時須剔除無薪或非全薪日子，見簡明指南附錄）。按比例部分為全數×（酬金期內受僱日數÷酬金期日數），除非合約另指明分數。本頁不替你計12個月平均。",
    faq5q: "酬金期是農曆年還是公曆年？何時要支付？",
    faq5a: "以合約指明為準。沒有指明則以農曆年度計算。支付日期：合約指定之日；沒有指定則在酬金期滿當日或其後7天內。如在期滿前被解僱而須支付部分年終酬金，則在合約終止當日或7天內支付。如按僱主利潤計算，則在確定利潤當日或7天內。",
    faq6q: "這是不是勞工處官方計算機？",
    faq6a: "不是。請用勞工處「法定僱傭權益參考計算機」核對。本頁只套用第IIA部公開規則作粗略估算，不能代替法律意見或勞資審裁處裁決。酌情花紅、利潤分紅公式、外傭合約另議條款均不在範圍內。",
    faq7q: "資料會上傳嗎？",
    faq7a: "不會。估算只在瀏覽器內計算，草稿可選擇寫入本機 localStorage。沒有帳戶、沒有伺服器存檔。",
    sourcesTitle: "資料來源 / Sources",
    srcFaq: "勞工處 — 《僱傭條例》FAQ（年終酬金／雙糧資格與按比例）：",
    srcGuide: "勞工處 — 《僱傭條例簡明指南》第八章（PDF）：",
    src1823: "1823 — 僱員離職可否按比例獲發年終酬金：",
    srcWage: "勞工處 — 工資 FAQ（未指定年終酬金時用一個月平均工資）：",
    srcEo: "香港法例第57章第11F條（部分年終酬金）：",
    srcCalc: "勞工處 — 法定僱傭權益參考計算機：",
    srcAsOf: "以上條文與指引於2026年10月23日核對上述官方頁。若法例或勞工處其後修訂，以官方為準。",
    privacyTitle: "私隱",
    privacyBody: "工資、日期與估算只留在這個瀏覽器（localStorage）。本頁不上傳、不設帳號、不設後端。列印、複製或匯出 CSV 才會在你選擇的位置產生檔案。",
    disclaimer: "只供參考，並非法例意見，亦非勞工處官方計算。合約可給予更多。 / For reference only; not legal advice and not a Labour Department tool. A contract may grant more.",
    csvItem: "項目",
    csvAmount: "內容",
  },
  en: {
    pageTitle: "End-of-year payment / double-pay estimator",
    docTitle: "HK end-of-year payment / double pay · EO Cap.57 Part IIA",
    lede: "Estimate statutory eligibility and pro-rata end-of-year payment (double pay / 13th month) under Part IIA of the Employment Ordinance. No sign-up, nothing uploaded.",
    notice: "For reference only — not legal advice and not a Labour Department tool. Your contract, the EO text, the Concise Guide and LD’s calculator prevail. A contract may grant more than the statute. Discretionary bonuses are out of scope.",
    explainTitle: "Why this tool",
    explainBody: "LD’s mega calculator mostly lets you type an end-of-year amount in. Dedicated third-party pro-rata pages are thin. This page applies s.11F to your contractual sum (or one month’s average wages if the contract is silent), payment period and days of service. Rates and Government rent already have RVD’s official calculator, which this site does not clone. For annual leave / payment in lieu / sick leave use LD or stamp4u.",
    ruleItem: "Item",
    ruleHow: "Statutory rule (Part IIA)",
    ruleElig: "Pro-rata eligibility",
    ruleEligV: "Continuous contract of not less than 3 months in the payment period, and still employed after expiry or dismissed by the employer (not s.9 summary dismissal)",
    ruleResign: "Resignation during the period",
    ruleResignV: "Generally no pro-rata entitlement unless the contract says otherwise (s.11F(1B))",
    ruleProb: "Probation",
    ruleProbV: "Excluded from the 3-month test (capped at 3 months); included in the amount once eligible",
    ruleAmt: "Amount",
    ruleAmtV: "Sum specified in the contract; otherwise one month’s average wages. Pro-rata = full × (days employed in the period ÷ days in the period)",
    demoBtn: "Dismissal, half year",
    demoResignBtn: "Resignation demo",
    demoFullBtn: "Full year demo",
    clearData: "Clear data",
    formTitle: "Contract and service",
    amountLegend: "End-of-year amount",
    amountFixed: "Amount specified in the contract",
    amountAverage: "Not specified (use one month’s average wages)",
    amountFixedLabel: "Contractual end-of-year payment / double pay (HKD)",
    amountAverageLabel: "One month’s average wages (HKD)",
    amountHint: "If the contract is silent, Concise Guide Ch.8 uses the 12-month average monthly wages before the due date (or the shorter employment). This page does not compute that average — enter the figure.",
    periodLegend: "Payment period",
    periodLunar: "Lunar year (statutory default if the contract is silent)",
    periodCalendar: "Calendar year (1 Jan–31 Dec)",
    periodCustom: "Custom start and end dates",
    periodYear: "Year",
    periodYearHint: "A lunar year starts on the first day of the first lunar month in that Gregorian year and ends the day before the next lunar new year.",
    customStart: "Payment period start",
    customEnd: "Payment period end",
    serviceLegend: "Days employed in the payment period",
    serviceDates: "Derive from employment dates",
    serviceDays: "Enter days directly",
    empStart: "Employment start date",
    empEnd: "Termination / relevant date",
    empEndHint: "If still employed at period end, enter the last day of the period or leave blank and this page uses the period end.",
    employedDays: "Days employed in the payment period",
    employedDaysHint: "With days only, the 3-month test uses a 90-day proxy. Dates use calendar months.",
    termLegend: "Employment situation",
    termStill: "Still employed after the payment period",
    termDismissed: "Dismissed by the employer (not summary dismissal)",
    termResigned: "Employee resigned (not s.10)",
    termSummary: "Summary dismissal for serious misconduct (s.9)",
    contractGrant: "Contract grants pro-rata end-of-year payment on resignation",
    contractGrantHint: "The statutory floor is that a resignation generally earns no pro-rata portion. Tick this only if your contract says otherwise.",
    probLegend: "Probation (optional)",
    excludeProbation: "There is a probation period: exclude it from the 3-month test (max 3 months)",
    excludeProbationHint: "LD / 1823: probation is left out of the 3-month test, but once eligible the amount uses the whole employment in the period (including probation).",
    probationMonths: "Probation (months), maximum 3",
    printBtn: "Print / save PDF",
    copyBtn: "Copy text",
    csvBtn: "Download CSV",
    draftStatus: "A draft is saved in this browser.",
    copied: "Copied.",
    copyFail: "Could not copy. Select the text yourself.",
    kpiElig: "Eligibility",
    kpiDays: "Days in period",
    kpiRatio: "Ratio",
    kpiPay: "Estimated payment",
    yes: "Eligible",
    no: "Not eligible",
    na: "N/A",
    billTitle: "End-of-year payment estimate",
    billSub: "EO Cap.57 Part IIA · checked " + AS_OF,
    colItem: "Item",
    colAmt: "Value",
    lineElig: "Eligibility",
    lineReason: "Reason",
    linePeriod: "Payment period",
    linePeriodDays: "Days in payment period",
    lineEmployed: "Days employed in the period",
    lineQualifying: "Days used for the 3-month test (after probation)",
    lineMonths: "Approx. months",
    lineFull: "Full amount (contract or one month’s wages)",
    lineRatio: "Day ratio",
    linePay: "Estimated payable",
    lineTerm: "Situation",
    formulaTitle: "Formula",
    empty: "Enter a valid payment period, service facts and amount.",
    notLegal: "Not a Labour Department calculation or legal advice. A contract may grant more.",
    daysUnit: " days",
    lunarLabel: "Lunar year",
    calendarLabel: "Calendar year",
    customLabel: "Custom payment period",
    termNameStill: "Still employed after expiry",
    termNameDismissed: "Dismissed by employer (not summary)",
    termNameResigned: "Employee resigned",
    termNameSummary: "s.9 summary dismissal",
    reason_yes_full: "Employed throughout the payment period — full payment under s.11B.",
    reason_yes_full_after_resign_note: "The whole payment period was completed, so the full sum was already earned. A later resignation does not usually undo that.",
    reason_yes_full_after_summary_note: "The inputs show the whole payment period was completed. Whether a s.9 dismissal still leaves that sum payable is fact-sensitive.",
    reason_yes_prorata_employed: "Still employed after expiry and qualifying service in the period is not less than 3 months — pro-rata under s.11F.",
    reason_yes_prorata_dismissed: "Dismissed by the employer (not summary dismissal) with not less than 3 months’ qualifying service in the period — pro-rata under s.11F.",
    reason_yes_prorata_resign_contract: "The statute generally pays no pro-rata portion on resignation; the contract-grants-more box is on, so the day-count estimate is shown.",
    reason_no_resigned: "Resignation before the payment period expires earns no pro-rata end-of-year payment unless the contract says otherwise (s.11F(1B) / LD FAQ).",
    reason_no_summary: "s.9 summary dismissal takes the case out of s.11F, so no pro-rata portion is estimated.",
    reason_no_short_service: "After excluding probation, qualifying service in the payment period is under 3 months.",
    reason_badLunarYear: "That lunar year is outside this page’s look-up table (2016–2035).",
    reason_badCalendarYear: "Enter a valid calendar year.",
    reason_badCustomDates: "Enter valid custom payment-period dates.",
    reason_endBeforeStart: "The payment period cannot end before it starts.",
    warn_badAmount: "Enter a valid non-negative amount.",
    warn_badEmpStart: "Enter a valid employment start date.",
    warn_badEmpEnd: "Enter a valid termination date.",
    warn_empEndBeforeStart: "Termination cannot be before the start date.",
    warn_badEmployedDays: "Enter days employed greater than 0.",
    warn_daysCappedToPeriod: "Days employed were capped at the length of the payment period.",
    warn_daysApprox3Months: "With days only, the 3-month test uses a 90-day proxy. Employment dates use calendar months.",
    warn_resignedNotEntitled: "A mid-period resignation is not entitled to a pro-rata portion unless the contract says otherwise.",
    warn_summaryNotEntitled: "s.9 summary dismissal is not entitled to a pro-rata portion.",
    warn_shortService: "Qualifying service is under 3 months after the probation exclusion, so no amount is estimated.",
    warn_probationExcludedForTest: "Probation was excluded from the 3-month test only. The amount still uses all days employed in the period.",
    warn_fullAfterResign: "The whole payment period was completed: a later resignation does not usually undo the full sum already earned.",
    warn_fullAfterSummary: "The inputs show the whole period was completed; whether summary dismissal still leaves that payable is fact-sensitive.",
    warn_contractBeatsStatute: "Estimated on the contract-grants-more resignation term. The contract text prevails.",
    ratesTitle: "Statutory formula (EO Part IIA)",
    rateStep: "Step",
    rateHow: "How it is counted",
    rateA: "1. Full amount",
    rateAV: "Sum specified in the contract; otherwise one month’s average wages",
    rateB: "2. Whole payment period",
    rateBV: "s.11B: full amount",
    rateC: "3. Part period",
    rateCV: "s.11F: full × days employed in the period ÷ days in the period (need 3 months; not resignation / s.9)",
    rateD: "4. Probation",
    rateDV: "s.11F(1A): excluded from the 3-month test (max 3 months); included in the amount",
    ratesHintFoot: "Checked against the LD FAQ, Concise Guide Chapter 8 PDF and the 1823 termination FAQ on 23 October 2026. Later official changes prevail.",
    faqTitle: "FAQ",
    faq1q: "Must an employer pay year-end double pay?",
    faq1a: "The Employment Ordinance does not require an employer to pay end-of-year payment (including double pay and bonus). Entitlement depends on the contract (oral or written, express or implied). End-of-year payment excludes gratuitous or purely discretionary sums. For contracts made after 27 June 1997, an annual payment is presumed not gratuitous and not discretionary only, unless a written term says otherwise.",
    faq2q: "If the employee resigns before the payment period ends, is there pro-rata end-of-year payment?",
    faq2a: "Not unless the contract provides otherwise. The payment period is the period specified in the contract, or a lunar year if none is specified. If the employee already served the whole payment period, a later resignation does not usually undo the full sum already earned.",
    faq3q: "Is a dismissed employee entitled to pro-rata end-of-year payment? How is probation counted?",
    faq3a: "An employee employed under a continuous contract for not less than 3 months in a payment period and dismissed by the employer (except s.9 summary dismissal for serious misconduct) is eligible for a pro-rata portion. Any probation, subject to a 3-month cap, is excluded from that 3-month test. Once eligible, the whole employment in the period — including probation — is used for the amount. A s.10 termination (for example the employer’s serious breach) is generally treated like a qualifying termination, not a voluntary resignation; this page’s “resigned” option means a resignation other than s.10.",
    faq4q: "How is the amount set if the contract is silent?",
    faq4a: "Use the contractual sum if one is specified. If not, Concise Guide Ch.8 uses the average monthly wages in the 12 months before the due date (or the shorter employment), excluding unpaid or not-full-pay days. The pro-rata portion is full × (days of service in the period ÷ days in the period) unless the contract specifies another fraction. This page does not compute the 12-month average for you.",
    faq5q: "Is the payment period a lunar year or a calendar year? When is it due?",
    faq5a: "Use the period in the contract. If none is specified, a lunar year. Due date: the date specified, or the last day of the period or within 7 days after. If dismissed before expiry and a pro-rata portion is payable, it is due on termination or within 7 days. If calculated from the employer’s profits, on the day those profits are ascertained or within 7 days.",
    faq6q: "Is this an official Labour Department calculator?",
    faq6a: "No. Cross-check with LD’s Statutory Employment Entitlements Reference Calculator. This page only applies the published Part IIA rules for a rough estimate — not legal advice or a Labour Tribunal award. Discretionary bonuses, profit-share formulae and extra FDH contract terms are out of scope.",
    faq7q: "Is anything uploaded?",
    faq7a: "No. The estimate runs in this browser. A draft may be written to localStorage. There is no account and no server copy.",
    sourcesTitle: "Sources",
    srcFaq: "Labour Department — Employment Ordinance FAQ (end-of-year payment / double pay):",
    srcGuide: "Labour Department — Concise Guide to the EO, Chapter 8 (PDF):",
    src1823: "1823 — Is an employee entitled to pro-rata end-of-year payment on termination:",
    srcWage: "Labour Department — Wages FAQ (one month’s average wages if the amount is not specified):",
    srcEo: "Cap. 57 s.11F (proportion of end of year payment):",
    srcCalc: "Labour Department — Statutory Employment Entitlements Reference Calculator:",
    srcAsOf: "Checked against those official pages on 23 October 2026. Later EO / LD changes prevail.",
    privacyTitle: "Privacy",
    privacyBody: "Wages, dates and estimates stay in this browser (localStorage). This page does not upload, create an account, or use a backend. Print, copy or CSV only creates a file where you choose.",
    disclaimer: "For reference only; not legal advice and not a Labour Department tool. A contract may grant more.",
    csvItem: "Item",
    csvAmount: "Value",
  },
};

const state = {
  lang: "zh",
  model: emptyModel(),
};

function $(id) {
  return document.getElementById(id);
}

function pack() {
  return I18N[state.lang] || I18N.zh;
}

function readLang() {
  try {
    var stored = localStorage.getItem(LANG_KEY);
    if (stored === "en" || stored === "zh") return stored;
  } catch (e) {
    /* ignore */
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

function loadDraft() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return Object.assign(emptyModel(), JSON.parse(raw));
  } catch (e) {
    return null;
  }
}

function saveDraft() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.model));
  } catch (e) {
    /* ignore */
  }
}

function fillYearSelect() {
  var sel = $("period-year");
  var current = String(state.model.periodYear || 2026);
  var years = Object.keys(LUNAR_CNY)
    .map(Number)
    .filter(function (y) {
      return LUNAR_CNY[y + 1];
    })
    .sort(function (a, b) {
      return b - a;
    });
  sel.innerHTML = years
    .map(function (y) {
      var stem = LUNAR_STEM_BRANCH[y] ? " " + LUNAR_STEM_BRANCH[y] : "";
      return (
        "<option value='" +
        y +
        "'" +
        (String(y) === current ? " selected" : "") +
        ">" +
        y +
        stem +
        "</option>"
      );
    })
    .join("");
}

function selectedRadio(name, fallback) {
  var el = document.querySelector('input[name="' + name + '"]:checked');
  return el ? el.value : fallback;
}

function applyI18n() {
  var t = pack();
  document.documentElement.lang = state.lang === "en" ? "en-HK" : "zh-Hant-HK";
  document.title = t.docTitle;
  $("lang-zh").setAttribute("aria-pressed", state.lang === "zh" ? "true" : "false");
  $("lang-en").setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    if (t[key] != null) el.textContent = t[key];
  });
  syncAmountLabel();
}

function syncAmountLabel() {
  var t = pack();
  var mode = selectedRadio("amountMode", "fixed");
  $("amount-label").textContent = mode === "average" ? t.amountAverageLabel : t.amountFixedLabel;
}

function syncChrome() {
  var periodKind = selectedRadio("periodKind", "calendar");
  $("period-year-wrap").hidden = periodKind === "custom";
  $("custom-dates-wrap").hidden = periodKind !== "custom";
  var serviceMode = selectedRadio("serviceMode", "dates");
  $("service-dates-wrap").hidden = serviceMode !== "dates";
  $("service-days-wrap").hidden = serviceMode !== "days";
  $("probation-wrap").hidden = !$("exclude-probation").checked;
  syncAmountLabel();
}

function readForm() {
  return {
    amountMode: selectedRadio("amountMode", "fixed"),
    amount: $("amount").value === "" ? "" : Number($("amount").value),
    periodKind: selectedRadio("periodKind", "calendar"),
    periodYear: Number($("period-year").value) || 2026,
    customStart: $("custom-start").value || "",
    customEnd: $("custom-end").value || "",
    serviceMode: selectedRadio("serviceMode", "dates"),
    empStart: $("emp-start").value || "",
    empEnd: $("emp-end").value || "",
    employedDays: Number($("employed-days").value) || 0,
    termination: selectedRadio("termination", "dismissed"),
    contractGrantResign: $("contract-grant").checked,
    excludeProbation: $("exclude-probation").checked,
    probationMonths: Number($("probation-months").value) || 0,
  };
}

function writeForm(model) {
  document.querySelectorAll('input[name="amountMode"]').forEach(function (el) {
    el.checked = el.value === model.amountMode;
  });
  $("amount").value = model.amount;
  document.querySelectorAll('input[name="periodKind"]').forEach(function (el) {
    el.checked = el.value === model.periodKind;
  });
  $("period-year").value = String(model.periodYear);
  $("custom-start").value = model.customStart || "";
  $("custom-end").value = model.customEnd || "";
  document.querySelectorAll('input[name="serviceMode"]').forEach(function (el) {
    el.checked = el.value === model.serviceMode;
  });
  $("emp-start").value = model.empStart || "";
  $("emp-end").value = model.empEnd || "";
  $("employed-days").value = model.employedDays;
  document.querySelectorAll('input[name="termination"]').forEach(function (el) {
    el.checked = el.value === model.termination;
  });
  $("contract-grant").checked = Boolean(model.contractGrantResign);
  $("exclude-probation").checked = Boolean(model.excludeProbation);
  $("probation-months").value = model.probationMonths;
  syncChrome();
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
  var items = (result.warnings || [])
    .map(function (key) {
      return t["warn_" + key];
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

function row(label, value) {
  return (
    "<tr><th>" +
    escapeHtml(label) +
    "</th><td class='num'>" +
    value +
    "</td></tr>"
  );
}

function kpi(label, value, cls) {
  return (
    "<div class='kpi" +
    (cls ? " " + cls : "") +
    "'><span>" +
    escapeHtml(label) +
    "</span><strong>" +
    escapeHtml(value) +
    "</strong></div>"
  );
}

function periodLabel(result, t) {
  if (!result.periodStart) return "—";
  var kind =
    result.period && result.period.kind === "lunar"
      ? t.lunarLabel
      : result.period && result.period.kind === "custom"
        ? t.customLabel
        : t.calendarLabel;
  var extra = "";
  if (result.period && result.period.kind === "lunar" && result.period.year) {
    extra = " " + result.period.year + (LUNAR_STEM_BRANCH[result.period.year] ? " " + LUNAR_STEM_BRANCH[result.period.year] : "");
  } else if (result.period && result.period.year) {
    extra = " " + result.period.year;
  }
  return kind + extra + "（" + result.periodStart + " – " + result.periodEnd + "）";
}

function termName(termination, t) {
  if (termination === "stillEmployed") return t.termNameStill;
  if (termination === "resigned") return t.termNameResigned;
  if (termination === "summary") return t.termNameSummary;
  return t.termNameDismissed;
}

function reasonText(result, t) {
  return t["reason_" + result.reason] || result.reason;
}

function pct(ratio) {
  return (Math.round(ratio * 10000) / 100).toFixed(2) + "%";
}

function render() {
  var t = pack();
  var result = compute(state.model);
  warnHtml(result);

  var eligLabel = result.eligible ? t.yes : t.no;
  var payLabel = result.payable ? formatHkd(result.amount) : t.na;
  $("kpis").innerHTML =
    kpi(t.kpiElig, eligLabel, result.eligible ? "ok" : "no") +
    kpi(t.kpiDays, String(result.employedDays) + " / " + String(result.periodDays) + t.daysUnit) +
    kpi(t.kpiRatio, result.periodDays ? pct(result.ratio) : "—") +
    kpi(t.kpiPay, payLabel);

  if (!result.period || !result.period.ok) {
    $("bill").innerHTML =
      "<div class='bill-head'><div><h2 class='bill-title'>" +
      escapeHtml(t.billTitle) +
      "<small>" +
      escapeHtml(t.billSub) +
      "</small></h2></div><div class='bill-chop' aria-hidden='true'>年終<br />雙糧</div></div>" +
      "<p class='bill-note'>" +
      escapeHtml(t.empty) +
      "</p>";
    return;
  }

  var eligHtml =
    "<span class='" +
    (result.eligible ? "elig-yes" : "elig-no") +
    "'>" +
    escapeHtml(eligLabel) +
    "</span>";

  var rows =
    row(t.lineElig, eligHtml) +
    row(t.lineReason, escapeHtml(reasonText(result, t))) +
    row(t.lineTerm, escapeHtml(termName(result.termination, t))) +
    row(t.linePeriod, escapeHtml(periodLabel(result, t))) +
    row(t.linePeriodDays, escapeHtml(String(result.periodDays) + t.daysUnit)) +
    row(t.lineEmployed, escapeHtml(String(result.employedDays) + t.daysUnit)) +
    (result.excludeProbation
      ? row(t.lineQualifying, escapeHtml(String(result.qualifyingDays) + t.daysUnit))
      : "") +
    row(t.lineMonths, escapeHtml(String(result.monthsApprox))) +
    row(t.lineFull, escapeHtml(formatHkd(result.fullAmount))) +
    row(t.lineRatio, escapeHtml(pct(result.ratio))) +
    row(t.linePay, "<strong>" + escapeHtml(payLabel) + "</strong>");

  $("bill").innerHTML =
    "<div class='bill-head'><div><h2 class='bill-title'>" +
    escapeHtml(t.billTitle) +
    "<small>" +
    escapeHtml(t.billSub) +
    "</small></h2></div><div class='bill-chop' aria-hidden='true'>年終<br />雙糧</div></div>" +
    "<table><thead><tr><th>" +
    escapeHtml(t.colItem) +
    "</th><th class='num'>" +
    escapeHtml(t.colAmt) +
    "</th></tr></thead><tbody>" +
    rows +
    "</tbody></table>" +
    (result.formula
      ? "<h2>" + escapeHtml(t.formulaTitle) + "</h2><pre class='formula'>" + escapeHtml(result.formula) + "</pre>"
      : "") +
    "<p class='bill-note'>" +
    escapeHtml(t.notLegal) +
    "</p>";
}

function resultText() {
  var t = pack();
  var result = compute(state.model);
  return [
    t.billTitle,
    t.billSub,
    "",
    t.lineElig + ": " + (result.eligible ? t.yes : t.no),
    t.lineReason + ": " + reasonText(result, t),
    t.linePeriod + ": " + periodLabel(result, t),
    t.lineEmployed + ": " + result.employedDays + " / " + result.periodDays,
    t.lineFull + ": " + formatHkd(result.fullAmount),
    t.linePay + ": " + (result.payable ? formatHkd(result.amount) : t.na),
    "",
    result.formula,
    "",
    t.notLegal,
  ].join("\n");
}

function csvLabels() {
  var t = pack();
  return {
    item: t.csvItem,
    amount: t.csvAmount,
    eligibility: t.lineElig,
    yes: t.yes,
    no: t.no,
    reason: t.lineReason,
    period: t.linePeriod,
    periodDays: t.linePeriodDays,
    employedDays: t.lineEmployed,
    qualifyingDays: t.lineQualifying,
    ratio: t.lineRatio,
    full: t.lineFull,
    estimate: t.linePay,
    termination: t.lineTerm,
    formula: t.formulaTitle,
  };
}

function onFormChange() {
  state.model = readForm();
  saveDraft();
  syncChrome();
  render();
}

function init() {
  state.lang = readLang();
  fillYearSelect();
  var draft = loadDraft();
  if (draft) state.model = draft;
  writeForm(state.model);
  applyI18n();
  render();

  $("eoy-form").addEventListener("input", onFormChange);
  $("eoy-form").addEventListener("change", onFormChange);
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
    state.model = demoDismissedHalfYear();
    writeForm(state.model);
    saveDraft();
    render();
  });
  $("demo-resign-btn").addEventListener("click", function () {
    state.model = demoResignedHalfYear();
    writeForm(state.model);
    saveDraft();
    render();
  });
  $("demo-full-btn").addEventListener("click", function () {
    state.model = demoFullYear();
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
    var csv = summaryToCsv(compute(state.model), csvLabels());
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "year-end-pay.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
