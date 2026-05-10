import React from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../user";
import { ComponentLoading } from "../ui";

/**
 * -----------------------------------------------------------------------------
 * RequireAuth
 * -----------------------------------------------------------------------------
 *
 * Route-level guard.
 *
 * Responsibilities:
 *  - ensures user is authenticated
 *  - redirects if not
 *  - blocks rendering until auth resolves
 *
 * DO NOT use for UI layout.
 * -----------------------------------------------------------------------------
 */

export default function RequireAuth({
    children,
    redirectTo = "/",
}) {
    const {
        user,
        isLoading,
    } = useCurrentUser();

    if (isLoading) {
        return <ComponentLoading />;
    }

    if (!user) {
        return (
            <Navigate
                to={redirectTo}
                replace
            />
        );
    }

    return children;
}