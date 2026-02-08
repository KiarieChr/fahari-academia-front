const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async (response, options = {}) => {
    const contentType = response.headers.get("content-type");
    if (options.responseType === 'blob') {
        return response.blob();
    }
    if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (!response.ok) {
            // Backend error message
            // Create error object but attach the full data for component handling
            const error = new Error(data.detail || data.message || response.statusText || "Something went wrong");
            error.data = data;
            error.status = response.status;
            throw error;
        }
        return data;
    }
    // Handle non-JSON responses
    if (!response.ok) {
        throw new Error(response.statusText || "Network response was not ok");
    }
    return response.text();
};

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Token ${token}` } : {};
};

export const api = {
    // Generic HTTP methods
    get: async (url, options = {}) => {
        try {
            const separator = url.includes('?') ? '&' : '?';
            const queryString = options.params ? `${separator}${new URLSearchParams(options.params)}` : '';
            const response = await fetch(`${API_URL}${url}${queryString}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                    ...(options.headers || {})
                },
            });
            return handleResponse(response, options);
        } catch (error) {
            throw error;
        }
    },

    post: async (url, data, options = {}) => {
        try {
            const isFormData = data instanceof FormData;
            const headers = {
                ...getAuthHeaders(),
                ...(options.headers || {})
            };

            if (!isFormData && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            // Handle FormData specifically if needed, but for now assume JSON unless specified
            const body = options.body || (isFormData ? data : JSON.stringify(data));

            const response = await fetch(`${API_URL}${url}`, {
                method: 'POST',
                headers,
                body,
            });
            return handleResponse(response, options);
        } catch (error) {
            throw error;
        }
    },

    put: async (url, data, options = {}) => {
        try {
            const isFormData = data instanceof FormData;
            const headers = {
                ...getAuthHeaders(),
                ...(options.headers || {})
            };

            if (!isFormData && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${API_URL}${url}`, {
                method: 'PUT',
                headers,
                body: isFormData ? data : JSON.stringify(data),
            });
            return handleResponse(response, options);
        } catch (error) {
            throw error;
        }
    },

    patch: async (url, data, options = {}) => {
        try {
            const isFormData = data instanceof FormData;
            const headers = {
                ...getAuthHeaders(),
                ...(options.headers || {})
            };

            if (!isFormData && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${API_URL}${url}`, {
                method: 'PATCH',
                headers,
                body: isFormData ? data : JSON.stringify(data),
            });
            return handleResponse(response, options);
        } catch (error) {
            throw error;
        }
    },

    delete: async (url, options = {}) => {
        try {
            const response = await fetch(`${API_URL}${url}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                    ...(options.headers || {})
                },
            });
            return handleResponse(response, options);
        } catch (error) {
            throw error;
        }
    },

    login: async (credentials) => {
        try {
            // Assuming DRF/Django, endpoint likely requires username & password
            const response = await fetch(`${API_URL}/api/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });
            return handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    // Used for changing the password on first login
    firstTimeSetup: async (data) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/first-time-setup/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // You might need to pass the auth token here if the user is considered "logged in" but restricted
                    // 'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        try {
            const response = await fetch(`${API_URL}/api/auth/logout/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            return handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    // Placeholder - Not implemented yet
    forgotPassword: async (email) => {
        console.warn("Forgot password not implemented on backend");
        throw new Error("Feature not available yet.");
    }
};
