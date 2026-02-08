import React from 'react';
import {
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const ResourceUsage = ({ data, compact = false }) => {
    // Dummy data structure - replace with your actual data
    const usageData = data || {
        storage: { used: 75, total: 100, unit: 'GB' },
        bandwidth: { used: 45, total: 100, unit: 'GB' },
        activeUsers: { count: 235, total: 300 },
        serverLoad: { percentage: 68 }
    };

    const storageData = [
        { name: 'Used', value: usageData.storage.used, color: '#3f51b5' },
        { name: 'Free', value: usageData.storage.total - usageData.storage.used, color: '#e0e0e0' }
    ];

    const bandwidthData = [
        { name: 'Used', value: usageData.bandwidth.used, color: '#4caf50' },
        { name: 'Remaining', value: usageData.bandwidth.total - usageData.bandwidth.used, color: '#e0e0e0' }
    ];

    const renderRadialChart = (value, label, color, unit = '') => (
        <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: compact ? '80px' : '120px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                        innerRadius={compact ? '70%' : '60%'} 
                        outerRadius={compact ? '100%' : '100%'} 
                        data={[{ value }]} 
                        startAngle={180} 
                        endAngle={-180}
                    >
                        <PolarAngleAxis 
                            type="number" 
                            domain={[0, 100]} 
                            angleAxisId={0} 
                            tick={false}
                        />
                        <RadialBar 
                            background={{ fill: '#e0e0e0' }}
                            dataKey="value" 
                            cornerRadius={10}
                            fill={color}
                            minAngle={15}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                }}>
                    <div style={{ 
                        fontSize: compact ? '1.2rem' : '1.5rem', 
                        fontWeight: 'bold',
                        color: 'var(--text-main)'
                    }}>
                        {value}%
                    </div>
                </div>
            </div>
            <div style={{ 
                fontSize: compact ? '0.75rem' : '0.9rem', 
                color: 'var(--text-secondary)',
                marginTop: '0.5rem'
            }}>
                {label}
            </div>
        </div>
    );

    const renderPieChart = (data, label, colors) => (
        <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: compact ? '80px' : '120px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={compact ? 25 : 35}
                            outerRadius={compact ? 40 : 50}
                            paddingAngle={0}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div style={{ 
                fontSize: compact ? '0.75rem' : '0.9rem', 
                color: 'var(--text-secondary)',
                marginTop: '0.5rem'
            }}>
                {label}
            </div>
        </div>
    );

    return (
        <div className="resource-usage" style={{ height: '100%' }}>
            {compact ? (
                // Compact view - 2x2 grid
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '1rem',
                    height: '100%'
                }}>
                    {renderRadialChart(
                        usageData.serverLoad.percentage, 
                        'Server Load', 
                        '#ff9800'
                    )}
                    {renderRadialChart(
                        Math.round((usageData.activeUsers.count / usageData.activeUsers.total) * 100), 
                        'Active Users', 
                        '#e91e63'
                    )}
                    {renderPieChart(
                        storageData, 
                        `Storage: ${usageData.storage.used}/${usageData.storage.total}${usageData.storage.unit}`, 
                        ['#3f51b5', '#e0e0e0']
                    )}
                    {renderPieChart(
                        bandwidthData, 
                        `Bandwidth: ${usageData.bandwidth.used}/${usageData.bandwidth.total}${usageData.bandwidth.unit}`, 
                        ['#4caf50', '#e0e0e0']
                    )}
                </div>
            ) : (
                // Full view - Detailed layout
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '2rem',
                    height: '100%'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Storage Usage</h4>
                            {renderPieChart(
                                storageData, 
                                `${usageData.storage.used}${usageData.storage.unit} used of ${usageData.storage.total}${usageData.storage.unit}`, 
                                ['#3f51b5', '#e0e0e0']
                            )}
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Bandwidth Usage</h4>
                            {renderPieChart(
                                bandwidthData, 
                                `${usageData.bandwidth.used}${usageData.bandwidth.unit} used this month`, 
                                ['#4caf50', '#e0e0e0']
                            )}
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Server Load</h4>
                            {renderRadialChart(
                                usageData.serverLoad.percentage, 
                                `${usageData.serverLoad.percentage}% CPU Usage`, 
                                '#ff9800'
                            )}
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Active Users</h4>
                            {renderRadialChart(
                                Math.round((usageData.activeUsers.count / usageData.activeUsers.total) * 100), 
                                `${usageData.activeUsers.count} active of ${usageData.activeUsers.total}`, 
                                '#e91e63'
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceUsage;