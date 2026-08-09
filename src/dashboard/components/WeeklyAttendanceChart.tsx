import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const WeeklyAttendanceChart = ({ data }) => {
    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color-light)', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>Weekly Attendance</h3>
                <select style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color-light)', fontSize: '0.85rem', outline: 'none', color: 'var(--text-secondary)' }}>
                    <option>This Week</option>
                    <option>Last Week</option>
                </select>
            </div>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={data} barGap={4}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', padding: '12px' }}
                        />
                        <Bar dataKey="present" fill="#4caf50" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar dataKey="absent" fill="#f44336" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WeeklyAttendanceChart;
