import React, { useMemo, useState } from 'react';
import { User, Printer } from 'lucide-react';
import Modal from '../../../../components/common/Modal';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/**
 * TeacherScheduleView
 * Props:
 *  slots    — flat array of TimetableSlot objects from API
 *  subjects — array of Subject objects (for reference)
 */
const TeacherScheduleView = ({ slots = [], subjects = [] }) => {
    const [selectedTeacherKey, setSelectedTeacherKey] = useState(null);

    // ── Derive per-teacher aggregates from slots ──────────────────
    const teachers = useMemo(() => {
        const map = {};
        slots.forEach((slot) => {
            if (!slot.teacher) return;
            const key = slot.teacher;
            if (!map[key]) {
                map[key] = {
                    id: key,
                    name: slot.teacher_name ?? `User #${key}`,
                    slots: [],
                    subjects: new Set(),
                    classSet: new Set(),
                };
            }
            map[key].slots.push(slot);
            if (slot.subject_name) map[key].subjects.add(slot.subject_name);
            if (slot.class_session_name) map[key].classSet.add(slot.class_session_name);
        });
        return Object.values(map).map((t) => ({
            ...t,
            subjects: [...t.subjects],
            classes: [...t.classSet],
            totalSlots: t.slots.length,
        }));
    }, [slots]);

    // ── Build weekly grid for selected teacher ────────────────────
    const teacherSlots = useMemo(() => {
        if (!selectedTeacherKey) return {};
        const teacherData = teachers.find((t) => t.id === selectedTeacherKey);
        if (!teacherData) return {};
        const grid = {}; // grid[dayIndex] = [slot, ...]
        teacherData.slots.forEach((s) => {
            const di = s.day_of_week;
            if (!grid[di]) grid[di] = [];
            grid[di].push(s);
        });
        return grid;
    }, [selectedTeacherKey, teachers]);

    const selectedTeacher = teachers.find((t) => t.id === selectedTeacherKey);

    if (slots.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <p className="text-slate-400 text-sm">No timetable slots available. Add slots first.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Teacher</th>
                                <th className="px-6 py-3 font-semibold">Subjects</th>
                                <th className="px-6 py-3 font-semibold">Classes</th>
                                <th className="px-6 py-3 font-semibold">Total Slots</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {teachers.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xs font-bold">
                                                {teacher.name.charAt(0).toUpperCase()}
                                            </div>
                                            {teacher.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.subjects.slice(0, 3).map((sub, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
                                                    {sub}
                                                </span>
                                            ))}
                                            {teacher.subjects.length > 3 && (
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">
                                                    +{teacher.subjects.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400 text-xs">
                                        {teacher.classes.slice(0, 3).join(', ')}
                                        {teacher.classes.length > 3 && ` +${teacher.classes.length - 3}`}
                                    </td>
                                    <td className="px-6 py-3 font-bold text-slate-700 dark:text-slate-300">{teacher.totalSlots}</td>
                                    <td className="px-6 py-3 text-right">
                                        <button
                                            onClick={() => setSelectedTeacherKey(teacher.id)}
                                            className="text-blue-600 hover:underline text-xs font-medium"
                                        >
                                            View Schedule
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Teacher Schedule Drawer ─────────────────────────────── */}
            <Modal
                isOpen={!!selectedTeacher}
                onClose={() => setSelectedTeacherKey(null)}
                title={selectedTeacher?.name}
                subtitle={selectedTeacher ? `${selectedTeacher.totalSlots} slots this week` : ''}
                icon={
                    selectedTeacher && (
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 font-bold text-xl">
                            {selectedTeacher.name.charAt(0).toUpperCase()}
                        </div>
                    )
                }
                size="xl"
                noPadding
                footer={
                    <>
                        <button className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-white border border-slate-200 rounded-lg transition-all flex items-center gap-2">
                            <Printer size={16} /> Print
                        </button>
                        <Modal.CancelButton onClick={() => setSelectedTeacherKey(null)}>Close</Modal.CancelButton>
                    </>
                }
            >
                {/* Weekly grid */}
                <div className="p-6 overflow-x-auto">
                    <div className="grid grid-cols-[80px_repeat(5,1fr)] text-sm border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        {/* Column headers */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-700" />
                        {DAY_NAMES.map((day) => (
                            <div key={day} className="p-3 font-bold text-center text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border-b border-l border-slate-200 dark:border-slate-700">
                                {day}
                            </div>
                        ))}
                        {/* Single summary row per day */}
                        <div className="p-3 text-xs font-semibold text-slate-400 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center">Slots</div>
                        {DAY_NAMES.map((_, di) => (
                            <div key={di} className="p-2 border-l border-slate-200 dark:border-slate-700 space-y-1">
                                {(teacherSlots[di] ?? []).length === 0
                                    ? <div className="text-center text-xs text-slate-300 py-3">Free</div>
                                    : (teacherSlots[di] ?? []).map((s) => (
                                        <div key={s.id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded p-2">
                                            <div className="font-bold text-blue-700 dark:text-blue-300 text-xs">{s.subject_name}</div>
                                            <div className="text-[10px] text-blue-500 mt-0.5">{s.class_session_name}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">{s.start_time} – {s.end_time}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TeacherScheduleView;
