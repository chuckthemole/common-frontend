import React, { useState, useEffect, useRef, useCallback } from "react";
import AuthContext from "./auth-context";
import { isCurrentUserAuthenticated } from "../common_requests";
import logger, { useScopedLogger } from "../../logger";

export const AuthProvider = ({ children }) => {
    const SCOPED_LOGGER = useScopedLogger("AuthProvider", logger);

    const [authState, setAuthState] = useState({
        isLoading: true,
        isAuthenticated: false,
        roles: null,
        user: null,
    });

    const inFlightRef = useRef(false);

    const fetchAuthStatus = useCallback(async () => {
        if (inFlightRef.current) {
            SCOPED_LOGGER.debug("fetchAuthStatus skipped (already in flight)");
            return;
        }

        inFlightRef.current = true;

        try {
            const res = await isCurrentUserAuthenticated();

            const nextState = {
                isLoading: false,
                isAuthenticated: res?.authenticated,
                roles: res?.roles ?? null,
                user: res?.username ?? null,
            };

            setAuthState(nextState);
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
        }
    }, []);

    useEffect(() => {
        fetchAuthStatus();
    }, [fetchAuthStatus]);

    useEffect(() => {
        SCOPED_LOGGER.debug("authState changed:", authState);
    }, [authState]);

    return (
        <AuthContext.Provider
            value={{
                ...authState,
                refreshAuth: fetchAuthStatus,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};