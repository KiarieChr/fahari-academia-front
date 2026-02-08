import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TeacherPerformance = () => {
    const data = [
        { name: 'Mr. Omondi', sessions: 24, attendance: 92 },
        { name: 'Mrs. Wanjiku', sessions: 22, attendance: 96 },
        { name: 'Mr. Kamau', sessions: 25, attendance: 88 },
        { name: 'Ms. Atieno', sessions: 20, attendance: 95 },
        { name: 'Mr. Juma', sessions: 18, attendance: 90 },
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Teacher Performance Metrics</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#6b7280" />
                        <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#6b7280" />
                        <Tooltip
                            cursor={{ fill: '#f9fafb' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="sessions" name="Sessions Conducted" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        <Bar dataKey="attendance" name="Avg. Attendance %" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TeacherPerformance;
