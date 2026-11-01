import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import AuthRolesContext from "./auth-roles-context";

import logger, {
    useScopedLogger,
} from "../../../logger";

import { getApi } from "../../../api/client/api";

/**
 * Endpoints intentionally remain unconfigured until the REST API exists.
 *
 * Each endpoint may be:
 *   - null: not configured
 *   - string: a static URL
 *   - function: receives the relevant parameters and returns a URL
 *
 * Examples:
 *
 * listRoles: "/api/roles",
 *
 * listUserRoles: ({ userId }) =>
 *     `/api/users/${encodeURIComponent(userId)}/roles`,
 *
 * grantRole: ({ userId }) =>
 *     `/api/users/${encodeURIComponent(userId)}/roles`,
 *
 * revokeRole: ({ userId, assignmentId }) =>
 *     `/api/users/${encodeURIComponent(userId)}/roles/${assignmentId}`,
 */
const DEFAULT_ENDPOINTS = Object.freeze({
    listRoles: null,
    listUserRoles: null,
    grantRole: null,
    revokeRole: null,
});

/**
 * Convert an Axios response or a response body into an array.
 *
 * Supported response shapes include:
 *   [...]
 *   { data: [...] }
 *   { items: [...] }
 *   { roles: [...] }
 *   { assignments: [...] }
 *   { authorities: [...] }
 *
 * Customize this helper if your API uses a different response contract.
 */
function extractArray(response, keys = []) {
    let value = response?.data ?? response;

    if (Array.isArray(value)) {
        return value;
    }

    if (!value || typeof value !== "object") {
        throw new Error(
            "Expected an array in the API response."
        );
    }

    for (const key of keys) {
        if (Array.isArray(value[key])) {
            return value[key];
        }
    }

    throw new Error(
        `Expected an array or one of these response fields: ${keys.join(", ")}.`
    );
}

/**
 * Resolve an endpoint URL.
 *
 * Throwing here makes an unconfigured endpoint visible immediately,
 * rather than silently making an invalid request.
 */
function resolveEndpoint(endpoint, params, endpointName) {
    if (typeof endpoint === "function") {
        const url = endpoint(params);

        if (typeof url === "string" && url.trim()) {
            return url;
        }
    } else if (
        typeof endpoint === "string" &&
        endpoint.trim()
    ) {
        return endpoint;
    }

    throw new Error(
        `AuthRolesProvider: endpoint "${endpointName}" is not configured.`
    );
}

export default function AuthRolesProvider({
    children,

    /**
     * The user whose role assignments are being managed.
     * Use the same identifier type your backend expects.
     */
    userId = null,

    /**
     * Supply your endpoint paths when your REST API is ready.
     */
    endpoints = DEFAULT_ENDPOINTS,

    /**
     * Load role definitions on mount.
     * User assignments are loaded when userId is supplied.
     */
    autoFetch = true,

    /**
     * Payload sent to the grant endpoint.
     * The default assumes the backend accepts { roleId }.
     * Change this if your API expects a role name or another shape.
     */
    buildGrantPayload = ({ roleId, payload }) => ({
        ...payload,
        roleId,
    }),
}) {
    const SCOPED_LOGGER = useScopedLogger(
        "AuthRolesProvider",
        logger
    );

    const [roles, setRoles] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [rolesLoading, setRolesLoading] = useState(false);
    const [assignmentsLoading, setAssignmentsLoading] =
        useState(false);

    const [rolesError, setRolesError] = useState(null);
    const [assignmentsError, setAssignmentsError] =
        useState(null);

    const [mutationLoading, setMutationLoading] =
        useState(false);
    const [mutationError, setMutationError] = useState(null);

    /**
     * Avoid applying an older request's result after a newer
     * request for the same resource has started.
     */
    const rolesRequestId = useRef(0);
    const assignmentsRequestId = useRef(0);

    /**
     * Fetch all available role definitions.
     */
    const refreshRoles = useCallback(async () => {
        const requestId = ++rolesRequestId.current;

        setRolesLoading(true);
        setRolesError(null);

        try {
            const api = getApi();

            const url = resolveEndpoint(
                endpoints.listRoles,
                {},
                "listRoles"
            );

            SCOPED_LOGGER.debug(
                "Fetching role definitions",
                { url }
            );

            const response = await api.get(url);

            const nextRoles = extractArray(
                response,
                ["roles", "items", "content", "authorities"]
            );

            if (requestId === rolesRequestId.current) {
                setRoles(nextRoles);
            }

            return nextRoles;
        } catch (error) {
            SCOPED_LOGGER.error(
                "Failed to fetch role definitions",
                error
            );

            if (requestId === rolesRequestId.current) {
                setRolesError(error);
            }

            throw error;
        } finally {
            if (requestId === rolesRequestId.current) {
                setRolesLoading(false);
            }
        }
    }, [endpoints.listRoles, SCOPED_LOGGER]);

    /**
     * Fetch the role assignments for a particular user.
     *
     * An assignment may contain its own ID, the user ID, and a
     * reference to a role definition. Keep the full object rather
     * than reducing assignments to role-name strings.
     */
    const refreshAssignments = useCallback(
        async (targetUserId = userId) => {
            if (
                targetUserId === null ||
                targetUserId === undefined ||
                targetUserId === ""
            ) {
                throw new Error(
                    "Cannot fetch role assignments without a userId."
                );
            }

            const requestId = ++assignmentsRequestId.current;

            setAssignmentsLoading(true);
            setAssignmentsError(null);

            try {
                const api = getApi();

                const url = resolveEndpoint(
                    endpoints.listUserRoles,
                    { userId: targetUserId },
                    "listUserRoles"
                );

                SCOPED_LOGGER.debug(
                    "Fetching user role assignments",
                    { userId: targetUserId, url }
                );

                const response = await api.get(url);

                const nextAssignments = extractArray(
                    response,
                    [
                        "assignments",
                        "userRoles",
                        "userAuthorities",
                        "roles",
                        "items",
                        "content",
                    ]
                );

                if (requestId === assignmentsRequestId.current) {
                    setAssignments(nextAssignments);
                }

                return nextAssignments;
            } catch (error) {
                SCOPED_LOGGER.error(
                    "Failed to fetch user role assignments",
                    error
                );

                if (requestId === assignmentsRequestId.current) {
                    setAssignmentsError(error);
                }

                throw error;
            } finally {
                if (requestId === assignmentsRequestId.current) {
                    setAssignmentsLoading(false);
                }
            }
        },
        [userId, endpoints.listUserRoles, SCOPED_LOGGER]
    );

    /**
     * Grant a role to a user.
     *
     * roleId is the role-definition ID, not necessarily the
     * user-role assignment ID.
     */
    const grantRole = useCallback(
        async ({
            roleId,
            payload = {},
            targetUserId = userId,
        } = {}) => {
            if (
                targetUserId === null ||
                targetUserId === undefined ||
                targetUserId === ""
            ) {
                throw new Error(
                    "Cannot grant a role without a userId."
                );
            }

            if (
                roleId === null ||
                roleId === undefined ||
                roleId === ""
            ) {
                throw new Error(
                    "Cannot grant a role without a roleId."
                );
            }

            setMutationLoading(true);
            setMutationError(null);

            try {
                const api = getApi();

                const url = resolveEndpoint(
                    endpoints.grantRole,
                    {
                        userId: targetUserId,
                        roleId,
                    },
                    "grantRole"
                );

                const requestBody = buildGrantPayload({
                    userId: targetUserId,
                    roleId,
                    payload,
                });

                SCOPED_LOGGER.debug(
                    "Granting role to user",
                    {
                        userId: targetUserId,
                        roleId,
                        url,
                    }
                );

                const response = await api.post(
                    url,
                    requestBody
                );

                /**
                 * Refresh only after the mutation succeeds.
                 * A refresh failure is recorded separately and
                 * does not undo the successful grant.
                 */
                try {
                    await refreshAssignments(targetUserId);
                } catch (refreshError) {
                    SCOPED_LOGGER.warn(
                        "Role granted, but assignments could not be refreshed",
                        refreshError
                    );
                }

                return response?.data ?? response;
            } catch (error) {
                setMutationError(error);

                SCOPED_LOGGER.error(
                    "Failed to grant role",
                    error
                );

                throw error;
            } finally {
                setMutationLoading(false);
            }
        },
        [
            userId,
            endpoints.grantRole,
            buildGrantPayload,
            refreshAssignments,
            SCOPED_LOGGER,
        ]
    );

    /**
     * Revoke a role assignment.
     *
     * Pass the assignment ID if your API identifies individual
     * user-role rows. If your API instead revokes by role ID,
     * adjust the endpoint and request here.
     */
    const revokeRole = useCallback(
        async ({
            assignmentId,
            roleId,
            targetUserId = userId,
            payload,
        } = {}) => {
            if (
                targetUserId === null ||
                targetUserId === undefined ||
                targetUserId === ""
            ) {
                throw new Error(
                    "Cannot revoke a role without a userId."
                );
            }

            if (
                assignmentId === null ||
                assignmentId === undefined ||
                assignmentId === ""
            ) {
                throw new Error(
                    "Cannot revoke a role without an assignmentId."
                );
            }

            setMutationLoading(true);
            setMutationError(null);

            try {
                const api = getApi();

                const url = resolveEndpoint(
                    endpoints.revokeRole,
                    {
                        userId: targetUserId,
                        assignmentId,
                        roleId,
                    },
                    "revokeRole"
                );

                SCOPED_LOGGER.debug(
                    "Revoking user role assignment",
                    {
                        userId: targetUserId,
                        assignmentId,
                        roleId,
                        url,
                    }
                );

                const response = await api.delete(url, {
                    ...(payload !== undefined
                        ? { data: payload }
                        : {}),
                });

                try {
                    await refreshAssignments(targetUserId);
                } catch (refreshError) {
                    SCOPED_LOGGER.warn(
                        "Role revoked, but assignments could not be refreshed",
                        refreshError
                    );
                }

                return response?.data ?? response;
            } catch (error) {
                setMutationError(error);

                SCOPED_LOGGER.error(
                    "Failed to revoke role",
                    error
                );

                throw error;
            } finally {
                setMutationLoading(false);
            }
        },
        [
            userId,
            endpoints.revokeRole,
            refreshAssignments,
            SCOPED_LOGGER,
        ]
    );

    /**
     * Clear the current user's assignment state.
     * Useful on logout or when switching users.
     */
    const clearAssignments = useCallback(() => {
        assignmentsRequestId.current += 1;

        setAssignments([]);
        setAssignmentsError(null);
        setAssignmentsLoading(false);
        setMutationError(null);
    }, []);

    /**
     * Fetch definitions on mount. Fetch assignments only when
     * there is a userId and an assignment endpoint configured.
     *
     * The cancellation flag prevents this effect from reporting
     * an unhandled rejection when it is cleaned up.
     */
    useEffect(() => {
        if (!autoFetch) {
            return undefined;
        }

        let active = true;

        if (endpoints.listRoles) {
            refreshRoles().catch(() => {
                // Error is exposed through rolesError.
            });
        }

        if (
            userId !== null &&
            userId !== undefined &&
            userId !== "" &&
            endpoints.listUserRoles
        ) {
            refreshAssignments(userId).catch(() => {
                // Error is exposed through assignmentsError.
            });
        } else {
            clearAssignments();
        }

        return () => {
            active = false;

            // Invalidate requests started by this effect.
            // The request-ID checks also prevent stale state writes.
            if (!active) {
                assignmentsRequestId.current += 1;
            }
        };
    }, [
        autoFetch,
        userId,
        endpoints.listRoles,
        endpoints.listUserRoles,
        refreshRoles,
        refreshAssignments,
        clearAssignments,
    ]);

    /**
     * Convenience list of authority names.
     *
     * Adapt this if your API returns role names under another field.
     */
    const roleNames = useMemo(
        () =>
            roles
                .map((role) => role?.authority ?? role?.name)
                .filter(
                    (name) =>
                        typeof name === "string" &&
                        name.length > 0
                ),
        [roles]
    );

    const value = useMemo(
        () => ({
            // Data
            roles,
            roleNames,
            assignments,
            userId,

            // Loading
            rolesLoading,
            assignmentsLoading,
            mutationLoading,
            loading:
                rolesLoading ||
                assignmentsLoading ||
                mutationLoading,

            // Errors
            rolesError,
            assignmentsError,
            mutationError,

            // Queries / refresh
            refreshRoles,
            refreshAssignments,

            // Mutations
            grantRole,
            revokeRole,

            // Local state
            clearAssignments,
        }),
        [
            roles,
            roleNames,
            assignments,
            userId,
            rolesLoading,
            assignmentsLoading,
            mutationLoading,
            rolesError,
            assignmentsError,
            mutationError,
            refreshRoles,
            refreshAssignments,
            grantRole,
            revokeRole,
            clearAssignments,
        ]
    );

    return (
        <AuthRolesContext.Provider value={value}>
            {children}
        </AuthRolesContext.Provider>
    );
}