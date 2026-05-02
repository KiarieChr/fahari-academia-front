import React, { useState, useEffect } from 'react';
import { BookOpen, Layers, Library, Users, CheckSquare, GraduationCap, BarChart3, PieChart, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { curriculumService } from '../../../../services/curriculumService';

const MetricCard = ({ title, count, icon: Icon, color, status, loading }) => (
    <div className="group bg-white p-6 rounded-[24px] border-2 border-gray-50 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex justify-between items-start">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${color.replace('bg-', 'bg-opacity-20 ')} ${color}`}>
                <Icon size={28} className={color.replace('bg-', 'text-')} />
            </div>
            {status && (
                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">
                    {status}
                </span>
            )}
        </div>
        
        <div className="relative mt-6 space-y-1">
            {loading ? (
                <div className="h-10 w-20 bg-gray-50 animate-pulse rounded-xl"></div>
            ) : (
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{count}</h3>
            )}
            <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wide">{title}</p>
        </div>
    </div>
);

const CurriculumOverview = ({ refreshKey = 0 }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
    }, [refreshKey]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const data = await curriculumService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch curriculum stats:', error);
            toast.error('Failed to load curriculum statistics');
        } finally {
            setLoading(false);
        }
    };

    const maxSubjectCount = stats?.subject_distribution?.length > 0
        ? Math.max(...stats.subject_distribution.map(s => s.count))
        : 1;

    const barColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500', 'bg-violet-500'];

    return (
        <div className="space-y-8">
            {/* ─── Metric Command Center ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <MetricCard
                    title="Total Curricula"
                    count={stats?.metrics?.total_curricula || 0}
                    icon={BookOpen}
                    color="bg-indigo-600"
                    loading={loading}
                />
                <MetricCard
                    title="Active Systems"
                    count={stats?.metrics?.active_curricula || 0}
                    icon={CheckSquare}
                    color="bg-emerald-600"
                    status="Live"
                    loading={loading}
                />
                <MetricCard
                    title="Total Subjects"
                    count={stats?.metrics?.total_subjects || 0}
                    icon={Library}
                    color="bg-violet-600"
                    loading={loading}
                />
                <MetricCard
                    title="Classes Covered"
                    count={stats?.metrics?.classes_covered || 0}
                    icon={Users}
                    color="bg-amber-600"
                    loading={loading}
                />
                <MetricCard
                    title="Learning Areas"
                    count={stats?.metrics?.learning_areas || 0}
                    icon={Layers}
                    color="bg-rose-600"
                    loading={loading}
                />
            </div>

            {/* ─── Analytics Engine ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Subject Distribution */}
                <div className="bg-white p-8 rounded-[32px] border-2 border-gray-50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BarChart3 size={120} />
                    </div>
                    <div className="relative mb-8 flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-xl font-black text-gray-900 tracking-tight">Subjects Distribution</h4>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inventory by Framework</p>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex flex-col gap-6">
                            {[1, 2, 3].map(i => <div key={i} className="h-4 bg-gray-50 animate-pulse rounded-full w-full" />)}
                        </div>
                    ) : stats?.subject_distribution?.length > 0 ? (
                        <div className="space-y-7">
                            {stats.subject_distribution.map((item, idx) => (
                                <div key={idx} className="group/item">
                                    <div className="flex justify-between items-end mb-2.5">
                                        <span className="text-sm font-black text-gray-700">{item.name}</span>
                                        <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{item.count} UNIT{(item.count !== 1) ? 'S' : ''}</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                        <div
                                            className={`h-full ${barColors[idx % barColors.length]} rounded-full transition-all duration-1000 ease-out shadow-sm group-hover/item:brightness-110`}
                                            style={{ width: `${(item.count / maxSubjectCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Library className="text-gray-300" size={24} />
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Subjects Cataloged</p>
                        </div>
                    )}
                </div>

                {/* Class Coverage */}
                <div className="bg-white p-8 rounded-[32px] border-2 border-gray-50 shadow-sm">
                    <div className="mb-8 space-y-1">
                        <h4 className="text-xl font-black text-gray-900 tracking-tight">Class Coverage</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Structural Implementation</p>
                    </div>
                    
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-2xl w-full" />)}
                        </div>
                    ) : stats?.class_coverage?.length > 0 ? (
                        <div className="space-y-4 max-h-[420px] pr-2 overflow-y-auto custom-scrollbar">
                            {stats.class_coverage.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-5 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-100 border-2 border-transparent hover:border-gray-100 rounded-[22px] transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-gray-50">
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-black text-gray-900">{item.level}</p>
                                            <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">{item.curriculum}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-gray-900 leading-none">{item.classes}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Sections</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 font-bold uppercase text-xs tracking-widest">Registry Empty</div>
                    )}
                </div>

                {/* Subject Types */}
                <div className="bg-white p-8 rounded-[32px] border-2 border-gray-50 shadow-sm flex flex-col">
                    <div className="mb-8 space-y-1">
                        <h4 className="text-xl font-black text-gray-900 tracking-tight">Subject Classification</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Functional Distribution</p>
                    </div>
                    
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="animate-spin text-indigo-600" size={40} />
                        </div>
                    ) : stats?.type_distribution?.length > 0 ? (
                        <div className="flex-1 flex flex-col justify-center gap-8">
                            <div className="relative flex items-center justify-center h-48">
                                <div className="absolute inset-0 border-[16px] border-gray-50 rounded-full" />
                                <div className="text-center z-10">
                                    <span className="text-5xl font-black text-gray-900 tracking-tighter">
                                        {stats.type_distribution.reduce((acc, t) => acc + t.value, 0)}
                                    </span>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Total Units</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {stats.type_distribution.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full shadow-inner shadow-black/10"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                        </div>
                                        <span className="text-base font-black text-gray-900">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 font-bold uppercase text-xs tracking-widest">No Categorization</div>
                    )}
                </div>
            </div>

            {/* ─── Knowledge Domains ─── */}
            {stats?.area_distribution?.length > 0 && (
                <div className="bg-white p-8 rounded-[32px] border-2 border-gray-50 shadow-sm relative overflow-hidden">
                    <div className="relative mb-10 space-y-1">
                        <h4 className="text-xl font-black text-gray-900 tracking-tight">Learning Area Distribution</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cognitive Domains and Expertise</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {stats.area_distribution.map((area, idx) => (
                            <div
                                key={idx}
                                className="group p-6 rounded-[24px] border-2 border-gray-50 bg-white hover:bg-gray-900 transition-all duration-500 text-center shadow-sm hover:shadow-2xl hover:shadow-gray-200"
                            >
                                <div 
                                    className="w-12 h-1 bg-indigo-500 mx-auto mb-6 rounded-full group-hover:w-full transition-all duration-500"
                                    style={{ backgroundColor: area.color }}
                                />
                                <p className="text-4xl font-black text-gray-900 group-hover:text-white transition-colors duration-500">{area.count}</p>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-3 leading-tight group-hover:text-indigo-400 transition-colors duration-500">{area.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurriculumOverview;
