const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (!response.ok) {
            // Backend error message
            // Create error object but attach the full data for component handling
            const error = new Error(data.detail || data.message || response.statusText || "Something went wrong");
            error.data = data;
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

export const api = {
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
