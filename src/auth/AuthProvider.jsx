import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'academia-token';
const USER_KEY = import.meta.env.VITE_USER_KEY || 'academia-user';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Function to check authentication status
    const checkAuth = async () => {
        try {
            // Check if user has a valid token in localStorage
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                return false;
            }

            // Verify the token is still valid with the backend
            const data = await api.get("/api/auth/me/");
            setIsAuthenticated(true);
            setUser(data);
            return true;
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                // Token is invalid or expired — clear it
                localStorage.removeItem(TOKEN_KEY);
                console.log("Token invalid/expired (401/403). Cleared from storage.");
            } else if (error.message?.includes("Network") || error.code === "ERR_NETWORK") {
                console.error("Network error during auth check. Backend may be offline.");
            } else {
                console.error("Auth check failed:", error.message || error);
            }
            setIsAuthenticated(false);
            setUser(null);
            return false;
        }
    };

    // Initialize auth on mount + listen for auth-change events (fired by LoginForm)
    useEffect(() => {
        const initAuth = async () => {
            try {
                await checkAuth();
            } finally {
                setLoading(false);
            }
        };

        const handleAuthChange = () => {
            checkAuth();
        };

        initAuth();

        window.addEventListener('auth-change', handleAuthChange);
        window.addEventListener('storage', handleAuthChange);
        return () => {
            window.removeEventListener('auth-change', handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
        };
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            const data = await api.post('/api/auth/login/', credentials);

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
                        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
                    }
                    if (data.token) {
                        localStorage.setItem(TOKEN_KEY, data.token);
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
                error: error.data || error.message
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
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(TOKEN_KEY);
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
