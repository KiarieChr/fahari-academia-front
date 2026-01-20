
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.100.27:8000';

export const dashboardService = {
    getStats: async () => {
        try {
            // In a real scenario, fetch from API
            // const response = await fetch(`${API_URL}/api/dashboard/stats/`, {
            //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            // });
            // if (!response.ok) throw new Error('Failed to fetch stats');
            // return await response.json();

            // Mock Data matching Reference Images
            return {
                success: true,
                data: {
                    stats: [
                        { title: 'Total Students', count: '1,247', trend: 3.2, trendLabel: 'from last term', icon: 'users', color: '#e3f2fd', iconColor: '#2196f3' },
                        { title: "Today's Attendance", count: '94.5%', trend: 1.8, trendLabel: 'from yesterday', icon: 'user-check', color: '#e8f5e9', iconColor: '#4caf50' },
                        { title: 'Fee Collection', count: 'KES 7.5M', trend: 12.5, trendLabel: 'this month', icon: 'credit-card', color: '#fff3e0', iconColor: '#ff9800' },
                        { title: 'Fee Defaulters', count: '48', trend: -8.3, trendLabel: 'from last week', icon: 'alert-triangle', color: '#ffebee', iconColor: '#f44336' },
                    ],
                    charts: {
                        weekly_attendance: [
                            { name: 'Mon', present: 850, absent: 50 },
                            { name: 'Tue', present: 880, absent: 30 },
                            { name: 'Wed', present: 840, absent: 60 },
                            { name: 'Thu', present: 890, absent: 20 },
                            { name: 'Fri', present: 820, absent: 80 },
                        ],
                        fee_collection: [
                            { name: 'Collected', value: 7.5, color: '#4caf50' },
                            { name: 'Pending', value: 1.8, color: '#ff9800' },
                            { name: 'Overdue', value: 0.7, color: '#f44336' },
                        ]
                    },
                    recent_activity: [
                        { id: 1, title: 'New Student Enrolled', desc: 'John Doe was enrolled in Class 9', time: '5 minutes ago', icon: 'user-plus', color: '#e3f2fd' },
                        { id: 2, title: 'Fee Payment Received', desc: 'KES 45,000 received from...', time: '15 minutes ago', icon: 'credit-card', color: '#fff3e0' },
                        { id: 3, title: 'Report Cards Generated', desc: 'Term 1 reports for Class 9', time: '1 hour ago', icon: 'file-text', color: '#e8f5e9' },
                        { id: 4, title: 'Staff Meeting Reminder', desc: 'January payroll processed', time: '2 hours ago', icon: 'bell', color: '#e3f2fd' },
                    ],
                    upcoming_events: [
                        { id: 1, title: 'Mid-Term Examinations', date: 'Feb 15, 2026', time: '8:00 AM', location: 'All Classrooms', color: '#4caf50' },
                        { id: 2, title: 'Parent-Teacher Meeting', date: 'Feb 20, 2026', time: '2:00 PM', location: 'School Hall', color: '#2196f3' },
                        { id: 3, title: 'Sports Day', date: 'Feb 28, 2026', time: '9:00 AM', location: 'Sports Ground', color: '#009688' },
                        { id: 4, title: 'Fee Payment Deadline', date: 'Mar 5, 2026', time: '5:00 PM', location: 'Finance Office', color: '#f44336' },
                    ]
                }
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    getSimpleStats: async () => {
        // Implement for /api/dashboard/simple/
        return {
            success: true,
            data: {
                total_students: 850,
                total_staff: 150
            }
        };
    }
};
