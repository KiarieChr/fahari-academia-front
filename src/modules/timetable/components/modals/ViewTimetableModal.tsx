import React, { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { api } from '../../../../services/apiClient';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ViewTimetableModal = ({ isOpen, onClose, classSessionId, classSessionName }) => {
    const [data, setData] = useState(null);
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!classSessionId) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [result, periodData] = await Promise.all([
                    api.timetable.getClassTimetable(classSessionId),
                    api.timetable.getSchedulablePeriods()
                ]);
                setData(result);
                setPeriods(periodData.results || periodData || []);
            } catch {
                setData(null);
                setPeriods([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [classSessionId]);

    const days = data?.days || {};

    // Build time rows
    const allSlots = Object.values(days).flat();
    const timeRows = periods.length > 0
        ? periods.map(p => ({ label: `${p.start_time?.slice(0, 5)} - ${p.end_time?.slice(0, 5)}`, start: p.start_time, name: p.short_name || p.name, isBreak: !p.is_schedulable }))
        : [...new Set(allSlots.map(s => s.start_time))].sort().map(t => ({ label: t?.slice(0, 5), start: t, name: '', isBreak: false }));

    const getSlot = (dayName, startTime) => {
        const daySlots = days[dayName] || [];
        return daySlots.find(s => s.start_time === startTime);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Class Timetable"
            subtitle={classSessionName || 'Full weekly view'}
            size="xl"
            noPadding
            footer={
                <p className="text-xs text-gray-500 mr-auto">
                    {data?.coverage && (
                        <span>Coverage: <span className="font-bold">{Math.round(data.coverage.coverage_percentage || 0)}%</span></span>
                    )}
                </p>
            }
        >
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-indigo-600" size={28} />
                </div>
            ) : timeRows.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <p className="font-medium">No timetable slots found</p>
                </div>
            ) : (
                <div className="flex-1 overflow-auto p-6">
                    <div className="min-w-[600px] border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 border-b border-r border-gray-200 w-24">Time</th>
                                    {DAY_NAMES.slice(0, 5).map(day => (
                                        <th key={day} className="px-4 py-3 border-b border-r border-gray-200">{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {timeRows.map((row, idx) => (
                                    <tr key={idx} className={row.isBreak ? 'bg-orange-50' : 'hover:bg-gray-50'}>
                                        <td className="px-4 py-3 border-r border-gray-100 font-mono text-xs font-medium text-gray-500">
                                            <div>{row.label}</div>
                                            {row.name && <div className="text-[10px] text-gray-400 mt-0.5">{row.name}</div>}
                                        </td>
                                        {DAY_NAMES.slice(0, 5).map(day => {
                                            if (row.isBreak) {
                                                return (
                                                    <td key={day} className="px-4 py-3 border-r border-gray-100 text-center text-orange-700 font-bold text-xs bg-orange-50">
                                                        BREAK
                                                    </td>
                                                );
                                            }
                                            const slot = getSlot(day, row.start);
                                            if (!slot) {
                                                return <td key={day} className="px-4 py-3 border-r border-gray-100 text-gray-300">—</td>;
                                            }
                                            return (
                                                <td key={day} className="px-3 py-2 border-r border-gray-100">
                                                    <div
                                                        className="rounded px-2 py-1 border-l-3"
                                                        style={{
                                                            borderLeftColor: slot.subject_color || '#6366f1',
                                                            borderLeftWidth: '3px',
                                                            backgroundColor: slot.subject_color ? `${slot.subject_color}15` : '#f0f0ff',
                                                        }}
                                                    >
                                                        <div className="font-semibold text-sm">{slot.subject}</div>
                                                        <div className="text-xs text-gray-600">{slot.teacher}</div>
                                                        {slot.room && <div className="text-xs text-gray-400">{slot.room}</div>}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ViewTimetableModal;
