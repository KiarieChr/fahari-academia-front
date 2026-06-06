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

const MetricCard = ({ title, count, icon: Icon, color, status, loading }) => (
    <div 
        className="group p-6 rounded-[28px] border transition-all duration-500 relative overflow-hidden transform hover:-translate-y-1.5 hover:shadow-xl"
        style={{ 
            background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(99, 102, 241, 0.02) 100%)', 
            borderColor: 'var(--border-color-light)', 
            boxShadow: 'var(--shadow-card)' 
        }}
    >
        {/* Glow decoration inside the card */}
        <div 
            className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-all duration-700 pointer-events-none" 
            style={{ 
                background: color.includes('indigo') ? 'var(--primary-color)' 
                          : color.includes('emerald') ? '#10b981' 
                          : color.includes('violet') ? '#8b5cf6' 
                          : color.includes('amber') ? '#f59e0b' 
                          : '#f43f5e' 
            }}
        />
        
        <div className="relative flex justify-between items-start z-10">
            <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-all duration-500 group-hover:scale-110" 
                style={{ background: getIconGradient(color) }}
            >
                <Icon size={26} />
            </div>
            {status && (
                <span className="text-[9px] font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/60 uppercase tracking-widest animate-pulse">
                    {status}
                </span>
            )}
        </div>
        
        <div className="relative mt-6 space-y-1 z-10">
            {loading ? (
                <div className="h-9 w-20 bg-gray-100 animate-pulse rounded-xl"></div>
            ) : (
                <h3 className="text-3.5xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>{count}</h3>
            )}
            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{title}</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3">
                {/* Subject Distribution */}
                <div 
                    className="p-3 rounded-[32px] border relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BarChart3 size={120} />
                    </div>
                    <div className="relative mb-8 flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Subjects Distribution</h4>
                            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Inventory by Framework</p>
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
                                        <span className="text-sm font-black" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                                        <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{item.count} UNIT{(item.count !== 1) ? 'S' : ''}</span>
                                    </div>
                                    <div className="h-3.5 w-full bg-slate-50 dark:bg-slate-800/20 rounded-full overflow-hidden border" style={{ borderColor: 'var(--border-color-light)' }}>
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
                <div 
                    className="p-3 rounded-[32px] border hover:shadow-lg transition-all duration-300"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
                >
                    <div className="mb-8 space-y-1">
                        <h4 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Class Coverage</h4>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Structural Implementation</p>
                    </div>
                    
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-2xl w-full" />)}
                        </div>
                    ) : stats?.class_coverage?.length > 0 ? (
                        <div className="space-y-4 max-h-[420px] pr-2 overflow-y-auto custom-scrollbar">
                            {stats.class_coverage.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex items-center justify-between p-3 rounded-[22px] border transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md cursor-pointer mb-3"
                                    style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-gray-100 dark:border-slate-700">
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-black text-left" style={{ color: 'var(--text-main)' }}>{item.level}</p>
                                            <p className="text-[11px] font-black uppercase tracking-widest mt-0.5 text-left" style={{ color: 'var(--primary-color)' }}>{item.curriculum}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black leading-none" style={{ color: 'var(--text-main)' }}>{item.classes}</p>
                                        <p className="text-[10px] font-bold uppercase mt-1" style={{ color: 'var(--text-muted)' }}>Sections</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 font-bold uppercase text-xs tracking-widest">Registry Empty</div>
                    )}
                </div>

                {/* Subject Types */}
                <div 
                    className="p-3 rounded-[32px] border flex flex-col hover:shadow-lg transition-all duration-300"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
                >
                    <div className="mb-8 space-y-1">
                        <h4 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Subject Classification</h4>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Functional Distribution</p>
                    </div>
                    
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="animate-spin text-indigo-600" size={40} />
                        </div>
                    ) : stats?.type_distribution?.length > 0 ? (
                        <div className="flex-1 flex flex-col justify-center gap-8">
                            <div className="relative flex items-center justify-center h-48">
                                <div className="absolute inset-0 border-[16px] rounded-full" style={{ borderColor: 'var(--bg-light)' }} />
                                <div className="text-center z-10">
                                    <span className="text-5xl font-black tracking-tighter" style={{ color: 'var(--text-main)' }}>
                                        {stats.type_distribution.reduce((acc, t) => acc + t.value, 0)}
                                    </span>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--text-muted)' }}>Total Units</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {stats.type_distribution.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className="flex items-center justify-between p-4 rounded-2xl border hover:shadow-sm transition-all"
                                        style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full shadow-inner shadow-black/10"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                                        </div>
                                        <span className="text-base font-black" style={{ color: 'var(--text-main)' }}>{item.value}</span>
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
                    className="p-4 rounded-[32px] border relative overflow-hidden"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
                >
                    <div className="relative mb-10 space-y-1">
                        <h4 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Learning Area Distribution</h4>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Cognitive Domains and Expertise</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {stats.area_distribution.map((area, idx) => (
                            <div
                                key={idx}
                                className="group p-6 rounded-[24px] border bg-white dark:bg-slate-800 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-indigo-700 transition-all duration-500 text-center shadow-sm hover:shadow-xl cursor-pointer transform hover:-translate-y-1.5 hover:text-white"
                                style={{ borderColor: 'var(--border-color-light)' }}
                            >
                                <div 
                                    className="w-12 h-1 bg-indigo-500 mx-auto mb-6 rounded-full group-hover:w-full transition-all duration-500"
                                    style={{ backgroundColor: area.color }}
                                />
                                <p className="text-4xl font-black text-slate-800 group-hover:text-white transition-colors duration-500" style={{ color: 'inherit' }}>{area.count}</p>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3 leading-tight group-hover:text-indigo-200 transition-colors duration-500" style={{ color: 'inherit' }}>{area.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurriculumOverview;
