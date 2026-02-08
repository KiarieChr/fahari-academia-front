export const summaryMetrics = {
    totalStudents: { value: 1250, change: "+5%", trend: "up" },
    activeStudents: { value: 1215, change: "+3.2%", trend: "up" },
    newAdmissions: { value: 145, change: "+12%", trend: "up" },
    transfersIn: { value: 24, change: "+2", trend: "up" },
    transfersOut: { value: 12, change: "-5%", trend: "down" }, // Good if down
    dropouts: { value: 8, change: "-2%", trend: "down" } // Good if down
};

export const enrollmentData = {
    byClass: [
        { name: 'Grade 1', students: 120 },
        { name: 'Grade 2', students: 115 },
        { name: 'Grade 3', students: 130 },
        { name: 'Grade 4', students: 125 },
        { name: 'Grade 5', students: 140 },
        { name: 'Form 1', students: 150 },
        { name: 'Form 2', students: 160 },
    ],
    byGender: [
        { name: 'Male', value: 650, color: '#3B82F6' },
        { name: 'Female', value: 600, color: '#EC4899' }
    ],
    trend: [
        { month: 'Jan', students: 1100 },
        { month: 'Feb', students: 1150 },
        { month: 'Mar', students: 1180 },
        { month: 'Apr', students: 1200 },
        { month: 'May', students: 1220 },
        { month: 'Jun', students: 1250 },
    ],
    table: [
        { class: 'Grade 1', total: 120, male: 60, female: 60, new: 15, in: 2, out: 1 },
        { class: 'Grade 2', total: 115, male: 55, female: 60, new: 5, in: 0, out: 2 },
        { class: 'Grade 3', total: 130, male: 70, female: 60, new: 8, in: 1, out: 0 },
        { class: 'Form 1', total: 150, male: 80, female: 70, new: 40, in: 5, out: 3 },
    ]
};

export const attendanceData = {
    byClass: [
        { name: 'Grade 1', attendance: 95 },
        { name: 'Grade 2', attendance: 92 },
        { name: 'Grade 3', attendance: 96 },
        { name: 'Form 1', attendance: 88 },
        { name: 'Form 2', attendance: 90 },
    ],
    trend: [
        { name: 'Week 1', value: 94 },
        { name: 'Week 2', value: 92 },
        { name: 'Week 3', value: 96 },
        { name: 'Week 4', value: 95 },
    ],
    table: [
        { class: 'Grade 1', students: 120, avg: 95, chronic: 2, bestDay: 'Tuesday' },
        { class: 'Grade 2', students: 115, avg: 92, chronic: 5, bestDay: 'Wednesday' },
        { class: 'Form 1', students: 150, avg: 88, chronic: 8, bestDay: 'Monday' },
    ]
};

export const academicData = {
    meanScore: [
        { class: 'Grade 1', current: 75, previous: 72 },
        { class: 'Grade 2', current: 68, previous: 70 },
        { class: 'Form 1', current: 62, previous: 60 },
    ],
    subjectPerformance: [
        { subject: 'Math', avg: 65 },
        { subject: 'English', avg: 72 },
        { subject: 'Science', avg: 68 },
        { subject: 'History', avg: 75 },
    ],
    table: [
        { class: 'Grade 1', subject: 'Mathematics', avg: 72, high: 98, low: 45, rating: 'Good' },
        { class: 'Grade 2', subject: 'English', avg: 68, high: 95, low: 30, rating: 'Average' },
        { class: 'Form 1', subject: 'Physics', avg: 55, high: 88, low: 20, rating: 'Poor' },
    ]
};

export const disciplineData = {
    summary: { total: 45, resolved: 35, pending: 10 },
    cases: [
        { id: 1, student: 'John Doe', class: 'Form 2', type: 'Late Arrival', severity: 'Low', action: 'Warning', status: 'Resolved' },
        { id: 2, student: 'Jane Smith', class: 'Grade 5', type: 'Bullying', severity: 'High', action: 'Suspension', status: 'Pending' },
        { id: 3, student: 'Mike Ross', class: 'Form 1', type: 'Uniform', severity: 'Low', action: 'Counseling', status: 'Resolved' },
    ]
};

export const transfersData = {
    stats: [
        { name: 'In', value: 24, color: '#10B981' },
        { name: 'Out', value: 12, color: '#EF4444' },
    ],
    table: [
        { student: 'Sarah Connor', adm: 'ADM001', status: 'Transfer Out', reason: 'Relocation', date: '2024-01-15' },
        { student: 'Kyle Reese', adm: 'ADM045', status: 'Transfer In', reason: 'New Admission', date: '2024-02-01' },
    ]
};

export const demographicsData = {
    ageDistribution: [
        { range: '6-8', count: 300 },
        { range: '9-11', count: 400 },
        { range: '12-14', count: 350 },
        { range: '15+', count: 200 },
    ],
    table: [
        { ageGroup: '6-8 Years', male: 150, female: 150, total: 300 },
        { ageGroup: '9-11 Years', male: 210, female: 190, total: 400 },
        { ageGroup: '12-14 Years', male: 180, female: 170, total: 350 },
    ]
};

export const reportHistory = [
    { id: 1, name: 'Term 1 Attendance Report', user: 'Admin', date: '2024-03-15', filters: 'Term 1, All Classes' },
    { id: 2, name: 'Discipline Summary', user: 'Principal', date: '2024-03-10', filters: 'Year 2024' },
];
