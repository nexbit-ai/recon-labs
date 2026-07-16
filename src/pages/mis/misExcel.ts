// CFO-ready Excel export engine for the AI-Powered MIS page (Tata 1mg demo).
// Frontend-only: every workbook is generated in-browser from misData, so an
// exported figure always matches what's on screen and in the chat. No backend.
//
// One private buildWorkbook(meta, tables) produces the shared branded format
// (Tata 1mg header block + audit footer) for all 5 reports, so they look
// identical. Download is triggered by writing xlsx.writeBuffer() to a Blob and
// clicking a temporary object-URL anchor — no file-saver dependency.
import ExcelJS from 'exceljs';
import { misData } from './misData';

export type AnswerReportId = 'net-revenue' | 'losing-channel' | 'kill-skus' | 'disputes' | 'ebitda';

// ── Number formats ───────────────────────────────────────────────────────────
// Indian lakh/crore accounting format. Values stay REAL NUMBERS; negatives show
// red in parentheses. (Backslash-escaped commas force Indian digit grouping.)
const MONEY_FMT = '[>=10000000]"₹"#\\,##\\,##\\,##0;[>=100000]"₹"#\\,##\\,##0;"₹"#,##0;[Red]("₹"#,##0)';
// Percent stored as points (e.g. 82.0), displayed "82.0%"; negatives red in parens.
const PCT_FMT = '0.0"%";[Red](0.0"%")';

// ── Palette (ARGB) — mirrors the on-screen tokens ────────────────────────────
const INK = 'FF111111';
const GREY700 = 'FF6B7280';
const MUTED = 'FF9CA3AF';
const HAIRLINE = { style: 'thin', color: { argb: 'FFE5E7EB' } } as ExcelJS.Border;
const INK_BORDER = { style: 'thin', color: { argb: INK } } as ExcelJS.Border;
const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } } as ExcelJS.Fill;

// ── Table model ──────────────────────────────────────────────────────────────
type ColKind = 'text' | 'money' | 'pct';
interface Column {
  header: string;
  kind: ColKind;
  width: number;
}
interface Row {
  cells: (string | number)[];
  /** Subtotal-style emphasis: bold + top border, matching the on-screen P&L. */
  emphasize?: boolean;
}
interface Table {
  title?: string;
  columns: Column[];
  rows: Row[];
}
interface Meta {
  title: string;
  filename: string;
}

const isBlank = (v: string | number) => v === '' || v == null;

// ── Shared branded workbook builder used by ALL 5 reports ─────────────────────
async function buildWorkbook(meta: Meta, tables: Table[]): Promise<void> {
  const { period, reconciliation: r } = misData;
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const auditLine =
    `Source: reconciled ledger · ${period} · ${r.totalTransactions.toLocaleString('en-IN')} transactions · ` +
    `${r.reconciledMatchedPct}% reconciled · ${r.inDisputePct}% in dispute`;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Nexbit — AI-Powered MIS';
  wb.created = new Date();
  const ws = wb.addWorksheet('Report', { views: [{ state: 'frozen', ySplit: 3 }] });

  const span = Math.max(3, ...tables.map((t) => t.columns.length));

  // Header block (rows 1–3), merged across the table span.
  ws.mergeCells(1, 1, 1, span);
  Object.assign(ws.getCell(1, 1), { value: 'Tata 1mg' });
  ws.getCell(1, 1).font = { bold: true, size: 16, color: { argb: INK } };
  ws.getRow(1).height = 22;

  ws.mergeCells(2, 1, 2, span);
  ws.getCell(2, 1).value = meta.title;
  ws.getCell(2, 1).font = { bold: true, size: 12, color: { argb: INK } };

  ws.mergeCells(3, 1, 3, span);
  ws.getCell(3, 1).value = `Period: ${period}   ·   Generated: ${today}   ·   Prepared via Nexbit — AI-Powered MIS`;
  ws.getCell(3, 1).font = { size: 9, italic: true, color: { argb: MUTED } };

  // Column widths = max needed per index across all tables.
  const widths: number[] = [];
  tables.forEach((t) => t.columns.forEach((c, i) => (widths[i] = Math.max(widths[i] || 0, c.width))));
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));

  let rowIdx = 4; // row 4 stays blank under the header block

  for (const table of tables) {
    rowIdx += 1;
    if (table.title) {
      ws.mergeCells(rowIdx, 1, rowIdx, span);
      ws.getCell(rowIdx, 1).value = table.title;
      ws.getCell(rowIdx, 1).font = { bold: true, size: 10, color: { argb: GREY700 } };
      rowIdx += 1;
    }

    // Header row: bold, subtle fill, bottom border.
    table.columns.forEach((col, i) => {
      const cell = ws.getCell(rowIdx, i + 1);
      cell.value = col.header;
      cell.font = { bold: true, size: 10, color: { argb: GREY700 } };
      cell.fill = HEADER_FILL;
      cell.border = { bottom: HAIRLINE };
      cell.alignment = { horizontal: col.kind === 'text' ? 'left' : 'right', vertical: 'middle' };
    });
    rowIdx += 1;

    // Body rows.
    for (const row of table.rows) {
      table.columns.forEach((col, i) => {
        const cell = ws.getCell(rowIdx, i + 1);
        const val = row.cells[i];
        cell.alignment = { horizontal: col.kind === 'text' ? 'left' : 'right', vertical: 'middle' };
        cell.font = { size: 10, bold: !!row.emphasize, color: { argb: INK } };
        if (row.emphasize) cell.border = { top: INK_BORDER };
        if (isBlank(val)) {
          cell.value = null;
        } else {
          cell.value = val;
          if (col.kind === 'money') cell.numFmt = MONEY_FMT;
          else if (col.kind === 'pct') cell.numFmt = PCT_FMT;
        }
      });
      rowIdx += 1;
    }

    rowIdx += 1; // blank spacer between tables
  }

  // Audit footer (appears on every report).
  ws.mergeCells(rowIdx, 1, rowIdx, span);
  ws.getCell(rowIdx, 1).value = auditLine;
  ws.getCell(rowIdx, 1).font = { size: 9, italic: true, color: { argb: MUTED } };

  // Write → Blob → temporary anchor download (no file-saver).
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf as unknown as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = meta.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Report definitions (content only, all from misData) ──────────────────────
const line = (k: string) =>
  misData.pnl.find((l) => l.key === k) ?? { key: k, label: k, amount: 0, pctOfGmv: 0, kind: 'flow' as const };

// Compact filename token from the period, e.g. "June 2026" → "Jun2026".
const periodToken = (() => {
  const [mon = '', yr = ''] = misData.period.split(' ');
  return `${mon.slice(0, 3)}${yr}`;
})();
const fileName = (report: string) => `Nexbit_${report}_${periodToken}.xlsx`;

const HEALTH_LABEL: Record<string, string> = {
  best: 'Best',
  strong: 'Strong',
  healthy: 'Healthy',
  thin: 'Thin',
  negative: 'Loss-making',
  loss: 'Loss-making',
};

function buildReport(id: AnswerReportId): { meta: Meta; tables: Table[] } {
  const { period, pnl, channels, skus } = misData;

  switch (id) {
    case 'net-revenue': {
      const keys = ['gmv', 'discounts', 'returnsRto', 'netRevenue'];
      return {
        meta: { title: `Net Revenue — ${period}`, filename: fileName('NetRevenue') },
        tables: [
          {
            columns: [
              { header: 'Line', kind: 'text', width: 34 },
              { header: 'Amount (₹)', kind: 'money', width: 18 },
              { header: '% of GMV', kind: 'pct', width: 14 },
            ],
            rows: keys.map((k) => {
              const l = line(k);
              return { cells: [l.label, l.amount, l.pctOfGmv], emphasize: k === 'netRevenue' };
            }),
          },
        ],
      };
    }

    case 'losing-channel': {
      const sorted = [...channels].sort((a, b) => b.cm1Pct - a.cm1Pct);
      return {
        meta: { title: `Channel Profitability — ${period}`, filename: fileName('ChannelProfitability') },
        tables: [
          {
            columns: [
              { header: 'Channel', kind: 'text', width: 22 },
              { header: 'GMV (₹)', kind: 'money', width: 18 },
              { header: 'CM1 %', kind: 'pct', width: 12 },
              { header: 'Status', kind: 'text', width: 16 },
            ],
            rows: sorted.map((c) => ({
              cells: [c.channel, c.gmv, c.cm1Pct, c.cm1Pct < 0 ? 'Loss-making' : HEALTH_LABEL[c.health] ?? '—'],
            })),
          },
        ],
      };
    }

    case 'kill-skus': {
      const killed = skus.filter((s) => s.isKillList).sort((a, b) => a.marginPct - b.marginPct);
      const winners = skus.filter((s) => !s.isKillList).sort((a, b) => b.marginPct - a.marginPct);
      const cols: Column[] = [
        { header: 'SKU', kind: 'text', width: 34 },
        { header: 'Channel', kind: 'text', width: 16 },
        { header: 'Margin %', kind: 'pct', width: 12 },
      ];
      const tables: Table[] = [
        {
          title: 'Below cost — kill list',
          columns: cols,
          rows: killed.map((s) => ({ cells: [s.sku, s.channel, s.marginPct] })),
        },
      ];
      if (winners.length) {
        tables.push({
          title: 'Top performers',
          columns: cols,
          rows: winners.map((s) => ({ cells: [s.sku, s.channel, s.marginPct] })),
        });
      }
      return { meta: { title: `SKUs Below Cost — ${period}`, filename: fileName('SKUsBelowCost') }, tables };
    }

    case 'disputes': {
      const r = misData.reconciliation;
      return {
        meta: { title: `Reconciliation & Disputes — ${period}`, filename: fileName('Reconciliation') },
        tables: [
          {
            columns: [
              { header: 'Metric', kind: 'text', width: 26 },
              { header: '%', kind: 'pct', width: 10 },
              { header: 'Amount (₹)', kind: 'money', width: 18 },
              { header: 'Detail', kind: 'text', width: 22 },
            ],
            rows: [
              { cells: ['Matched', r.reconciledMatchedPct, '', ''] },
              {
                cells: ['In dispute', r.inDisputePct, r.inDisputeAmount, `${r.inDisputeExceptions.toLocaleString('en-IN')} exceptions`],
              },
              { cells: ['Pending settlement', r.pendingSettlementPct, r.pendingSettlementAmount, ''] },
              { cells: ['Recovered this month', '', r.recoveredThisMonth, 'disputes filed & won'] },
            ],
          },
        ],
      };
    }

    case 'ebitda': {
      return {
        meta: { title: `P&L Waterfall — ${period}`, filename: fileName('PnL') },
        tables: [
          {
            columns: [
              { header: 'Line', kind: 'text', width: 40 },
              { header: 'Amount (₹)', kind: 'money', width: 18 },
              { header: '% of GMV', kind: 'pct', width: 14 },
            ],
            rows: pnl.map((l) => ({ cells: [l.label, l.amount, l.pctOfGmv], emphasize: l.kind === 'subtotal' })),
          },
        ],
      };
    }
  }
}

/** Build and download the CFO-ready workbook for a given answer id. */
export async function downloadAnswerReport(answerId: AnswerReportId): Promise<void> {
  const { meta, tables } = buildReport(answerId);
  await buildWorkbook(meta, tables);
}
