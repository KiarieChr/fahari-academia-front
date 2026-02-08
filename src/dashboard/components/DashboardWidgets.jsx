import React from 'react';
import { UserPlus, CreditCard, FileText, Bell, Calendar, Clock, UserCheck, FilePlus, Download } from 'lucide-react';
export { default as ResourceUsage } from './ResourceUsage';
const iconMap = {
    'user-plus': UserPlus,
    'credit-card': CreditCard,
    'file-text': FileText,
    'bell': Bell,
};

export const RecentActivity = ({ activities }) => {
    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color-light)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>Recent Activity</h3>
                <button style={{ border: 'none', background: 'transparent', color: 'var(--primary-color)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600', transition: 'color 0.2s' }}>View All</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1, overflowY: 'auto' }}>
                {activities.map((activity) => {
                    const Icon = iconMap[activity.icon] || Bell;
                    return (
                        <div key={activity.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ minWidth: '40px', height: '40px', borderRadius: '12px', background: activity.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>{activity.title}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', lineHeight: '1.3' }}>{activity.desc}</p>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} /> {activity.time}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const QuickActions = () => {
    const actions = [
        { label: 'Add Student', icon: UserPlus, color: '#e3f2fd', textColor: '#1976d2' },
        { label: 'Generate Report', icon: FileText, color: '#e8f5e9', textColor: '#2e7d32' },
        { label: 'Record Payment', icon: CreditCard, color: '#fff3e0', textColor: '#f57c00' },
        { label: 'Take Attendance', icon: UserCheck, color: '#ffebee', textColor: '#d32f2f' },
        { label: 'Schedule Exam', icon: Calendar, color: '#f3e5f5', textColor: '#7b1fa2' },
        { label: 'Export Data', icon: Download, color: '#efebe9', textColor: '#5d4037' },
    ];

    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color-light)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', flex: 1 }}>
                {actions.map((action, index) => (
                    <div key={index}
                        className="action-card"
                        style={{
                            background: action.color,
                            borderRadius: '12px',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            textAlign: 'center',
                            gap: '8px',
                            height: '100%',
                            border: '1px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <action.icon size={24} color={action.textColor} />
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: action.textColor, lineHeight: '1.2' }}>{action.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const UpcomingEvents = ({ events }) => {
    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color-light)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>Upcoming Events</h3>
                <button style={{ border: 'none', background: 'transparent', color: 'var(--primary-color)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600', transition: 'color 0.2s' }}>View Calendar</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
                {events.map((event) => (
                    <div key={event.id}
                        style={{
                            display: 'flex',
                            gap: '12px',
                            padding: '1rem',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            borderLeft: `4px solid ${event.color}`,
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                    >
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>{event.title}</h4>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {event.date}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {event.time}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {event.location}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
