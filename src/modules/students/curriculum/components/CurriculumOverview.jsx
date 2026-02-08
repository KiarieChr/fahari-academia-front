import React from 'react';
import { BookOpen, Layers, Library, Users, CheckSquare, GraduationCap, BarChart3, PieChart } from 'lucide-react';

const MetricCard = ({ title, count, icon: Icon, color, status }) => (
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
            <h3 className="text-2xl font-bold text-gray-900">{count}</h3>
            <p className="text-gray-500 text-sm">{title}</p>
        </div>
    </div>
);

const CurriculumOverview = () => {
    return (
        <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <MetricCard
                    title="Total Curricula"
                    count="4"
                    icon={BookOpen}
                    color="bg-blue-100"
                />
                <MetricCard
                    title="Active Curriculum"
                    count="2"
                    icon={CheckSquare}
                    color="bg-green-100"
                    status="Active"
                />
                <MetricCard
                    title="Total Subjects"
                    count="42"
                    icon={Library}
                    color="bg-purple-100"
                />
                <MetricCard
                    title="Classes Covered"
                    count="18"
                    icon={Users}
                    color="bg-orange-100"
                />
                <MetricCard
                    title="Learning Areas"
                    count="8"
                    icon={Layers}
                    color="bg-pink-100"
                />
                <MetricCard
                    title="Assessment Types"
                    count="5"
                    icon={GraduationCap}
                    color="bg-indigo-100"
                />
            </div>

            {/* Charts Section (Mock) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subjects per Curriculum */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <BarChart3 size={18} className="text-gray-400" />
                            Subjects Distribution
                        </h4>
                    </div>
                    {/* Mock Bar Chart */}
                    <div className="space-y-4">
                        {[
                            { label: 'CBC (Primary)', val: 85, color: 'bg-blue-500' },
                            { label: '8-4-4 (Secondary)', val: 60, color: 'bg-green-500' },
                            { label: 'IGCSE', val: 30, color: 'bg-purple-500' },
                            { label: 'Checkpoints', val: 45, color: 'bg-orange-500' },
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-gray-600">{item.label}</span>
                                    <span className="text-gray-500">{item.val} Subj</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} rounded-full`}
                                        style={{ width: `${item.val}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Curriculum Coverage */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <Layers size={18} className="text-gray-400" />
                            Class Coverage
                        </h4>
                    </div>
                    {/* Mock Stacked Bar or List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Grade 1 - 6</p>
                                <p className="text-xs text-blue-600">CBC Curriculum</p>
                            </div>
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">100%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Grade 7 - 9</p>
                                <p className="text-xs text-purple-600">JSS / CBC</p>
                            </div>
                            <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">85%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Form 1 - 4</p>
                                <p className="text-xs text-green-600">8-4-4 System</p>
                            </div>
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">100%</span>
                        </div>
                    </div>
                </div>

                {/* Assessment Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <PieChart size={18} className="text-gray-400" />
                            Assessment Weight
                        </h4>
                    </div>
                    <div className="flex items-center justify-center h-48 relative">
                        {/* CSS-only simple pie representation or placeholder */}
                        <div className="w-32 h-32 rounded-full border-8 border-indigo-500 border-r-pink-500 border-b-yellow-500 border-l-blue-500 transform rotate-45"></div>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-bold text-gray-800">100%</span>
                            <span className="text-xs text-gray-500">Total</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Exams (40%)</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 bg-pink-500 rounded-full"></span> Projects (20%)</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> CATs (30%)</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Oral (10%)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurriculumOverview;
