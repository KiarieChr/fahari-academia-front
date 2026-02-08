import React from 'react';
import { AlertTriangle, AlertCircle, XCircle } from 'lucide-react';

const ConflictPanel = ({ conflicts }) => {
    if (!conflicts || conflicts.length === 0) return null;

    return (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg shrink-0 mt-0.5">
                    <AlertTriangle size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-red-800 dark:text-red-200 text-sm uppercase tracking-wide mb-2">
                        Schedule Conflicts Needed Attention ({conflicts.length})
                    </h3>
                    <div className="space-y-2">
                        {conflicts.map((conflict) => (
                            <div key={conflict.id} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300 bg-white dark:bg-slate-800/50 p-2 rounded border border-red-100 dark:border-red-900/50">
                                <XCircle size={14} className="mt-0.5 shrink-0" />
                                <div>
                                    <span className="font-bold mr-1">{conflict.type}:</span>
                                    {conflict.description}
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
