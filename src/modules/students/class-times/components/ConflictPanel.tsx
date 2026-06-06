import React from 'react';
import { AlertTriangle, XCircle, Calendar } from 'lucide-react';

/**
 * ConflictPanel
 * Props:
 *  conflicts — array of TimetableException objects from API OR legacy mock objects
 *              API shape: { id, date_from, date_to, reason, exception_type,
 *                           exception_type_display, affects_all_classes }
 *              Mock shape: { id, type, description, severity }
 */
const ConflictPanel = ({ conflicts }) => {
    if (!conflicts || conflicts.length === 0) return null;

    // Normalise to a display-friendly shape
    const items = conflicts.map((c) => {
        // API shape
        if (c.exception_type !== undefined) {
            const dateRange = c.date_from === c.date_to
                ? c.date_from
                : `${c.date_from} – ${c.date_to}`;
            return {
                id: c.id,
                type: c.exception_type_display ?? c.exception_type,
                description: `${c.reason ?? 'No reason given'} (${dateRange})`,
                severity: c.exception_type === 'cancelled' ? 'High' : 'Medium',
            };
        }
        // Legacy mock shape
        return c;
    });

    return (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-2 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg shrink-0 mt-0.5">
                    <Calendar size={18} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-amber-800 dark:text-amber-200 text-sm uppercase tracking-wide mb-2">
                        Schedule Exceptions / Conflicts ({items.length})
                    </h3>
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300 bg-white dark:bg-slate-800/50 p-2 rounded border border-amber-100 dark:border-amber-900/50"
                            >
                                <XCircle size={13} className="mt-0.5 shrink-0 text-amber-500" />
                                <div>
                                    <span className="font-bold mr-1">{item.type}:</span>
                                    {item.description}
                                    {item.severity && (
                                        <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${item.severity === 'High' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {item.severity}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConflictPanel;

