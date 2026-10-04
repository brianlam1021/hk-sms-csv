const BANKS = [
  {
    id: "hsbc",
    name: "滙豐",
    keywords: [/hsbc/i, /滙豐/, /汇丰/],
  },
  {
    id: "hangseng",
    name: "恒生",
    keywords: [/hang\s*seng/i, /恒生/, /恆生/],
  },
  {
    id: "boc",
    name: "中銀",
    keywords: [/bochk/i, /\bboc\b/i, /bank of china/i, /中銀/, /中银/],
  },
  {
    id: "scb",
    name: "渣打",
    keywords: [/standard\s*chartered/i, /\bscb\b/i, /渣打/],
  },
];

const MONTHS = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const CURRENCY_RE =
  /(?:HKD|HK\$|USD|CNY|RMB|EUR|JPY|MOP|GBP|AUD|SGD|港幣|港币)/i;

export function toHalfWidth(input) {
  return String(input)
    .replace(/[\uFF01-\uFF5E]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
    )
    .replace(/\u3000/g, " ");
}

export function splitMessages(text) {
  const normalized = toHalfWidth(String(text ?? ""))
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
  if (!normalized) return [];
  if (/\n\s*\n/.test(normalized)) {
    return normalized
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean);
  }
  return normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function detectBank(text) {
  for (const bank of BANKS) {
    if (bank.keywords.some((re) => re.test(text))) return bank;
  }
  return null;
}

function parseAmount(text) {
  const re = new RegExp(
    `(${CURRENCY_RE.source})\\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\\.[0-9]{1,2})?|[0-9]+(?:\\.[0-9]{1,2})?)`,
    "i",
  );
  const match = text.match(re);
  if (!match) return null;
  const rawCurrency = match[1].toUpperCase();
  const currency =
    rawCurrency === "港幣" || rawCurrency === "港币" || rawCurrency === "HK$"
      ? "HKD"
      : rawCurrency === "RMB"
        ? "CNY"
        : rawCurrency;
  return {
    amount: Number(match[2].replace(/,/g, "")),
    currency,
  };
}

function expandYear(year) {
  const n = Number(year);
  if (year.length === 2) return 2000 + n;
  return n;
}

function isoDate(year, month, day) {
  const y = Number(year);
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  if (y < 2000 || y > 2100) return null;
  const monthNum = Number(m);
  const dayNum = Number(d);
  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) return null;
  return `${y}-${m}-${d}`;
}

function parseDate(text) {
  const patterns = [
    /(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/,
    /(\d{1,2})月\s*(\d{1,2})日/,
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
    /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
    /(\d{1,2})-(\d{1,2})-(\d{2,4})/,
    /(\d{1,2})\s*([A-Za-z]{3})\s*(\d{2,4})/,
    /(\d{1,2})-([A-Za-z]{3})-(\d{2,4})/,
  ];

  for (const re of patterns) {
    const match = text.match(re);
    if (!match) continue;

    if (re.source.includes("年")) {
      return isoDate(match[1], match[2], match[3]);
    }
    if (re.source.includes("月")) {
      const nowYear = new Date().getFullYear();
      return isoDate(nowYear, match[1], match[2]);
    }
    if (re.source.startsWith("(\\d{4})-")) {
      return isoDate(match[1], match[2], match[3]);
    }
    if (/[A-Za-z]/.test(match[2])) {
      const month = MONTHS[match[2].toLowerCase()];
      if (!month) continue;
      return isoDate(expandYear(match[3]), month, match[1]);
    }
    return isoDate(expandYear(match[3]), match[2], match[1]);
  }
  return "";
}

function parseCardTail(text) {
  const patterns = [
    /(?:ending(?:\s+with)?|card\s+ending)\s*[:#*]?\s*(\d{4})/i,
    /(?:尾數|尾数|卡尾)\s*[:：#*]?\s*(\d{4})/,
    /卡\s*尾\s*(\d{4})/,
    /(?:card|卡)\s*[*xX]\s*(\d{4})/i,
    /[*xX](\d{4})(?!\d)/,
    /信用卡[（(](?:尾數|尾数)?(\d{4})[）)]/,
    /(?:your card|card)\s+(\d{4})\b/i,
  ];
  for (const re of patterns) {
    const match = text.match(re);
    if (match) return match[1];
  }
  return "";
}

function cleanMerchant(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/[。．.！!？?,，;；]+$/g, "")
    .replace(/^(?:the\s+)?/i, "")
    .trim();
}

function parseMerchant(text) {
  const english = text.match(
    /\bat\s+(.+?)(?:\s+on\s+\d|\s+on\s+[A-Za-z]|\s+at\s+\d|[.。]|,\s*(?:if|please|call|enquiry)|(?:if|please|call|enquiry)\b)/i,
  );
  if (english) {
    const merchant = cleanMerchant(english[1]);
    if (merchant) return merchant;
  }

  const chineseAt = text.match(
    /在\s*(.+?)\s*(?:簽帳|签帐|消費|消费|購物|购物|付款)/,
  );
  if (chineseAt) {
    const merchant = cleanMerchant(chineseAt[1]);
    if (merchant) return merchant;
  }

  const chineseOn = text.match(
    /(?:於|于)\s*(.+?)\s*(?:簽帳|签帐|消費|消费|購物|购物|付款)/,
  );
  if (chineseOn) {
    const merchant = cleanMerchant(
      chineseOn[1]
        .replace(/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}(?:\s+\d{1,2}:\d{2})?\s*/, "")
        .replace(/^\d{4}年?\d{1,2}月\d{1,2}日?\s*/, "")
        .replace(/^\d{1,2}月\d{1,2}日(?:\s*\d{1,2}:\d{2})?\s*/, "")
        .replace(/^\d{1,2}:\d{2}\s*/, ""),
    );
    if (merchant) return merchant;
  }

  const payOn = text.match(
    /(?:to pay|used (?:your card )?to pay|paid)\s+(?:HKD|HK\$|USD|港幣|港币)?\s*[0-9,.]+\s+(?:at|on)\s+(.+?)(?:[.。]|$)/i,
  );
  if (payOn) {
    const merchant = cleanMerchant(payOn[1]);
    if (merchant) return merchant;
  }

  return "";
}

function looksLikePurchase(text) {
  return /簽帳|签帐|消費|消费|購物|购物|purchase|used for|was used|paid|spend|transaction|商戶|merchant/i.test(
    text,
  );
}

export function parseOne(rawLine) {
  const raw = String(rawLine ?? "").trim();
  if (!raw) return null;
  const text = toHalfWidth(raw).replace(/\s+/g, " ");
  const bank = detectBank(text);
  const money = parseAmount(text);
  if (!bank || !money || !Number.isFinite(money.amount)) return null;
  if (!looksLikePurchase(text)) return null;

  const date = parseDate(text);
  const merchant = parseMerchant(text);
  const cardTail = parseCardTail(text);
  if (!date && !merchant && !cardTail) return null;

  return {
    date,
    amount: money.amount,
    currency: money.currency,
    merchant,
    bank: bank.name,
    bankId: bank.id,
    cardTail,
    raw,
  };
}

export function parseSmsText(text) {
  const messages = splitMessages(text);
  const rows = [];
  const unmatched = [];

  for (const message of messages) {
    const parsed = parseOne(message);
    if (parsed) {
      rows.push(parsed);
      continue;
    }

    const lines = message
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length > 1) {
      let any = false;
      const leftover = [];
      for (const line of lines) {
        const lineParsed = parseOne(line);
        if (lineParsed) {
          rows.push(lineParsed);
          any = true;
        } else {
          leftover.push(line);
        }
      }
      if (any) {
        unmatched.push(...leftover);
        continue;
      }
    }
    unmatched.push(message);
  }

  return { rows, unmatched };
}

export function summarize(rows) {
  const byBank = {};
  const byMerchant = {};
  let total = 0;

  for (const row of rows) {
    total += row.amount;
    byBank[row.bank] = (byBank[row.bank] || 0) + row.amount;
    const merchant = row.merchant || "（無商戶）";
    byMerchant[merchant] = (byMerchant[merchant] || 0) + row.amount;
  }

  const sortEntries = (obj) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hant"));

  return {
    total,
    count: rows.length,
    byBank: sortEntries(byBank),
    byMerchant: sortEntries(byMerchant),
  };
}
