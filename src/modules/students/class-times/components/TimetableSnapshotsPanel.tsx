import React, { useState } from 'react';
import { History, Camera, RotateCcw, Loader2, Calendar, FileText, Check } from 'lucide-react';

const TimetableSnapshotsPanel = ({
    versions = [],
    loading = false,
    saving = false,
    onCreateSnapshot,
    onRestoreSnapshot,
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!label.trim()) {
            setError('Snapshot label is required');
            return;
        }

        setError('');
        try {
            await onCreateSnapshot(label, description);
            setIsCreating(false);
            setLabel('');
            setDescription('');
        } catch (err) {
            setError(err.message || 'Failed to create snapshot');
        }
    };

    const handleRestore = async (versionId) => {
        if (!window.confirm('Are you sure you want to restore this snapshot? This will overwrite the current timetable.')) {
            return;
        }
        try {
            await onRestoreSnapshot(versionId);
            alert('Snapshot restored successfully!');
        } catch (err) {
            alert(err.message || 'Failed to restore snapshot');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Snapshot Form */}
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sticky top-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Camera size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Create Snapshot</h3>
                            <p className="text-xs text-slate-500">Save the current timetable state</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Label / Version Name *
                            </label>
                            <input
                                type="text"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="e.g., Term 1 Final, Mid-Term Adjustments"
                                className="w-full h-11 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional details about why you are saving this version..."
                                rows={3}
                                className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors resize-none"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={saving || !label.trim()}
                            className="w-full h-11 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                            Save Snapshot
                        </button>
                    </form>
                </div>
            </div>

            {/* Snapshots List */}
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <History size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Version History</h3>
                            <p className="text-xs text-slate-500">Previously saved snapshots</p>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {versions.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <History size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No snapshots have been created yet.</p>
                            </div>
                        ) : (
                            versions.map((version) => (
                                <div key={version.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                                                {version.label}
                                            </h4>
                                            {version.is_active && (
                                                <span className="px-2.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                                                    <Check size={10} strokeWidth={3} /> Active
                                                </span>
                                            )}
                                        </div>
                                        
                                        {version.description && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 flex items-start gap-2">
                                                <FileText size={14} className="mt-0.5 flex-shrink-0 opacity-70" />
                                                {version.description}
                                            </p>
                                        )}
                                        
                                        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {new Date(version.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                                                v{version.version_number}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={() => handleRestore(version.id)}
                                            disabled={saving || version.is_active}
                                            className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors disabled:opacity-50 text-slate-700 dark:text-slate-300"
                                        >
                                            <RotateCcw size={16} />
                                            Restore
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimetableSnapshotsPanel;
