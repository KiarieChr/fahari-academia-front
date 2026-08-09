
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, RefreshCw, Settings, ExternalLink } from 'lucide-react';

const IntegrationSettings = ({ integrations }) => {
    return (
        <div className="grid grid-cols-1 gap-4">
            {integrations.map((integration) => (
                <div
                    key={integration.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:shadow-md transition-all gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700 p-2 border border-slate-100 dark:border-slate-600 flex items-center justify-center">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{integration.name.substring(0, 3)}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100">{integration.name}</h3>
                                {integration.status === 'Connected' ? (
                                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <CheckCircle size={10} /> Active
                                    </span>
                                ) : (
                                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <AlertCircle size={10} /> Inactive
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                                Last synced: {integration.lastSync}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none py-2 px-3 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                            <Settings size={14} />
                            Configure
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <RefreshCw size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <ExternalLink size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default IntegrationSettings;
