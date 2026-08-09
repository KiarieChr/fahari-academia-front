export const contextData = {
    academicYears: ['2026', '2025', '2024'],
    terms: ['Term 1', 'Term 2', 'Term 3'],
    classes: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Form 1', 'Form 2'],
    streams: ['East', 'West', 'North', 'South'],
    subjects: [
        { id: 'math', name: 'Mathematics' },
        { id: 'eng', name: 'English' },
        { id: 'kis', name: 'Kiswahili' },
        { id: 'sci', name: 'Science' },
        { id: 'sst', name: 'Social Studies' },
        { id: 'cre', name: 'C.R.E.' }
    ],
    assessmentTypes: ['Opener Exam', 'Mid-Term Exam', 'End-Term Exam', 'CAT 1', 'CAT 2', 'Assignment'],
};

export const initialStudents = [
    { id: 1, admNo: 'ADM001', name: 'John Kamau', marks: '', grade: '-', remarks: '', status: 'Present', locked: false },
    { id: 2, admNo: 'ADM002', name: 'Alice Wanjiku', marks: 85, grade: 'A', remarks: 'Excellent', status: 'Present', locked: true },
    { id: 3, admNo: 'ADM003', name: 'Brian Omondi', marks: 45, grade: 'C', remarks: 'Can do better', status: 'Present', locked: false },
    { id: 4, admNo: 'ADM004', name: 'Grace Mutua', marks: '', grade: '-', remarks: '', status: 'Absent', locked: false },
    { id: 5, admNo: 'ADM005', name: 'David Njoroge', marks: 72, grade: 'B', remarks: 'Good work', status: 'Present', locked: false },
    { id: 6, admNo: 'ADM006', name: 'Esther Chebet', marks: 60, grade: 'C+', remarks: 'Fair', status: 'Present', locked: false },
    { id: 7, admNo: 'ADM007', name: 'Frank Juma', marks: '', grade: '-', remarks: '', status: 'Present', locked: false },
    { id: 8, admNo: 'ADM008', name: 'Hellen Achieng', marks: 92, grade: 'A', remarks: 'Outstanding', status: 'Present', locked: false },
    { id: 9, admNo: 'ADM009', name: 'Ian Kiptoo', marks: '', grade: '-', remarks: '', status: 'Excused', locked: false },
    { id: 10, admNo: 'ADM010', name: 'Jane Mwangi', marks: 30, grade: 'D', remarks: 'Needs improvement', status: 'Present', locked: false },
];

export const getClassStats = (students) => {
    const presentStudents = students.filter(s => s.status === 'Present' && s.marks !== '');
    if (presentStudents.length === 0) return { average: 0, highest: 0, lowest: 0, passRate: 0 };

    const marks = presentStudents.map(s => Number(s.marks));
    const average = marks.reduce((a, b) => a + b, 0) / marks.length;
    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);
    const passed = marks.filter(m => m >= 50).length;
    const passRate = (passed / marks.length) * 100;

    return {
        average: average.toFixed(1),
        highest,
        lowest,
        passRate: passRate.toFixed(1)
    };
};

export const calculateGrade = (marks) => {
    const m = Number(marks);
    if (!marks || isNaN(m)) return '-';
    if (m >= 80) return 'A';
    if (m >= 75) return 'A-';
    if (m >= 70) return 'B+';
    if (m >= 65) return 'B';
    if (m >= 60) return 'B-';
    if (m >= 55) return 'C+';
    if (m >= 50) return 'C';
    if (m >= 45) return 'C-';
    if (m >= 40) return 'D+';
    if (m >= 35) return 'D';
    if (m >= 30) return 'D-';
    return 'E';
};
