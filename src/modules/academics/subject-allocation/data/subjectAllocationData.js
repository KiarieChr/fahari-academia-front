export const teachersData = [
    { id: 't1', name: 'John Doe', subjects: ['Mathematics', 'Physics'], maxLoad: 25, currentLoad: 20 },
    { id: 't2', name: 'Jane Smith', subjects: ['English', 'Literature'], maxLoad: 25, currentLoad: 24 },
    { id: 't3', name: 'Alice Johnson', subjects: ['Kiswahili', 'History'], maxLoad: 25, currentLoad: 15 },
    { id: 't4', name: 'Bob Builder', subjects: ['Art & Design', 'Computer Science'], maxLoad: 20, currentLoad: 5 },
    { id: 't5', name: 'Sarah Connor', subjects: ['Biology', 'Chemistry'], maxLoad: 25, currentLoad: 26 }, // Overloaded
];

export const classesData = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Year 9', 'Year 10'];

// Initial allocations mock
export const initialAllocations = [
    { id: 'a1', class: 'Grade 1', subject: 'Mathematics', teacherId: 't1', lessons: 5, category: 'Core', status: 'Active' },
    { id: 'a2', class: 'Grade 1', subject: 'English', teacherId: 't2', lessons: 5, category: 'Core', status: 'Active' },
    { id: 'a3', class: 'Grade 1', subject: 'Kiswahili', teacherId: 't3', lessons: 4, category: 'Core', status: 'Active' },
    { id: 'a4', class: 'Grade 2', subject: 'Mathematics', teacherId: 't1', lessons: 5, category: 'Core', status: 'Active' },
    { id: 'a5', class: 'Grade 2', subject: 'English', teacherId: 't2', lessons: 5, category: 'Core', status: 'Active' },
    { id: 'a6', class: 'Grade 3', subject: 'Mathematics', teacherId: null, lessons: 5, category: 'Core', status: 'Pending' }, // Unassigned teacher
    { id: 'a7', class: 'Year 9', subject: 'Computer Science', teacherId: 't4', lessons: 3, category: 'Optional', status: 'Active' },
    { id: 'a8', class: 'Year 10', subject: 'Biology', teacherId: 't5', lessons: 4, category: 'Elective', status: 'Active' },
];

export const availableSubjects = [
    { name: 'Mathematics', category: 'Core', defaultLessons: 5 },
    { name: 'English', category: 'Core', defaultLessons: 5 },
    { name: 'Kiswahili', category: 'Core', defaultLessons: 4 },
    { name: 'Science', category: 'Core', defaultLessons: 4 },
    { name: 'Social Studies', category: 'Core', defaultLessons: 3 },
    { name: 'Art & Design', category: 'Elective', defaultLessons: 2 },
    { name: 'Computer Science', category: 'Optional', defaultLessons: 3 },
    { name: 'Biology', category: 'Elective', defaultLessons: 4 },
    { name: 'Chemistry', category: 'Elective', defaultLessons: 4 },
];
