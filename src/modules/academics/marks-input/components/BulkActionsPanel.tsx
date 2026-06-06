import React from 'react';
import { Trash2, Edit3, UserCheck, UserX, MoreHorizontal } from 'lucide-react';

const BulkActionsPanel = ({ selectedCount, onAction }) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl shadow-xl px-4 py-3 flex items-center gap-4 border border-slate-800 dark:border-slate-200">
                <div className="flex items-center gap-2 border-r border-slate-700 dark:border-slate-200 pr-4">
                    <span className="font-bold whitespace-nowrap">{selectedCount} Selected</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onAction('markPresent')}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
                        title="Mark Selected as Present"
                    >
                        <UserCheck size={16} /> <span className="hidden sm:inline">Present</span>
                    </button>

                    <button
                        onClick={() => onAction('markAbsent')}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-900/50 hover:text-red-200 dark:hover:bg-red-50 dark:hover:text-red-700 rounded-lg transition-colors text-sm font-medium"
                        title="Mark Selected as Absent"
                    >
                        <UserX size={16} /> <span className="hidden sm:inline">Absent</span>
                    </button>

                    <button
                        onClick={() => onAction('fillZeros')}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
                        title="Fill Empty with 0"
                    >
                        <Edit3 size={16} /> <span className="hidden sm:inline">Fill 0</span>
                    </button>

                    <button
                        onClick={() => onAction('clear')}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-900/50 hover:text-red-200 dark:hover:bg-red-50 dark:hover:text-red-700 rounded-lg transition-colors text-sm font-medium"
                        title="Clear Marks"
                    >
                        <Trash2 size={16} /> <span className="hidden sm:inline">Clear</span>
                    </button>

                    <div className="h-4 w-px bg-slate-700 dark:bg-slate-300 mx-1"></div>

                    <button
                        className="p-1.5 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkActionsPanel;
