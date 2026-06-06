import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2, XCircle, Clock, AlertCircle,
    Loader2, BarChart3,
} from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import { portalService } from './portalService';
import { toast } from 'react-toastify';

const statusConfig = {
    present: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Present' },
    absent: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Absent' },
    late: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Late' },
    excused: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Excused' },
};

const MyAttendance = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await portalService.getAttendance();
                setData(res);
            } catch {
                toast.error('Failed to load attendance');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <StudentLayout title="My Attendance">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
            </StudentLayout>
        );
    }

    const summary = data?.summary || {};
    const records = data?.records || [];
    const rate = summary.attendance_rate ?? 0;

    return (
        <StudentLayout title="My Attendance">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-1">
                {/* Rate hero */}
                <div className={`rounded-2xl p-6 text-white shadow-lg ${
                    rate >= 80 ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                    rate >= 60 ? 'bg-gradient-to-r from-amber-600 to-yellow-500' :
                    'bg-gradient-to-r from-red-600 to-rose-500'
                }`}>
                    <p className="text-white/80 text-sm flex items-center gap-2">
                        <BarChart3 size={16} /> Attendance Rate
                    </p>
                    <p className="text-5xl font-bold mt-2">{rate}%</p>
                    <p className="text-white/70 text-xs mt-1">
                        {summary.total || 0} total sessions tracked
                    </p>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['present', 'absent', 'late', 'excused'].map(key => {
                        const cfg = statusConfig[key];
                        const Icon = cfg.icon;
                        return (
                            <div key={key} className={`${cfg.bg} rounded-xl border p-4`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon size={16} className={cfg.color} />
                                    <span className="text-xs font-medium text-gray-500 uppercase">{cfg.label}</span>
                                </div>
                                <p className={`text-2xl font-bold ${cfg.color}`}>{summary[key] ?? 0}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Recent records */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-base font-bold text-gray-900">Recent Attendance Records</h3>
                    </div>
                    {records.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {records.map(r => {
                                const cfg = statusConfig[r.status] || statusConfig.present;
                                const Icon = cfg.icon;
                                return (
                                    <div key={r.id} className="flex items-center gap-4 px-6 py-3">
                                        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                                            <Icon size={16} className={cfg.color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800">{r.subject_name || 'Lesson'}</p>
                                            <p className="text-xs text-gray-500">{r.date || '—'}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                            {cfg.label}
                                            {r.status === 'late' && r.minutes_late > 0 && ` (${r.minutes_late} min)`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            <CheckCircle2 size={40} className="mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No attendance records yet</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </StudentLayout>
    );
};

export default MyAttendance;
