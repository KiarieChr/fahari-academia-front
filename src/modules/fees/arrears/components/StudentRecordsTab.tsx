import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronUp, ChevronDown, Eye, MessageSquare, FileText, MoreVertical } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import StudentStatementDrawer from './StudentStatementDrawer';

const fmtKES = (v) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

// Severity uses semantic colours only (not brand primary), so they stay fixed
const SEVERITY = (balance) => {
    if (balance <= 0)     return { label: 'Cleared',  bg: '#ecfdf5', color: '#059669' };
    if (balance < 10000)  return { label: 'Low',      bg: '#eff6ff', color: '#2563eb' };
    if (balance < 50000)  return { label: 'Medium',   bg: '#fffbeb', color: '#d97706' };
    return                       { label: 'Critical', bg: '#fef2f2', color: '#dc2626' };
};

const SortIcon = ({ field, sortConfig }) => {
    if (sortConfig.key !== field) return <ArrowUpDown size={12} color="var(--text-muted)" />;
    return sortConfig.dir === 'asc'
        ? <ChevronUp size={13} color="var(--primary-color)" />
        : <ChevronDown size={13} color="var(--primary-color)" />;
};

const StudentRecordsTab = ({ students, filterOptions, filter, onFilterChange, loading }) => {
    const [search, setSearch] = useState('');
    const [gradeFilter, setGradeFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'balance', dir: 'desc' });
    const [drawerStudent, setDrawerStudent] = useState(null);

    const handleSort = (key) => {
        setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
    };

    const filtered = useMemo(() => {
        let list = [...(students || [])];
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(s => s.name?.toLowerCase().includes(q) || s.admNo?.toLowerCase().includes(q));
        }
        if (gradeFilter) list = list.filter(s => s.class === gradeFilter);
        list.sort((a, b) => {
            const va = a[sortConfig.key] ?? 0;
            const vb = b[sortConfig.key] ?? 0;
            const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
            return sortConfig.dir === 'asc' ? cmp : -cmp;
        });
        return list;
    }, [students, search, gradeFilter, sortConfig]);

    const uniqueGrades = useMemo(() =>
        [...new Set((students || []).map(s => s.class).filter(Boolean))].sort()
    , [students]);

    const selectStyle = {
        padding: '7px 10px',
        borderRadius: 'var(--border-radius-sm)',
        border: '1px solid var(--border-color-light)',
        fontSize: '0.82rem',
        background: 'var(--input-bg)',
        color: 'var(--text-main)',
        outline: 'none',
    };

    const Th = ({ label, field, right }) => (
        <th
            onClick={field ? () => handleSort(field) : undefined}
            style={{
                padding: '10px 12px',
                fontSize: '0.71rem', fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                cursor: field ? 'pointer' : 'default',
                textAlign: right ? 'right' : 'left',
                userSelect: 'none', whiteSpace: 'nowrap',
                background: 'var(--bg-light)',
                borderBottom: '1px solid var(--border-color-light)',
            }}
        >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {label} {field && <SortIcon field={field} sortConfig={sortConfig} />}
            </span>
        </th>
    );

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .records-spinner { width:28px; height:28px; border:3px solid var(--border-color-light); border-top-color:var(--primary-color); border-radius:50%; animation:spin 0.7s linear infinite; }
                .records-search-wrap { position:relative; flex:1; min-width:200px; }
                .records-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--text-muted); pointer-events:none; }
                .records-search-input { width:100%; padding:8px 12px 8px 32px; border-radius:var(--border-radius-sm); border:1px solid var(--border-color-light); font-size:0.82rem; outline:none; background:var(--input-bg); color:var(--text-main); box-sizing:border-box; transition:border-color var(--transition-fast); }
                .records-search-input:focus { border-color:var(--primary-color); box-shadow:0 0 0 3px rgba(63,81,181,0.08); }
                .records-row:hover td { background:var(--bg-light) !important; }
            `}</style>

            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <div className="records-search-wrap">
                    <Search size={14} className="records-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name or adm number…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="records-search-input"
                    />
                </div>
                <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)} style={selectStyle}>
                    <option value="">All Grades</option>
                    {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select value={filter.year} onChange={e => onFilterChange({ ...filter, year: e.target.value })} style={selectStyle}>
                    <option value="All">All Years</option>
                    {(filterOptions.academicYears || []).map(y => <option key={y.id} value={y.name}>{y.name}</option>)}
                </select>
                <select value={filter.term} onChange={e => onFilterChange({ ...filter, term: e.target.value })} style={selectStyle}>
                    <option value="All">All Terms</option>
                    {(filterOptions.terms || []).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
                <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color-light)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <Th label="Adm No"           field="admNo"   />
                                <Th label="Student Name"     field="name"    />
                                <Th label="Grade"            field="class"   />
                                <Th label="Term"             field="term"    />
                                <Th label="Total Billed"     field="payable" right />
                                <Th label="Paid"             field="paid"    right />
                                <Th label="Balance"          field="balance" right />
                                <Th label="Days Since Inv."  />
                                <Th label="Severity"         />
                                <Th label="Actions"          />
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={10} style={{ textAlign: 'center', padding: '3rem' }}>
                                        <div className="records-spinner" style={{ margin: '0 auto' }} />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        No students match the current filters.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((student, idx) => {
                                    const sev = SEVERITY(student.balance);
                                    const daysOverdue = student.days_overdue ?? '—';
                                    return (
                                        <tr
                                            key={student.id}
                                            className="records-row"
                                            style={{ borderTop: '1px solid var(--border-color-light)' }}
                                        >
                                            <td style={{ padding: '10px 12px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)' }}>{student.admNo}</td>
                                            <td style={{ padding: '10px 12px', fontSize: '0.83rem', color: 'var(--text-main)', fontWeight: 600 }}>{student.name}</td>
                                            <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{student.class}</td>
                                            <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{student.term}</td>
                                            <td style={{ padding: '10px 12px', fontSize: '0.8rem', textAlign: 'right', color: 'var(--text-main)', fontWeight: 600 }}>{fmtKES(student.payable)}</td>
                                            <td style={{ padding: '10px 12px', fontSize: '0.8rem', textAlign: 'right', color: '#059669', fontWeight: 600 }}>{fmtKES(student.paid)}</td>
                                            <td style={{ padding: '10px 12px', fontSize: '0.8rem', textAlign: 'right', color: student.balance > 0 ? '#dc2626' : '#059669', fontWeight: 800 }}>
                                                {fmtKES(student.balance)}
                                            </td>
                                            <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {daysOverdue === '—' ? '—' : `${daysOverdue}d`}
                                            </td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <span style={{ background: sev.bg, color: sev.color, fontSize: '0.7rem', fontWeight: 700, borderRadius: 999, padding: '2px 9px' }}>
                                                    {sev.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <Dropdown align="end">
                                                    <Dropdown.Toggle variant="light" size="sm" className="border-0 bg-transparent p-1">
                                                        <MoreVertical size={15} color="var(--text-muted)" />
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item onClick={() => setDrawerStudent(student)}>
                                                            <Eye size={14} className="me-2 text-muted" /> View Statement
                                                        </Dropdown.Item>
                                                        <Dropdown.Item href="#" onClick={e => { e.preventDefault(); alert('WhatsApp reminder — coming soon with WhatsApp Business API integration.'); }}>
                                                            <MessageSquare size={14} className="me-2 text-success" /> Send WhatsApp Reminder
                                                        </Dropdown.Item>
                                                        <Dropdown.Item onClick={() => setDrawerStudent(student)}>
                                                            <FileText size={14} className="me-2 text-primary" /> Generate Statement PDF
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {filtered.length > 0 && (
                    <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-color-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Showing {filtered.length} of {students?.length ?? 0} students with arrears
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Total outstanding: <strong style={{ color: '#dc2626' }}>{fmtKES(filtered.reduce((s, x) => s + (x.balance || 0), 0))}</strong>
                        </span>
                    </div>
                )}
            </div>

            {drawerStudent && (
                <StudentStatementDrawer
                    studentId={drawerStudent.id}
                    studentName={drawerStudent.name}
                    onClose={() => setDrawerStudent(null)}
                />
            )}
        </>
    );
};

export default StudentRecordsTab;
