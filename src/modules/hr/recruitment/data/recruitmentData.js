
import { Users, Briefcase, UserCheck, Clock, FileText, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

export const recruitmentMetrics = [
    {
        id: 1,
        title: "Total Applicants",
        value: "1,284",
        trend: "+12%",
        trendUp: true,
        icon: Users,
        color: "blue",
        description: "Total applications received this month"
    },
    {
        id: 2,
        title: "Open Positions",
        value: "18",
        trend: "+4",
        trendUp: true,
        icon: Briefcase,
        color: "indigo",
        description: "Active job listings"
    },
    {
        id: 3,
        title: "Active Interviews",
        value: "42",
        trend: "-5%",
        trendUp: false,
        icon: Calendar,
        color: "amber",
        description: "Scheduled interviews this week"
    },
    {
        id: 4,
        title: "Hired this Month",
        value: "12",
        trend: "+8%",
        trendUp: true,
        icon: UserCheck,
        color: "emerald",
        description: "Candidates who accepted offers"
    },
    {
        id: 5,
        title: "Avg. Time to Hire",
        value: "18 Days",
        trend: "-2 Days",
        trendUp: true, // Improvement
        icon: Clock,
        color: "purple",
        description: "Average days from application to offer"
    }
];

export const recruitmentPipeline = {
    columns: {
        'applied': {
            id: 'applied',
            title: 'Applied',
            color: 'blue',
            candidateIds: ['c1', 'c2', 'c3', 'c4']
        },
        'shortlisted': {
            id: 'shortlisted',
            title: 'Shortlisted',
            color: 'indigo',
            candidateIds: ['c5', 'c6']
        },
        'interview': {
            id: 'interview',
            title: 'Interview',
            color: 'amber',
            candidateIds: ['c7', 'c8', 'c9']
        },
        'assessment': {
            id: 'assessment',
            title: 'Assessment',
            color: 'purple',
            candidateIds: ['c10']
        },
        'offer': {
            id: 'offer',
            title: 'Offer Extended',
            color: 'emerald',
            candidateIds: ['c11']
        }
    },
    candidates: {
        'c1': { id: 'c1', name: 'Sarah Johnson', role: 'Senior UX Designer', avatar: 'SJ', applied: '2h ago', source: 'LinkedIn' },
        'c2': { id: 'c2', name: 'Michael Chen', role: 'Frontend Developer', avatar: 'MC', applied: '5h ago', source: 'Website' },
        'c3': { id: 'c3', name: 'Jessica Davis', role: 'Product Manager', avatar: 'JD', applied: '1d ago', source: 'Referral' },
        'c4': { id: 'c4', name: 'David Wilson', role: 'Marketing Specialist', avatar: 'DW', applied: '1d ago', source: 'LinkedIn' },
        'c5': { id: 'c5', name: 'Emily Taylor', role: 'Senior UX Designer', avatar: 'ET', applied: '2d ago', source: 'Agency' },
        'c6': { id: 'c6', name: 'James Anderson', role: 'Frontend Developer', avatar: 'JA', applied: '3d ago', source: 'LinkedIn' },
        'c7': { id: 'c7', name: 'Robert Martinez', role: 'Backend Engineer', avatar: 'RM', applied: '4d ago', source: 'Website' },
        'c8': { id: 'c8', name: 'Lisa Thomas', role: 'HR Manager', avatar: 'LT', applied: '5d ago', source: 'LinkedIn' },
        'c9': { id: 'c9', name: 'William Jackson', role: 'Data Analyst', avatar: 'WJ', applied: '1w ago', source: 'Glassdoor' },
        'c10': { id: 'c10', name: 'Ashley White', role: 'Product Owner', avatar: 'AW', applied: '1w ago', source: 'Referral' },
        'c11': { id: 'c11', name: 'Brian Harris', role: 'DevOps Engineer', avatar: 'BH', applied: '2w ago', source: 'LinkedIn' },
    },
    columnOrder: ['applied', 'shortlisted', 'interview', 'assessment', 'offer']
};

export const candidatesData = [
    { id: 1, name: "Sarah Johnson", position: "Senior UX Designer", stage: "Applied", source: "LinkedIn", appliedDate: "2024-03-10", status: "New", email: "sarah.j@example.com", phone: "+1 555-0123" },
    { id: 2, name: "Michael Chen", position: "Frontend Developer", stage: "Applied", source: "Website", appliedDate: "2024-03-10", status: "New", email: "michael.c@example.com", phone: "+1 555-0124" },
    { id: 3, name: "Emily Taylor", position: "Senior UX Designer", stage: "Shortlisted", source: "Agency", appliedDate: "2024-03-08", status: "In Review", email: "emily.t@example.com", phone: "+1 555-0125" },
    { id: 4, name: "Robert Martinez", position: "Backend Engineer", stage: "Interview", source: "Website", appliedDate: "2024-03-05", status: "Scheduled", email: "robert.m@example.com", phone: "+1 555-0126" },
    { id: 5, name: "Ashley White", position: "Product Owner", stage: "Assessment", source: "Referral", appliedDate: "2024-03-01", status: "Pending Score", email: "ashley.w@example.com", phone: "+1 555-0127" },
    { id: 6, name: "Brian Harris", position: "DevOps Engineer", stage: "Offer", source: "LinkedIn", appliedDate: "2024-02-25", status: "Offer Sent", email: "brian.h@example.com", phone: "+1 555-0128" },
    { id: 7, name: "Jessica Davis", position: "Product Manager", stage: "Rejected", source: "Referral", appliedDate: "2024-03-09", status: "Rejected", email: "jessica.d@example.com", phone: "+1 555-0129" },
];

export const interviewSchedule = [
    {
        id: 1,
        candidateName: "Robert Martinez",
        position: "Backend Engineer",
        date: "Today",
        time: "10:00 AM - 11:00 AM",
        interviewers: ["Alex Rivera", "Sarah Connors"],
        type: "Technical Round",
        status: "Upcoming"
    },
    {
        id: 2,
        candidateName: "Lisa Thomas",
        position: "HR Manager",
        date: "Today",
        time: "02:00 PM - 03:00 PM",
        interviewers: ["John Dao", "Melissa Grant"],
        type: "Cultural Fit",
        status: "Upcoming"
    },
    {
        id: 3,
        candidateName: "William Jackson",
        position: "Data Analyst",
        date: "Tomorrow",
        time: "11:30 AM - 12:30 PM",
        interviewers: ["David Scott"],
        type: "Initial Screening",
        status: "Scheduled"
    }
];

export const recentActivities = [
    { id: 1, type: "applied", user: "Sarah Johnson", detail: "applied for Senior UX Designer", time: "2 hours ago" },
    { id: 2, type: "stage_move", user: "Robert Martinez", detail: "moved to Interview stage", time: "4 hours ago" },
    { id: 3, type: "interview", user: "Lisa Thomas", detail: "interview scheduled for Today 2pm", time: "5 hours ago" },
    { id: 4, type: "offer", user: "Brian Harris", detail: "offer letter sent", time: "1 day ago" },
];

// Transform complex pipeline structure to simple array for the dashboard component
const simplifiedStages = recruitmentPipeline.columnOrder.map(colId => {
    const col = recruitmentPipeline.columns[colId];
    return {
        id: col.id,
        title: col.title,
        color: col.color,
        count: col.candidateIds.length,
        candidates: col.candidateIds.map(cId => {
            const c = recruitmentPipeline.candidates[cId];
            return {
                id: c.id,
                name: c.name,
                role: c.role,
                experience: 'Exp: 3y', // Mock
                score: 85, // Mock
                date: c.applied,
                avatar: c.avatar
            };
        })
    };
});

// Aliases for consumption in Dashboard
export const pipelineData = { stages: simplifiedStages };
export const upcomingInterviews = interviewSchedule;
export const recentCandidates = candidatesData;
