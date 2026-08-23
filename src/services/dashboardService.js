
const getDynamicApiUrl = () => {
    if (import.meta.env.PROD) return ''; // Always use relative paths in production
    const isLocalDevServer = window.location.port === '5173' || window.location.port === '3000';
    if (isLocalDevServer) return `${window.location.protocol}//${window.location.hostname}:8000`;
    return import.meta.env.VITE_API_URL || '';
};
const API_URL = getDynamicApiUrl();
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
