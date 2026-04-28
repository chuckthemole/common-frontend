import { useEffect, useMemo, useRef } from "react";
import { eventLogger } from "./event-logger";
import useUser from "../hooks/use_user";
import logger, { useScopedLogger } from "../../logger";

export default function EventLoggerProvider({ children }) {

    const SCOPED_LOGGER = useScopedLogger("EventLoggerProvider", logger);

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