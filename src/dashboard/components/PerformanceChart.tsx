import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

const PerformanceChart = ({ data, compact = false }) => {
    // Dummy data structure - replace with your actual data
    const chartData = data || [
        { subject: 'Math', score: 85, average: 75, max: 100 },
        { subject: 'Science', score: 78, average: 72, max: 100 },
        { subject: 'English', score: 92, average: 80, max: 100 },
        { subject: 'History', score: 88, average: 78, max: 100 },
        { subject: 'Art', score: 95, average: 85, max: 100 },
        { subject: 'PE', score: 90, average: 82, max: 100 },
    ];

    const colors = ['#3f51b5', '#4caf50', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4'];

    return (
        <div className="performance-chart" style={{ height: compact ? '250px' : '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={compact ? { top: 10, right: 10, left: 0, bottom: 0 } : { top: 20, right: 30, left: 20, bottom: 5 }}
                    barSize={compact ? 20 : 30}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                    <XAxis 
                        dataKey="subject" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: compact ? 10 : 12 }}
                    />
                    <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: compact ? 10 : 12 }}
                        domain={[0, 100]}
                        label={!compact ? { value: 'Score (%)', angle: -90, position: 'insideLeft' } : null}
                    />
                    <Tooltip 
                        formatter={(value) => [`${value}%`, 'Score']}
                        labelFormatter={(label) => `Subject: ${label}`}
                        contentStyle={{
                            backgroundColor: 'var(--card-bg)',
                            border: '1px solid var(--border-color-light)',
                            borderRadius: '8px',
                            fontSize: compact ? '11px' : '12px'
                        }}
                    />
                    {!compact && <Legend />}
                    <Bar 
                        dataKey="score" 
                        name="Student Score" 
                        radius={[4, 4, 0, 0]}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                    {!compact && (
                        <Bar 
                            dataKey="average" 
                            name="Class Average" 
                            fill="#82ca9d"
                            radius={[4, 4, 0, 0]}
                            opacity={0.7}
                        />
                    )}
                </BarChart>
            </ResponsiveContainer>
            
            {compact && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '1rem', 
                    marginTop: '0.5rem',
                    flexWrap: 'wrap' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: '10px', height: '10px', backgroundColor: '#3f51b5', borderRadius: '2px' }}></div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Score</span>
                    </div>
                    {!compact && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <div style={{ width: '10px', height: '10px', backgroundColor: '#82ca9d', borderRadius: '2px' }}></div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Average</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PerformanceChart;