import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const UserRoleChart = ({ data }) => {
    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', height: '100%' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>User Role Distribution</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default UserRoleChart;
