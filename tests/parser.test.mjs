import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { parseOne, parseSmsText, summarize } from "../docs/parser.js";
import { rowsToCsv } from "../docs/csv.js";
import { SAMPLE_SMS } from "../docs/samples.js";

describe("parseOne bank formats", () => {
  it("parses HSBC English", () => {
    const row = parseOne(
      "Your HSBC Credit Card ending 4321 was used for HKD 88.50 at WELLCOME SUPERMARKET on 03/10/2026 14:22. If unauthorised, call 2233 3000.",
    );
    assert.deepEqual(
      {
        date: row.date,
        amount: row.amount,
        currency: row.currency,
        merchant: row.merchant,
        bank: row.bank,
        cardTail: row.cardTail,
      },
      {
        date: "2026-10-03",
        amount: 88.5,
        currency: "HKD",
        merchant: "WELLCOME SUPERMARKET",
        bank: "滙豐",
        cardTail: "4321",
      },
    );
  });

  it("parses HSBC Traditional Chinese", () => {
    const row = parseOne(
      "滙豐信用卡尾數4321於03/10/2026 18:05在MTR TICKET簽帳港幣22.00。如非閣下交易，請致電22333000。",
    );
    assert.equal(row.bank, "滙豐");
    assert.equal(row.amount, 22);
    assert.equal(row.merchant, "MTR TICKET");
    assert.equal(row.cardTail, "4321");
    assert.equal(row.date, "2026-10-03");
  });

  it("parses Hang Seng English and Chinese", () => {
    const en = parseOne(
      "Hang Seng Credit Card *2468 was used for HKD45.00 at 7-ELEVEN on 02/10/2026 08:11. If not you, call 2832 0833.",
    );
    const zh = parseOne(
      "恒生信用卡*2468於02/10/2026 12:40在CAFE DE CORAL消費港幣62.00。如非閣下交易，請致電28320833。",
    );
    assert.equal(en.bank, "恒生");
    assert.equal(en.merchant, "7-ELEVEN");
    assert.equal(en.cardTail, "2468");
    assert.equal(zh.merchant, "CAFE DE CORAL");
    assert.equal(zh.amount, 62);
  });

  it("parses BOC English, Chinese month-day, and SCB", () => {
    const bocEn = parseOne(
      "BOCHK: Your card ending 1357 was used for HKD250.80 at PARKnSHOP on 01/10/2026 19:03. Enquiry 2928 2388.",
    );
    const bocZh = parseOne(
      "中銀信用卡(尾數1357)於2026年10月1日19:03在CITYSUPER消費港幣168.00。如有疑問請致電29282388。",
    );
    const scb = parseOne(
      "Your Standard Chartered card ending 9753 was used for HKD99.00 at UNIQLO CAUSEWAY BAY on 30/09/2026 13:18. Call 2886 4111 if not you.",
    );
    const scbZh = parseOne(
      "渣打信用卡尾數9753於30/09/2026在STARBUCKS COFFEE簽帳港幣58.00。如非授權交易請致電28864111。",
    );
    assert.equal(bocEn.bank, "中銀");
    assert.equal(bocEn.amount, 250.8);
    assert.equal(bocZh.date, "2026-10-01");
    assert.equal(bocZh.merchant, "CITYSUPER");
    assert.equal(scb.bank, "渣打");
    assert.equal(scb.merchant, "UNIQLO CAUSEWAY BAY");
    assert.equal(scbZh.amount, 58);
  });

  it("parses comma amounts, two-digit years, and Oct dates", () => {
    const comma = parseOne(
      "HSBC card ending 1111 was used for HKD 1,234.56 at IKEA on 04/10/26.",
    );
    const oct = parseOne(
      "SCB: Purchase of HKD10.00 at BOOKSHOP on 04-Oct-2026 with card ending 2222.",
    );
    assert.equal(comma.amount, 1234.56);
    assert.equal(comma.date, "2026-10-04");
    assert.equal(oct.date, "2026-10-04");
    assert.equal(oct.merchant, "BOOKSHOP");
  });
});

describe("unmatched lines and summary", () => {
  it("keeps unmatched lines out of totals", () => {
    const text = [
      "Your HSBC Credit Card ending 4321 was used for HKD 88.50 at WELLCOME SUPERMARKET on 03/10/2026.",
      "This line is not a bank purchase SMS and should stay unmatched.",
      "HSBC: Your one-time password is 000000. Do not share this code.",
    ].join("\n");
    const { rows, unmatched } = parseSmsText(text);
    const stats = summarize(rows);
    assert.equal(rows.length, 1);
    assert.equal(unmatched.length, 2);
    assert.equal(stats.total, 88.5);
    assert.equal(stats.count, 1);
    assert.ok(!unmatched.some((line) => /WELLCOME/.test(line)));
  });

  it("parses all synthetic samples except the two unmatched lines", () => {
    const { rows, unmatched } = parseSmsText(SAMPLE_SMS);
    assert.equal(rows.length, 8);
    assert.ok(unmatched.some((line) => /should stay unmatched/.test(line)));
    assert.ok(unmatched.some((line) => /one-time password/.test(line)));
    const stats = summarize(rows);
    assert.equal(stats.count, 8);
    assert.equal(Number(stats.total.toFixed(2)), 793.3);
    assert.deepEqual(
      stats.byBank.map(([bank]) => bank).sort(),
      ["中銀", "恒生", "渣打", "滙豐"],
    );
  });
});

describe("csv", () => {
  it("writes UTF-8 BOM and excludes unmatched rows", () => {
    const { rows } = parseSmsText(
      "Your HSBC Credit Card ending 4321 was used for HKD 88.50 at WELLCOME SUPERMARKET on 03/10/2026.\nnoise",
    );
    const csv = rowsToCsv(rows);
    assert.equal(csv.charCodeAt(0), 0xfeff);
    assert.match(csv, /日期,金額,貨幣,商戶,銀行,卡尾/);
    assert.match(csv, /2026-10-03,88.50,HKD,WELLCOME SUPERMARKET,滙豐,4321/);
    assert.doesNotMatch(csv, /noise/);
  });
});

const ADSENSE_SNIPPET =
  '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4101065010696162" crossorigin="anonymous"></script>';

describe("privacy constraints in source", () => {
  it("does not use localStorage or analytics trackers", () => {
    const files = [
      "app.js",
      "parser.js",
      "csv.js",
      "samples.js",
      "index.html",
      "docs/app.js",
      "docs/parser.js",
      "docs/csv.js",
      "docs/samples.js",
      "docs/index.html",
    ].map((path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
    const joined = files.join("\n");
    assert.doesNotMatch(joined, /localStorage\s*[.[]|localStorage\s*=/);
    assert.doesNotMatch(joined, /google-analytics|gtag\(|googletagmanager|plausible|cloudflareinsights/i);
    assert.match(joined, /不是銀行夥伴/);
    assert.match(joined, /不是戶口結餘/);
    assert.match(joined, /不是詐騙偵測/);
  });

  it("includes the official AdSense site-connection snippet on both pages", () => {
    const rootHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    const docsHtml = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");
    assert.match(rootHtml, new RegExp(ADSENSE_SNIPPET.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(docsHtml, new RegExp(ADSENSE_SNIPPET.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    const pages = rootHtml + "\n" + docsHtml;
    assert.doesNotMatch(pages, /ca-pub-(?!4101065010696162)\d+/);
    assert.doesNotMatch(pages, /data-ad-slot|adsbygoogle\.push/i);
  });
});
