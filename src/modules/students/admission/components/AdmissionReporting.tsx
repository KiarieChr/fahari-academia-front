import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Users, CheckCircle, Search, User, BookOpen, AlertCircle, Calendar, Eye, X,
  ChevronLeft, ChevronRight, Sparkles, TrendingUp
} from 'lucide-react';
import { api } from '../../../../services/api';
import Swal from 'sweetalert2';
import Modal from '../../../../components/common/Modal';
import { Input, Select, FormField, inputClass } from '../../../../components/ui/FormField';


const AdmissionReporting = () => {
  const [subTab, setSubTab] = useState('report_back');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingStudent, setReportingStudent] = useState(null);
  const [detailStudent, setDetailStudent] = useState(null);

  // Recent Reports Data (Live)
  const [recentReports, setRecentReports] = useState([]);

  // Unreported students
  const [unreported, setUnreported] = useState([]);
  const [unreportedMeta, setUnreportedMeta] = useState({});
  const [loadingUnreported, setLoadingUnreported] = useState(false);

  useEffect(() => {
    if (subTab === 'report_back') {
      fetchRecentEnrollments();
      fetchUnreported();
    }
  }, [subTab]);

  const fetchRecentEnrollments = async () => {
    try {
      const res = await api.get('/api/settings/enrollments/?is_active=true&limit=100');
      setRecentReports(Array.isArray(res) ? res : (res.results || []));
    } catch (error) {
      console.error("Failed to fetch reports", error);
    }
  };

  const fetchUnreported = async () => {
    setLoadingUnreported(true);
    try {
      const res = await api.get('/api/settings/enrollments/unreported/');
      setUnreported(res.unreported || []);
      setUnreportedMeta({
        currentTerm: res.current_term,
        currentYear: res.current_year,
        previousTerm: res.previous_term,
        total: res.total
      });
    } catch (error) {
      console.error("Failed to fetch unreported", error);
    } finally {
      setLoadingUnreported(false);
    }
  };

  const handleQuickReport = (student) => {
    setReportingStudent(student);
    setShowReportModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex space-x-1 p-1 rounded-xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
        <button
          onClick={() => setSubTab('report_back')}
          style={subTab === 'report_back' ? {
            background: 'var(--card-bg)',
            color: 'var(--primary-color)',
            borderColor: 'var(--border-color-light)'
          } : {
            color: 'var(--text-secondary)'
          }}
          className={`py-2 px-4 rounded-lg font-bold text-sm transition-all cursor-pointer ${subTab === 'report_back' ? 'shadow-sm border' : ''}`}
        >
          Report Back to School
        </button>
        <button
          onClick={() => setSubTab('discipline')}
          style={subTab === 'discipline' ? {
            background: 'var(--card-bg)',
            color: 'var(--primary-color)',
            borderColor: 'var(--border-color-light)'
          } : {
            color: 'var(--text-secondary)'
          }}
          className={`py-2 px-4 rounded-lg font-bold text-sm transition-all cursor-pointer ${subTab === 'discipline' ? 'shadow-sm border' : ''}`}
        >
          Discipline & Incidents
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {subTab === 'report_back' ? (
          <ReportBackView
            reports={recentReports}
            unreported={unreported}
            unreportedMeta={unreportedMeta}
            loadingUnreported={loadingUnreported}
            onOpenModal={() => { setReportingStudent(null); setShowReportModal(true); }}
            onQuickReport={handleQuickReport}
            onSuccess={() => { fetchRecentEnrollments(); fetchUnreported(); }}
            onViewDetail={(student) => setDetailStudent(student)}
          />
        ) : (
          <div style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }} className="p-8 text-center rounded-lg border border-dashed">
            <AlertCircle className="mx-auto h-12 w-12 mb-2" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-medium" style={{ color: 'var(--text-main)' }}>Discipline Module</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Disciplinary reporting features coming soon.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showReportModal && (
        <ReportBackModal
          onClose={() => { setShowReportModal(false); setReportingStudent(null); }}
          onSuccess={() => {
            setShowReportModal(false);
            setReportingStudent(null);
            fetchRecentEnrollments();
            fetchUnreported();
          }}
          preSelectedStudent={reportingStudent}
        />
        
      )}

      {detailStudent && (
        <StudentReportingDetail
          student={detailStudent}
          onClose={() => setDetailStudent(null)}
        />
      )}
    </div>
  );
};

// --- Report Back View ---
const ReportBackView = ({ reports, unreported, unreportedMeta, loadingUnreported, onOpenModal, onQuickReport, onSuccess, onViewDetail }) => {
  // Search filter states
  const [unreportedSearch, setUnreportedSearch] = useState('');
  const [reportedSearch, setReportedSearch] = useState('');

  // Unreported pagination state
  const [unreportedPage, setUnreportedPage] = useState(1);
  const [unreportedLimit, setUnreportedLimit] = useState(5);

  // Reported pagination state
  const [reportedPage, setReportedPage] = useState(1);
  const [reportedLimit, setReportedLimit] = useState(10);

  const handleUnreportedSearchChange = (val) => {
    setUnreportedSearch(val);
    setUnreportedPage(1);
  };

  const handleReportedSearchChange = (val) => {
    setReportedSearch(val);
    setReportedPage(1);
  };

  // Filter lists
  const filteredUnreported = unreported.filter(s => {
    const q = unreportedSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.student_name || '').toLowerCase().includes(q) ||
      (s.admission_number || '').toLowerCase().includes(q) ||
      (s.grade_name || '').toLowerCase().includes(q) ||
      ((s.stream_name || '') + '').toLowerCase().includes(q)
    );
  });

  const filteredReports = reports.filter(r => {
    const q = reportedSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.student_name || '').toLowerCase().includes(q) ||
      (r.admission_number || '').toLowerCase().includes(q) ||
      (r.grade_name || '').toLowerCase().includes(q) ||
      ((r.stream_name || '') + '').toLowerCase().includes(q) ||
      (r.reporting_reason || '').toLowerCase().includes(q) ||
      (r.stay_status || '').toLowerCase().includes(q)
    );
  });

  // Unreported pagination slice
  const totalUnreportedItems = filteredUnreported.length;
  const totalUnreportedPages = Math.ceil(totalUnreportedItems / unreportedLimit) || 1;
  const unreportedIndexOfLast = unreportedPage * unreportedLimit;
  const unreportedIndexOfFirst = unreportedIndexOfLast - unreportedLimit;
  const currentUnreportedItems = filteredUnreported.slice(unreportedIndexOfFirst, unreportedIndexOfLast);

  // Reported pagination slice
  const totalReportedItems = filteredReports.length;
  const totalReportedPages = Math.ceil(totalReportedItems / reportedLimit) || 1;
  const reportedIndexOfLast = reportedPage * reportedLimit;
  const reportedIndexOfFirst = reportedIndexOfLast - reportedLimit;
  const currentReportedItems = filteredReports.slice(reportedIndexOfFirst, reportedIndexOfLast);

  return (
    <div className="space-y-6">
      {/* Executive Header Command Card */}
      <div 
        className="relative overflow-hidden p-6 md:p-8 rounded-[24px] border transition-all duration-300 hover:shadow-lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(99, 102, 241, 0.04) 100%)', 
          borderColor: 'var(--border-color-light)' 
        }}
      >
        {/* Background glowing decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
              <Sparkles size={12} className="text-indigo-600 animate-pulse" />
              <span>Term Operations Command</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
              Student Reopening Check-in
            </h2>
            <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Verify student re-entries, log check-in statuses, review custom stay profiles, and preview live fee structure balances before activating records for the term.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            {/* Quick Stats Badges */}
            <div className="flex items-center gap-3">
              {/* Recently Checked-in badge */}
              <div 
                style={{ 
                  background: 'var(--card-bg)', 
                  borderColor: 'var(--border-color-light)',
                  boxShadow: 'var(--shadow-card)'
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md"
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Reported</div>
                  <div className="text-lg font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
                    {reports.length}
                  </div>
                </div>
              </div>

              {/* Not Yet Reported badge */}
              <div 
                style={{ 
                  background: 'var(--card-bg)', 
                  borderColor: 'rgba(245, 158, 11, 0.2)',
                  boxShadow: 'var(--shadow-card)'
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md"
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending</div>
                  <div className="text-lg font-black tracking-tight text-amber-600 dark:text-amber-400">
                    {unreportedMeta.total || unreported.length || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onOpenModal}
              style={{ background: 'var(--primary-color)' }}
              className="whitespace-nowrap flex-shrink-0 px-6 py-3.5 text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg hover:opacity-95 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle size={18} />
              <span>Report Student Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Unreported Students Section */}
      <div 
        style={{ 
          background: 'var(--card-bg)', 
          borderColor: 'rgba(245, 158, 11, 0.25)', 
          boxShadow: 'var(--shadow-card)' 
        }} 
        className="rounded-[24px] border overflow-hidden transition-all duration-300"
      >
        <div 
          className="px-6 py-5 border-b flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4" 
          style={{ 
            borderColor: 'rgba(245, 158, 11, 0.15)', 
            background: 'linear-gradient(to right, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.01))' 
          }}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-amber-800 dark:text-amber-400 text-base">Not Yet Reported</h3>
              <p className="text-xs text-amber-600/80 dark:text-amber-500/80 font-medium">
                {unreportedMeta.previousTerm
                  ? `Students active in ${unreportedMeta.previousTerm} who have not checked in for ${unreportedMeta.currentTerm} ${unreportedMeta.currentYear}`
                  : "Active students who haven't checked in for the current active term"}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search filter for unreported */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search pending..."
                value={unreportedSearch}
                onChange={(e) => handleUnreportedSearchChange(e.target.value)}
                style={{ 
                  background: 'var(--card-bg)', 
                  borderColor: 'rgba(245, 158, 11, 0.3)', 
                  color: 'var(--text-main)',
                  paddingLeft: '2.25rem',
                  fontSize: '0.75rem'
                }}
                className="w-full sm:w-48 pl-8 pr-3 py-1.5 border rounded-lg focus:ring-1 focus:ring-amber-500 outline-none font-bold"
              />
              {unreportedSearch && (
                <button 
                  onClick={() => handleUnreportedSearchChange('')}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <span className="text-xs font-black text-amber-700 bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 px-3 py-1.5 rounded-full text-center">
              {totalUnreportedItems} / {unreportedMeta.total || 0} Pending
            </span>
          </div>
        </div>

        {loadingUnreported ? (
          <div className="px-6 py-12 text-center" style={{ color: 'var(--text-secondary)' }}>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-600/30 border-t-amber-600 mb-3"></div>
            <p className="text-xs font-black uppercase tracking-wider text-amber-700">Fetching pending list...</p>
          </div>
        ) : filteredUnreported.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3 animate-pulse" />
            <h4 className="text-sm font-extrabold text-green-700 dark:text-green-400">All Clear!</h4>
            <p className="text-xs text-slate-400 mt-1">Every student has checked in for the term.</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                <thead style={{ background: 'var(--bg-light)' }}>
                  <tr>
                    <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Student</th>
                    <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Adm No</th>
                    <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Last Class</th>
                    <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Last Term Info</th>
                    <th className="px-6 py-4.5 text-right text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                  {currentUnreportedItems.map((s) => (
                    <tr key={s.student_id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'rgb(217, 119, 6)' }}
                            className="h-8 w-8 rounded-full flex items-center justify-center font-bold mr-3"
                          >
                            {(s.student_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left font-bold text-sm" style={{ color: 'var(--text-main)' }}>
                            {s.student_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-extrabold" style={{ color: 'var(--text-secondary)' }}>
                        {s.admission_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                        {s.grade_name} {s.stream_name || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                        {s.last_term} {s.last_year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => onQuickReport(s)}
                          style={{ background: 'var(--primary-color)' }}
                          className="px-4 py-2 text-xs font-black text-white rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <CheckCircle size={13} />
                          <span>Report</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Unreported Pagination Controls Footer */}
            <div 
              style={{ borderColor: 'var(--border-color-light)', background: 'var(--bg-light)', color: 'var(--text-secondary)' }}
              className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-wider"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400">Rows per page:</span>
                <select
                  value={unreportedLimit}
                  onChange={(e) => {
                    setUnreportedLimit(Number(e.target.value));
                    setUnreportedPage(1);
                  }}
                  style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                  className="px-3 py-1.5 border rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500 text-xs font-extrabold"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
                <span className="text-[10px] text-slate-400 ml-1">
                  Showing {totalUnreportedItems > 0 ? unreportedIndexOfFirst + 1 : 0} - {Math.min(unreportedIndexOfLast, totalUnreportedItems)} of {totalUnreportedItems} entries
                </span>
              </div>

              {totalUnreportedPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setUnreportedPage(prev => Math.max(prev - 1, 1))}
                    disabled={unreportedPage === 1}
                    style={{ borderColor: 'var(--border-color-light)', background: 'var(--card-bg)' }}
                    className="p-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-45 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  
                  {Array.from({ length: totalUnreportedPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalUnreportedPages || Math.abs(page - unreportedPage) <= 1)
                    .map((page, idx, arr) => {
                      const showEllipsisBefore = page > 2 && arr[idx - 1] !== page - 1;
                      const showEllipsisAfter = page < totalUnreportedPages - 1 && arr[idx + 1] !== page + 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsisBefore && <span className="px-2 text-slate-400 font-bold">...</span>}
                          <button
                            onClick={() => setUnreportedPage(page)}
                            style={{
                              background: unreportedPage === page ? 'var(--primary-color)' : 'var(--card-bg)',
                              borderColor: unreportedPage === page ? 'var(--primary-color)' : 'var(--border-color-light)',
                              color: unreportedPage === page ? '#fff' : 'var(--text-secondary)'
                            }}
                            className="w-8 h-8 rounded-xl border text-xs font-black flex items-center justify-center transition-colors cursor-pointer"
                          >
                            {page}
                          </button>
                          {showEllipsisAfter && <span className="px-2 text-slate-400 font-bold">...</span>}
                        </React.Fragment>
                      );
                    })
                  }

                  <button
                    onClick={() => setUnreportedPage(prev => Math.min(prev + 1, totalUnreportedPages))}
                    disabled={unreportedPage === totalUnreportedPages}
                    style={{ borderColor: 'var(--border-color-light)', background: 'var(--card-bg)' }}
                    className="p-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-45 transition-colors cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recently Reported Students Section */}
      <div 
        style={{ 
          background: 'var(--card-bg)', 
          borderColor: 'var(--border-color-light)', 
          boxShadow: 'var(--shadow-card)' 
        }} 
        className="rounded-[24px] border overflow-hidden transition-all duration-300"
      >
        <div 
          className="px-6 py-5 border-b flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4" 
          style={{ 
            borderColor: 'var(--border-color-light)', 
            background: 'var(--bg-light)' 
          }}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base" style={{ color: 'var(--text-main)' }}>Recently Reported</h3>
              <p className="text-xs text-slate-400 font-medium">History of check-ins processed during the current administrative session.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search filter for reported */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search checked-in..."
                value={reportedSearch}
                onChange={(e) => handleReportedSearchChange(e.target.value)}
                style={{ 
                  background: 'var(--card-bg)', 
                  borderColor: 'var(--border-color-light)', 
                  color: 'var(--text-main)',
                  paddingLeft: '2.25rem',
                  fontSize: '0.75rem'
                }}
                className="w-full sm:w-48 pl-8 pr-3 py-1.5 border rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
              />
              {reportedSearch && (
                <button 
                  onClick={() => handleReportedSearchChange('')}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <span className="text-xs font-black text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 px-3 py-1.5 rounded-full text-center">
              {totalReportedItems} Total Verified
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
            <thead style={{ background: 'var(--bg-light)' }}>
              <tr>
                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Student</th>
                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Class Info</th>
                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Stay Status</th>
                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Check-in Reason</th>
                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Timestamp</th>
                <th className="px-6 py-4.5 text-right text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    No matching check-in records found.
                  </td>
                </tr>
              ) : (
                currentReportedItems.map((r) => (
                  <tr 
                    key={r.id} 
                    className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 cursor-pointer transition-colors" 
                    onDoubleClick={() => onViewDetail(r)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          style={{ background: 'var(--primary-light)', color: 'var(--primary-color)' }}
                          className="h-8 w-8 rounded-full flex items-center justify-center font-bold mr-3"
                        >
                          {(r.student_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-black" style={{ color: 'var(--text-main)' }}>{r.student_name}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.admission_number || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                      {r.grade_name} {r.stream_name || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        r.stay_status === 'boarder'
                          ? 'bg-purple-50 text-purple-600 border border-purple-100'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {r.stay_status === 'boarder' ? 'Boarder' : 'Day Scholar'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                      {r.reporting_reason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-xs font-bold tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {new Date(r.created_at || Date.now()).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewDetail(r); }}
                        style={{ color: 'var(--text-secondary)' }}
                        className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="View reporting history"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Reported Pagination Controls Footer */}
        <div 
          style={{ borderColor: 'var(--border-color-light)', background: 'var(--bg-light)', color: 'var(--text-secondary)' }}
          className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-wider"
        >
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400">Rows per page:</span>
            <select
              value={reportedLimit}
              onChange={(e) => {
                setReportedLimit(Number(e.target.value));
                setReportedPage(1);
              }}
              style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
              className="px-3 py-1.5 border rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500 text-xs font-extrabold"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-[10px] text-slate-400 ml-1">
              Showing {totalReportedItems > 0 ? reportedIndexOfFirst + 1 : 0} - {Math.min(reportedIndexOfLast, totalReportedItems)} of {totalReportedItems} entries
            </span>
          </div>

          {totalReportedPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setReportedPage(prev => Math.max(prev - 1, 1))}
                disabled={reportedPage === 1}
                style={{ borderColor: 'var(--border-color-light)', background: 'var(--card-bg)' }}
                className="p-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-45 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              
              {Array.from({ length: totalReportedPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalReportedPages || Math.abs(page - reportedPage) <= 1)
                .map((page, idx, arr) => {
                  const showEllipsisBefore = page > 2 && arr[idx - 1] !== page - 1;
                  const showEllipsisAfter = page < totalReportedPages - 1 && arr[idx + 1] !== page + 1;
                  
                  return (
                    <React.Fragment key={page}>
                      {showEllipsisBefore && <span className="px-2 text-slate-400 font-bold">...</span>}
                      <button
                        onClick={() => setReportedPage(page)}
                        style={{
                          background: reportedPage === page ? 'var(--primary-color)' : 'var(--card-bg)',
                          borderColor: reportedPage === page ? 'var(--primary-color)' : 'var(--border-color-light)',
                          color: reportedPage === page ? '#fff' : 'var(--text-secondary)'
                        }}
                        className="w-8 h-8 rounded-xl border text-xs font-black flex items-center justify-center transition-colors cursor-pointer"
                      >
                        {page}
                      </button>
                      {showEllipsisAfter && <span className="px-2 text-slate-400 font-bold">...</span>}
                    </React.Fragment>
                  );
                })
              }

              <button
                onClick={() => setReportedPage(prev => Math.min(prev + 1, totalReportedPages))}
                disabled={reportedPage === totalReportedPages}
                style={{ borderColor: 'var(--border-color-light)', background: 'var(--card-bg)' }}
                className="p-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-45 transition-colors cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Student Reporting Detail Modal ---
const StudentReportingDetail = ({ student, onClose }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/settings/enrollments/timeline/?student_id=${student.student || student.student_id}`);
        setTimeline(res.timeline || []);
      } catch (error) {
        console.error('Failed to fetch timeline', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [student]);

  const statusColor = (status) => {
    const map = { active: 'bg-green-100 text-green-800', promoted: 'bg-blue-100 text-blue-800', completed: 'bg-gray-100 text-gray-700', repeated: 'bg-amber-100 text-amber-800' };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Reporting History" size="lg" accentColor="bg-indigo-500"
      footer={<Modal.CancelButton onClick={onClose}>Close</Modal.CancelButton>}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: 'var(--primary-light)', borderColor: 'var(--border-color-light)' }}>
          <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ background: 'var(--primary-color)', opacity: 0.15 }}>
            <User style={{ color: 'var(--primary-color)' }} size={24} />
          </div>
          <div>
            <h3 className="font-bold" style={{ color: 'var(--text-main)' }}>{student.student_name}</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{student.admission_number || ''}</p>
          </div>
          {student.stay_status && (
            <span className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${student.stay_status === 'boarder' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
              {student.stay_status === 'boarder' ? 'Boarder' : 'Day Scholar'}
            </span>
          )}
        </div>

        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Enrollment Sessions</h4>

        {loading ? (
          <div className="py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 mb-2" style={{ borderColor: 'var(--primary-color)' }}></div>
            <p className="text-sm">Loading history...</p>
          </div>
        ) : timeline.length === 0 ? (
          <div className="py-8 text-center" style={{ color: 'var(--text-muted)' }}>
            <Calendar className="mx-auto h-10 w-10 mb-2" />
            <p className="text-sm">No enrollment records found.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ background: 'var(--border-color-light)' }}></div>
            <div className="space-y-4">
              {timeline.map((e, i) => (
                <div key={e.id || i} className="relative pl-10">
                  <div className={`absolute left-2.5 top-2 h-3 w-3 rounded-full border-2 border-white ${e.is_active ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                  <div 
                    style={e.is_active ? { 
                      background: 'var(--primary-light)', 
                      borderColor: 'var(--border-color-light)' 
                    } : { 
                      background: 'var(--card-bg)', 
                      borderColor: 'var(--border-color-light)' 
                    }}
                    className="p-4 rounded-xl border"
                  >
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{e.academic_year}</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{e.term}</span>
                        {e.is_active && <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)' }}>Current</span>}
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor(e.status)}`}>
                        {e.status_display || e.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Grade</span>
                        <p className="font-medium" style={{ color: 'var(--text-main)' }}>{e.grade} {e.stream || ''}</p>
                      </div>
                      <div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Curriculum</span>
                        <p className="font-medium" style={{ color: 'var(--text-main)' }}>{e.curriculum || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Type</span>
                        <p className="font-medium" style={{ color: 'var(--text-main)' }}>{e.type_display || e.enrollment_type || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Stay</span>
                        <p className="font-medium" style={{ color: 'var(--text-main)' }}>{e.stay_status === 'boarder' ? 'Boarder' : e.stay_status === 'day_scholar' ? 'Day Scholar' : '-'}</p>
                      </div>
                    </div>
                    {e.enrollment_date && (
                      <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>Enrolled: {new Date(e.enrollment_date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// --- Report Back Modal ---
const ReportBackModal = ({ onClose, onSuccess, preSelectedStudent }) => {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Form Data
  const [selectedStudent, setSelectedStudent] = useState(() => {
    if (preSelectedStudent) {
      return {
        id: preSelectedStudent.student_id,
        text: preSelectedStudent.student_name,
        admission_number: preSelectedStudent.admission_number,
        current_grade_id: preSelectedStudent.grade_id,
        current_grade_name: preSelectedStudent.grade_name,
        current_stream_id: preSelectedStudent.stream_id,
        current_curriculum: preSelectedStudent.curriculum_id,
      };
    }
    return null;
  });
  const [currentTerm, setCurrentTerm] = useState(null);
  const [billingInfo, setBillingInfo] = useState(null);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [formData, setFormData] = useState({
    stay_status: 'day_scholar',
    reporting_reason: 'Opening Day',
    other_reason: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    // Fetch current active term/year context
    const fetchContext = async () => {
      try {
        const terms = await api.get('/api/settings/terms/?status=active');
        const termList = Array.isArray(terms) ? terms : terms.results || [];

        if (termList.length > 0) {
          // Logic: Find term where today falls within start/end dates
          // Fallback: Pick the term with the latest start_date (most recent)

          const today = new Date();
          let activeTerm = termList.find(t => {
            if (!t.start_date || !t.end_date) return false;
            const start = new Date(t.start_date);
            const end = new Date(t.end_date);
            return today >= start && today <= end;
          });

          if (!activeTerm) {
            // Sort by start_date descending to get the latest one
            termList.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
            activeTerm = termList[0];
          }

          if (activeTerm) setCurrentTerm(activeTerm);
        }
      } catch (e) {
        console.error("Context fetch failed", e);
      }
    };
    fetchContext();
  }, []);

  // Fetch billing context when student is selected
  useEffect(() => {
    if (!selectedStudent) { setBillingInfo(null); return; }
    const fetchBilling = async () => {
      setLoadingBilling(true);
      try {
        const res = await api.get(`/api/fees/billing/context/?student_id=${selectedStudent.id}`);
        setBillingInfo(res);
      } catch {
        setBillingInfo(null);
      } finally {
        setLoadingBilling(false);
      }
    };
    fetchBilling();
  }, [selectedStudent]);

  const handleSearch = async (query) => {
    setSearchTerm(query);
    if (query.length > 2) {
      setLoadingSearch(true);
      try {
        // Using the specific billing search as I know it returns student details including program/class
        const res = await api.get(`/api/fees/billing/search-students/?query=${query}`);
        setSearchResults(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSearch(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !currentTerm) {
      Swal.fire("Error", "Missing Student or Active Term configuration.", "error");
      return;
    }

    setSubmitLoading(true);
    try {
      const reason = formData.reporting_reason === 'Other' ? formData.other_reason : formData.reporting_reason;

      // Payload for Enrollment Creation
      const payload = {
        student: selectedStudent.id,
        academic_year: currentTerm.academic_year,
        term: currentTerm.id,
        curriculum: selectedStudent.current_curriculum || 1, // Fallback need better handling
        grade: selectedStudent.current_grade_id || 1, // Still defaulting to 1 if missing, but now UI warns user.
        stream: selectedStudent.current_stream_id || null, // Optional

        stay_status: formData.stay_status,
        reporting_reason: reason,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        is_active: true
      };

      await api.post('/api/settings/enrollments/', payload);

      Swal.fire({
        icon: 'success',
        title: 'Student Reported',
        text: `${selectedStudent.text} has been successfully reported back.`
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      const errorMsg = error.data
        ? Object.values(error.data).flat().join('\n')
        : error.message || "Could not report student.";

      Swal.fire("Reporting Failed", errorMsg, "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Report Student Back"
      size="md"
      accentColor="bg-indigo-500"
      footer={
        selectedStudent ? (
          <>
            <Modal.CancelButton onClick={onClose} />
            <Modal.SubmitButton form="report-back-form" loading={submitLoading} disabled={!currentTerm}>
              Report Student
            </Modal.SubmitButton>
          </>
        ) : null
      }
    >
      <form id="report-back-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Student Search */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-main)' }}>Find Student</label>
            {selectedStudent ? (
              <div className="flex items-center justify-between p-3 rounded-xl border" style={{ background: 'var(--primary-light)', borderColor: 'var(--border-color-light)' }}>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{selectedStudent.text}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{selectedStudent.admission_number}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  style={{ color: 'var(--primary-color)' }}
                  className="text-sm font-bold hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-3" size={18} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by name or admission number..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={inputClass + ' pl-10'}
                />
                {searchResults.length > 0 && (
                  <div style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }} className="absolute z-10 w-full mt-1 border rounded-xl max-h-64 overflow-y-auto">
                    {searchResults.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudent(s);
                          setSearchTerm('');
                          setSearchResults([]);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50/50 border-b last:border-0 transition-colors cursor-pointer"
                        style={{ borderColor: 'var(--border-color-light)' }}
                      >
                        <p className="font-medium" style={{ color: 'var(--text-main)' }}>{s.text || s.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.admission_number}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedStudent && (
            <>
              {/* Class/Grade Selection */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-main)' }}>Class / Grade</label>
                <div className="p-3 rounded-xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                  {!selectedStudent.current_grade_id ? (
                    <div className="text-red-600 text-sm">
                      Warning: No class detected. Please verify student setup or defaulting to Grade 1.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} style={{ color: 'var(--text-secondary)' }} />
                      <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{selectedStudent.current_grade_name || "Grade " + selectedStudent.current_grade_id}</span>
                      <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>(Auto-detected)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stay Status */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-main)' }}>Stay Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, stay_status: 'day_scholar' })}
                    className={`py-2 px-4 rounded-xl border text-center transition-all cursor-pointer ${formData.stay_status === 'day_scholar'
                      ? 'bg-green-50 border-green-500 text-green-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    Day Scholar
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, stay_status: 'boarder' })}
                    className={`py-2 px-4 rounded-xl border text-center transition-all cursor-pointer ${formData.stay_status === 'boarder'
                      ? 'bg-purple-50 border-purple-500 text-purple-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    Boarder
                  </button>
                </div>
              </div>

              {/* Reason */}
              <FormField label="Reason">
                <Select
                  value={formData.reporting_reason}
                  onChange={(e) => setFormData({ ...formData, reporting_reason: e.target.value })}
                >
                  <option value="Opening Day">Opening Day</option>
                  <option value="Late Reporting">Late Reporting</option>
                  <option value="From Suspension">From Suspension</option>
                  <option value="Medical Leave Return">Medical Leave Return</option>
                  <option value="Other">Other</option>
                </Select>
                {formData.reporting_reason === 'Other' && (
                  <Input
                    type="text"
                    className="mt-2"
                    placeholder="Specify reason..."
                    value={formData.other_reason}
                    onChange={(e) => setFormData({ ...formData, other_reason: e.target.value })}
                    required
                  />
                )}
              </FormField>

              {/* Term Info Display */}
              <div className="text-xs p-3 rounded-xl flex items-center gap-2 border" style={{ color: 'var(--text-secondary)', background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                <Calendar size={14} style={{ color: 'var(--primary-color)' }} />
                <span>Reporting for:
                  <span className="font-bold ml-1" style={{ color: 'var(--text-main)' }}>
                    {currentTerm ? `${currentTerm.name} (${currentTerm.academic_year_name || 'Current Year'})` : 'Loading Term...'}
                  </span>
                </span>
              </div>

              {/* Billing Info */}
              <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border-color-light)' }}>
                <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Term Billing</span>
                  {billingInfo && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${billingInfo.billing_source === 'template' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                      {billingInfo.billing_source === 'template' ? 'Fee Template' : 'Grade Structure'}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {loadingBilling ? (
                    <div className="text-center py-3 text-sm" style={{ color: 'var(--text-muted)' }}>Loading billing...</div>
                  ) : billingInfo ? (
                    <div className="space-y-2">
                      {billingInfo.template && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Template: <span className="font-medium" style={{ color: 'var(--text-main)' }}>{billingInfo.template.name}</span></p>
                      )}
                      <div className="max-h-32 overflow-y-auto">
                        <table className="w-full text-sm">
                          <tbody className="divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                            {(billingInfo.fee_items || []).map((item, i) => (
                              <tr key={i} style={{ color: 'var(--text-secondary)' }}>
                                <td className="py-1">{item.name}</td>
                                <td className="py-1 text-right font-medium">{Number(item.amount).toLocaleString()}</td>
                                <td className="py-1 text-right">
                                  {item.is_optional && <span className="text-xs text-amber-600">Optional</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="pt-2 border-t flex justify-between font-semibold text-sm" style={{ borderColor: 'var(--border-color-light)' }}>
                        <span style={{ color: 'var(--text-main)' }}>Total</span>
                        <span style={{ color: 'var(--primary-color)' }}>
                          {billingInfo.template
                            ? Number(billingInfo.template.total).toLocaleString()
                            : (billingInfo.fee_items || []).reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>No billing structure found for this student.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </form>
    </Modal>
  );
};

export default AdmissionReporting;