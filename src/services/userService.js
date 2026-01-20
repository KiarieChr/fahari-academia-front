
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.100.27:8000';

export const userService = {
    getUsers: async (params = {}) => {
        try {
            // Build query string
            const queryString = new URLSearchParams(params).toString();
            // const response = await fetch(`${API_URL}/api/users/?${queryString}`);
            // return await response.json();

            // Mock Data
            const users = [
                { id: 1, first_name: 'Mary', last_name: 'Principal', email: 'mary@school.com', role: 'Admin', status: 'Active', last_login: '2025-10-24' },
                { id: 2, first_name: 'John', last_name: 'Doe', email: 'john.doe@student.com', role: 'Student', status: 'Active', last_login: '2025-10-23' },
                { id: 3, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@lecturer.com', role: 'Lecturer', status: 'Active', last_login: '2025-10-22' },
                { id: 4, first_name: 'Robert', last_name: 'Brown', email: 'robert.b@parent.com', role: 'Parent', status: 'Inactive', last_login: '2025-09-15' },
                { id: 5, first_name: 'Alice', last_name: 'Johnson', email: 'alice.j@admin.com', role: 'Admin', status: 'Active', last_login: '2025-10-24' },
                { id: 6, first_name: 'Michael', last_name: 'Clark', email: 'michael.c@student.com', role: 'Student', status: 'Active', last_login: '2025-10-21' },
                { id: 7, first_name: 'Sarah', last_name: 'Wilson', email: 'sarah.w@lecturer.com', role: 'Lecturer', status: 'Active', last_login: '2025-10-20' },
                { id: 8, first_name: 'David', last_name: 'Taylor', email: 'david.t@parent.com', role: 'Parent', status: 'Active', last_login: '2025-10-18' },
                { id: 9, first_name: 'Emily', last_name: 'Anderson', email: 'emily.a@student.com', role: 'Student', status: 'Inactive', last_login: '2025-09-01' },
                { id: 10, first_name: 'James', last_name: 'Thomas', email: 'james.t@lecturer.com', role: 'Lecturer', status: 'Active', last_login: '2025-10-19' },
            ];

            return {
                success: true,
                data: users,
                total: 50, // Mock total for pagination
                page: params.page || 1,
                limit: params.limit || 10
            };
        } catch (error) {
            throw error;
        }
    },

    createUser: async (userData) => {
        // Mock create
        return { success: true, message: 'User created successfully', data: { id: Math.random(), ...userData } };
    },

    updateUser: async (id, userData) => {
        return { success: true, message: 'User updated' };
    },

    deleteUser: async (id) => {
        return { success: true, message: 'User deleted' };
    }
};
