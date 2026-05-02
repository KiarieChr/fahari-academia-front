
const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'academia-token';

export const dashboardService = {
    getStats: async () => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
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
            const token = localStorage.getItem(TOKEN_KEY);
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
