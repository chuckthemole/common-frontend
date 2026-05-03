import { useEffect, useMemo, useRef } from "react";
import { eventLogger } from "./event-logger";
import useUser from "../user/current-user/useCurrentUserDataSource";
import logger, { useScopedLogger } from "../../logger";

export default function EventLoggerProvider({ children }) {

    const SCOPED_LOGGER = useScopedLogger("EventLoggerProvider", logger);
    const lastUserRef = useRef(null);

    const {
        user,
        loading,
        isAuthenticated,
    } = useUser({
        autoFetch: true,
        endpoints: {
            get: "/api/current_user",
        },
    });

    useEffect(() => {
        if (loading) {
            SCOPED_LOGGER.debug("user still loading...");
            return;
        }

        if (!user) {
            SCOPED_LOGGER.debug("no user returned", {
                isAuthenticated,
            });
            return;
        }

        // avoid duplicate logs for same object
        if (lastUserRef.current === user) return;
        lastUserRef.current = user;

        SCOPED_LOGGER.debug("user object received", {
            user,
            keys: Object.keys(user),
            isAuthenticated,
        });

    }, [user, loading, isAuthenticated]);

    /**
     * Build context (only meaningful once user exists)
     */
    const userId = user?.id ?? null;
    const username = user?.username ?? null;
    const context = useMemo(() => {
        const ctx = {
            userId: userId,
            username: username,
            isAuthenticated: isAuthenticated ?? false,
        };

        SCOPED_LOGGER.debug("computed context", ctx);

        return ctx;
    }, [userId, username, isAuthenticated]);

    /**
     * Sync into EventLogger (but only after loading resolves)
     *
     * FIXES:
     * - avoid repeated setContext calls for identical logical state
     * - guard using a stable primitive "contextKey"
     */
    const lastContextRef = useRef(null);
    const contextKey = `${userId}:${username}:${isAuthenticated}`;
    useEffect(() => {
        if (loading) {
            SCOPED_LOGGER.debug("still loading user → skip context sync");
            return;
        }

        if (lastContextRef.current === contextKey) {
            return;
        }

        lastContextRef.current = contextKey;

        SCOPED_LOGGER.debug("sync context → EventLogger");

        eventLogger.setContext(context);

        SCOPED_LOGGER.debug("context applied");

    }, [contextKey, context, loading]);

    return children;
}