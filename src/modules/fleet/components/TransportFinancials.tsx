import React, { useEffect, useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, ComposedChart, Area
} from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Activity, Droplet, Wrench } from 'lucide-react';
import { fleetService } from '../../../services/fleetService';
import ContentLoader from '../../../components/common/ContentLoader';
import StatCardMini from '../../../dashboard/components/StatCardMini';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(value);
};

const Loader = () => (
    <ContentLoader size="lg" message="Loading transport financial data..." />
);

const TransportFinancials = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const res = await fleetService.getFinancialAnalytics(6);
                setData(res);
            } catch (err) {
                console.error(err);
                setError('Failed to load transport financial data.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-4"><Loader /></div>;
    if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-lg m-4">{error}</div>;
    if (!data) return null;

    const { summary, chart_data } = data;
    const isProfitable = summary.net_profit >= 0;

    return (
        <div className="space-y-6">
            {/* Soft UI KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-green-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className="p-2 bg-green-100 text-green-700 rounded-xl">
                            <TrendingUp size={20} />
                        </div>
                        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Transport Income</h4>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 relative z-10">{formatCurrency(summary.total_income)}</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-red-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                            <AlertTriangle size={20} />
                        </div>
                        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Expenses</h4>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 relative z-10">{formatCurrency(summary.total_expense)}</p>
                </div>

                <div className={`bg-white rounded-2xl p-5 border shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow ${isProfitable ? 'border-green-100' : 'border-red-100'}`}>
                    <div className={`absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full opacity-50 group-hover:scale-110 transition-transform ${isProfitable ? 'bg-green-50' : 'bg-red-50'}`}></div>
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className={`p-2 rounded-xl ${isProfitable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isProfitable ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        </div>
                        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Net Profit / Loss</h4>
                    </div>
                    <p className={`text-2xl font-bold relative z-10 ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(summary.net_profit)}
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                            <Activity size={20} />
                        </div>
                        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg Cost / KM</h4>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 relative z-10">
                        KES {summary.avg_cost_per_km.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Based on {summary.total_distance_km} total km</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Trend Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <DollarSign className="text-blue-500" size={20} />
                        Income vs Expenditure (6 Months)
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chart_data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month_label" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(val) => `KES ${val/1000}k`} />
                                <Tooltip 
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                
                                <Area yAxisId="left" type="monotone" dataKey="income" name="Income" fillOpacity={1} fill="url(#colorIncome)" stroke="#10b981" strokeWidth={3} />
                                <Bar yAxisId="left" dataKey="fuel" name="Fuel Cost" stackId="a" fill="#f59e0b" radius={[0, 0, 4, 4]} />
                                <Bar yAxisId="left" dataKey="maintenance" name="Maintenance" stackId="a" fill="#ef4444" />
                                <Bar yAxisId="left" dataKey="other" name="Other Expenses" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Expense Breakdown</h3>
                        
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 font-medium text-slate-700">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                            <Droplet size={16} />
                                        </div>
                                        Fuel
                                    </div>
                                    <span className="font-bold text-slate-800">{formatCurrency(summary.total_fuel)}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-orange-500 h-full rounded-full" style={{ width: `${(summary.total_fuel / summary.total_expense) * 100}%` }}></div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 font-medium text-slate-700">
                                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                            <Wrench size={16} />
                                        </div>
                                        Maintenance
                                    </div>
                                    <span className="font-bold text-slate-800">{formatCurrency(summary.total_maintenance)}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${(summary.total_maintenance / summary.total_expense) * 100}%` }}></div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 font-medium text-slate-700">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                            <Activity size={16} />
                                        </div>
                                        Other Ops
                                    </div>
                                    <span className="font-bold text-slate-800">{formatCurrency(summary.total_other)}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(summary.total_other / summary.total_expense) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-500">Total Expenses</span>
                            <span className="text-xl font-bold text-slate-800">{formatCurrency(summary.total_expense)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransportFinancials;
