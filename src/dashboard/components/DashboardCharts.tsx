import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    PieChart,
    Pie,
    LineChart,
    Line,
    Legend,
    AreaChart,
    Area
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const DashboardCharts = () => {
    const [data, setData] = useState({
        finance: [],
        workforce: [],
        loading: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [payroll, finance] = await Promise.all([
                    api.workforce.getPayrollSummary(),
                    api.fees.getInsights()
                ]);

                const financeData = finance.data || finance;
                
                // 1. Prepare Revenue vs Expenses Data
                const financialHealth = [
                    {
                        name: 'Revenue (Fees)',
                        amount: financeData.collection?.total_collected || 0,
                        color: '#10b981'
                    },
                    {
                        name: 'Expenses (Payroll)',
                        amount: payroll.gross_payroll || 0,
                        color: '#f43f5e'
                    }
                ];

                // 2. Prepare Invoicing Status Data
                const invoicingStatus = [
                    { name: 'Invoiced', value: financeData.invoicing?.invoiced || 0 },
                    { name: 'Pending', value: financeData.invoicing?.not_invoiced || 0 }
                ];

                setData({
                    financialHealth,
                    invoicingStatus,
                    loading: false
                });
            } catch (error) {
                console.error("Failed to fetch chart data", error);
                setData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchData();
    }, []);

    const COLORS = ['#6366f1', '#e2e8f0'];

    if (data.loading) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-300" size={32} />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Financial Health Comparison */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm"
            >
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <BarChart3 size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Financial Health</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-tighter font-semibold">Revenue vs Payroll</p>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.financialHealth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                tickFormatter={(value) => `KSh ${value > 1000 ? (value / 1000) + 'k' : value}`}
                            />
                            <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={60}>
                                {data.financialHealth?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Invoicing Coverage */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm"
            >
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <PieChartIcon size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Invoicing Coverage</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-tighter font-semibold">Term Enrolment Status</p>
                    </div>
                </div>

                <div className="h-[250px] w-full flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.invoicingStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.invoicingStatus?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-slate-800">
                            {data.invoicingStatus?.[0]?.value + data.invoicingStatus?.[1]?.value}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Total Students</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DashboardCharts;
