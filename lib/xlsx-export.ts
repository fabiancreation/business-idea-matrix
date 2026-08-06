// Builds the .xlsx export. Kept out of the UI component so the heavy ExcelJS
// dependency stays behind a dynamic import and the sheet layout can be tested
// on its own.
//
// The point of this export is that it stays *live*: weights and ratings are
// written as plain numbers, while totals, the maximum and the recommendation
// are real formulas referencing them. Editing a weight in Excel or Google
// Sheets recalculates everything downstream.

import type { Workbook } from "exceljs";

export type XlsxIdea = { name: string; desc: string; ratings: number[] };

export type XlsxLabels = {
  sheetName: string;
  title: string;
  subtitle: string;
  date: string;
  idea: string;
  criterion: string;
  weight: string;
  description: string;
  total: string;
  maxScore: string;
  recommendation: string;
  go: string;
  goMicro: string;
  park: string;
  hint: string;
};

export type XlsxInput = {
  ideas: XlsxIdea[];
  weights: number[];
  criteria: string[];
  labels: XlsxLabels;
  locale: string;
};

// Sheet layout. Rows 1-3 are the title block, 4 is a spacer.
const HEADER_ROW = 5;
const DESC_ROW = 6;
const FIRST_CRIT_ROW = 7;

// The verdict thresholds mirror the app: they are fractions of the maximum
// achievable score, so they follow along when weights change in the sheet.
const GO_FRACTION = 40 / 52.5;
const MICRO_FRACTION = 32 / 52.5;

const BRAND = "FFE8572A";
const INK = "FF1A1A2E";
const HEADER_FILL = "FF1A1A2E";
const WEIGHT_FILL = "FFFDEFE7";
const TOTAL_FILL = "FFF4F4F8";

function fill(color: string) {
  return { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: color } };
}

function quote(text: string) {
  return `"${text.replace(/"/g, '""')}"`;
}

export function scoreFor(ratings: number[], weights: number[]) {
  return ratings.reduce((sum, r, i) => sum + r * (weights[i] ?? 0), 0);
}

export function verdictLabel(score: number, weights: number[], labels: XlsxLabels) {
  const max = weights.reduce((s, w) => s + w * 5, 0);
  if (score >= max * GO_FRACTION) return labels.go;
  if (score >= max * MICRO_FRACTION) return labels.goMicro;
  return labels.park;
}

export async function buildWorkbook({ ideas, weights, criteria, labels, locale }: XlsxInput): Promise<Workbook> {
  const mod = await import("exceljs");
  // exceljs ships as CommonJS, so the namespace can arrive on `default`.
  const ExcelJS = (mod as unknown as { default?: typeof mod }).default ?? mod;

  const wb = new ExcelJS.Workbook();
  wb.creator = labels.title;
  wb.created = new Date();

  const ws = wb.addWorksheet(labels.sheetName, {
    views: [{ state: "frozen", xSplit: 2, ySplit: HEADER_ROW }],
  });

  const lastCritRow = FIRST_CRIT_ROW + criteria.length - 1;
  const totalRow = lastCritRow + 2;
  const maxRow = totalRow + 1;
  const verdictRow = totalRow + 2;
  const hintRow = verdictRow + 2;

  const cols = ideas.map((idea, i) => ({
    label: idea.name || `${labels.idea} ${i + 1}`,
    desc: idea.desc,
    ratings: idea.ratings,
    score: scoreFor(idea.ratings, weights),
    // Column 1 is the criterion, column 2 the weight, so ideas start at 3.
    letter: ws.getColumn(i + 3).letter,
  }));
  const maxScore = weights.reduce((s, w) => s + w * 5, 0);
  const weightRange = `$B$${FIRST_CRIT_ROW}:$B$${lastCritRow}`;

  // ─── Title block ───────────────────────────────────────────────────────────
  const titleCell = ws.getCell("A1");
  titleCell.value = labels.title;
  titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: BRAND } };

  const subtitleCell = ws.getCell("A2");
  subtitleCell.value = labels.subtitle;
  subtitleCell.font = { size: 10, bold: true, color: { argb: "FF8A8A99" } };

  const dateCell = ws.getCell("A3");
  dateCell.value = `${labels.date}: ${new Date().toLocaleDateString(locale)}`;
  dateCell.font = { size: 9, color: { argb: "FFAAAAAA" } };

  // ─── Header + description ──────────────────────────────────────────────────
  const headerCells = [labels.criterion, labels.weight, ...cols.map((c) => c.label)];
  headerCells.forEach((text, i) => {
    const cell = ws.getRow(HEADER_ROW).getCell(i + 1);
    cell.value = text;
    cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = fill(HEADER_FILL);
    cell.alignment = { vertical: "middle", horizontal: i < 2 ? "left" : "center", wrapText: true };
  });

  const descRow = ws.getRow(DESC_ROW);
  descRow.getCell(1).value = labels.description;
  descRow.getCell(1).font = { italic: true, size: 9, color: { argb: "FF8A8A99" } };
  cols.forEach((c, i) => {
    const cell = descRow.getCell(i + 3);
    cell.value = c.desc;
    cell.font = { italic: true, size: 9, color: { argb: "FF8A8A99" } };
    cell.alignment = { horizontal: "center", wrapText: true };
  });

  // ─── Criteria: weights and ratings stay editable ───────────────────────────
  criteria.forEach((name, ci) => {
    const row = ws.getRow(FIRST_CRIT_ROW + ci);

    const critCell = row.getCell(1);
    critCell.value = name;
    critCell.font = { size: 10 };
    critCell.alignment = { wrapText: true, vertical: "middle" };

    const weightCell = row.getCell(2);
    weightCell.value = weights[ci];
    weightCell.numFmt = "0.0";
    weightCell.fill = fill(WEIGHT_FILL);
    weightCell.font = { size: 10, bold: true, color: { argb: BRAND } };
    weightCell.alignment = { horizontal: "center" };
    weightCell.dataValidation = {
      type: "decimal", operator: "between", formulae: [0, 3],
      allowBlank: false, showErrorMessage: true,
      errorTitle: labels.weight, error: "0 – 3",
    };

    cols.forEach((c, i) => {
      const cell = row.getCell(i + 3);
      cell.value = c.ratings[ci] ?? 0;
      cell.alignment = { horizontal: "center" };
      cell.font = { size: 10 };
      cell.dataValidation = {
        type: "whole", operator: "between", formulae: [0, 5],
        allowBlank: true, showErrorMessage: true,
        errorTitle: labels.criterion, error: "0 – 5",
      };
    });
  });

  // ─── Live formulas ─────────────────────────────────────────────────────────
  const totalCell = ws.getRow(totalRow).getCell(1);
  totalCell.value = labels.total;
  totalCell.font = { bold: true, size: 11 };
  ws.getRow(totalRow).getCell(2).fill = fill(TOTAL_FILL);

  const maxCell = ws.getRow(maxRow).getCell(1);
  maxCell.value = labels.maxScore;
  maxCell.font = { size: 9, color: { argb: "FF8A8A99" } };

  const verdictCell = ws.getRow(verdictRow).getCell(1);
  verdictCell.value = labels.recommendation;
  verdictCell.font = { bold: true, size: 11 };

  cols.forEach((c, i) => {
    const col = i + 3;

    const total = ws.getRow(totalRow).getCell(col);
    total.value = { formula: `SUMPRODUCT(${weightRange},${c.letter}${FIRST_CRIT_ROW}:${c.letter}${lastCritRow})`, result: c.score };
    total.numFmt = "0.0";
    total.font = { bold: true, size: 12, color: { argb: INK } };
    total.alignment = { horizontal: "center" };
    total.fill = fill(TOTAL_FILL);
    total.border = { top: { style: "medium", color: { argb: INK } } };

    const max = ws.getRow(maxRow).getCell(col);
    max.value = { formula: `SUM(${weightRange})*5`, result: maxScore };
    max.numFmt = "0.0";
    max.font = { size: 9, color: { argb: "FF8A8A99" } };
    max.alignment = { horizontal: "center" };

    const verdict = ws.getRow(verdictRow).getCell(col);
    const ref = `${c.letter}${totalRow}`;
    const maxRef = `${c.letter}${maxRow}`;
    verdict.value = {
      formula:
        `IF(${ref}>=${maxRef}*${GO_FRACTION},${quote(labels.go)},` +
        `IF(${ref}>=${maxRef}*${MICRO_FRACTION},${quote(labels.goMicro)},${quote(labels.park)}))`,
      result: verdictLabel(c.score, weights, labels),
    };
    verdict.font = { bold: true, size: 10 };
    verdict.alignment = { horizontal: "center", wrapText: true };
  });

  const hintCell = ws.getRow(hintRow).getCell(1);
  hintCell.value = labels.hint;
  hintCell.font = { size: 9, italic: true, color: { argb: "FF8A8A99" } };

  // ─── Column widths ─────────────────────────────────────────────────────────
  ws.getColumn(1).width = 34;
  ws.getColumn(2).width = 10;
  cols.forEach((_, i) => { ws.getColumn(i + 3).width = 18; });
  ws.getRow(HEADER_ROW).height = 30;
  ws.getRow(DESC_ROW).height = 26;

  return wb;
}
