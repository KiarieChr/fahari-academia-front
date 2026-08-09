
import { Users, TrendingDown, Clock, BarChart2, Calendar, UserCheck } from 'lucide-react';

export const reportMetrics = [
    {
        id: 1,
        title: "Total Staff",
        value: "142",
        trend: "+5% vs last month",
        trendUp: true,
        icon: Users,
        color: "blue",
        description: "Active employees"
    },
    {
        id: 2,
        title: "Attrition Rate",
        value: "2.4%",
        trend: "-0.5% vs last quarter",
        trendUp: true, // trendUp=true here because lowering attrition is good
        icon: TrendingDown,
        color: "emerald",
        description: "Monthly turnover"
    },
    {
        id: 3,
        title: "Avg Time to Hire",
        value: "18 Days",
        trend: "-2 days vs avg",
        trendUp: true,
        icon: Clock,
        color: "purple",
        description: "Recruitment velocity"
    },
    {
        id: 4,
        title: "Attendance Rate",
        value: "96%",
        trend: "Stable",
        trendUp: true,
        icon: UserCheck,
        color: "amber",
        description: "Average daily present"
    },
    {
        id: 5,
        title: "Leave Utilization",
        value: "45%",
        trend: "+12% vs last month",
        trendUp: false, // Could be neutral, but let's say high utilization might be a warning depending on context
        icon: Calendar,
        color: "indigo",
        description: "Allocated leave taken"
    },
    {
        id: 6,
        title: "Avg Performance",
        value: "82%",
        trend: "+3% vs last review",
        trendUp: true,
        icon: BarChart2,
        color: "pink",
        description: "Overall KPI score"
    },
];

export const attendanceTrendsData = [
    { name: 'Week 1', present: 95, absent: 2, late: 3 },
    { name: 'Week 2', present: 92, absent: 4, late: 4 },
    { name: 'Week 3', present: 96, absent: 1, late: 3 },
    { name: 'Week 4', present: 94, absent: 3, late: 3 },
];

export const leaveDistributionData = [
    { name: 'Annual Leave', value: 45 },
    { name: 'Sick Leave', value: 25 },
    { name: 'Maternity/Paternity', value: 10 },
    { name: 'Study Leave', value: 5 },
    { name: 'Unpaid Leave', value: 15 },
];

export const performanceDistributionData = [
    { name: 'Exceeds Expectations', value: 15 },
    { name: 'Meets Expectations', value: 65 },
    { name: 'Needs Improvement', value: 15 },
    { name: 'Unsatisfactory', value: 5 },
];

export const recruitmentFunnelData = [
    { stage: 'Applied', count: 120 },
    { stage: 'Screened', count: 80 },
    { stage: 'Interviewed', count: 45 },
    { stage: 'Offered', count: 15 },
    { stage: 'Hired', count: 12 },
];

export const detailedReportData = [
    { id: 1, category: "Attendance", metric: "Late Arrivals > 3 times", value: "8 Staff", department: "Sales", date: "Oct 2024", status: "Critical" },
    { id: 2, category: "Leave", metric: "Leave Balance > 20 Days", value: "15 Staff", department: "Engineering", date: "Oct 2024", status: "Warning" },
    { id: 3, category: "Performance", metric: "Low KPI Score (<60%)", value: "3 Staff", department: "Support", date: "Q3 2024", status: "Action Needed" },
    { id: 4, category: "Payroll", metric: "Overtime Hours", value: "120 Hours", department: "Operations", date: "Sep 2024", status: "Normal" },
    { id: 5, category: "All", metric: "Contract Expiring", value: "2 Staff", department: "Admin", date: "Next Month", status: "Warning" },
];

// Added missing exports to match HRReportsDashboard imports
export const attendanceReportData = [
    { id: 1, metric: "Late Arrival", value: "45 mins", department: "Sales", date: "2024-10-24", status: "Warning" },
    { id: 2, metric: "Absent", value: "1 Day", department: "Engineering", date: "2024-10-24", status: "Critical" },
    { id: 3, metric: "Late Arrival", value: "15 mins", department: "Marketing", date: "2024-10-23", status: "Normal" },
];

export const leaveReportData = [
    { id: 1, metric: "Annual Leave", value: "5 Days", department: "IT", date: "Nov 1-5", status: "Normal" },
    { id: 2, metric: "Sick Leave", value: "2 Days", department: "HR", date: "Oct 23-24", status: "Normal" },
    { id: 3, metric: "Unpaid Leave", value: "30 Days", department: "Sales", date: "Dec 2024", status: "Action Needed" },
];

export const performanceReportData = [
    { id: 1, metric: "KPI Score", value: "92%", department: "Design", date: "Q3 2024", status: "Normal" },
    { id: 2, metric: "KPI Score", value: "45%", department: "Sales", date: "Q3 2024", status: "Critical" },
    { id: 3, metric: "Peer Review", value: "Needs Improvement", department: "Support", date: "Q3 2024", status: "Action Needed" },
];

export const recruitmentReportData = [
    { id: 1, metric: "Time to Hire", value: "45 Days", department: "Engineering", date: "Q3 2024", status: "Warning" },
    { id: 2, metric: "New Hires", value: "5 Staff", department: "Sales", date: "Oct 2024", status: "Normal" },
    { id: 3, metric: "Rejected", value: "12 Candidates", department: "All", date: "Oct 2024", status: "Normal" },
];
