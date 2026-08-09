
export const summaryMetrics = {
    totalClasses: { value: 24, label: "Total Classes", status: "success" },
    totalSubjects: { value: 12, label: "Active Subjects", status: "info" },
    totalSlots: { value: 45, label: "Time Slots", status: "neutral" },
    assignedTeachers: { value: 32, label: "Teachers Assigned", status: "success" },
    roomUtilization: { value: "85%", label: "Room Usage", status: "warning" },
    conflicts: { value: 3, label: "Schedule Conflicts", status: "error" }
};

export const timeSlots = [
    { id: 1, name: "Morning Prep", start: "07:00", end: "08:00", duration: "60m", type: "Prep", status: "Active" },
    { id: 2, name: "Period 1", start: "08:00", end: "08:40", duration: "40m", type: "Lesson", status: "Active" },
    { id: 3, name: "Period 2", start: "08:40", end: "09:20", duration: "40m", type: "Lesson", status: "Active" },
    { id: 4, name: "Short Break", start: "09:20", end: "09:35", duration: "15m", type: "Break", status: "Active" },
    { id: 5, name: "Period 3", start: "09:35", end: "10:15", duration: "40m", type: "Lesson", status: "Active" },
    { id: 6, name: "Period 4", start: "10:15", end: "10:55", duration: "40m", type: "Lesson", status: "Active" },
    { id: 7, name: "Lunch Break", start: "12:55", end: "14:00", duration: "65m", type: "Break", status: "Active" },
];

export const weeklyTimetable = [
    {
        day: "Monday",
        slots: [
            { id: 101, slotId: 2, subject: "Math", teacher: "JM", room: "RM 1B", color: "blue" },
            { id: 102, slotId: 3, subject: "English", teacher: "AK", room: "RM 1B", color: "green" },
            { id: 103, slotId: 5, subject: "Science", teacher: "BT", room: "SCI LAB", color: "indigo" },
            { id: 104, slotId: 6, subject: "History", teacher: "GL", room: "RM 1B", color: "amber" },
        ]
    },
    {
        day: "Tuesday",
        slots: [
            { id: 201, slotId: 2, subject: "Science", teacher: "BT", room: "RM 1B", color: "indigo" },
            { id: 202, slotId: 3, subject: "Math", teacher: "JM", room: "RM 1B", color: "blue" },
            { id: 203, slotId: 5, subject: "Geography", teacher: "MS", room: "RM 1B", color: "orange" },
            { id: 204, slotId: 6, subject: "Kiswahili", teacher: "ZK", room: "RM 1B", color: "emerald" },
        ]
    },
    // ... more days
];

export const teacherSchedules = [
    { id: 1, name: "John Maina", initials: "JM", subjects: ["Math", "Physics"], classes: 12, periods: 24, free: 6 },
    { id: 2, name: "Alice Kamau", initials: "AK", subjects: ["English"], classes: 10, periods: 20, free: 10 },
    { id: 3, name: "Ben Ten", initials: "BT", subjects: ["Science"], classes: 14, periods: 28, free: 2 },
];

export const roomAllocations = [
    { id: 1, name: "Room 1A", capacity: 40, assigned: 35, status: "Available" },
    { id: 2, name: "Room 1B", capacity: 40, assigned: 40, status: "Full" },
    { id: 3, name: "Science Lab", capacity: 30, assigned: 25, status: "Available" },
    { id: 4, name: "Comp Lab", capacity: 30, assigned: 0, status: "Free" },
];

export const conflicts = [
    { id: 1, type: "Teacher Double", description: "John Maina assigned to 1A and 2B at 08:00 AM", severity: "High" },
    { id: 2, type: "Room Conflict", description: "Room 1B double booked at 10:15 AM", severity: "High" },
    { id: 3, type: "Gap", description: "Class 1A has undefined slot at 11:00 AM", severity: "Low" },
];
