/** Pure apportionment maths for the building repair-levy calculator. No DOM. */

export const CATEGORY_IDS = ["residential", "shop", "carpark", "other"];

export const CATEGORY_ALIASES = {
  residential: [
    "residential",
    "res",
    "flat",
    "flats",
    "unit",
    "住宅",
    "住宅 residential",
    "單位",
  ],
  shop: ["shop", "shops", "commercial", "商舖", "商铺", "商店", "商舖 shop"],
  carpark: [
    "carpark",
    "car park",
    "car-park",
    "parking",
    "cp",
    "車位",
    "车位",
    "車位 car park",
  ],
  other: ["other", "others", "misc", "其他", "其他 other"],
};

export function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function parseCategory(raw) {
  const s = String(raw == null ? "" : raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (!s) return "residential";
  for (const id of CATEGORY_IDS) {
    const aliases = CATEGORY_ALIASES[id];
    for (let i = 0; i < aliases.length; i++) {
      if (aliases[i] === s) return id;
    }
  }
  return "other";
}

export function participates(unit, categories) {
  if (!unit) return false;
  if (categories === "all" || categories == null) return true;
  if (!Array.isArray(categories) || categories.length === 0) return true;
  return categories.indexOf(unit.category) !== -1;
}

export function moneyToUnits(amount, step) {
  const factor = step === 0.1 ? 10 : 1;
  const n = num(amount, 0);
  return Math.round(n * factor);
}

export function unitsToMoney(units, step) {
  const factor = step === 0.1 ? 10 : 1;
  return units / factor;
}

function nearlyEqual(a, b) {
  return Math.abs(a - b) < 1e-9;
}

/**
 * Hamilton / largest-remainder allocation.
 * Σ returned amounts === steppedTotal (total rounded to `step`).
 * Tie-break: larger remainder, then larger weight, then lower index.
 */
export function largestRemainder(weights, total, step) {
  const stepValue = step === 0.1 ? 0.1 : 1;
  const n = weights.length;
  const totalUnits = moneyToUnits(total, stepValue);
  const w = [];
  for (let i = 0; i < n; i++) {
    const v = num(weights[i], 0);
    w.push(v > 0 ? v : 0);
  }
  const sumW = w.reduce((a, b) => a + b, 0);
  const floors = new Array(n).fill(0);
  if (n === 0 || sumW <= 0 || totalUnits === 0) {
    return {
      amounts: floors.map(() => 0),
      steppedTotal: unitsToMoney(totalUnits, stepValue),
    };
  }

  const exact = w.map((wi) => (totalUnits * wi) / sumW);
  for (let i = 0; i < n; i++) {
    floors[i] = Math.floor(exact[i] + 1e-12);
  }
  let leftover = totalUnits - floors.reduce((a, b) => a + b, 0);
  leftover = Math.round(leftover);

  const order = exact.map((e, i) => ({
    i,
    rem: e - floors[i],
    w: w[i],
  }));
  order.sort((a, b) => {
    if (!nearlyEqual(a.rem, b.rem)) return b.rem - a.rem;
    if (!nearlyEqual(a.w, b.w)) return b.w - a.w;
    return a.i - b.i;
  });

  if (leftover > 0) {
    for (let k = 0; k < leftover; k++) {
      floors[order[k].i] += 1;
    }
  } else if (leftover < 0) {
    const rev = order.slice().reverse();
    let need = -leftover;
    for (let k = 0; k < rev.length && need > 0; k++) {
      if (floors[rev[k].i] > 0) {
        floors[rev[k].i] -= 1;
        need -= 1;
      }
    }
  }

  return {
    amounts: floors.map((f) => unitsToMoney(f, stepValue)),
    steppedTotal: unitsToMoney(totalUnits, stepValue),
  };
}

export function resolveItems(items) {
  const list = Array.isArray(items) ? items : [];
  let fixedSum = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i].mode !== "percent") {
      fixedSum += Math.max(0, num(list[i].value, 0));
    }
  }
  return list.map((item) => {
    const value = Math.max(0, num(item.value, 0));
    const resolvedAmount =
      item.mode === "percent" ? (value / 100) * fixedSum : value;
    return Object.assign({}, item, { resolvedAmount });
  });
}

export function applySubsidy(resolvedItems, ocSubsidy) {
  const subsidy = Math.max(0, num(ocSubsidy, 0));
  const gross = resolvedItems.reduce((s, item) => s + item.resolvedAmount, 0);
  const net = Math.max(0, gross - subsidy);
  const scale = gross > 0 ? net / gross : 0;
  return resolvedItems.map((item) =>
    Object.assign({}, item, { apportionAmount: item.resolvedAmount * scale }),
  );
}

function rowIsEmpty(unit) {
  const label = String(unit.label || "").trim();
  const owner = String(unit.owner || "").trim();
  const shares = String(unit.shares == null ? "" : unit.shares).trim();
  const deduction = num(unit.deduction, 0);
  return !label && !owner && (shares === "" || num(shares, 0) === 0) && deduction === 0;
}

export function validateModel(model) {
  const errors = [];
  const units = (model.units || []).filter((u) => !rowIsEmpty(u));
  const items = model.items || [];

  const labels = Object.create(null);
  units.forEach((unit, index) => {
    const label = String(unit.label || "").trim();
    if (!label) {
      errors.push({
        code: "blank-label",
        unitIndex: index,
        unitId: unit.id,
      });
    } else {
      const key = label.toLowerCase();
      if (labels[key] != null) {
        errors.push({
          code: "duplicate-label",
          unitIndex: index,
          unitId: unit.id,
          label,
        });
      } else {
        labels[key] = index;
      }
    }
    const shares = num(unit.shares, NaN);
    if (!Number.isFinite(shares) || shares <= 0) {
      errors.push({
        code: "zero-shares",
        unitIndex: index,
        unitId: unit.id,
        label,
      });
    }
    if (num(unit.deduction, 0) < 0) {
      errors.push({
        code: "negative-deduction",
        unitIndex: index,
        unitId: unit.id,
        label,
      });
    }
  });

  const resolved = resolveItems(items);
  resolved.forEach((item, index) => {
    const cats = item.categories;
    if (Array.isArray(cats) && cats.length === 0) {
      errors.push({
        code: "no-categories",
        itemIndex: index,
        itemId: item.id,
        name: item.name,
      });
    }
    if (item.mode === "percent" && num(item.value, 0) <= 0) {
      errors.push({
        code: "blank-percent",
        itemIndex: index,
        itemId: item.id,
        name: item.name,
      });
    }
    if (item.mode !== "percent" && num(item.value, 0) < 0) {
      errors.push({
        code: "negative-amount",
        itemIndex: index,
        itemId: item.id,
        name: item.name,
      });
    }
    const pool = units.filter((u) => participates(u, item.categories));
    const poolShares = pool.reduce((s, u) => s + Math.max(0, num(u.shares, 0)), 0);
    if (item.resolvedAmount > 0 && poolShares <= 0) {
      errors.push({
        code: "category-zero-shares",
        itemIndex: index,
        itemId: item.id,
        name: item.name,
      });
    }
  });

  if (units.length === 0) {
    errors.push({ code: "no-units" });
  }
  if (items.length === 0) {
    errors.push({ code: "no-items" });
  }

  return errors;
}

export function addMonthsIso(iso, offset) {
  const parts = String(iso || "").split("-");
  if (parts.length < 3) return "";
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return "";
  const dt = new Date(y, m - 1 + offset, d);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return yy + "-" + mm + "-" + dd;
}

export function instalmentDates(firstIso, count) {
  const n = Math.max(1, Math.round(num(count, 1)));
  const dates = [];
  for (let i = 0; i < n; i++) {
    dates.push(firstIso ? addMonthsIso(firstIso, i) : "");
  }
  return dates;
}

export function splitInstalments(amount, count, step) {
  const n = Math.max(1, Math.round(num(count, 1)));
  const weights = new Array(n).fill(1);
  return largestRemainder(weights, amount, step).amounts;
}

function parseDelimitedLine(line) {
  if (line.indexOf("\t") !== -1) {
    return line.split("\t").map((c) => c.trim());
  }
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line.charAt(i);
    if (inQuotes) {
      if (ch === '"') {
        if (line.charAt(i + 1) === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur.trim());
  return cells;
}

function looksLikeHeader(cells) {
  const joined = cells.join(" ").toLowerCase();
  return /單位|unit|label|業主|owner|份數|shares|類別|category/.test(joined) &&
    !/\d/.test(cells[0] || "");
}

export function parsePaste(text) {
  const lines = String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");
  const units = [];
  const errors = [];
  let start = 0;
  const firstCells = parseDelimitedLine(lines[0] || "");
  if (lines[0] && looksLikeHeader(firstCells)) start = 1;
  for (let i = start; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    const cells = parseDelimitedLine(raw).filter((c, idx, arr) => {
      return c !== "" || idx !== arr.length - 1;
    });
    if (cells.length < 2) {
      errors.push({ code: "paste-short", line: i + 1 });
      continue;
    }
    let label = "";
    let owner = "";
    let shares = "";
    let category = "residential";
    if (cells.length === 2) {
      label = cells[0];
      shares = cells[1];
    } else if (cells.length === 3) {
      label = cells[0];
      const mid = cells[1];
      const last = cells[2];
      if (/^[\d.]+$/.test(mid) && !/^[\d.]+$/.test(last)) {
        shares = mid;
        category = parseCategory(last);
      } else if (/^[\d.]+$/.test(last)) {
        owner = mid;
        shares = last;
      } else {
        shares = mid;
        category = parseCategory(last);
      }
    } else {
      label = cells[0];
      owner = cells[1];
      shares = cells[2];
      category = parseCategory(cells[3]);
    }
    units.push({
      label: String(label).trim(),
      owner: String(owner).trim(),
      shares: num(shares, 0),
      category,
      deduction: 0,
    });
  }
  return { units, errors };
}

export function escapeCsvCell(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

export function formatMoneyPlain(amount, step) {
  const n = num(amount, 0);
  const digits = step === 0.1 ? 1 : step === 1 ? 0 : 2;
  return n.toFixed(digits);
}

export function compute(model) {
  const step = model.roundingStep === 0.1 ? 0.1 : 1;
  const errors = validateModel(model);
  const units = (model.units || []).filter((u) => !rowIsEmpty(u));
  const rawItems = model.items || [];
  const resolved = applySubsidy(resolveItems(rawItems), model.ocSubsidy);
  const instalmentCount = Math.max(1, Math.round(num(model.instalments, 1)));
  const dates = instalmentDates(model.firstDue, instalmentCount);

  const blocking = errors.some((e) =>
    [
      "no-units",
      "no-items",
      "zero-shares",
      "duplicate-label",
      "category-zero-shares",
      "no-categories",
    ].indexOf(e.code) !== -1,
  );

  if (blocking || units.length === 0 || resolved.length === 0) {
    return {
      ok: false,
      errors,
      step,
      items: [],
      rows: [],
      totals: emptyTotals(),
      dates,
      roundingNote: true,
      instalmentCount,
    };
  }

  const itemResults = resolved.map((item) => {
    const weights = units.map((u) =>
      participates(u, item.categories) ? Math.max(0, num(u.shares, 0)) : 0,
    );
    const allocated = largestRemainder(weights, item.apportionAmount, step);
    const byUnitId = {};
    units.forEach((u, i) => {
      byUnitId[u.id] = allocated.amounts[i];
    });
    return Object.assign({}, item, {
      steppedTotal: allocated.steppedTotal,
      amounts: allocated.amounts,
      byUnitId,
    });
  });

  const totalShares = units.reduce((s, u) => s + Math.max(0, num(u.shares, 0)), 0);
  const rows = units.map((unit, index) => {
    const itemShares = {};
    let itemsTotal = 0;
    itemResults.forEach((item) => {
      const amt = item.amounts[index];
      itemShares[item.id] = amt;
      itemsTotal += amt;
    });
    itemsTotal = Number(itemsTotal.toFixed(step === 0.1 ? 1 : 0));
    const deduction = Math.max(0, num(unit.deduction, 0));
    const deductionStepped = unitsToMoney(moneyToUnits(deduction, step), step);
    const payable = Number((itemsTotal - deductionStepped).toFixed(step === 0.1 ? 1 : 0));
    const instalments = splitInstalments(payable, instalmentCount, step);
    return {
      id: unit.id,
      label: unit.label,
      owner: unit.owner,
      category: unit.category,
      shares: num(unit.shares, 0),
      pct: totalShares > 0 ? (num(unit.shares, 0) / totalShares) * 100 : 0,
      itemShares,
      itemsTotal,
      deduction: deductionStepped,
      payable,
      instalments,
    };
  });

  const gross = resolved.reduce((s, item) => s + item.resolvedAmount, 0);
  const net = resolved.reduce((s, item) => s + item.apportionAmount, 0);
  const itemSums = {};
  let itemsColumnSum = 0;
  itemResults.forEach((item) => {
    itemSums[item.id] = item.steppedTotal;
    itemsColumnSum += item.steppedTotal;
  });
  const deductions = rows.reduce((s, r) => s + r.deduction, 0);
  const payable = rows.reduce((s, r) => s + r.payable, 0);

  return {
    ok: true,
    errors,
    step,
    items: itemResults,
    rows,
    totals: {
      gross,
      subsidy: Math.max(0, num(model.ocSubsidy, 0)),
      net,
      itemsColumnSum,
      deductions,
      payable,
      itemSums,
      totalShares,
    },
    dates,
    roundingNote: true,
    instalmentCount,
  };
}

function emptyTotals() {
  return {
    gross: 0,
    subsidy: 0,
    net: 0,
    itemsColumnSum: 0,
    deductions: 0,
    payable: 0,
    itemSums: {},
    totalShares: 0,
  };
}

export function quickShare(totalCost, myShares, totalShares, instalments) {
  const total = Math.max(0, num(totalCost, 0));
  const mine = num(myShares, 0);
  const all = num(totalShares, 0);
  const n = Math.max(1, Math.round(num(instalments, 1)));
  if (all <= 0 || mine < 0) {
    return {
      ok: false,
      amount: 0,
      pct: 0,
      perInstalment: 0,
      instalments: n,
    };
  }
  const amount = (total * mine) / all;
  return {
    ok: true,
    amount,
    pct: (mine / all) * 100,
    perInstalment: amount / n,
    instalments: n,
  };
}

const DEMO_OWNERS_A = ["陳大文", "李小明", "王美玲", "張志強", "黃雅文", "林家傑", "周詠詩", "吳俊傑"];
const DEMO_OWNERS_B = ["鄭麗華", "何志偉", "馬嘉琪", "梁偉明", "徐雅婷", "蔡國豪", "葉美華", "羅子軒"];
const DEMO_OWNERS_C = ["馮曉琳", "鄧梓軒", "謝嘉欣", "韓志明", "潘詠琪", "呂俊熙", "蘇美寶", "江子健"];

export function demoModel() {
  const units = [];
  let id = 1;
  for (let i = 0; i < 8; i++) {
    units.push({
      id: "u" + id++,
      label: i + 1 + "A",
      owner: DEMO_OWNERS_A[i],
      shares: 50,
      category: "residential",
      deduction: 0,
    });
  }
  for (let i = 0; i < 8; i++) {
    units.push({
      id: "u" + id++,
      label: i + 1 + "B",
      owner: DEMO_OWNERS_B[i],
      shares: 40,
      category: "residential",
      deduction: 0,
    });
  }
  for (let i = 0; i < 8; i++) {
    units.push({
      id: "u" + id++,
      label: i + 1 + "C",
      owner: DEMO_OWNERS_C[i],
      shares: 30,
      category: "residential",
      deduction: 0,
    });
  }
  units.push({
    id: "u" + id++,
    label: "Shop 1",
    owner: "示例商號甲",
    shares: 100,
    category: "shop",
    deduction: 0,
  });
  units.push({
    id: "u" + id++,
    label: "Shop 2",
    owner: "示例商號乙",
    shares: 100,
    category: "shop",
    deduction: 0,
  });
  for (let i = 1; i <= 6; i++) {
    units.push({
      id: "u" + id++,
      label: "CP" + String(i).padStart(2, "0"),
      owner: "",
      shares: 10,
      category: "carpark",
      deduction: 0,
    });
  }
  return {
    units,
    items: [
      {
        id: "i1",
        name: "外牆及渠管 External walls & drains",
        mode: "amount",
        value: 4800000,
        categories: "all",
      },
      {
        id: "i2",
        name: "更換升降機 Lift replacement",
        mode: "amount",
        value: 1600000,
        categories: ["residential"],
      },
      {
        id: "i3",
        name: "顧問費 Consultant fee",
        mode: "percent",
        value: 8,
        categories: "all",
      },
    ],
    ocSubsidy: 0,
    roundingStep: 1,
    instalments: 4,
    firstDue: "2026-11-01",
    shareBasis: "undivided",
    buildingName: "示例大廈 Example Court",
    ocName: "示例大廈業主立案法團",
    resolutionDate: "2026-09-15",
    resolutionRef: "EGM-2026-03",
    payNotes: "請存入法團指定戶口，並註明單位編號。Cheque payable to the OC; quote the unit number.",
  };
}

export function summaryToCsv(result, model, lang) {
  const zh = lang !== "en";
  const basis =
    model.shareBasis === "management"
      ? zh
        ? "管理份數"
        : "Management shares"
      : zh
        ? "業權份數"
        : "Undivided shares";
  const headers = [
    zh ? "單位" : "Unit",
    zh ? "業主" : "Owner",
    zh ? "類別" : "Category",
    basis,
    zh ? "佔比%" : "% of shares",
  ];
  (result.items || []).forEach((item) => {
    headers.push(item.name || (zh ? "項目" : "Item"));
  });
  headers.push(
    zh ? "項目小計" : "Items subtotal",
    zh ? "扣減" : "Deduction",
    zh ? "應付" : "Payable",
    zh ? "每期" : "Per instalment",
  );
  const lines = [headers.map(escapeCsvCell).join(",")];
  const catLabel = {
    residential: zh ? "住宅" : "Residential",
    shop: zh ? "商舖" : "Shop",
    carpark: zh ? "車位" : "Car park",
    other: zh ? "其他" : "Other",
  };
  (result.rows || []).forEach((row) => {
    const cells = [
      row.label,
      row.owner,
      catLabel[row.category] || row.category,
      formatMoneyPlain(row.shares, 0.1).replace(/\.0$/, ""),
      row.pct.toFixed(4),
    ];
    (result.items || []).forEach((item) => {
      cells.push(formatMoneyPlain(row.itemShares[item.id] || 0, result.step));
    });
    const per =
      row.instalments && row.instalments.length
        ? row.instalments[0]
        : row.payable;
    cells.push(
      formatMoneyPlain(row.itemsTotal, result.step),
      formatMoneyPlain(row.deduction, result.step),
      formatMoneyPlain(row.payable, result.step),
      formatMoneyPlain(per, result.step),
    );
    lines.push(cells.map(escapeCsvCell).join(","));
  });
  if (result.ok) {
    const totalCells = [
      zh ? "合計" : "Total",
      "",
      "",
      formatMoneyPlain(result.totals.totalShares, 0.1).replace(/\.0$/, ""),
      "100",
    ];
    (result.items || []).forEach((item) => {
      totalCells.push(formatMoneyPlain(item.steppedTotal, result.step));
    });
    totalCells.push(
      formatMoneyPlain(result.totals.itemsColumnSum, result.step),
      formatMoneyPlain(result.totals.deductions, result.step),
      formatMoneyPlain(result.totals.payable, result.step),
      "",
    );
    lines.push(totalCells.map(escapeCsvCell).join(","));
  }
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}

export function summaryToText(result, model, lang) {
  const zh = lang !== "en";
  if (!result.ok) {
    return zh ? "未能計算：請先修正單位或項目錯誤。" : "Cannot compute: fix unit or item errors first.";
  }
  const lines = [];
  const title = model.buildingName || (zh ? "大廈維修費分攤" : "Repair levy apportionment");
  lines.push(title);
  if (model.ocName) lines.push(model.ocName);
  if (model.resolutionRef || model.resolutionDate) {
    lines.push(
      (zh ? "決議 " : "Resolution ") +
        [model.resolutionDate, model.resolutionRef].filter(Boolean).join(" "),
    );
  }
  lines.push("");
  result.rows.forEach((row) => {
    const owner = row.owner ? " " + row.owner : "";
    lines.push(
      row.label +
        owner +
        "  " +
        (zh ? "應付 " : "Payable ") +
        "HK$" +
        formatMoneyPlain(row.payable, result.step),
    );
  });
  lines.push("");
  lines.push(
    (zh ? "各戶應付合計 " : "Total payable ") +
      "HK$" +
      formatMoneyPlain(result.totals.payable, result.step),
  );
  lines.push(
    (zh ? "待分攤淨額 " : "Net to apportion ") +
      "HK$" +
      formatMoneyPlain(result.totals.itemsColumnSum, result.step),
  );
  return lines.join("\n");
}
