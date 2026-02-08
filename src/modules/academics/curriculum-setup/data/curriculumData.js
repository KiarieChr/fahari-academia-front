export const educationSystems = [
    { id: 'cbc', name: 'Competency Based Curriculum (CBC)' },
    { id: '8-4-4', name: '8-4-4 System' },
    { id: 'igcse', name: 'IGCSE (Cambridge)' },
    { id: 'ace', name: 'ACE' }
];

export const initialLevels = [
    {
        id: 'pp',
        name: 'Pre-Primary',
        code: 'PP',
        years: 2,
        classes: [
            { id: 'pp1', name: 'PP1', code: 'PP1', maxStudents: 25 },
            { id: 'pp2', name: 'PP2', code: 'PP2', maxStudents: 30 }
        ]
    },
    {
        id: 'pri',
        name: 'Primary',
        code: 'PRI',
        years: 6,
        classes: [
            { id: 'g1', name: 'Grade 1', code: 'G1', maxStudents: 40 },
            { id: 'g2', name: 'Grade 2', code: 'G2', maxStudents: 40 },
            { id: 'g3', name: 'Grade 3', code: 'G3', maxStudents: 40 }
        ]
    },
    {
        id: 'jss',
        name: 'Junior Secondary',
        code: 'JSS',
        years: 3,
        classes: [
            { id: 'g7', name: 'Grade 7', code: 'G7', maxStudents: 45 },
            { id: 'g8', name: 'Grade 8', code: 'G8', maxStudents: 45 }
        ]
    }
];

export const initialSubjects = [
    { id: 'math', name: 'Mathematics', code: 'MAT', category: 'Core', compulsory: true },
    { id: 'eng', name: 'English', code: 'ENG', category: 'Languages', compulsory: true },
    { id: 'kis', name: 'Kiswahili', code: 'KIS', category: 'Languages', compulsory: true },
    { id: 'sci', name: 'Integrated Science', code: 'SCI', category: 'Sciences', compulsory: true },
    { id: 'sst', name: 'Social Studies', code: 'SST', category: 'Humanities', compulsory: true },
    { id: 'cre', name: 'Religious Education', code: 'CRE', category: 'Humanities', compulsory: false },
    { id: 'comp', name: 'Computer Science', code: 'COMP', category: 'Technical', compulsory: false },
    { id: 'music', name: 'Music', code: 'MUS', category: 'Creative', compulsory: false },
    { id: 'art', name: 'Art & Craft', code: 'ART', category: 'Creative', compulsory: false }
];

export const renderMatrix = (levels, subjects) => {
    // Helper to generate initial matrix state (all enabled by default for demo)
    const matrix = {};
    levels.forEach(level => {
        level.classes.forEach(cls => {
            subjects.forEach(sub => {
                matrix[`${cls.id}-${sub.id}`] = true;
            });
        });
    });
    return matrix;
};
