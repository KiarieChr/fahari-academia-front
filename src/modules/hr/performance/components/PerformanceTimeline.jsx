
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Award, Settings } from 'lucide-react';

const PerformanceTimeline = ({ items }) => {
    // We map string contents to actual Icon components here if needed, 
    // but the data passed already contains component references in the previous file creation...
    // However, JSON/mock data usually doesn't store components. 
    // For safety, let's map types to icons locally as the data file imported icons but they are just objects unless rendered.
    // Wait, the data file `performanceData.js` assigned the actual Lucide components to the `icon` property.
    // So we can use them directly.

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Award size={20} className="text-amber-500" />
                Activity Timeline
            </h3>

            <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            <div className="absolute -left-[34px] p-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-slate-500 z-10">
                                <Icon size={14} />
                            </div>

                            <div>
                                <p className="text-sm text-slate-800 font-medium">
                                    <span className="text-slate-500 font-normal mr-1">[{item.type}]</span>
                                    {item.content}
                                </p>
                                <span className="text-xs text-slate-400 mt-1 block">{item.date}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <button className="w-full mt-6 py-2 text-sm text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors dashed border border-slate-200 hover:border-blue-200">
                View All History
            </button>
        </div>
    );
};

export default PerformanceTimeline;
