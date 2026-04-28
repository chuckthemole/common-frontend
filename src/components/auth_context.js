import React from "react";
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { isCurrentUserAuthenticated } from "./common_requests";
import logger, { useScopedLogger } from "../logger";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const SCOPED_LOGGER = useScopedLogger("AuthProvider", logger);

    const [authState, setAuthState] = useState({
        isLoading: true,
        isAuthenticated: false,
        roles: null,
        user: null,
    });

    // prevent duplicate concurrent calls
    const inFlightRef = useRef(false);

    const fetchAuthStatus = useCallback(async () => {
        if (inFlightRef.current) {
            SCOPED_LOGGER.debug("fetchAuthStatus skipped (already in flight)");
            return;
        }

        inFlightRef.current = true;

        SCOPED_LOGGER.debug("Fetching auth status...");

        try {
            const res = await isCurrentUserAuthenticated();

            const nextState = {
                isLoading: false,
                isAuthenticated: res?.authenticated,
                roles: res?.roles ?? null,
                user: res?.username ?? null,
            };

            setAuthState(nextState);

            SCOPED_LOGGER.debug("Auth state updated");
        } catch (err) {
            SCOPED_LOGGER.error("Failed to fetch auth status", err);

            setAuthState({
                isLoading: false,
                isAuthenticated: false,
                roles: null,
                user: null,
            });
        } finally {
            inFlightRef.current = false;
            SCOPED_LOGGER.debug("Finished fetchAuthStatus");
        }
    }, []);

    /**
     * Fetch ONCE on mount
     */
    useEffect(() => {
        fetchAuthStatus();
    }, [fetchAuthStatus]);

    /**
     * Log only on actual state change
     */
    useEffect(() => {
        SCOPED_LOGGER.debug("authState changed:", authState);
    }, [authState]);

    return (
        <AuthContext.Provider
            value={{ ...authState, refreshAuth: fetchAuthStatus }}
        >
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