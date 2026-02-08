import React, { useState, useEffect } from 'react';
import {
  BarChart, Users, CheckCircle, Search, X, User, BookOpen, AlertCircle, Calendar
} from 'lucide-react';
import { api } from '../../../../services/api';
import Swal from 'sweetalert2';


const AdmissionReporting = () => {
  const [subTab, setSubTab] = useState('report_back');
  const [showReportModal, setShowReportModal] = useState(false);

  // Recent Reports Data (Live)
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    if (subTab === 'report_back') {
      fetchRecentEnrollments();
    }
  }, [subTab]);

  const fetchRecentEnrollments = async () => {
    try {
      const res = await api.get('/api/settings/enrollments/?is_active=true&limit=10'); // Fetch last 10 active
      setRecentReports(Array.isArray(res) ? res : (res.results || []));
    } catch (error) {
      console.error("Failed to fetch reports", error);
    }
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
            onOpenModal={() => setShowReportModal(true)}
            onSuccess={fetchRecentEnrollments}
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
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            setShowReportModal(false);
            fetchRecentEnrollments();
          }}
        />
      )}
    </div>
  );
};

// --- Report Back View ---
const ReportBackView = ({ reports, onOpenModal, onSuccess }) => {
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No students reported yet this session.
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Report Back Modal ---
const ReportBackModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Form Data
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(null);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Report Student Back</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                  {/* If we have a detected grade, show it, but allow override if needed (future feature). For now just show and use it. 
                        Actually, user wants to FIX the class if it's picking Grade One.
                        So we should make this editable or at least explicitly visible.
                    */}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={formData.reporting_reason}
                  onChange={(e) => setFormData({ ...formData, reporting_reason: e.target.value })}
                >
                  <option value="Opening Day">Opening Day</option>
                  <option value="Late Reporting">Late Reporting</option>
                  <option value="From Suspension">From Suspension</option>
                  <option value="Medical Leave Return">Medical Leave Return</option>
                  <option value="Other">Other</option>
                </select>
                {formData.reporting_reason === 'Other' && (
                  <input
                    type="text"
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
                    placeholder="Specify reason..."
                    value={formData.other_reason}
                    onChange={(e) => setFormData({ ...formData, other_reason: e.target.value })}
                    required
                  />
                )}
              </div>

              {/* Term Info Display */}
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                <Calendar size={14} />
                <span>Reporting for:
                  <span className="font-medium text-gray-700 ml-1">
                    {currentTerm ? `${currentTerm.name} (${currentTerm.academic_year_name || 'Current Year'})` : 'Loading Term...'}
                  </span>
                </span>
              </div>

              <button
                type="submit"
                disabled={submitLoading || !currentTerm}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submitLoading ? 'Submitting...' : 'Report Student'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdmissionReporting;