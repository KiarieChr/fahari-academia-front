import React from 'react';
import { BookOpen, Star, Beaker, Archive, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, count, icon: Icon, color, subtext }) => (
    <motion.div
        whileHover={{ y: -2 }}
        className={`bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group`}
    >
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-10 ${color}`}></div>
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{count}</h3>
                <p className="text-[10px] text-slate-400 mt-1">{subtext}</p>
            </div>
            <div className={`p-2 rounded-lg ${color} bg-opacity-20 text-opacity-100`}>
                <Icon size={20} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
    </motion.div>
);

const SubjectsStats = ({ subjects }) => {
    const total = subjects.length;
    const core = subjects.filter(s => s.category === 'Core').length;
    const practical = subjects.filter(s => s.type === 'Practical').length;
    const inactive = subjects.filter(s => s.status === 'Inactive').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StatCard
                title="Total Subjects"
                count={total}
                icon={BookOpen}
                color="bg-blue-500"
                subtext="Across all curriculums"
            />
            <StatCard
                title="Core Subjects"
                count={core}
                icon={Star}
                color="bg-emerald-500"
                subtext="Compulsory for students"
            />
            <StatCard
                title="Practical / Tech"
                count={practical}
                icon={Beaker}
                color="bg-purple-500"
                subtext="Requiring lab/studio"
            />
            <StatCard
                title="Inactive"
                count={inactive}
                icon={Archive}
                color="bg-slate-500"
                subtext="Archived or Disabled"
            />
        </div>
    );
};

export default SubjectsStats;
