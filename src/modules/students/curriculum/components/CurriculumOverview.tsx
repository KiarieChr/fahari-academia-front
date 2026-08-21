import React, { useState, useEffect } from 'react';
import { BookOpen, Layers, Library, Users, CheckSquare, GraduationCap, BarChart3, PieChart, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { curriculumService } from '../../../../services/curriculumService';

const getIconGradient = (color) => {
    if (color.includes('indigo')) return 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)';
    if (color.includes('emerald')) return 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
    if (color.includes('violet')) return 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)';
    if (color.includes('amber')) return 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
    return 'linear-gradient(135deg, #dc2626 0%, #f43f5e 100%)';
};

const MetricCard = ({ title, count, icon: Icon, color, status, loading }) => {
    const iconColor = color.replace('bg-', 'text-');
    
    // We can extract the actual color code for glows
    let hexColor = '#4f46e5';
    if(color.includes('emerald')) hexColor = '#10b981';
    if(color.includes('violet')) hexColor = '#8b5cf6';
    if(color.includes('amber')) hexColor = '#f59e0b';
    if(color.includes('rose')) hexColor = '#f43f5e';

    return (
        <div className="group p-6 neo-card relative overflow-hidden transition-all duration-500">
            {/* Ambient Glow */}
            <div 
                className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-20 dark:opacity-10 transition-all duration-700 pointer-events-none group-hover:scale-150 group-hover:opacity-40" 
                style={{ background: hexColor }}
            />
            
            <div className="relative flex justify-between items-start z-10 mb-8">
                <div 
                    className={`w-14 h-14 rounded-[20px] flex items-center justify-center ${iconColor} neo-pressed transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`} 
                >
                    <Icon size={26} strokeWidth={2.5} />
                </div>
                {status && (
                    <span className="text-[9px] font-black px-3 py-1 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 uppercase tracking-widest animate-pulse shadow-sm">
                        {status}
                    </span>
                )}
            </div>
            
            <div className="relative space-y-1 z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{title}</p>
                {loading ? (
                    <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-xl mt-1"></div>
                ) : (
                    <h3 className="text-4xl font-black tracking-tighter text-gray-700">{count}</h3>
                )}
            </div>
        </div>
    );
};

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3">
                {/* Subject Distribution */}
                <div 
                    className="p-6 neo-card relative overflow-hidden group transition-all duration-300"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
                        <BarChart3 size={160} />
                    </div>
                    <div className="relative mb-8 flex items-center justify-between z-10">
                        <div className="space-y-1">
                            <h4 className="text-xl font-black tracking-tight text-gray-700">Subjects Distribution</h4>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Inventory by Framework</p>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex flex-col gap-6 relative z-10">
                            {[1, 2, 3].map(i => <div key={i} className="h-4 bg-gray-200 animate-pulse rounded-full w-full" />)}
                        </div>
                    ) : stats?.subject_distribution?.length > 0 ? (
                        <div className="space-y-7 relative z-10">
                            {stats.subject_distribution.map((item, idx) => (
                                <div key={idx} className="group/item">
                                    <div className="flex justify-between items-end mb-2.5">
                                        <span className="text-sm font-black text-gray-600">{item.name}</span>
                                        <span className="text-[11px] font-black neo-text-accent px-2.5 py-0.5 rounded-lg border border-indigo-100">{item.count} UNIT{(item.count !== 1) ? 'S' : ''}</span>
                                    </div>
                                    <div className="h-3.5 w-full neo-pressed rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${barColors[idx % barColors.length]} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                                            style={{ width: `${(item.count / maxSubjectCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 neo-pressed rounded-full flex items-center justify-center mx-auto mb-4">
                                <Library className="text-gray-400" size={24} />
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Subjects Cataloged</p>
                        </div>
                    )}
                </div>

                {/* Class Coverage */}
                <div 
                    className="p-6 neo-card transition-all duration-300 lg:col-span-2"
                >
                    <div className="mb-8 space-y-1">
                        <h4 className="text-xl font-black tracking-tight text-gray-700">Class Coverage</h4>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Structural Implementation</p>
                    </div>
                    
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-2xl w-full" />)}
                        </div>
                    ) : stats?.class_coverage?.length > 0 ? (
                        <div className="space-y-3 max-h-[420px] pr-2 overflow-y-auto custom-scrollbar">
                            {stats.class_coverage.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex items-center justify-between p-4 rounded-[22px] neo-btn transition-all duration-300 transform w-full text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 neo-pressed rounded-[18px] flex items-center justify-center neo-text-accent">
                                            <Users size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-black text-left text-gray-700">{item.level}</p>
                                            <p className="text-[11px] font-black uppercase tracking-widest mt-1 text-left neo-text-accent bg-indigo-50 inline-block px-2 py-0.5 rounded-md">{item.curriculum}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Enrolled</span>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                                            <span className="text-sm font-black">{item.students}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                            <GraduationCap size={48} className="mb-4 opacity-50" />
                            <span className="text-sm font-bold uppercase tracking-widest">No Class Data</span>
                        </div>
                    )}
                </div>

                {/* Subject Types */}
                <div 
                    className="p-6 neo-card flex flex-col transition-all duration-300"
                >
                    <div className="mb-8 space-y-1">
                        <h4 className="text-xl font-black tracking-tight text-gray-700">Subject Classification</h4>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Functional Distribution</p>
                    </div>
                    
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="animate-spin text-indigo-600" size={40} />
                        </div>
                    ) : stats?.type_distribution?.length > 0 ? (
                        <div className="flex-1 flex flex-col justify-center gap-8">
                            <div className="relative flex items-center justify-center h-48">
                                <div className="absolute inset-0 border-[16px] rounded-full border-gray-100 shadow-[inset_0_4px_20px_rgba(0,0,0,0.03)]" />
                                <div className="text-center z-10">
                                    <span className="text-5xl font-black tracking-tighter text-gray-700">
                                        {stats.type_distribution.reduce((acc, t) => acc + t.value, 0)}
                                    </span>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] mt-1 text-gray-400">Total Units</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {stats.type_distribution.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className="flex items-center justify-between p-4 rounded-2xl neo-btn w-full transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full shadow-inner shadow-black/20"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-sm font-bold text-gray-600">{item.name}</span>
                                        </div>
                                        <span className="text-base font-black text-gray-700">{item.value}</span>
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
                <div 
                    className="p-8 neo-card relative overflow-hidden"
                >
                    <div className="relative mb-10 space-y-1">
                        <h4 className="text-xl font-black tracking-tight text-gray-700">Learning Area Distribution</h4>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Cognitive Domains and Expertise</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {stats.area_distribution.map((area, idx) => (
                            <div
                                key={idx}
                                className="group p-6 rounded-[24px] neo-btn text-center cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300"
                            >
                                <div 
                                    className="w-12 h-1.5 mx-auto mb-6 rounded-full group-hover:w-16 transition-all duration-500"
                                    style={{ backgroundColor: area.color }}
                                />
                                <p className="text-4xl font-black text-gray-700 relative z-10">{area.count}</p>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-3 leading-tight relative z-10 group-hover:text-gray-700 transition-colors duration-300">{area.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurriculumOverview;
