import React, { useMemo, useState, useCallback, memo } from 'react';
import { MoreHorizontal, Plus, AlertTriangle, Trash2, Edit3, User, MapPin, Lock } from 'lucide-react';
import { DndContext, useSensor, useSensors, PointerSensor, DragOverlay, closestCenter } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

const DraggableSlotCard = ({ entry, hasConflict, isLocked, onEdit, onDelete, isOverlay = false }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `slot-${entry.id}`,
        data: entry,
        disabled: isLocked,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        cursor: isLocked ? 'default' : 'grab',
    };

    const colors = getColorClasses(entry.subject_color);
    const conflictClass = hasConflict ? 'ring-2 ring-red-500 ring-offset-1' : '';

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            className={`
                p-2.5 rounded-lg border border-l-4 shadow-sm relative transition-all duration-200
                ${colors.bg} ${colors.border} ${colors.accent} ${colors.text} ${colors.hover}
                ${isHovered || isOverlay ? 'shadow-md scale-[1.02]' : ''}
                ${conflictClass}
                ${isOverlay ? 'shadow-xl cursor-grabbing scale-[1.05]' : ''}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
            onClick={(e) => {
                // Prevent drag from triggering click if they are just dragging
                if (!isLocked && !isDragging) onEdit?.(entry);
            }}
        >
            {hasConflict && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm z-10">
                    <AlertTriangle size={10} className="text-white" />
                </div>
            )}

            <div className="flex justify-between items-start mb-1.5">
                <span className="text-xs font-bold truncate pr-2 leading-tight select-none">{entry.subject_name}</span>
                {!isLocked && (
                    <div className="relative z-20">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            className={`p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                            onPointerDown={(e) => e.stopPropagation()} // stop drag on menu click
                        >
                            <MoreHorizontal size={12} />
                        </button>
                        
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

            <div className="flex justify-between items-center text-[10px] opacity-80 font-medium gap-2 select-none">
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
            
            {entry.subject_code && (
                <div className="mt-1.5 text-[9px] uppercase tracking-wide opacity-50 font-mono select-none">
                    {entry.subject_code}
                </div>
            )}
        </div>
    );
};

const TimetableCell = memo(({ 
    entry, 
    periodKey, 
    periodType,
    dayIdx,
    periodStart,
    periodEnd,
    onEdit, 
    onDelete, 
    onAssign,
    isLocked,
    hasConflict,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const { isOver, setNodeRef } = useDroppable({
        id: `${dayIdx}-${periodKey}`,
        data: { dayIdx, periodStart, periodEnd },
        disabled: isLocked,
    });

    if (periodType === 'Break' || periodType === 'Lunch' || periodType === 'break' || periodType === 'lunch') {
        return (
            <td className="p-2 border-b border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">
                    {periodType}
                </span>
            </td>
        );
    }

    return (
        <td 
            ref={setNodeRef}
            className={`
                p-2 border-b border-r border-slate-200 dark:border-slate-700 relative group transition-colors 
                ${!entry ? 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-700/20'}
                ${isOver ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-400 ring-inset' : ''}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {!entry ? (
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
            ) : (
                <DraggableSlotCard 
                    entry={entry} 
                    hasConflict={hasConflict} 
                    isLocked={isLocked} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                />
            )}
        </td>
    );
});

TimetableCell.displayName = 'TimetableCell';

const WeeklyTimetable = ({ 
    weeklyView, 
    slots, 
    periods: externalPeriods,
    timetable, 
    timeSlots,
    onEditSlot,
    onDeleteSlot,
    onAssignSlot,
    onMoveSlot,
    isLocked = false,
    conflicts = [],
}) => {
    const [activeDragItem, setActiveDragItem] = useState(null);

    const timePeriods = useMemo(() => {
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

        return (timeSlots ?? []).map((s) => ({
            id: s.id,
            key: `${s.start}-${s.end}`,
            start: s.start,
            end: s.end,
            name: s.name,
            type: s.type,
        }));
    }, [externalPeriods, slots, timeSlots]);

    const cellMap = useMemo(() => {
        const map = {};
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

    const daysToShow = useMemo(() => {
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

    const hasConflict = useCallback((slotId) => conflicts.includes(slotId), [conflicts]);
    const handleEdit = useCallback((entry) => onEditSlot?.(entry), [onEditSlot]);
    const handleDelete = useCallback((entry) => onDeleteSlot?.(entry), [onDeleteSlot]);
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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require dragging 8px before activating, prevents accidental drags on click
            },
        })
    );

    const handleDragStart = (event) => {
        setActiveDragItem(event.active.data.current);
    };

    const handleDragEnd = (event) => {
        setActiveDragItem(null);
        const { active, over } = event;
        
        if (!over) return;
        
        const draggedSlot = active.data.current;
        const dropData = over.data.current;
        
        if (draggedSlot && dropData && onMoveSlot) {
            // Check if it was dropped in the exact same spot
            if (draggedSlot.day_of_week === dropData.dayIdx && 
                draggedSlot.start_time === dropData.periodStart) {
                return;
            }
            
            onMoveSlot(draggedSlot.id, {
                day_of_week: dropData.dayIdx,
                start_time: dropData.periodStart,
                end_time: dropData.periodEnd,
            });
        }
    };

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
            {isLocked && (
                <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center gap-2">
                    <Lock size={14} className="text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        Timetable is locked — editing disabled
                    </span>
                </div>
            )}

            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse min-w-[800px]">
                        <thead className="sticky top-0 z-20">
                            <tr>
                                <th className="p-4 border-b border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 min-w-[90px] sticky left-0 z-30">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Day / Period
                                    </span>
                                </th>

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

                                    {timePeriods.map((period) => {
                                        const entry = cellMap[dayIdx]?.[period.key];
                                        return (
                                            <TimetableCell
                                                key={`${dayIdx}-${period.key}`}
                                                entry={entry}
                                                periodKey={period.key}
                                                periodType={period.type}
                                                periodStart={period.start}
                                                periodEnd={period.end}
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

                <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                    {activeDragItem ? (
                        <div className="w-[120px] shadow-2xl opacity-90 cursor-grabbing">
                            <DraggableSlotCard 
                                entry={activeDragItem} 
                                hasConflict={hasConflict(activeDragItem.id)} 
                                isLocked={true} 
                                isOverlay={true}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default memo(WeeklyTimetable);
