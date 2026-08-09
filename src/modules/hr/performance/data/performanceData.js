import { Target, TrendingUp, Users, AlertCircle, Award, Settings } from 'lucide-react';

export const performanceMetrics = [
    {
        id: 1,
        title: "Avg Performance Score",
        value: "82%",
        trend: "+5% vs Q3",
        trendUp: true,
        icon: TrendingUp,
        color: "blue",
        description: "Organization-wide average"
    },
    {
        id: 2,
        title: "Goals Completed",
        value: "254",
        trend: "92% Completion Rate",
        trendUp: true,
        icon: Target,
        color: "emerald",
        description: "Departmental goals met"
    },
    {
        id: 3,
        title: "Active Reviews",
        value: "14",
        trend: "Due in 3 days",
        trendUp: false,
        icon: Users,
        color: "purple",
        description: "Pending appraisals"
    },
    {
        id: 4,
        title: "Top Performers",
        value: "18",
        trend: "+2 New",
        trendUp: true,
        icon: Award,
        color: "amber",
        description: "Exceeded 90% score"
    },
    {
        id: 5,
        title: "Underperforming",
        value: "5",
        trend: "Action Needed",
        trendUp: false,
        icon: AlertCircle,
        color: "red",
        description: "Below 70% threshold"
    }
];

export const goalsData = [
    { id: 1, title: "Increase Team Efficiency", staff: "IT Department", progress: 75, status: "On Track", dueDate: "2024-12-31" },
    { id: 2, title: "Complete Safety Training", staff: "Operations", progress: 95, status: "Completed", dueDate: "2024-11-15" },
    { id: 3, title: "Client Acquisition Target", staff: "Sales Team", progress: 45, status: "At Risk", dueDate: "2024-12-01" },
    { id: 4, title: "Reduce Server Downtime", staff: "IT Department", progress: 60, status: "On Track", dueDate: "2024-12-31" },
    { id: 5, title: "Customer Satisfaction Score", staff: "Support Team", progress: 88, status: "On Track", dueDate: "2024-12-15" },
];

export const reviewsData = [
    { id: 1, staff: "Alice Brown", period: "Q3 2024", reviewer: "John Smith", score: 92, status: "Completed" },
    { id: 2, staff: "Bob Wilson", period: "Q3 2024", reviewer: "Sarah Davis", score: 78, status: "In Review" },
    { id: 3, staff: "Charlie Day", period: "Q3 2024", reviewer: "John Smith", score: null, status: "Pending Self-Review" },
    { id: 4, staff: "Diana Prince", period: "Q3 2024", reviewer: "Sarah Davis", score: 88, status: "Completed" },
    { id: 5, staff: "Evan Wright", period: "Q3 2024", reviewer: "Mike Ross", score: 65, status: "Action Plan Needed" },
];

export const timelineData = [
    { id: 1, type: "Review", content: "Q3 Performance Reviews assigned", date: "2 Hours ago", icon: Users },
    { id: 2, type: "Goal", content: "Alice Brown completed 'Project X' goal", date: "4 Hours ago", icon: Target },
    { id: 3, type: "Feedback", content: "Positive feedback received for Bob Wilson", date: "Yesterday", icon: Award },
    { id: 4, type: "System", content: "New scoring model '2025 Standard' published", date: "2 days ago", icon: Settings },
];

// Helper for timeline icon component in timeline data would need component reference not just string if rendering directly, 
// using names for now or importing in component. 
// Corrected to use the objects, assuming consumer handles it.
