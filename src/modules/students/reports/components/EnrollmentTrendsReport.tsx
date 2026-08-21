import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/api';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';

const EnrollmentTrendsReport = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/api/student-management/reports/enrollment_trends/');
                
                // Transform data for Recharts
                const formattedData = (res.admissions_by_year || []).map((item: any) => ({
                    year: item.year ? new Date(item.year).getFullYear() : 'Unknown',
                    admissions: item.count
                })).filter((item: any) => item.year !== 'Unknown');

                setData(formattedData);
            } catch (error) {
                toast.error("Failed to fetch enrollment trends");
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
                <span className="text-sm font-medium">Loading trends...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                <TrendingUp className="text-indigo-600" size={24} />
                Admission & Enrollment Trends
            </h2>
            
            <div className="h-96">
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No trend data available.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <Tooltip cursor={{ stroke: '#f9fafb', strokeWidth: 2 }} />
                            <Legend />
                            <Line type="monotone" dataKey="admissions" name="New Admissions" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default EnrollmentTrendsReport;
