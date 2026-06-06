import React, { useMemo, useState, useCallback, memo } from 'react';
import { MoreHorizontal, Plus, AlertTriangle, Trash2, Edit3, User, MapPin, Lock } from 'lucide-react';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Subject color mapping - generates consistent colors from hex or uses predefined palette.
 */
const SUBJECT_COLORS = {
    '#3B82F6': { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'border-l-blue-500', text: 'text-blue-900', hover: 'hover:bg-blue-100' },
    '#10B981': { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'border-l-emerald-500', text: 'text-emerald-900', hover: 'hover:bg-emerald-100' },
    '#6366F1': { bg: 'bg-indigo-50', border: 'border-indigo-200', accent: 'border-l-indigo-500', text: 'text-indigo-900', hover: 'hover:bg-indigo-100' },
    '#F59E0B': { bg: 'bg-amber-50', border: 'border-amber-200', accent: 'border-l-amber-500', text: 'text-amber-900', hover: 'hover:bg-amber-100' },
    '#F97316': { bg: 'bg-orange-50', border: 'border-orange-200', accent: 'border-l-orange-500', text: 'text-orange-900', hover: 'hover:bg-orange-100' },
    '#14B8A6': { bg: 'bg-teal-50', border: 'border-teal-200', accent: 'border-l-teal-500', text: 'text-teal-900', hover: 'hover:bg-teal-100' },
    '#8B5CF6': { bg: 'bg-violet-50', border: 'border-violet-200', accent: 'border-l-violet-500', text: 'text-violet-900', hover: 'hover:bg-violet-100' },
    '#EC4899': { bg: 'bg-pink-50', border: 'border-pink-200', accent: 'border-l-pink-500', text: 'text-pink-900', hover: 'hover:bg-pink-100' },
    '#EF4444': { bg: 'bg-red-50', border: 'border-red-200', accent: 'border-l-red-500', text: 'text-red-900', hover: 'hover:bg-red-100' },
    '#84CC16': { bg: 'bg-lime-50', border: 'border-lime-200', accent: 'border-l-lime-500', text: 'text-lime-900', hover: 'hover:bg-lime-100' },
};

const DEFAULT_COLOR = { bg: 'bg-slate-50', border: 'border-slate-200', accent: 'border-l-slate-400', text: 'text-slate-900', hover: 'hover:bg-slate-100' };

const getColorClasses = (hex) => {
    if (!hex) return DEFAULT_COLOR;
    return SUBJECT_COLORS[hex?.toUpperCase()] ?? DEFAULT_COLOR;
};

/**
 * TimetableCell — Memoized cell component for performance.
 */
const TimetableCell = memo(({ 
    entry, 
    periodKey, 
    periodType,
    dayIdx,
    onEdit, 
    onDelete, 
    onAssign,
    isLocked,
    hasConflict,
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Break/Lunch cells
    if (periodType === 'Break' || periodType === 'Lunch' || periodType === 'break' || periodType === 'lunch') {
        return (
            <td className="p-2 border-b border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">
                    {periodType}
                </span>
            </td>
        );
    }

    // Empty cell - show assign button on hover
    if (!entry) {
        return (
            <td 
                className="p-2 border-b border-r border-slate-200 dark:border-slate-700 relative group transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="h-full w-full min-h-[60px] flex items-center justify-center">
                    {!isLocked && (
                        <button 
                            onClick={() => onAssign?.(dayIdx, periodKey)}
                            className={`text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-1.5 transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                            <Plus size={12} strokeWidth={2.5} /> Assign
                        </button>
                    )}
                </div>
            </td>
        );
    }

    const colors = getColorClasses(entry.subject_color);
    const conflictClass = hasConflict ? 'ring-2 ring-red-500 ring-offset-1' : '';

    return (
        <td 
            className="p-2 border-b border-r border-slate-200 dark:border-slate-700 relative group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-700/20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
        >
            <div 
                className={`
                    p-2.5 rounded-lg border border-l-4 shadow-sm cursor-pointer 
                    transition-all duration-200 transform
                    ${colors.bg} ${colors.border} ${colors.accent} ${colors.text} ${colors.hover}
                    ${isHovered ? 'shadow-md scale-[1.02]' : ''}
                    ${conflictClass}
                `}
                onClick={() => !isLocked && onEdit?.(entry)}
            >
                {/* Conflict indicator */}
                {hasConflict && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                        <AlertTriangle size={10} className="text-white" />
                    </div>
                )}

                {/* Subject name and menu */}
                <div className="flex justify-between items-start mb-1.5">
                    <span className="text-xs font-bold truncate pr-2 leading-tight">{entry.subject_name}</span>
                    {!isLocked && (
                        <div className="relative">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                className={`p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <MoreHorizontal size={12} />
                            </button>
                            
                            {/* Dropdown menu */}
                            {showMenu && (
                                <div className="absolute right-0 top-6 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 min-w-[120px] animate-in fade-in slide-in-from-top-2 duration-150">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onEdit?.(entry); setShowMenu(false); }}
                                        className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                    >
                                        <Edit3 size={11} /> Edit
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete?.(entry); setShowMenu(false); }}
                                        className="w-full px-3 py-1.5 text-left text-xs hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 flex items-center gap-2"
                                    >
                                        <Trash2 size={11} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Teacher and room info */}
                <div className="flex justify-between items-center text-[10px] opacity-80 font-medium gap-2">
                    <span className="flex items-center gap-1 truncate">
                        <User size={9} className="opacity-60 flex-shrink-0" />
                        <span className="truncate">{entry.teacher_name}</span>
                    </span>
                    {entry.room_name && (
                        <span className="flex items-center gap-1 bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded text-[9px] uppercase flex-shrink-0">
                            <MapPin size={8} className="opacity-60" />
                            {entry.room_name}
                        </span>
                    )}
                </div>

                {/* Subject code badge (if available) */}
                {entry.subject_code && (
                    <div className="mt-1.5 text-[9px] uppercase tracking-wide opacity-50 font-mono">
                        {entry.subject_code}
                    </div>
                )}
            </div>

            {/* Tooltip on hover */}
            {isHovered && entry && (
                <div className="absolute z-40 left-full ml-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-150">
                    <div className="font-semibold mb-1">{entry.subject_name}</div>
                    <div className="text-slate-300 space-y-0.5">
                        <div>Teacher: {entry.teacher_name}</div>
                        {entry.room_name && <div>Room: {entry.room_name}</div>}
                        <div className="text-slate-400 text-[10px] mt-1">
                            {entry.start_time} – {entry.end_time}
                        </div>
                    </div>
                </div>
            )}
        </td>
    );
});

TimetableCell.displayName = 'TimetableCell';

/**
 * WeeklyTimetable — Main timetable grid component.
 * 
 * Props:
 *  @param {Object|Array} weeklyView - Slots grouped by day (dict or array format)
 *  @param {Array} slots - Flat array of all slots (for deriving time columns)
 *  @param {Array} periods - Time period definitions from backend
 *  @param {Function} onEditSlot - Callback when editing a slot
 *  @param {Function} onDeleteSlot - Callback when deleting a slot
 *  @param {Function} onAssignSlot - Callback when assigning to empty cell
 *  @param {boolean} isLocked - Whether timetable is locked for editing
 *  @param {Array} conflicts - Array of slot IDs that have conflicts
 */
const WeeklyTimetable = ({ 
    weeklyView, 
    slots, 
    periods: externalPeriods,
    timetable, 
    timeSlots,
    onEditSlot,
    onDeleteSlot,
    onAssignSlot,
    isLocked = false,
    conflicts = [],
}) => {

    // ── Derive unique time columns from flat slots array ──────────
    const timePeriods = useMemo(() => {
        // Use external periods if provided (from backend TimePeriod model)
        if (externalPeriods && externalPeriods.length) {
            return externalPeriods.map(p => ({
                id: p.id || `${p.start_time}-${p.end_time}`,
                key: `${p.start_time}-${p.end_time}`,
                start: p.start_time,
                end: p.end_time,
                name: p.name || p.short_name,
                type: p.period_type,
                order: p.order,
            })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }

        // Derive from slots if no periods provided
        if (slots && slots.length) {
            const seen = new Set();
            const periods = [];
            [...slots]
                .sort((a, b) => (a.start_time < b.start_time ? -1 : 1))
                .forEach((s) => {
                    const key = `${s.start_time}-${s.end_time}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        periods.push({ 
                            id: key, 
                            key,
                            start: s.start_time, 
                            end: s.end_time,
                            name: null,
                            type: 'lesson',
                        });
                    }
                });
            return periods;
        }

        // Static mock path (legacy)
        return (timeSlots ?? []).map((s) => ({
            id: s.id,
            key: `${s.start}-${s.end}`,
            start: s.start,
            end: s.end,
            name: s.name,
            type: s.type,
        }));
    }, [externalPeriods, slots, timeSlots]);

    // ── Build a quick-lookup map: day → time → slot ───────────────
    const cellMap = useMemo(() => {
        const map = {};
        
        // Live weekly view (dict keyed by day_of_week int or string)
        if (weeklyView && typeof weeklyView === 'object' && !Array.isArray(weeklyView)) {
            Object.entries(weeklyView).forEach(([dayIdx, daySlots]) => {
                const idx = Number(dayIdx);
                map[idx] = {};
                (daySlots || []).forEach((s) => {
                    const key = `${s.start_time}-${s.end_time}`;
                    map[idx][key] = s;
                });
            });
            return map;
        }

        // Static mock path (array of {day, slots})
        const mockSource = weeklyView ?? timetable ?? [];
        mockSource.forEach((row) => {
            const di = DAY_NAMES.indexOf(row.day);
            if (di < 0) return;
            map[di] = {};
            row.slots?.forEach((s) => {
                const period = (timeSlots ?? []).find((p) => p.id === s.slotId);
                if (period) {
                    map[di][`${period.start}-${period.end}`] = {
                        id: s.id,
                        subject_name: s.subject,
                        teacher_name: s.teacher,
                        room_name: s.room,
                        subject_color: null,
                    };
                }
            });
        });
        return map;
    }, [weeklyView, timetable, timeSlots]);

    // ── Determine which days to render ───────────────────────────
    const daysToShow = useMemo(() => {
        // Always show Mon-Fri (0-4), optionally Saturday if there's data
        if (weeklyView && typeof weeklyView === 'object' && !Array.isArray(weeklyView)) {
            const base = [0, 1, 2, 3, 4];
            if (weeklyView['5'] && weeklyView['5'].length > 0) {
                base.push(5);
            }
            return base;
        }
        const mockSource = weeklyView ?? timetable ?? [];
        const indices = mockSource.map((row) => DAY_NAMES.indexOf(row.day)).filter((i) => i >= 0);
        return indices.length > 0 ? indices : [0, 1, 2, 3, 4];
    }, [weeklyView, timetable]);

    // ── Conflict check helper ─────────────────────────────────────
    const hasConflict = useCallback((slotId) => {
        return conflicts.includes(slotId);
    }, [conflicts]);

    // ── Event handlers ────────────────────────────────────────────
    const handleEdit = useCallback((entry) => {
        onEditSlot?.(entry);
    }, [onEditSlot]);

    const handleDelete = useCallback((entry) => {
        onDeleteSlot?.(entry);
    }, [onDeleteSlot]);

    const handleAssign = useCallback((dayIdx, periodKey) => {
        const period = timePeriods.find(p => p.key === periodKey);
        if (period) {
            onAssignSlot?.({
                day_of_week: dayIdx,
                start_time: period.start,
                end_time: period.end,
            });
        }
    }, [onAssignSlot, timePeriods]);

    // ── Empty state ───────────────────────────────────────────────
    if (!timePeriods.length && !daysToShow.length) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <Plus size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">No timetable slots found</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs">
                    Select a class or create time periods first
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in duration-300">
            {/* Lock indicator */}
            {isLocked && (
                <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center gap-2">
                    <Lock size={14} className="text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        Timetable is locked — editing disabled
                    </span>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="sticky top-0 z-20">
                        <tr>
                            {/* Corner cell */}
                            <th className="p-4 border-b border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 min-w-[90px] sticky left-0 z-30">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Day / Period
                                </span>
                            </th>

                            {/* Period headers */}
                            {timePeriods.map((period, idx) => (
                                <th
                                    key={period.id}
                                    className="px-2 py-3 border-b border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 min-w-[130px] text-center"
                                >
                                    <div className="flex flex-col items-center gap-0.5">
                                        {period.name ? (
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                                                {period.name}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                                Period {idx + 1}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                            {period.start} – {period.end}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {daysToShow.map((dayIdx) => (
                            <tr key={dayIdx} className="divide-slate-200 dark:divide-slate-700">
                                {/* Day label - sticky */}
                                <td className="p-3 border-b border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-white dark:bg-slate-800 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800 dark:text-white text-sm">
                                            {DAY_NAMES[dayIdx]}
                                        </span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                            {DAY_SHORT[dayIdx]}
                                        </span>
                                    </div>
                                </td>

                                {/* Period cells */}
                                {timePeriods.map((period) => {
                                    const entry = cellMap[dayIdx]?.[period.key];
                                    
                                    return (
                                        <TimetableCell
                                            key={`${dayIdx}-${period.key}`}
                                            entry={entry}
                                            periodKey={period.key}
                                            periodType={period.type}
                                            dayIdx={dayIdx}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onAssign={handleAssign}
                                            isLocked={isLocked}
                                            hasConflict={entry ? hasConflict(entry.id) : false}
                                        />
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default memo(WeeklyTimetable);

