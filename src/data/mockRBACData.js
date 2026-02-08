
// Mock Data for RBAC System

export const initialData = {
    roles: [
        {
            id: 1,
            name: 'Administrator',
            description: 'Full access to all system features and settings',
            status: 'active',
            isSystemRole: true,
            userCount: 3,
            createdAt: '2023-01-15',
            updatedAt: '2023-06-20',
            permissions: ['all'] // Special keyword or list of all IDs
        },
        {
            id: 2,
            name: 'Academic Registrar',
            description: 'Manage students, curriculum, and academic records',
            status: 'active',
            isSystemRole: false,
            userCount: 5,
            createdAt: '2023-02-10',
            updatedAt: '2023-05-15',
            permissions: ['read_students', 'write_students', 'read_academics', 'write_academics']
        },
        {
            id: 3,
            name: 'Finance Manager',
            description: 'Access to fees, payments, and financial reports',
            status: 'active',
            isSystemRole: false,
            userCount: 2,
            createdAt: '2023-02-12',
            updatedAt: '2023-04-01',
            permissions: ['read_finance', 'write_finance', 'read_fees', 'write_fees']
        },
        {
            id: 4,
            name: 'Teacher',
            description: 'Access to assigned classes, grading, and attendance',
            status: 'active',
            isSystemRole: false,
            userCount: 45,
            createdAt: '2023-03-01',
            updatedAt: '2023-03-01',
            permissions: ['read_students', 'write_marks', 'read_curriculum']
        },
        {
            id: 5,
            name: 'Guest / Parent',
            description: 'Limited read-only access to specific records',
            status: 'disabled',
            isSystemRole: false,
            userCount: 0,
            createdAt: '2023-05-20',
            updatedAt: '2023-05-20',
            permissions: ['read_reports']
        }
    ],

    permissions: [
        // Students Module
        { id: 'read_students', name: 'View Students', module: 'Students', description: 'View student profiles and lists' },
        { id: 'write_students', name: 'Edit Students', module: 'Students', description: 'Add, edit, or delete students' },
        { id: 'import_students', name: 'Import Students', module: 'Students', description: 'Bulk import student records' },

        // Academics Module
        { id: 'read_academics', name: 'View Academics', module: 'Academics', description: 'View curriculum and subjects' },
        { id: 'write_academics', name: 'Manage Curriculum', module: 'Academics', description: 'Create and edit curriculum' },
        { id: 'write_marks', name: 'Enter Marks', module: 'Academics', description: 'Input student assessment marks' },
        { id: 'approve_marks', name: 'Approve Marks', module: 'Academics', description: 'Finalize and publish results' },

        // Finance Module
        { id: 'read_finance', name: 'View Finance', module: 'Finance', description: 'View financial overview' },
        { id: 'write_finance', name: 'Manage Accounts', module: 'Finance', description: 'Manage charts of accounts' },
        { id: 'process_payments', name: 'Process Payments', module: 'Finance', description: 'Record and verify payments' },

        // HR Module
        { id: 'read_hr', name: 'View Staff', module: 'Human Resource', description: 'View staff directory' },
        { id: 'manage_payroll', name: 'Manage Payroll', module: 'Human Resource', description: 'Process staff payroll' },

        // Settings
        { id: 'manage_settings', name: 'System Settings', module: 'Settings', description: 'Configure general system settings' },
        { id: 'view_logs', name: 'View Audit Logs', module: 'Settings', description: 'Access system activity logs' }
    ],

    users: [
        { id: 101, name: 'John Doe', email: 'john.doe@school.edu', role: 'Administrator', roles: [1], avatar: 'JD' },
        { id: 102, name: 'Jane Smith', email: 'jane.smith@school.edu', role: 'Academic Registrar', roles: [2], avatar: 'JS' },
        { id: 103, name: 'Robert Brown', email: 'r.brown@school.edu', role: 'Teacher', roles: [4], avatar: 'RB' },
        { id: 104, name: 'Alice Johnson', email: 'alice.j@school.edu', role: 'Finance Manager', roles: [3], avatar: 'AJ' },
        { id: 105, name: 'Michael White', email: 'm.white@school.edu', role: 'Teacher', roles: [4], avatar: 'MW' },
    ],

    modules: ['Students', 'Academics', 'Finance', 'Human Resource', 'Settings', 'Users'],
    permissionTypes: ['read', 'write', 'delete', 'approve', 'export']
};

// Helper function to group permissions by module
export const getPermissionsByModule = (permissions) => {
    return permissions.reduce((acc, permission) => {
        if (!acc[permission.module]) {
            acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
    }, {});
};
