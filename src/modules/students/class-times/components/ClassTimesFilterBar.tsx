import React from 'react';
import { Filter, RefreshCcw } from 'lucide-react';

/**
 * ClassTimesFilterBar
 * Props:
 *   classSessions  — array of {id, name, grade_name, term_name, ...} from API
 *   filters        — current filter state { classSessionId, ... }
 *   onFiltersChange— setter function
 */
const ClassTimesFilterBar = ({ classSessions = [], filters = {}, onFiltersChange }) => {
    const update = (key, value) => {
        onFiltersChange?.({ ...filters, [key]: value || null });
    };

    const reset = () => {
        onFiltersChange?.({ classSessionId: null });
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between">
            <div className="flex flex-wrap gap-3 flex-1">
                {/* Class Session */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Class</label>
                    <select
                        value={filters.classSessionId ?? ''}
                        onChange={(e) => update('classSessionId', e.target.value ? Number(e.target.value) : null)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Classes</option>
                        {classSessions.map((cs) => (
                            <option key={cs.id} value={cs.id}>
                                {cs.name ?? `${cs.grade_name} – ${cs.term_name}`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Day filter (local UI only — weekly view already shows all days) */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Day</label>
                    <select
                        value={filters.day ?? ''}
                        onChange={(e) => update('day', e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Days</option>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={reset}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Reset Filters"
                >
                    <RefreshCcw size={18} />
                </button>
                <button className="px-4 py-2 bg-slate-900 text-white dark:bg-blue-600 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <Filter size={16} /> Apply
                </button>
            </div>
        </div>
    );
};

export default ClassTimesFilterBar;

