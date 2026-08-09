import React, { useState, useEffect } from 'react';
import { Container, Form } from 'react-bootstrap';
import { LayoutDashboard, Users, FileBarChart, Bell, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import KPISection from './components/KPISection';
import ArrearsCharts from './components/ArrearsCharts';
import AgingBands from './components/AgingBands';
import StudentRecordsTab from './components/StudentRecordsTab';
import ReportsTab from './components/ReportsTab';
import { feesService } from '../../../services/feesService';

const TABS = [
    { id: 'overview', label: 'Overview',             icon: LayoutDashboard },
    { id: 'students', label: 'Student Records',      icon: Users },
    { id: 'reports',  label: 'Reports & Statements', icon: FileBarChart },
];

const DASHBOARD_STYLES = `
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Tab bar ── */
  .arrears-tab-bar { display:flex; gap:4px; background:var(--bg-light); border-radius:var(--border-radius); padding:5px; margin-bottom:1.25rem; border:1px solid var(--border-color-light); }
  .arrears-tab-btn { flex:1; padding:9px 16px; border-radius:var(--border-radius-sm); border:none; background:transparent; color:var(--text-secondary); font-weight:500; font-size:0.84rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; transition:all var(--transition-fast); }
  .arrears-tab-btn:hover:not(.active) { background:var(--card-bg); color:var(--text-main); }
  .arrears-tab-btn.active { background:var(--card-bg); color:var(--primary-color); font-weight:700; box-shadow:var(--shadow-sm); }

  /* ── Collection rate bar ── */
  .collection-bar-wrap { background:var(--card-bg); border-radius:var(--border-radius); padding:0.85rem 1.25rem; margin-bottom:1.25rem; border:1px solid var(--border-color-light); display:flex; align-items:center; gap:14px; box-shadow:var(--shadow-sm); }
  .collection-bar-track { flex:1; height:10px; border-radius:999px; background:var(--bg-light); overflow:hidden; }
  .collection-bar-fill  { height:100%; border-radius:999px; transition:width 0.7s ease; }

  /* ── Header selects ── */
  .arrears-select { padding:7px 10px; border-radius:var(--border-radius-sm); border:1px solid var(--border-color-light); font-size:0.83rem; background:var(--input-bg); color:var(--text-main); outline:none; transition:border-color var(--transition-fast); }
  .arrears-select:focus { border-color:var(--primary-color); }

  /* ── Refresh button ── */
  .arrears-refresh-btn { padding:7px 12px; border-radius:var(--border-radius-sm); border:1px solid var(--border-color-light); background:var(--card-bg); cursor:pointer; display:flex; align-items:center; gap:5px; color:var(--text-secondary); font-size:0.83rem; transition:all var(--transition-fast); }
  .arrears-refresh-btn:hover { border-color:var(--primary-color); color:var(--primary-color); background:var(--bg-light); }

  /* ── Remind/export button ── */
  .arrears-action-btn { padding:7px 14px; border-radius:var(--border-radius-sm); border:1.5px solid var(--primary-color); background:var(--card-bg); cursor:pointer; display:flex; align-items:center; gap:6px; color:var(--primary-color); font-weight:700; font-size:0.83rem; transition:background var(--transition-fast); }
  .arrears-action-btn:hover { background:var(--primary-light); }

  /* ── Chart panels ── */
  .arrears-chart-panel { background:var(--card-bg); border-radius:var(--border-radius); padding:1rem 1.25rem; border:1px solid var(--border-color-light); box-shadow:var(--shadow-sm); }

  /* ── Error box ── */
  .arrears-error { margin-top:16px; padding:0.85rem 1rem; background:#fef2f2; border:1px solid #fca5a5; border-radius:var(--border-radius-sm); color:#dc2626; font-size:0.83rem; }
  .dark-mode .arrears-error { background:rgba(220,38,38,0.12); border-color:rgba(239,68,68,0.3); }
`;

const ArrearsDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [filter, setFilter] = useState({ year: 'All', term: 'All', class: 'All', intake: 'All' });
    const [data, setData] = useState({ kpis: {}, arrearsByClass: [], arrearsByIntake: [] });
    const [students, setStudents] = useState([]);
    const [ageing, setAgeing] = useState([]);
    const [searchQuery] = useState('');
    const [filterOptions, setFilterOptions] = useState({ academicYears: [], terms: [], grades: [], intakes: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load filter options once
    useEffect(() => {
        (async () => {
            try {
                const options = await feesService.getFilterOptions();
                setFilterOptions({
                    academicYears: options.academic_years || [],
                    terms:         options.terms          || [],
                    grades:        options.grades         || [],
                    intakes:       options.intakes        || [],
                });
                if (options.academic_years?.length) {
                    const cur = new Date().getFullYear().toString();
                    const matched = options.academic_years.find(y => y.name?.includes(cur));
                    setFilter(f => ({ ...f, year: (matched || options.academic_years[0]).name }));
                }
                if (options.terms?.length) {
                    setFilter(f => ({ ...f, term: options.terms[0].name }));
                }
            } catch (err) { console.error('Filter options error:', err); }
        })();
    }, []);

    // Cascade terms on year change
    useEffect(() => {
        if (!filter.year || filter.year === 'All') return;
        (async () => {
            try {
                const opts = await feesService.getFilterOptions(filter.year);
                setFilterOptions(p => ({ ...p, terms: opts.terms || [] }));
                setFilter(f => ({ ...f, term: opts.terms?.length ? opts.terms[0].name : 'All' }));
            } catch { /* ignore */ }
        })();
    }, [filter.year]);

    // Main data fetch
    useEffect(() => {
        const ctrl = new AbortController();
        (async () => {
            try {
                setLoading(true); setError(null);
                const [summary, stud, age] = await Promise.all([
                    feesService.getArrearsSummary(filter),
                    feesService.getStudentsInArrears(filter, searchQuery),
                    feesService.getAgeingAnalysis(filter),
                ]);
                setData(summary);
                setStudents(stud.results || []);
                setAgeing(age);
            } catch (err) {
                if (err.name !== 'AbortError') setError(err.message || 'Failed to load arrears data');
            } finally { setLoading(false); }
        })();
        return () => ctrl.abort();
    }, [filter, searchQuery]);

    // Collection rate
    const totalOutstanding = data.kpis?.totalArrears || 0;
    const totalBilled      = totalOutstanding + (data.kpis?.totalPaid || 0);
    const collectionRate   = totalBilled > 0 ? Math.round(((totalBilled - totalOutstanding) / totalBilled) * 100) : 0;
    const barColor = collectionRate >= 80
        ? 'linear-gradient(90deg,#10b981,#059669)'
        : collectionRate >= 50
            ? 'linear-gradient(90deg,#f59e0b,#d97706)'
            : 'linear-gradient(90deg,#f97316,#dc2626)';
    const rateColor = collectionRate >= 80 ? '#059669' : collectionRate >= 50 ? '#d97706' : '#dc2626';

    return (
        <DashboardLayout title="Student Arrears Dashboard">
            <style>{DASHBOARD_STYLES}</style>
            <Container fluid className="p-4">

                {/* ── Page Header ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: 800, color: 'var(--text-main)', fontSize: '1.45rem' }}>Student Arrears Dashboard</h2>
                        <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Track outstanding fees, analyse debt ageing, and generate student statements
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <select className="arrears-select" value={filter.year} onChange={e => setFilter(f => ({ ...f, year: e.target.value }))}>
                            <option value="All">All Years</option>
                            {filterOptions.academicYears.map(y => <option key={y.id} value={y.name}>{y.name}</option>)}
                        </select>
                        <select className="arrears-select" value={filter.term} onChange={e => setFilter(f => ({ ...f, term: e.target.value }))} disabled={!filterOptions.terms.length && filter.year !== 'All'}>
                            <option value="All">All Terms</option>
                            {filterOptions.terms.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                        </select>
                        <button className="arrears-refresh-btn" onClick={() => setFilter(f => ({ ...f }))} title="Refresh">
                            <RefreshCw size={15} />
                        </button>
                        <button className="arrears-action-btn" onClick={() => setActiveTab('reports')}>
                            <Bell size={15} /> Remind / Export
                        </button>
                    </div>
                </div>

                {/* ── KPI Section (always visible) ── */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <KPISection data={data.kpis} />
                </div>

                {/* ── Collection Rate Bar ── */}
                <div className="collection-bar-wrap">
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        Collection Rate
                    </span>
                    <div className="collection-bar-track">
                        <div className="collection-bar-fill" style={{ background: barColor, width: `${collectionRate}%` }} />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: rateColor, minWidth: 42, textAlign: 'right' }}>
                        {collectionRate}%
                    </span>
                </div>

                {/* ── Tab Navigation ── */}
                <div className="arrears-tab-bar">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            className={`arrears-tab-btn${activeTab === id ? ' active' : ''}`}
                            onClick={() => setActiveTab(id)}
                        >
                            <Icon size={15} /> {label}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ── */}
                {activeTab === 'overview' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div className="arrears-chart-panel">
                                <h6 style={{ margin: '0 0 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Arrears Distribution by Class</h6>
                                <ArrearsCharts type="distribution" data={data.arrearsByClass} />
                            </div>
                            <div className="arrears-chart-panel">
                                <h6 style={{ margin: '0 0 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Arrears by Intake</h6>
                                <ArrearsCharts type="intake" data={data.arrearsByIntake} />
                            </div>
                        </div>
                        <AgingBands data={ageing} />
                    </div>
                )}

                {activeTab === 'students' && (
                    <StudentRecordsTab
                        students={students}
                        filterOptions={filterOptions}
                        filter={filter}
                        onFilterChange={setFilter}
                        loading={loading}
                    />
                )}

                {activeTab === 'reports' && (
                    <ReportsTab filterOptions={filterOptions} filter={filter} students={students} />
                )}

                {error && <div className="arrears-error">⚠️ {error}</div>}
            </Container>
        </DashboardLayout>
    );
};

export default ArrearsDashboard;
