import React from 'react';
import { Layers, CheckCircle, AlertTriangle, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, count, icon: Icon, color, subtext }) => (
    <motion.div
        whileHover={{ y: -2 }}
        className="neo-card p-5 border-none flex flex-col justify-between relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-slate-50 opacity-50 rounded-bl-[100px] pointer-events-none" />
        <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{count}</h3>
            <p className="text-xs font-bold text-slate-400 mt-2">{subtext}</p>
        </div>
        <div className={`mt-4 w-12 h-12 rounded-2xl neo-bg shadow-sm border border-slate-100/50 flex items-center justify-center relative z-10 ${color.replace('bg-', 'text-')}`}>
            <Icon size={24} />
        </div>
    </motion.div>
);

const AllocationStats = ({ allocations, teachers }) => {
    const totalAllocations = allocations.length;
    const unallocated = allocations.filter(a => !a.teacherId).length;
    const teachersCount = new Set(allocations.map(a => a.teacherId).filter(Boolean)).size;
    const overloadedTeachers = teachers.filter(t => t.currentLoad > t.maxLoad).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-3">
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
