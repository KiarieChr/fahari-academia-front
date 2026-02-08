import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Function to check authentication status
    const checkAuth = async () => {
        try {
            // Ensure CSRF token is set
            await api.get("/api/csrf/");
            const res = await api.get("/api/auth/me/");
            setIsAuthenticated(true);
            setUser(res.data);
            return true;
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                // Determine if this is a session expiry or just not logged in
                console.log("User not currently authenticated via session.");
            } else if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
                console.error("Auth check failed due to Network Error. Check if backend is running on port 8000.");
            } else {
                console.error("Auth check failed unexpectedly:", error);
            }
            setIsAuthenticated(false);
            setUser(null);
            return false;
        }
    };

    // Initialize auth on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                await checkAuth();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            const response = await api.post('/api/auth/login/', credentials);
            const data = response.data;

            if (data.success) {
                if (data.requires_setup) {
                    // For first-time setup, don't set auth yet
                    return {
                        success: true,
                        requiresSetup: true,
                        userId: data.user_id
                    };
                } else {
                    // Normal login successful
                    setIsAuthenticated(true);
                    if (data.user) {
                        setUser(data.user);
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    }
                    return { success: true, requiresSetup: false, user: data.user };
                }
            } else {
                return { success: false, errors: data.errors };
            }
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await api.post('/api/auth/logout/');
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            setIsAuthenticated,
            loading,
            user,
            setUser,
            login,
            logout,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

// Shared Animation Variants
export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};
