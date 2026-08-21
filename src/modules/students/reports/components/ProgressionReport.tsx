import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/api';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, ArrowRightLeft } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];

const ProgressionReport = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/api/student-management/reports/progression_transitions/');
                
                // Format for recharts
                const formatted = (res.progression || []).map((item: any) => ({
                    name: item.status || 'Unknown',
                    value: item.count
                }));
                
                setData(formatted);
            } catch (error) {
                toast.error("Failed to fetch progression data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400 bg-white rounded-2xl border border-gray-100">
                <Loader2 className="animate-spin mb-3" size={32} />
                <span className="text-sm font-medium">Loading progression metrics...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                <ArrowRightLeft className="text-indigo-600" size={24} />
                Progression & Transitions
            </h2>
            
            <div className="h-96">
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No transition data available.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} Students`, 'Count']} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default ProgressionReport;
