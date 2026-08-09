import React, { useState } from 'react';
import { FileBarChart, Download, User, Search, Loader2, FileText, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { feesService } from '../../../../services/feesService';
import StudentStatementDrawer from './StudentStatementDrawer';

const fmtKES = (v) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ────────────────────────────────────────────────────────────
// Shared styles injected once
// ────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .rpt-spinner { width:18px; height:18px; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }
  .rpt-card { background:var(--card-bg); border-radius:var(--border-radius); border:1px solid var(--border-color-light); box-shadow:var(--shadow-sm); overflow:hidden; }
  .rpt-card-header { padding:1rem 1.25rem; border-bottom:1px solid rgba(255,255,255,0.12); display:flex; align-items:center; gap:8px; color:#fff; }
  .rpt-label { display:block; font-size:0.72rem; font-weight:700; color:var(--text-secondary); margin-bottom:4px; text-transform:uppercase; letter-spacing:0.05em; }
  .rpt-select { width:100%; padding:8px 10px; border-radius:var(--border-radius-sm); border:1px solid var(--border-color-light); font-size:0.82rem; outline:none; background:var(--input-bg); color:var(--text-main); transition:border-color var(--transition-fast); }
  .rpt-select:focus { border-color:var(--primary-color); box-shadow:0 0 0 3px rgba(63,81,181,0.08); }
  .rpt-btn-outline { flex:1; padding:10px 16px; border-radius:var(--border-radius-sm); border:1.5px solid var(--primary-color); background:var(--card-bg); color:var(--primary-color); font-weight:700; font-size:0.83rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; transition:background var(--transition-fast); }
  .rpt-btn-outline:hover:not(:disabled) { background:var(--primary-light); }
  .rpt-btn-outline:disabled { opacity:0.6; cursor:not-allowed; }
  .rpt-btn-primary { flex:1; padding:10px 16px; border-radius:var(--border-radius-sm); border:none; background:var(--primary-color); color:#fff; font-weight:700; font-size:0.83rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; box-shadow:0 2px 8px rgba(63,81,181,0.25); transition:background var(--transition-fast), opacity var(--transition-fast); }
  .rpt-btn-primary:hover:not(:disabled) { background:var(--primary-dark); }
  .rpt-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
  .rpt-btn-sky { padding:10px 18px; border-radius:var(--border-radius-sm); border:1.5px solid var(--primary-color); background:var(--card-bg); color:var(--primary-color); font-weight:700; font-size:0.83rem; cursor:pointer; display:flex; align-items:center; gap:6px; transition:background var(--transition-fast); }
  .rpt-btn-sky:hover { background:var(--primary-light); }
  .rpt-search { width:100%; padding:9px 12px 9px 32px; border-radius:var(--border-radius-sm); border:1px solid var(--border-color-light); font-size:0.83rem; outline:none; background:var(--input-bg); color:var(--text-main); box-sizing:border-box; transition:border-color var(--transition-fast); }
  .rpt-search:focus { border-color:var(--primary-color); box-shadow:0 0 0 3px rgba(63,81,181,0.08); }
  .rpt-suggestion { padding:9px 14px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:background var(--transition-fast); color:var(--text-main); background:var(--card-bg); }
  .rpt-suggestion:hover { background:var(--bg-light); }
  .rpt-kpi-card { background:var(--bg-light); border-radius:var(--border-radius-sm); padding:0.65rem 0.85rem; }
  .rpt-th { padding:8px 10px; font-size:0.7rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; background:var(--bg-light); }
  .rpt-td-primary { padding:8px 10px; font-size:0.78rem; color:var(--primary-color); font-weight:600; }
  .rpt-td { padding:8px 10px; font-size:0.78rem; color:var(--text-secondary); }
`;

// ────────────────────────────────────────────────────────────
// Section A: Bulk Report
// ────────────────────────────────────────────────────────────
const BulkReportSection = ({ filterOptions, filter }) => {
    const [bulkFilter, setBulkFilter] = useState({ year: filter.year || 'All', term: filter.term || 'All', grade: 'All' });
    const [loading, setLoading] = useState(false);

    const exportCSV = (rows) => {
        const header = ['Adm No', 'Name', 'Grade', 'Term', 'Total Billed (KES)', 'Paid (KES)', 'Balance (KES)', 'Status'];
        const csvRows = [header, ...rows.map(s => [s.admNo, s.name, s.class, s.term, s.payable, s.paid, s.balance, s.status])];
        const blob = new Blob([csvRows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `Arrears_${bulkFilter.grade}_${bulkFilter.year}.csv` });
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const exportPDF = (rows) => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(14); doc.text('Student Arrears Report', 14, 18);
        doc.setFontSize(9); doc.setTextColor(120);
        doc.text(`Grade: ${bulkFilter.grade}   Term: ${bulkFilter.term}   Year: ${bulkFilter.year}   Generated: ${new Date().toLocaleString()}`, 14, 25);
        autoTable(doc, {
            head: [['Adm No', 'Name', 'Grade', 'Term', 'Billed', 'Paid', 'Balance', 'Status']],
            body: rows.map(s => [s.admNo, s.name, s.class, s.term, fmtKES(s.payable), fmtKES(s.paid), fmtKES(s.balance), s.status]),
            startY: 30, theme: 'grid',
            headStyles: { fillColor: [63, 81, 181] },      // brand primary
            columnStyles: { 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } },
            styles: { fontSize: 8 },
        });
        const y = doc.lastAutoTable.finalY + 8;
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(180, 0, 0);
        doc.text(`Total Outstanding: ${fmtKES(rows.reduce((s, r) => s + r.balance, 0))}`, 14, y);
        doc.save(`Arrears_${bulkFilter.grade !== 'All' ? bulkFilter.grade + '_' : ''}${bulkFilter.year}.pdf`);
    };

    const handleExport = async (format) => {
        setLoading(true);
        try {
            const rows = await feesService.getAllStudentsInArrears({ year: bulkFilter.year, term: bulkFilter.term, class: bulkFilter.grade });
            if (!rows.length) { toast.info('No students with arrears found for the selected filters.'); return; }
            format === 'csv' ? exportCSV(rows) : exportPDF(rows);
            toast.success(`Report exported as ${format.toUpperCase()} — ${rows.length} students`);
        } catch { toast.error('Failed to generate report. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="rpt-card">
            <div className="rpt-card-header" style={{ background: 'var(--primary-color)' }}>
                <FileBarChart size={17} />
                <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Bulk Arrears Report</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Export class-level or school-wide arrears to CSV or PDF</div>
                </div>
            </div>
            <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    {[
                        { label: 'Academic Year', key: 'year', opts: [{ id: 'All', name: 'All Years' }, ...(filterOptions.academicYears || [])] },
                        { label: 'Term',           key: 'term', opts: [{ id: 'All', name: 'All Terms' }, ...(filterOptions.terms    || [])] },
                        { label: 'Grade / Class',  key: 'grade',opts: [{ id: 'All', name: 'All Classes' }, ...(filterOptions.grades  || [])] },
                    ].map(({ label, key, opts }) => (
                        <div key={key} style={{ flex: 1, minWidth: 140 }}>
                            <label className="rpt-label">{label}</label>
                            <select
                                className="rpt-select"
                                value={bulkFilter[key]}
                                onChange={e => setBulkFilter(p => ({ ...p, [key]: e.target.value }))}
                            >
                                {opts.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="rpt-btn-outline" onClick={() => handleExport('csv')} disabled={loading}>
                        {loading ? <span className="rpt-spinner" style={{ borderTopColor: 'var(--primary-color)', borderColor: 'var(--primary-light)' }} /> : <Download size={14} />}
                        Export CSV
                    </button>
                    <button className="rpt-btn-primary" onClick={() => handleExport('pdf')} disabled={loading}>
                        {loading ? <span className="rpt-spinner" /> : <Download size={14} />}
                        Export PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

// ────────────────────────────────────────────────────────────
// Section B: Individual Statement
// ────────────────────────────────────────────────────────────
const StudentStatementSection = ({ students }) => {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [statementStudent, setStatementStudent] = useState(null);
    const [statementData, setStatementData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const results = search.length > 1
        ? (students || []).filter(s =>
            s.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.admNo?.toLowerCase().includes(search.toLowerCase())
          ).slice(0, 8)
        : [];

    const handleSelect = (student) => { setSelected(student); setSearch(student.name); setStatementData(null); };

    const handleLoad = async () => {
        if (!selected) return;
        setLoading(true);
        try {
            const data = await feesService.getStudentStatement(selected.id);
            setStatementData(data);
            setStatementStudent(selected);
        } catch { toast.error('Failed to load student statement.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="rpt-card" style={{ marginTop: 20 }}>
            <div className="rpt-card-header" style={{ background: 'var(--primary-dark)' }}>
                <User size={17} />
                <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Individual Student Statement</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Search a student and generate a complete fee statement</div>
                </div>
            </div>
            <div style={{ padding: '1.25rem' }}>
                {/* Search */}
                <div style={{ position: 'relative', marginBottom: 14 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder="Search student by name or admission number…"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setSelected(null); setStatementData(null); }}
                        className="rpt-search"
                    />
                    {results.length > 0 && !selected && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--border-color-light)', borderRadius: 'var(--border-radius-sm)', boxShadow: 'var(--shadow-md)', zIndex: 100, overflow: 'hidden', marginTop: 2 }}>
                            {results.map(s => (
                                <div key={s.id} className="rpt-suggestion" onClick={() => handleSelect(s)}>
                                    <div>
                                        <span style={{ fontSize: '0.83rem', fontWeight: 600 }}>{s.name}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>{s.admNo}</span>
                                    </div>
                                    <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>{s.class}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="rpt-btn-primary" onClick={handleLoad} disabled={!selected || loading} style={{ flex: 1, opacity: (!selected || loading) ? 0.6 : 1, cursor: (!selected || loading) ? 'not-allowed' : 'pointer' }}>
                        {loading ? <span className="rpt-spinner" /> : <FileText size={14} />}
                        {loading ? 'Loading…' : 'Load Statement'}
                    </button>
                    {statementData && (
                        <button className="rpt-btn-sky" onClick={() => setDrawerOpen(true)}>
                            <FileText size={14} /> Full View & PDF
                        </button>
                    )}
                </div>

                {/* Statement preview */}
                {statementData && (
                    <div style={{ marginTop: 20 }}>
                        {/* Student card */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0.85rem 1rem', background: 'var(--bg-light)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color-light)', marginBottom: 14 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                                {statementData.student.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{statementData.student.name}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Adm: {statementData.student.admission_number} · {statementData.student.grade}</div>
                            </div>
                            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Net Balance</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: statementData.summary.net_balance > 0 ? '#dc2626' : '#059669' }}>
                                    {fmtKES(statementData.summary.net_balance)}
                                </div>
                            </div>
                        </div>

                        {/* KPI row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                            {[
                                { label: 'Total Billed',  value: statementData.summary.total_billed,   color: 'var(--primary-color)' },
                                { label: 'Total Paid',    value: statementData.summary.total_paid,     color: '#059669' },
                                { label: 'Outstanding',   value: statementData.summary.total_balance,  color: '#dc2626' },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="rpt-kpi-card" style={{ borderLeft: `3px solid ${color}` }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 3 }}>{label}</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color }}>{fmtKES(value)}</div>
                                </div>
                            ))}
                        </div>

                        {/* Invoice mini-table */}
                        <div style={{ border: '1px solid var(--border-color-light)', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Invoice #', 'Term / Year', 'Billed', 'Paid', 'Balance', 'Payments'].map(h => (
                                            <th key={h} className="rpt-th" style={{ textAlign: ['Billed', 'Paid', 'Balance'].includes(h) ? 'right' : 'left' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {statementData.invoices.map((inv, i) => (
                                        <tr key={inv.id} style={{ borderTop: '1px solid var(--border-color-light)', background: i % 2 === 0 ? 'var(--card-bg)' : 'var(--bg-light)' }}>
                                            <td className="rpt-td-primary">{inv.invoice_number}</td>
                                            <td className="rpt-td">{inv.term} {inv.academic_year}</td>
                                            <td style={{ padding: '8px 10px', fontSize: '0.78rem', textAlign: 'right', color: 'var(--text-main)', fontWeight: 600 }}>{fmtKES(inv.total_amount)}</td>
                                            <td style={{ padding: '8px 10px', fontSize: '0.78rem', textAlign: 'right', color: '#059669', fontWeight: 600 }}>{fmtKES(inv.paid_amount)}</td>
                                            <td style={{ padding: '8px 10px', fontSize: '0.78rem', textAlign: 'right', color: inv.balance > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>{fmtKES(inv.balance)}</td>
                                            <td className="rpt-td">{inv.payments?.length ?? 0} receipt{inv.payments?.length !== 1 ? 's' : ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* WhatsApp placeholder */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--border-radius-sm)' }}>
                            <MessageSquare size={16} color="#16a34a" />
                            <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>WhatsApp Reminder</span>
                            <span style={{ fontSize: '0.78rem', color: '#166534' }}>— available once WhatsApp Business API is integrated.</span>
                        </div>
                    </div>
                )}
            </div>

            {drawerOpen && statementStudent && (
                <StudentStatementDrawer
                    studentId={statementStudent.id}
                    studentName={statementStudent.name}
                    onClose={() => setDrawerOpen(false)}
                />
            )}
        </div>
    );
};

// ────────────────────────────────────────────────────────────
// Main ReportsTab
// ────────────────────────────────────────────────────────────
const ReportsTab = ({ filterOptions, filter, students }) => (
    <>
        <style>{STYLES}</style>
        <BulkReportSection filterOptions={filterOptions} filter={filter} />
        <StudentStatementSection students={students} />
    </>
);

export default ReportsTab;
