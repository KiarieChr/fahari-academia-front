
export const mockKPIs = {
    totalArrears: 12500000,
    studentCount: 450,
    averageArrears: 27777,
    highestArrears: 150000,
    fullyPaidCount: 850,
    arrearsGrowth: -5.2, // Negative means reduction, good
};

export const mockArrearsByClass = [
    { name: 'Form 1', value: 4500000 },
    { name: 'Form 2', value: 3200000 },
    { name: 'Form 3', value: 2800000 },
    { name: 'Form 4', value: 2000000 },
];

export const mockArrearsByIntake = [
    { name: 'Jan 2024', value: 40 },
    { name: 'May 2024', value: 30 },
    { name: 'Sep 2023', value: 30 },
];

export const mockMonthlyTrend = [
    { month: 'Jan', amount: 12000000 },
    { month: 'Feb', amount: 13500000 },
    { month: 'Mar', amount: 13000000 },
    { month: 'Apr', amount: 12500000 },
    { month: 'May', amount: 12800000 },
    { month: 'Jun', amount: 12500000 },
];

export const mockStudentsInArrears = [
    { id: 1, name: "John Doe", admNo: "ADM001", class: "Form 4", term: "Term 2", payable: 50000, paid: 30000, balance: 20000, status: "Active" },
    { id: 2, name: "Jane Smith", admNo: "ADM002", class: "Form 3", term: "Term 2", payable: 45000, paid: 10000, balance: 35000, status: "Active" },
    { id: 3, name: "Alice Johnson", admNo: "ADM003", class: "Form 2", term: "Term 2", payable: 40000, paid: 0, balance: 40000, status: "Active" },
    { id: 4, name: "Bob Brown", admNo: "ADM004", class: "Form 1", term: "Term 2", payable: 35000, paid: 34000, balance: 1000, status: "Active" },
    { id: 5, name: "Charlie Davis", admNo: "ADM005", class: "Form 4", term: "Term 1", payable: 50000, paid: 20000, balance: 30000, status: "Long Overdue" },
];
