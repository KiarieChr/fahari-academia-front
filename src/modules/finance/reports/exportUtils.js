/**
 * Finance Report Export Utility
 * Supports: PDF (print), Excel (CSV/XLSX via data-uri), RTF
 *
 * Usage:
 *   exportReport({ title, headers, rows, format: 'pdf'|'excel'|'rtf', filename? })
 *
 * rows: array of arrays (matching headers order)
 * or pass { tableId } to export an existing HTML table by DOM id.
 */

const fmtCurrency = (v) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

/** Export via browser print dialog — renders a styled HTML document */
export function exportToPDF({ title, subtitle = '', headers, rows, filename = 'report' }) {
    const tableRows = rows
        .map(
            (row) =>
                `<tr>${row
                    .map((cell, i) => {
                        const isNum = typeof cell === 'number';
                        return `<td style="text-align:${isNum ? 'right' : 'left'};padding:5px 8px;border-bottom:1px solid #e2e8f0">${isNum ? fmtCurrency(cell) : (cell ?? '')}</td>`;
                    })
                    .join('')}</tr>`
        )
        .join('');

    const headerRow = headers
        .map((h) => `<th style="text-align:left;padding:6px 8px;background:#1e40af;color:white;font-size:11px">${h}</th>`)
        .join('');

    const html = `<!DOCTYPE html><html><head>
        <meta charset="UTF-8"><title>${title}</title>
        <style>
            body{font-family:Arial,sans-serif;font-size:12px;color:#1e293b;margin:20px}
            h1{font-size:18px;margin-bottom:2px;color:#1e40af}
            p.sub{font-size:11px;color:#64748b;margin-top:0}
            table{width:100%;border-collapse:collapse;margin-top:16px}
            th{white-space:nowrap}
            tr:nth-child(even){background:#f8fafc}
            tfoot td{font-weight:bold;background:#f1f5f9;border-top:2px solid #1e40af}
            @media print{@page{margin:15mm}}
        </style>
    </head><body>
        <h1>${title}</h1>
        <p class="sub">${subtitle} &nbsp;|&nbsp; Printed: ${new Date().toLocaleString('en-KE')}</p>
        <table>
            <thead><tr>${headerRow}</tr></thead>
            <tbody>${tableRows}</tbody>
        </table>
    </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
}

/** Export to CSV (opens as Excel) */
export function exportToExcel({ title, headers, rows, filename = 'report' }) {
    const escape = (v) => {
        const s = String(v ?? '').replace(/"/g, '""');
        return /[,"\n]/.test(s) ? `"${s}"` : s;
    };

    const lines = [
        `"${title}"`,
        '',
        headers.map(escape).join(','),
        ...rows.map((row) => row.map(escape).join(',')),
    ];

    const csv = lines.join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

/** Export to RTF */
export function exportToRTF({ title, headers, rows, filename = 'report' }) {
    const rtfEscape = (s) =>
        String(s ?? '')
            .replace(/\\/g, '\\\\')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/[^\x00-\x7F]/g, (c) => `\\u${c.charCodeAt(0)}?`);

    const colCount = headers.length;
    const colWidth = Math.floor(9000 / colCount);

    const cellDef = Array(colCount).fill(`\\cellx${colWidth}`).map((c, i) => `\\cellx${(i + 1) * colWidth}`).join('');

    const headerRow = `{\\trowd\\trgaph108\\trleft0 ${cellDef}\\intbl ${headers.map((h) => `{\\b ${rtfEscape(h)}}\\cell`).join(' ')}\\row}`;

    const dataRows = rows
        .map(
            (row) =>
                `{\\trowd\\trgaph108\\trleft0 ${cellDef}\\intbl ${row.map((c) => `${rtfEscape(c)}\\cell`).join(' ')}\\row}`
        )
        .join('\n');

    const rtf = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Arial;}}
{\\colortbl ;\\red30\\green64\\blue175;}
\\f0\\fs20
{\\b\\fs28\\cf1 ${rtfEscape(title)}}\\par
{\\fs18 Generated: ${new Date().toLocaleString('en-KE')}}\\par\\par
${headerRow}
${dataRows}
}`;

    const blob = new Blob([rtf], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.rtf`;
    a.click();
    URL.revokeObjectURL(url);
}

/** Unified export dispatcher */
export function exportReport({ format, ...opts }) {
    switch (format) {
        case 'pdf':
            return exportToPDF(opts);
        case 'excel':
        case 'csv':
            return exportToExcel(opts);
        case 'rtf':
            return exportToRTF(opts);
        default:
            exportToPDF(opts);
    }
}
