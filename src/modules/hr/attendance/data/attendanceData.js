
import { Users, CheckCircle, XCircle, Clock, Calendar, AlertTriangle, UserCheck } from 'lucide-react';

export const attendanceMetrics = [
    {
        id: 1,
        title: "Total Staff",
        value: "142",
        trend: "+3 New",
        trendUp: true,
        icon: Users,
        color: "blue",
        description: "Total active employees"
    },
    {
        id: 2,
        title: "Present Today",
        value: "128",
        trend: "90%",
        trendUp: true,
        icon: UserCheck,
        color: "emerald",
        description: "Staff clocked in today"
    },
    {
        id: 3,
        title: "Absent",
        value: "8",
        trend: "-2%",
        trendUp: true, // Improvement (less absent)
        icon: XCircle,
        color: "red",
        description: "Unplanned absences"
    },
    {
        id: 4,
        title: "Late Arrivals",
        value: "4",
        trend: "+1",
        trendUp: false, // Negative trend
        icon: Clock,
        color: "amber",
        description: "Clocked in after 9:00 AM"
    },
    {
        id: 5,
        title: "On Leave",
        value: "6",
        trend: "Scheduled",
        trendUp: true,
        icon: Calendar,
        color: "purple",
        description: "Authorized leave"
    }
];

export const liveClockData = {
    staffId: "EMP-001",
    staffName: "Admin User",
    shiftStart: "09:00 AM",
    shiftEnd: "05:00 PM",
    currentStatus: "Clocked In", // or "Clocked Out"
    clockInTime: "08:55 AM",
    workedHours: "04:30:15",
    location: "Office HQ"
};

export const attendanceRecords = [
    { id: 1, staff: "Sarah Johnson", department: "Design", date: "2024-10-24", clockIn: "08:45 AM", clockOut: "05:15 PM", hours: "8h 30m", status: "Present", avatar: "SJ" },
    { id: 2, staff: "Michael Chen", department: "Engineering", date: "2024-10-24", clockIn: "09:05 AM", clockOut: "05:00 PM", hours: "7h 55m", status: "Late", avatar: "MC" },
    { id: 3, staff: "Jessica Davis", department: "Product", date: "2024-10-24", clockIn: "-", clockOut: "-", hours: "0h 00m", status: "Absent", avatar: "JD" },
    { id: 4, staff: "David Wilson", department: "Marketing", date: "2024-10-24", clockIn: "08:50 AM", clockOut: "05:00 PM", hours: "8h 10m", status: "Present", avatar: "DW" },
    { id: 5, staff: "Emily Taylor", department: "Design", date: "2024-10-24", clockIn: "-", clockOut: "-", hours: "-", status: "On Leave", avatar: "ET" },
    { id: 6, staff: "James Anderson", department: "Engineering", date: "2024-10-24", clockIn: "08:30 AM", clockOut: "04:30 PM", hours: "8h 00m", status: "Present", avatar: "JA" },
    { id: 7, staff: "Robert Martinez", department: "Engineering", date: "2024-10-24", clockIn: "09:15 AM", clockOut: "06:15 PM", hours: "9h 00m", status: "Late", avatar: "RM" },
];

export const calendarEvents = [
    // Mocking a few days for the calendar
    { date: "2024-10-01", status: "Present" },
    { date: "2024-10-02", status: "Present" },
    { date: "2024-10-03", status: "Late" },
    { date: "2024-10-04", status: "Present" },
    { date: "2024-10-07", status: "Present" },
    { date: "2024-10-08", status: "Absent" },
    { date: "2024-10-09", status: "Present" },
    { date: "2024-10-10", status: "On Leave" },
    { date: "2024-10-11", status: "On Leave" },
];

export const upcomingHolidays = [
    { date: "2024-12-25", name: "Christmas Day" },
    { date: "2024-12-26", name: "Boxing Day" },
];
