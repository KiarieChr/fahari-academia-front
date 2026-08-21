import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/api';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Loader2, Layers } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

const CapacityDistributionReport = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/api/student-management/reports/class_distribution/');
                
                // Format grade_distribution
                const formatted = (res.grade_distribution || []).map((item: any) => ({
                    grade: item.grade__name || 'Unknown',
                    count: item.count
                }));
                
                setData(formatted);
            } catch (error) {
                toast.error("Failed to fetch capacity distribution");
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
                <span className="text-sm font-medium">Loading distribution...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                <Layers className="text-indigo-600" size={24} />
                Class/Stream Capacity Distribution
            </h2>
            
            <div className="h-96">
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No distribution data available.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <Tooltip cursor={{ fill: '#f9fafb' }} />
                            <Legend />
                            <Bar dataKey="count" name="Enrolled Students" fill="#10b981" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default CapacityDistributionReport;
