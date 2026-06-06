import React, { useState, useEffect, useCallback } from 'react';
import { Save, CheckCircle, XCircle, Clock, Loader2, ChevronDown } from 'lucide-react';
import { api } from '../../../../services/api';

// Backend status → display label
const STATUS_LABELS = { P: 'Present', A: 'Absent', L: 'Late', E: 'Excused' };
const STATUSES = ['P', 'A', 'L', 'E'];
const STATUS_ICON = {
    P: { icon: CheckCircle, active: 'bg-green-100 text-green-700 ring-1 ring-green-400', label: 'Present' },
    A: { icon: XCircle, active: 'bg-red-100 text-red-700 ring-1 ring-red-400', label: 'Absent' },
    L: { icon: Clock, active: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-400', label: 'Late' },
    E: { icon: Clock, active: 'bg-blue-100 text-blue-700 ring-1 ring-blue-400', label: 'Excused' },
};

const AttendancePanel = ({ todaySessions = [] }) => {
    // Pick the first in-progress session by default; let user switch
    const activeSessions = todaySessions.filter(s => s.status === 'in_progress' || s.status === 'completed');

    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [records, setRecords] = useState([]); // [{id, student_id, student_name, adm_no, status, remarks}]
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    // Auto-select first available session
    useEffect(() => {
        if (!selectedSessionId && activeSessions.length > 0) {
            setSelectedSessionId(activeSessions[0].id);
        }
    }, [activeSessions.length]);

    // Load attendance records whenever selected session changes
    const loadAttendance = useCallback(async (sessionId) => {
        if (!sessionId) return;
        setLoading(true); setError(null);
        try {
            const res = await api.lessonSessions.getAttendance(sessionId);
            const data = res.data ?? res;
            // Normalise: API returns array of attendance objects
            setRecords((Array.isArray(data) ? data : data.results ?? []).map(r => ({
                id: r.id,
                student_id: r.student ?? r.student_id,
                name: r.student_name ?? r.student ?? 'Unknown',
                admNo: r.admission_number ?? r.adm_no ?? '—',
                status: r.status ?? 'P',
                remarks: r.remarks ?? '',
            })));
        } catch (e) {
            setError('Failed to load attendance records.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAttendance(selectedSessionId); }, [selectedSessionId]);

    const handleStatusChange = (id, newStatus) => {
        setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
        setSaved(false);
    };
    const handleRemarkChange = (id, val) => {
        setRecords(records.map(r => r.id === id ? { ...r, remarks: val } : r));
        setSaved(false);
    };
    const markAllPresent = () => {
        setRecords(records.map(r => ({ ...r, status: 'P' })));
        setSaved(false);
    };
    const handleSave = async () => {
        if (!selectedSessionId) return;
        setSaving(true); setError(null);
        try {
            await api.lessonSessions.markAttendance(
                selectedSessionId,
                records.map(r => ({ id: r.id, status: r.status, remarks: r.remarks }))
            );
            setSaved(true);
        } catch (e) {
            setError('Failed to save attendance. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const selectedSession = todaySessions.find(s => s.id === selectedSessionId);

    // No sessions at all
    if (todaySessions.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
                No sessions found for today. Start a session to mark attendance.
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header: session selector */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900">Attendance</h3>
                    {activeSessions.length > 0 ? (
                        <div className="relative mt-1 w-full max-w-xs">
                            <select
                                value={selectedSessionId ?? ''}
                                onChange={(e) => setSelectedSessionId(Number(e.target.value))}
                                className="w-full pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg bg-white
                                           focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
                            >
                                {activeSessions.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.class_session_name} — {s.subject_name ?? 'Session'}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 mt-0.5">No in-progress sessions to mark</p>
                    )}
                </div>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={markAllPresent}
                        disabled={records.length === 0 || loading}
                        className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg
                                   hover:bg-green-100 border border-green-200 disabled:opacity-40"
                    >
                        Mark All Present
                    </button>
                </div>
            </div>

            {error && (
                <div className="px-6 py-2 bg-red-50 text-red-600 text-xs">{error}</div>
            )}

            {loading ? (
                <div className="py-12 flex justify-center items-center gap-2 text-gray-400 text-sm">
                    <Loader2 size={18} className="animate-spin" /> Loading attendance…
                </div>
            ) : records.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                    {selectedSessionId ? 'No attendance records found for this session.' : 'Select a session above.'}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4">Admission No.</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {records.map((rec) => (
                                <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{rec.name}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{rec.admNo}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-1">
                                            {STATUSES.map(st => {
                                                const { icon: Icon, active, label } = STATUS_ICON[st];
                                                return (
                                                    <button
                                                        key={st}
                                                        onClick={() => handleStatusChange(rec.id, st)}
                                                        className={`p-1.5 rounded-md transition-colors
                                                            ${rec.status === st ? active : 'text-gray-400 hover:bg-gray-100'}`}
                                                        title={label}
                                                    >
                                                        <Icon size={18} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium mt-1 block">
                                            {STATUS_LABELS[rec.status] ?? rec.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            value={rec.remarks}
                                            onChange={(e) => handleRemarkChange(rec.id, e.target.value)}
                                            placeholder="Add remark…"
                                            className="w-full bg-transparent border-b border-transparent
                                                       focus:border-indigo-300 focus:outline-none text-xs
                                                       text-gray-600 focus:bg-gray-50 px-2 py-1"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                {saved && <span className="text-xs text-green-600 font-medium">✓ Attendance saved</span>}
                <button
                    onClick={handleSave}
                    disabled={saving || loading || records.length === 0 || !selectedSessionId}
                    className="ml-auto flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl
                               hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-200
                               font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving…' : 'Save Attendance'}
                </button>
            </div>
        </div>
    );
};

export default AttendancePanel;
