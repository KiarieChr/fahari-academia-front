import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Download, FileText, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { feesService } from '../../../../services/feesService';

const fmtKES = (v) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_STYLE = {
    PAID:           { bg: '#ecfdf5', color: '#059669', label: 'Paid' },
    PARTIALLY_PAID: { bg: '#fffbeb', color: '#d97706', label: 'Partial' },
    SENT:           { bg: 'var(--primary-light)', color: 'var(--primary-color)', label: 'Sent' },
    OVERDUE:        { bg: '#fef2f2', color: '#dc2626', label: 'Overdue' },
    DRAFT:          { bg: 'var(--bg-light)', color: 'var(--text-secondary)', label: 'Draft' },
};

const StatusBadge = ({ status }) => {
    const s = STATUS_STYLE[status] || { bg: 'var(--bg-light)', color: 'var(--text-secondary)', label: status };
    return (
        <span style={{ background: s.bg, color: s.color, fontSize: '0.7rem', fontWeight: 700, borderRadius: 999, padding: '2px 9px' }}>
            {s.label}
        </span>
    );
};

const InvoiceRow = ({ invoice }) => {
    const [open, setOpen] = useState(false);
    const hasPayments = invoice.payments && invoice.payments.length > 0;

    return (
        <>
            <tr
                onClick={() => setOpen(p => !p)}
                style={{ cursor: hasPayments ? 'pointer' : 'default', background: open ? 'var(--bg-light)' : 'var(--card-bg)', transition: 'background var(--transition-fast)' }}
                onMouseEnter={e => !open && (e.currentTarget.style.background = 'var(--bg-light)')}
                onMouseLeave={e => !open && (e.currentTarget.style.background = 'var(--card-bg)')}
            >
                <td style={{ padding: '10px 12px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                    {invoice.invoice_number}
                </td>
                <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {invoice.term} {invoice.academic_year}
                </td>
                <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {fmtDate(invoice.date_issued)}
                </td>
                <td style={{ padding: '10px 12px', fontSize: '0.8rem', textAlign: 'right', color: 'var(--text-main)', fontWeight: 600 }}>
                    {fmtKES(invoice.total_amount)}
                </td>
                <td style={{ padding: '10px 12px', fontSize: '0.8rem', textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                    {fmtKES(invoice.paid_amount)}
                </td>
                <td style={{ padding: '10px 12px', fontSize: '0.8rem', textAlign: 'right', color: invoice.balance > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                    {fmtKES(invoice.balance)}
                </td>
                <td style={{ padding: '10px 12px' }}>
                    <StatusBadge status={invoice.status} />
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center', width: 28 }}>
                    {hasPayments && (open
                        ? <ChevronUp size={14} color="var(--text-muted)" />
                        : <ChevronDown size={14} color="var(--text-muted)" />
                    )}
                </td>
            </tr>
            {open && hasPayments && (
                <tr>
                    <td colSpan={8} style={{ padding: '0 12px 10px 32px', background: 'var(--bg-light)', borderBottom: '1px solid var(--border-color-light)' }}>
                        <div style={{ fontSize: '0.71rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                            Payment History
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-light)' }}>
                                    {['Receipt #', 'Date', 'Payer', 'Method', 'Amount'].map(h => (
                                        <th key={h} style={{ padding: '5px 8px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.payments.map((p, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid var(--border-color-light)' }}>
                                        <td style={{ padding: '5px 8px', fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600 }}>{p.receipt_number}</td>
                                        <td style={{ padding: '5px 8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{fmtDate(p.date)}</td>
                                        <td style={{ padding: '5px 8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.payer_name || '—'}</td>
                                        <td style={{ padding: '5px 8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.payment_method}</td>
                                        <td style={{ padding: '5px 8px', fontSize: '0.75rem', color: '#059669', fontWeight: 700, textAlign: 'right' }}>{fmtKES(p.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </td>
                </tr>
            )}
        </>
    );
};

const StudentStatementDrawer = ({ studentId, studentName, onClose }) => {
    const [statement, setStatement] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentId) return;
        setLoading(true);
        feesService.getStudentStatement(studentId)
            .then(setStatement)
            .catch(() => toast.error('Failed to load statement'))
            .finally(() => setLoading(false));
    }, [studentId]);

    const handleDownloadPDF = () => {
        if (!statement) return;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.setTextColor(30);
        doc.text('STUDENT FEE STATEMENT', 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Student: ${statement.student.name}`, 14, 30);
        doc.text(`Adm No: ${statement.student.admission_number}`, 14, 36);
        doc.text(`Grade: ${statement.student.grade}`, 14, 42);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 48);

        const rows = statement.invoices.map(inv => [
            inv.invoice_number,
            `${inv.term} ${inv.academic_year}`,
            fmtDate(inv.date_issued),
            `KES ${inv.total_amount.toLocaleString()}`,
            `KES ${inv.paid_amount.toLocaleString()}`,
            `KES ${inv.balance.toLocaleString()}`,
            STATUS_STYLE[inv.status]?.label || inv.status,
        ]);

        autoTable(doc, {
            head: [['Invoice #', 'Term', 'Date Issued', 'Billed', 'Paid', 'Balance', 'Status']],
            body: rows,
            startY: 56,
            theme: 'grid',
            // Use brand primary color (Ocean Blue default)
            headStyles: { fillColor: [63, 81, 181] },
            columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Billed: KES ${statement.summary.total_billed.toLocaleString()}`, 14, finalY);
        doc.text(`Total Paid:   KES ${statement.summary.total_paid.toLocaleString()}`, 14, finalY + 6);
        if (statement.summary.prepayment_credit > 0) {
            doc.text(`Prepayment Credit: KES ${statement.summary.prepayment_credit.toLocaleString()}`, 14, finalY + 12);
        }
        doc.setTextColor(180, 0, 0);
        doc.text(`Net Balance: KES ${statement.summary.net_balance.toLocaleString()}`, 14, finalY + 18);
        doc.save(`Statement_${statement.student.admission_number}.pdf`);
    };

    return (
        <>
            <style>{`
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                .stmt-drawer { position:fixed; top:0; right:0; height:100vh; width:820px; max-width:96vw; background:var(--card-bg); z-index:1050; box-shadow:-4px 0 32px rgba(0,0,0,0.18); display:flex; flex-direction:column; overflow-y:auto; animation:slideInRight 0.25s ease; }
                .stmt-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:1040; backdrop-filter:blur(2px); }
                .stmt-header { padding:1.1rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:space-between; background:var(--primary-color); color:#fff; position:sticky; top:0; z-index:2; }
                .stmt-header-btn { background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); color:#fff; border-radius:var(--border-radius-sm); padding:6px 12px; cursor:pointer; display:flex; align-items:center; gap:5px; font-size:0.8rem; transition:background var(--transition-fast); }
                .stmt-header-btn:hover { background:rgba(255,255,255,0.25); }
                .stmt-kpi { background:var(--bg-light); border-radius:var(--border-radius-sm); padding:0.85rem 1rem; }
                .stmt-table-wrap { background:var(--card-bg); border-radius:var(--border-radius); border:1px solid var(--border-color-light); overflow:hidden; }
                .stmt-th { padding:9px 12px; font-size:0.72rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.04em; background:var(--bg-light); }
                .stmt-spinner { width:36px; height:36px; border:3px solid var(--border-color-light); border-top-color:var(--primary-color); border-radius:50%; animation:spin 0.7s linear infinite; }
            `}</style>

            <div className="stmt-overlay" onClick={onClose} />
            <div className="stmt-drawer">
                {/* Header */}
                <div className="stmt-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileText size={20} />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Fee Statement</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>{studentName}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="stmt-header-btn" onClick={() => window.print()} title="Print">
                            <Printer size={14} /> Print
                        </button>
                        <button className="stmt-header-btn" onClick={handleDownloadPDF} title="Download PDF">
                            <Download size={14} /> PDF
                        </button>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 6, padding: 4 }}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                            <div className="stmt-spinner" />
                        </div>
                    ) : !statement ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: 60 }}>No statement data found.</div>
                    ) : (
                        <>
                            {/* KPI Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                                {[
                                    { label: 'Total Billed', value: fmtKES(statement.summary.total_billed), icon: FileText, color: 'var(--primary-color)' },
                                    { label: 'Total Paid', value: fmtKES(statement.summary.total_paid), icon: CheckCircle2, color: '#059669' },
                                    { label: 'Net Balance', value: fmtKES(statement.summary.net_balance), icon: AlertTriangle, color: statement.summary.net_balance > 0 ? '#dc2626' : '#059669' },
                                ].map(({ label, value, icon: Icon, color }) => (
                                    <div key={label} className="stmt-kpi" style={{ borderLeft: `3px solid ${color}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                            <Icon size={13} color={color} />
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                                        </div>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color }}>{value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Prepayment credit */}
                            {statement.summary.prepayment_credit > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 'var(--border-radius-sm)', padding: '0.75rem 1rem', marginBottom: 16 }}>
                                    <Wallet size={16} color="#059669" />
                                    <span style={{ fontSize: '0.83rem', color: '#065f46', fontWeight: 600 }}>
                                        Prepayment Credit on Account: {fmtKES(statement.summary.prepayment_credit)}
                                        <span style={{ fontWeight: 400, marginLeft: 6 }}>— will be applied to next invoice</span>
                                    </span>
                                </div>
                            )}

                            {/* Invoice table */}
                            <div className="stmt-table-wrap">
                                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <FileText size={15} color="var(--primary-color)" />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                        Invoice History ({statement.invoices.length})
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 4 }}>Click a row to expand payment details</span>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                {['Invoice #', 'Term', 'Date Issued', 'Billed', 'Paid', 'Balance', 'Status', ''].map((h, i) => (
                                                    <th key={i} className="stmt-th" style={{ textAlign: ['Billed', 'Paid', 'Balance'].includes(h) ? 'right' : 'left' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statement.invoices.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                        No invoices found for this student.
                                                    </td>
                                                </tr>
                                            ) : (
                                                statement.invoices.map(inv => <InvoiceRow key={inv.id} invoice={inv} />)
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Prepayments table */}
                            {statement.prepayments?.length > 0 && (
                                <div style={{ marginTop: 16, background: 'var(--card-bg)', borderRadius: 'var(--border-radius)', border: '1px solid #6ee7b7', overflow: 'hidden' }}>
                                    <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', borderBottom: '1px solid #6ee7b7', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Wallet size={15} color="#059669" />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46' }}>Unallocated Credits / Prepayments</span>
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--bg-light)' }}>
                                                {['Receipt #', 'Date', 'Original Amount', 'Remaining Credit'].map(h => (
                                                    <th key={h} className="stmt-th" style={{ textAlign: ['Original Amount', 'Remaining Credit'].includes(h) ? 'right' : 'left' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statement.prepayments.map((p, i) => (
                                                <tr key={i} style={{ borderTop: '1px solid var(--border-color-light)' }}>
                                                    <td style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600 }}>{p.receipt_number}</td>
                                                    <td style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{fmtDate(p.date)}</td>
                                                    <td style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'right', color: 'var(--text-main)', fontWeight: 600 }}>{fmtKES(p.original_amount)}</td>
                                                    <td style={{ padding: '8px 12px', fontSize: '0.8rem', textAlign: 'right', color: '#059669', fontWeight: 700 }}>{fmtKES(p.remaining_balance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default StudentStatementDrawer;
