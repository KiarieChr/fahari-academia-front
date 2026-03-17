import React, { useState, useEffect } from 'react';
import { BookOpen, Layers, Library, Users, CheckSquare, GraduationCap, BarChart3, PieChart, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { curriculumService } from '../../../../services/curriculumService';

const MetricCard = ({ title, count, icon: Icon, color, status, loading }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-gray-800" />
            </div>
            {status && (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {status}
                </span>
            )}
        </div>
        <div className="mt-4">
            {loading ? (
                <div className="h-8 w-12 bg-gray-100 animate-pulse rounded"></div>
            ) : (
                <h3 className="text-2xl font-bold text-gray-900">{count}</h3>
            )}
            <p className="text-gray-500 text-sm">{title}</p>
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

    // Calculate max for percentage bars
    const maxSubjectCount = stats?.subject_distribution?.length > 0
        ? Math.max(...stats.subject_distribution.map(s => s.count))
        : 1;

    const barColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];

    return (
        <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <MetricCard
                    title="Total Curricula"
                    count={stats?.metrics?.total_curricula || 0}
                    icon={BookOpen}
                    color="bg-blue-100"
                    loading={loading}
                />
                <MetricCard
                    title="Active Curricula"
                    count={stats?.metrics?.active_curricula || 0}
                    icon={CheckSquare}
                    color="bg-green-100"
                    status="Active"
                    loading={loading}
                />
                <MetricCard
                    title="Total Subjects"
                    count={stats?.metrics?.total_subjects || 0}
                    icon={Library}
                    color="bg-purple-100"
                    loading={loading}
                />
                <MetricCard
                    title="Classes Covered"
                    count={stats?.metrics?.classes_covered || 0}
                    icon={Users}
                    color="bg-orange-100"
                    loading={loading}
                />
                <MetricCard
                    title="Learning Areas"
                    count={stats?.metrics?.learning_areas || 0}
                    icon={Layers}
                    color="bg-pink-100"
                    loading={loading}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subjects per Curriculum */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <BarChart3 size={18} className="text-gray-400" />
                            Subjects Distribution
                        </h4>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="animate-spin text-gray-400" size={24} />
                        </div>
                    ) : stats?.subject_distribution?.length > 0 ? (
                        <div className="space-y-4">
                            {stats.subject_distribution.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-gray-600">{item.name}</span>
                                        <span className="text-gray-500">{item.count} Subjects</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${barColors[idx % barColors.length]} rounded-full transition-all duration-500`}
                                            style={{ width: `${(item.count / maxSubjectCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">No subjects configured yet</div>
                    )}
                </div>

                {/* Class Coverage */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <Layers size={18} className="text-gray-400" />
                            Class Coverage
                        </h4>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="animate-spin text-gray-400" size={24} />
                        </div>
                    ) : stats?.class_coverage?.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {stats.class_coverage.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{item.level}</p>
                                        <p className="text-xs text-blue-600">{item.curriculum}</p>
                                    </div>
                                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                        {item.classes} Classes
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">No classes configured yet</div>
                    )}
                </div>

                {/* Subject Type Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <PieChart size={18} className="text-gray-400" />
                            Subject Types
                        </h4>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="animate-spin text-gray-400" size={24} />
                        </div>
                    ) : stats?.type_distribution?.length > 0 ? (
                        <>
                            <div className="flex items-center justify-center h-32 relative">
                                <div className="text-center">
                                    <span className="text-3xl font-bold text-gray-800">
                                        {stats.type_distribution.reduce((acc, t) => acc + t.value, 0)}
                                    </span>
                                    <p className="text-xs text-gray-500">Total Subjects</p>
                                </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                {stats.type_distribution.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            ></span>
                                            <span className="text-gray-600">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-800">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500 py-8">No subject types configured</div>
                    )}
                </div>
            </div>

            {/* Learning Area Distribution */}
            {stats?.area_distribution?.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <GraduationCap size={18} className="text-gray-400" />
                            Subjects by Learning Area
                        </h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {stats.area_distribution.map((area, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-lg border border-gray-100 text-center hover:shadow-md transition-all"
                                style={{ borderLeftColor: area.color, borderLeftWidth: '4px' }}
                            >
                                <p className="text-2xl font-bold text-gray-800">{area.count}</p>
                                <p className="text-xs text-gray-500 mt-1">{area.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurriculumOverview;
