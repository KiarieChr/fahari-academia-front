export const subjectsData = [
    {
        id: '1',
        name: 'Mathematics',
        code: 'MAT',
        category: 'Core',
        type: 'Theory',
        curriculum: 'CBC',
        classes: ['Grade 1', 'Grade 2', 'Grade 3'],
        lessons: 5,
        teachers: ['John Doe'],
        status: 'Active',
        description: 'Fundamental mathematics concepts.',
        isGraded: true
    },
    {
        id: '2',
        name: 'English',
        code: 'ENG',
        category: 'Core',
        type: 'Theory',
        curriculum: 'CBC',
        classes: ['Grade 1', 'Grade 2', 'Grade 3'],
        lessons: 5,
        teachers: ['Jane Smith'],
        status: 'Active',
        description: 'English language and composition.',
        isGraded: true
    },
    {
        id: '3',
        name: 'Kiswahili',
        code: 'KIS',
        category: 'Core',
        type: 'Theory',
        curriculum: 'CBC',
        classes: ['Grade 1', 'Grade 2'],
        lessons: 4,
        teachers: ['Alice Johnson'],
        status: 'Active',
        description: 'Kiswahili language mastery.',
        isGraded: true
    },
    {
        id: '4',
        name: 'Computer Science',
        code: 'CS',
        category: 'Optional',
        type: 'Practical',
        curriculum: 'IGCSE',
        classes: ['Year 9', 'Year 10'],
        lessons: 3,
        teachers: [],
        status: 'Inactive',
        description: 'Introduction to programming and systems.',
        isGraded: true
    },
    {
        id: '5',
        name: 'Art & Design',
        code: 'ART',
        category: 'Elective',
        type: 'Practical',
        curriculum: 'CBC',
        classes: ['Grade 4', 'Grade 5'],
        lessons: 2,
        teachers: ['Bob Builder'],
        status: 'Active',
        description: 'Creative arts and design principles.',
        isGraded: false
    }
];

export const curriculumOptions = ['CBC', '8-4-4', 'IGCSE'];
export const categoryOptions = ['Core', 'Optional', 'Elective'];
export const activeYear = '2026';
