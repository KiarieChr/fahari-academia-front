import React from 'react';
import { Layers, CheckCircle, AlertTriangle, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, count, icon: Icon, color, subtext }) => (
    <motion.div
        whileHover={{ y: -2 }}
        className={`bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between`}
    >
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{count}</h3>
            <p className="text-[10px] text-slate-400 mt-1">{subtext}</p>
        </div>
        <div className={`p-1 rounded-lg ${color} bg-opacity-20 text-opacity-100`}>
            <Icon size={20} className={color.replace('bg-', 'text-')} />
        </div>
    </motion.div>
);

const AllocationStats = ({ allocations, teachers }) => {
    const totalAllocations = allocations.length;
    const unallocated = allocations.filter(a => !a.teacherId).length;
    const teachersCount = new Set(allocations.map(a => a.teacherId).filter(Boolean)).size;
    const overloadedTeachers = teachers.filter(t => t.currentLoad > t.maxLoad).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-3">
            <StatCard
                title="Allocated Subjects"
                count={totalAllocations}
                icon={BookOpen}
                color="bg-blue-500"
                subtext="Total subject assignments"
            />
            <StatCard
                title="Unassigned Subjects"
                count={unallocated}
                icon={AlertTriangle}
                color="bg-amber-500"
                subtext="Classes without teachers"
            />
            <StatCard
                title="Active Teachers"
                count={teachersCount}
                icon={Users}
                color="bg-emerald-500"
                subtext="Teachers with classes"
            />
            <StatCard
                title="Conflicts / Overload"
                count={overloadedTeachers}
                icon={AlertTriangle}
                color="bg-red-500"
                subtext="Teachers exceeding load"
            />
        </div>
    );
};

export default AllocationStats;
