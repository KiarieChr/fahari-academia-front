
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, PieChart } from 'lucide-react';

const ReportsCharts = ({ type, data, title }) => {
    // A simplified visual mock of a chart if Recharts isn't available or for quick prototyping.
    // In a real app, you'd use Recharts or Chart.js here.

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <BarChart2 size={18} className="text-blue-500" />
                        Attendance Trends
                    </h3>
                    <select className="text-xs border-none bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg px-2 py-1 outline-none cursor-pointer">
                        <option>Last 6 Months</option>
                        <option>Thinking Year</option>
                    </select>
                </div>

                {/* Mock Chart Visual - Bar Chart */}
                <div className="h-64 flex items-end justify-between gap-2 px-2">
                    {[65, 59, 80, 81, 56, 55, 40].map((h, i) => (
                        <div key={i} className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-t-lg relative group h-full flex flex-col justify-end">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className="w-full bg-blue-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity relative"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {h}%
                                </div>
                            </motion.div>
                            <span className="text-[10px] text-slate-400 text-center mt-2 absolute -bottom-5 left-0 right-0">Mon</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <PieChart size={18} className="text-purple-500" />
                        Leave Distribution
                    </h3>
                    <select className="text-xs border-none bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg px-2 py-1 outline-none cursor-pointer">
                        <option>Departement</option>
                        <option>Type</option>
                    </select>
                </div>

                {/* Mock Chart Visual - Pie/Donut (represented abstractly) */}
                <div className="h-64 flex items-center justify-center relative">
                    <div className="w-48 h-48 rounded-full border-[16px] border-slate-100 dark:border-slate-700 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-[16px] border-purple-500 border-l-transparent border-b-transparent rotate-45"></div>
                        <div className="absolute inset-0 rounded-full border-[16px] border-emerald-400 border-l-transparent border-t-transparent border-r-transparent rotate-[200deg]"></div>

                        <div className="text-center">
                            <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">85%</span>
                            <p className="text-xs text-slate-400">Efficiency</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ReportsCharts;
