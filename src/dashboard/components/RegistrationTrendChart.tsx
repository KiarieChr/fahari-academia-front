import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RegistrationTrendChart = ({ data }) => {
    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', height: '100%' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>Monthly Registrations</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ background: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="var(--primary-color)"
                            strokeWidth={3}
                            dot={{ r: 4, fill: 'var(--primary-color)', strokeWidth: 2, stroke: 'white' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RegistrationTrendChart;
