
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.100.27:8000';

export const dashboardService = {
    getStats: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/dashboard/stats/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Token ${token}` })
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch stats: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    getSimpleStats: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/dashboard/debug/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Token ${token}` })
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch simple stats: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching simple stats:', error);
            throw error;
        }
    }
};
