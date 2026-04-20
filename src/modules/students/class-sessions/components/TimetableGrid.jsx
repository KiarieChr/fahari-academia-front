import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../../services/apiClient';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const hexToRgb = (hex) => {
    if (!hex) return null;
    const h = hex.replace('#', '');
    return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
};

const getSlotStyle = (colorHex) => {
    const rgb = hexToRgb(colorHex);
    if (!rgb) return { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-900' };
    return {
        bg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
        border: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`,
        text: 'inherit',
    };
};

const TimetableGrid = ({ classSessionId, onEditSlot, onDeleteSlot, isLocked }) => {
    const [weeklyData, setWeeklyData] = useState({});
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!classSessionId) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [weekly, periodData] = await Promise.all([
                    api.timetable.getWeeklyView(classSessionId),
                    api.timetable.getSchedulablePeriods(),
                ]);
                setWeeklyData(weekly);
                setPeriods((periodData.results || periodData) || []);
            } catch {
                setWeeklyData({});
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [classSessionId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-indigo-600" size={24} />
            </div>
        );
    }

    // Build time rows from periods or from slot times
    const allSlots = Object.values(weeklyData).flat();
    const timeRows = periods.length > 0
        ? periods.map(p => ({ label: `${p.start_time?.slice(0, 5)} - ${p.end_time?.slice(0, 5)}`, start: p.start_time, name: p.short_name || p.name, isBreak: !p.is_schedulable }))
        : [...new Set(allSlots.map(s => s.start_time))].sort().map(t => ({ label: t?.slice(0, 5), start: t, name: '', isBreak: false }));

    if (allSlots.length === 0 && periods.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p className="font-medium">No timetable slots yet</p>
                <p className="text-xs mt-1">Add slots manually or use Auto-Generate</p>
            </div>
        );
    }

    const getSlotForCell = (dayIndex, startTime) => {
        const daySlots = weeklyData[dayIndex] || [];
        return daySlots.find(s => s.start_time === startTime);
    };

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 w-28">Time</th>
                        {DAY_NAMES.slice(0, 5).map(day => (
                            <th key={day} className="px-4 py-3 text-left font-bold text-gray-700">{day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {timeRows.map((row, idx) => (
                        <motion.tr
                            key={idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className={row.isBreak ? 'bg-orange-50' : 'hover:bg-gray-50'}
                        >
                            <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-500 sticky left-0 bg-gray-50">
                                <div>{row.label}</div>
                                {row.name && <div className="text-[10px] text-gray-400">{row.name}</div>}
                            </td>
                            {DAY_NAMES.slice(0, 5).map((_, dayIdx) => {
                                if (row.isBreak) {
                                    return (
                                        <td key={dayIdx} className="px-4 py-3 text-center text-orange-700 font-bold text-xs bg-orange-50">
                                            BREAK
                                        </td>
                                    );
                                }
                                const slot = getSlotForCell(dayIdx, row.start);
                                if (!slot) {
                                    return <td key={dayIdx} className="px-4 py-3 text-gray-300 text-center">—</td>;
                                }
                                const style = getSlotStyle(slot.subject_color);
                                return (
                                    <td key={dayIdx} className="px-3 py-2">
                                        <div
                                            className="rounded-lg px-3 py-2 border-l-4 group relative"
                                            style={{ backgroundColor: style.bg, borderLeftColor: style.border }}
                                        >
                                            <div className="font-semibold text-sm">{slot.subject_name}</div>
                                            <div className="text-xs opacity-75 mt-0.5">{slot.teacher_name}</div>
                                            {slot.room_name && <div className="text-xs opacity-60">{slot.room_name}</div>}
                                            {!isLocked && (
                                                <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                                                    <button onClick={() => onEditSlot(slot)} className="p-1 bg-white rounded shadow hover:bg-gray-100">
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button onClick={() => onDeleteSlot(slot.id)} className="p-1 bg-white rounded shadow hover:bg-red-100 text-red-600">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TimetableGrid;
