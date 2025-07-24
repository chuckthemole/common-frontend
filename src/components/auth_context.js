import React from 'react';
import { createContext, useContext, useState, useEffect } from "react";
import { isCurrentUserAuthenticated } from "./common_requests";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isLoading: true,
        isAuthenticated: false,
        roles: null,
        user: null,
    });

    const fetchAuthStatus = async () => {
        try {
            const res = await isCurrentUserAuthenticated();
            setAuthState({
                isLoading: false,
                isAuthenticated: res.authenticated,
                roles: res.roles ?? null,
                user: res.username ?? null,
            });
        } catch (err) {
            console.error("Failed to fetch auth status", err);
            setAuthState({
                isLoading: false,
                isAuthenticated: false,
                roles: null,
                user: null,
            });
        }
    };

    useEffect(() => {
        fetchAuthStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ ...authState, refreshAuth: fetchAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
