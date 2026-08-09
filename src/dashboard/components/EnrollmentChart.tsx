import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

const EnrollmentChart = ({ data, compact = false }) => {
    // Dummy data structure - replace with your actual data
    const chartData = data || [
        { month: 'Jan', enrollments: 45, target: 50 },
        { month: 'Feb', enrollments: 52, target: 55 },
        { month: 'Mar', enrollments: 48, target: 52 },
        { month: 'Apr', enrollments: 60, target: 58 },
        { month: 'May', enrollments: 55, target: 60 },
        { month: 'Jun', enrollments: 65, target: 62 },
        { month: 'Jul', enrollments: 58, target: 60 },
        { month: 'Aug', enrollments: 70, target: 65 },
        { month: 'Sep', enrollments: 68, target: 70 },
        { month: 'Oct', enrollments: 75, target: 72 },
        { month: 'Nov', enrollments: 72, target: 75 },
        { month: 'Dec', enrollments: 80, target: 78 },
    ];

    return (
        <div className="enrollment-chart" style={{ height: compact ? '250px' : '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={compact ? { top: 10, right: 10, left: 0, bottom: 0 } : { top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <defs>
                        <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3f51b5" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ff9800" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                    <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: compact ? 10 : 12 }}
                    />
                    <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: compact ? 10 : 12 }}
                        label={!compact ? { value: 'Enrollments', angle: -90, position: 'insideLeft' } : null}
                    />
                    <Tooltip 
                        formatter={(value) => [`${value} students`, '']}
                        labelFormatter={(label) => `Month: ${label}`}
                        contentStyle={{
                            backgroundColor: 'var(--card-bg)',
                            border: '1px solid var(--border-color-light)',
                            borderRadius: '8px',
                            fontSize: compact ? '11px' : '12px'
                        }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="enrollments" 
                        stroke="#3f51b5" 
                        fillOpacity={1} 
                        fill="url(#colorEnrollments)"
                        name="Actual Enrollments"
                        strokeWidth={2}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#ff9800" 
                        fillOpacity={0.3} 
                        fill="url(#colorTarget)"
                        name="Target Enrollments"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                    />
                    {!compact && <Legend />}
                </AreaChart>
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
                        <div style={{ width: '10px', height: '2px', backgroundColor: '#3f51b5', borderRadius: '1px' }}></div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Actual</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: '10px', height: '2px', backgroundColor: '#ff9800', borderRadius: '1px', borderStyle: 'dashed' }}></div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnrollmentChart;