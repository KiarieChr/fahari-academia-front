
import React from 'react';
import { motion } from 'framer-motion';

const ReportsTabs = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex shadow-sm overflow-x-auto max-w-full">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap relative
                        ${activeTab === tab ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                    `}
                >
                    {activeTab === tab && (
                        <motion.div
                            layoutId="activeReportTab"
                            className="absolute inset-0 bg-slate-100 rounded-lg shadow-sm border border-slate-200/50"
                            style={{ zIndex: -1 }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    {tab}
                </button>
            ))}
        </div>
    );
};

export default ReportsTabs;
