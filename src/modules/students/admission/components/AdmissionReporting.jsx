import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Users, CheckCircle, Search, User, BookOpen, AlertCircle, Calendar, Eye, X
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
      const res = await api.get('/api/settings/enrollments/?is_active=true&limit=10');
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
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setSubTab('report_back')}
          className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${subTab === 'report_back'
            ? 'border-indigo-500 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Report Back to School
        </button>
        <button
          onClick={() => setSubTab('discipline')}
          className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${subTab === 'discipline'
            ? 'border-indigo-500 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
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
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium">Discipline Module</h3>
            <p>Disciplinary reporting features coming soon.</p>
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
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-indigo-50 p-6 rounded-xl border border-indigo-100">
        <div>
          <h2 className="text-xl font-bold text-indigo-900">Student Reporting</h2>
          <p className="text-indigo-700">Report students back to school for the current term.</p>
        </div>
        <button
          onClick={onOpenModal}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <CheckCircle size={20} />
          Report Student Back
        </button>
      </div>

      {/* Unreported Students Section */}
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-amber-200 bg-amber-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-600" size={20} />
            <div>
              <h3 className="font-semibold text-amber-800">Not Yet Reported</h3>
              <p className="text-xs text-amber-600">
                {unreportedMeta.previousTerm
                  ? `Students from ${unreportedMeta.previousTerm} who haven't reported for ${unreportedMeta.currentTerm} ${unreportedMeta.currentYear}`
                  : 'Students who haven\'t reported this term'}
              </p>
            </div>
          </div>
          <span className="text-sm font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            {unreportedMeta.total || 0} students
          </span>
        </div>
        {loadingUnreported ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mb-2"></div>
            <p className="text-sm">Loading unreported students...</p>
          </div>
        ) : unreported.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <CheckCircle className="mx-auto h-10 w-10 text-green-400 mb-2" />
            <p className="text-sm font-medium text-green-700">All students have reported!</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adm No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Term</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {unreported.map((s) => (
                  <tr key={s.student_id} className="hover:bg-amber-50/50">
                    <td className="px-6 py-3 font-medium text-gray-900">{s.student_name}</td>
                    <td className="px-6 py-3 text-gray-500 text-sm">{s.admission_number}</td>
                    <td className="px-6 py-3 text-gray-600 text-sm">{s.grade_name} {s.stream_name}</td>
                    <td className="px-6 py-3 text-gray-500 text-sm">{s.last_term} {s.last_year}</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => onQuickReport(s)}
                        className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-700">Recently Reported</h3>
        </div>
        <table className="w-full">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No students reported yet this session.
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onDoubleClick={() => onViewDetail(r)}>
                  <td className="px-6 py-4 font-medium text-gray-900">{r.student_name}</td>
                  <td className="px-6 py-4 text-gray-600">{r.grade_name} {r.stream_name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.stay_status === 'boarder' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                      {r.stay_status === 'boarder' ? 'Boarder' : 'Day Scholar'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{r.reporting_reason || '-'}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(r.created_at || Date.now()).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewDetail(r); }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
        <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="h-12 w-12 rounded-full bg-indigo-200 flex items-center justify-center">
            <User className="text-indigo-700" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-indigo-900">{student.student_name}</h3>
            <p className="text-sm text-indigo-600">{student.admission_number || ''}</p>
          </div>
          {student.stay_status && (
            <span className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${student.stay_status === 'boarder' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
              {student.stay_status === 'boarder' ? 'Boarder' : 'Day Scholar'}
            </span>
          )}
        </div>

        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Enrollment Sessions</h4>

        {loading ? (
          <div className="py-8 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-2"></div>
            <p className="text-sm">Loading history...</p>
          </div>
        ) : timeline.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <Calendar className="mx-auto h-10 w-10 mb-2" />
            <p className="text-sm">No enrollment records found.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-4">
              {timeline.map((e, i) => (
                <div key={e.id || i} className="relative pl-10">
                  <div className={`absolute left-2.5 top-2 h-3 w-3 rounded-full border-2 border-white ${e.is_active ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                  <div className={`p-4 rounded-lg border ${e.is_active ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{e.academic_year}</span>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-700">{e.term}</span>
                        {e.is_active && <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">Current</span>}
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor(e.status)}`}>
                        {e.status_display || e.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs">Grade</span>
                        <p className="font-medium text-gray-800">{e.grade} {e.stream || ''}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Curriculum</span>
                        <p className="font-medium text-gray-800">{e.curriculum || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Type</span>
                        <p className="font-medium text-gray-800">{e.type_display || e.enrollment_type || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Stay</span>
                        <p className="font-medium text-gray-800">{e.stay_status === 'boarder' ? 'Boarder' : e.stay_status === 'day_scholar' ? 'Day Scholar' : '-'}</p>
                      </div>
                    </div>
                    {e.enrollment_date && (
                      <p className="mt-2 text-xs text-gray-400">Enrolled: {new Date(e.enrollment_date).toLocaleDateString()}</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Find Student</label>
            {selectedStudent ? (
              <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div>
                  <p className="font-semibold text-indigo-900">{selectedStudent.text}</p>
                  <p className="text-xs text-indigo-700 ">{selectedStudent.admission_number}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or admission number..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={inputClass + ' pl-10'}
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {searchResults.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudent(s);
                          setSearchTerm('');
                          setSearchResults([]);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <p className="font-medium text-gray-900">{s.text || s.name}</p>
                        <p className="text-xs text-gray-500">{s.admission_number}</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Class / Grade</label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  {!selectedStudent.current_grade_id ? (
                    <div className="text-red-600 text-sm">
                      Warning: No class detected. Please verify student setup or defaulting to Grade 1.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-gray-500" />
                      <span className="font-semibold text-gray-800">{selectedStudent.current_grade_name || "Grade " + selectedStudent.current_grade_id}</span>
                      <span className="text-xs text-gray-500 ml-2">(Auto-detected)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stay Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stay Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, stay_status: 'day_scholar' })}
                    className={`py-2 px-4 rounded-lg border text-center transition-colors ${formData.stay_status === 'day_scholar'
                      ? 'bg-green-50 border-green-500 text-green-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    Day Scholar
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, stay_status: 'boarder' })}
                    className={`py-2 px-4 rounded-lg border text-center transition-colors ${formData.stay_status === 'boarder'
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
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                <Calendar size={14} />
                <span>Reporting for:
                  <span className="font-medium text-gray-700 ml-1">
                    {currentTerm ? `${currentTerm.name} (${currentTerm.academic_year_name || 'Current Year'})` : 'Loading Term...'}
                  </span>
                </span>
              </div>

              {/* Billing Info */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Term Billing</span>
                  {billingInfo && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${billingInfo.billing_source === 'template' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                      {billingInfo.billing_source === 'template' ? 'Fee Template' : 'Grade Structure'}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {loadingBilling ? (
                    <div className="text-center py-3 text-gray-400 text-sm">Loading billing...</div>
                  ) : billingInfo ? (
                    <div className="space-y-2">
                      {billingInfo.template && (
                        <p className="text-xs text-gray-500">Template: <span className="font-medium text-gray-700">{billingInfo.template.name}</span></p>
                      )}
                      <div className="max-h-32 overflow-y-auto">
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-gray-100">
                            {(billingInfo.fee_items || []).map((item, i) => (
                              <tr key={i} className="text-gray-600">
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
                      <div className="pt-2 border-t border-gray-200 flex justify-between font-semibold text-sm">
                        <span>Total</span>
                        <span className="text-indigo-700">
                          {billingInfo.template
                            ? Number(billingInfo.template.total).toLocaleString()
                            : (billingInfo.fee_items || []).reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-2">No billing structure found for this student.</p>
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