
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import RolesAssignmentContext from "./roles-assignment-context";

import logger, {
    useScopedLogger,
} from "../../../../logger";

import { getApi } from "../../../../api/client/api";

/**
 * All endpoints are required.
 *
 * Each endpoint can be:
 *   - A static URL string.
 *   - A function receiving request parameters and returning a URL.
 *
 * Example:
 *
 * const endpoints = {
 *     listUserRoles: ({ userId }) =>
 *         `/api/users/${encodeURIComponent(userId)}/roles`,
 *
 *     grantRole: ({ userId }) =>
 *         `/api/users/${encodeURIComponent(userId)}/roles`,
 *
 *     revokeRole: ({ userId, assignmentId }) =>
 *         `/api/users/${encodeURIComponent(userId)}/roles/${encodeURIComponent(assignmentId)}`,
 * };
 */
const DEFAULT_ENDPOINTS = Object.freeze({
    listUserRoles: null,
    grantRole: null,
    revokeRole: null,
});

/**
 * Extract an array from the supported API response formats.
 *
 * Supports:
 *   [...]
 *   { data: [...] }
 *   { assignments: [...] }
 *   { userRoles: [...] }
 *   { userAuthorities: [...] }
 *   { items: [...] }
 *   { content: [...] }
 *
 * Keep this aligned with the backend response contract.
 */
function extractAssignments(response) {
    const data = response?.data ?? response;

    if (Array.isArray(data)) {
        return data;
    }

    if (!data || typeof data !== "object") {
        throw new Error(
            "Expected an array of user role assignments."
        );
    }

    const supportedFields = [
        "assignments",
        "userRoles",
        "userAuthorities",
        "items",
        "content",
    ];

    for (const field of supportedFields) {
        if (Array.isArray(data[field])) {
            return data[field];
        }
    }

    throw new Error(
        `Expected an array in the API response. Supported fields: ${supportedFields.join(", ")}.`
    );
}

/**
 * Validate endpoint configuration.
 *
 * Fail immediately during provider initialization rather than
 * allowing the application to run with incomplete configuration.
 */
function validateEndpoints(endpoints) {
    if (!endpoints || typeof endpoints !== "object") {
        throw new Error(
            "RolesAssignmentProvider: endpoints must be an object."
        );
    }

    const requiredEndpoints = [
        "listUserRoles",
        "grantRole",
        "revokeRole",
    ];

    for (const name of requiredEndpoints) {
        const endpoint = endpoints[name];

        if (
            typeof endpoint !== "string" &&
            typeof endpoint !== "function"
        ) {
            throw new Error(
                `RolesAssignmentProvider: required endpoint "${name}" is not configured.`
            );
        }

        if (
            typeof endpoint === "string" &&
            !endpoint.trim()
        ) {
            throw new Error(
                `RolesAssignmentProvider: endpoint "${name}" cannot be an empty string.`
            );
        }
    }
}

/**
 * Resolve a static or dynamic endpoint.
 *
 * Dynamic endpoint functions receive the parameters relevant
 * to the current request.
 */
function resolveEndpoint(endpoint, params, endpointName) {
    const url =
        typeof endpoint === "function"
            ? endpoint(params)
            : endpoint;

    if (
        typeof url !== "string" ||
        !url.trim()
    ) {
        throw new Error(
            `RolesAssignmentProvider: endpoint "${endpointName}" did not resolve to a valid URL.`
        );
    }

    return url;
}

/**
 * Check whether a required identifier is missing.
 */
function isMissing(value) {
    return (
        value === null ||
        value === undefined ||
        value === ""
    );
}

export default function RolesAssignmentProvider({
    children,

    /**
     * User whose role assignments are being managed.
     */
    userId = null,

    /**
     * Required API endpoint configuration.
     */
    endpoints = DEFAULT_ENDPOINTS,

    /**
     * Automatically retrieve assignments when the provider
     * mounts or userId changes.
     */
    autoFetch = true,

    /**
     * Customize the grant request body.
     *
     * Default API payload:
     * { roleId: 123 }
     */
    buildGrantPayload = ({ roleId, payload }) => ({
        ...payload,
        roleId,
    }),
}) {
    const SCOPED_LOGGER = useScopedLogger(
        "RolesAssignmentProvider",
        logger
    );

    // Validate configuration immediately.
    validateEndpoints(endpoints);

    // ----------------------------------------------------------------
    // State
    // ----------------------------------------------------------------

    const [assignments, setAssignments] = useState([]);

    const [assignmentsLoading, setAssignmentsLoading] =
        useState(false);

    const [assignmentsError, setAssignmentsError] =
        useState(null);

    /**
     * Track outstanding mutations rather than using a boolean.
     * This prevents one completed request from incorrectly
     * setting loading to false while another request is running.
     */
    const [mutationCount, setMutationCount] = useState(0);

    const [mutationError, setMutationError] = useState(null);

    const mutationLoading = mutationCount > 0;

    // ----------------------------------------------------------------
    // Request tracking
    // ----------------------------------------------------------------

    /**
     * Incremented whenever a new assignment request begins.
     * Only the latest request is allowed to update state.
     */
    const assignmentsRequestId = useRef(0);

    // ----------------------------------------------------------------
    // Queries
    // ----------------------------------------------------------------

    /**
     * Retrieve all role assignments for a user.
     *
     * An optional targetUserId allows callers to retrieve
     * assignments for a user other than the provider's userId.
     */
    const refreshAssignments = useCallback(
        async (targetUserId = userId) => {
            if (isMissing(targetUserId)) {
                throw new Error(
                    "RolesAssignmentProvider: cannot fetch assignments without a userId."
                );
            }

            const requestId =
                ++assignmentsRequestId.current;

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
                    {
                        userId: targetUserId,
                        url,
                    }
                );

                const response = await api.get(url);

                const nextAssignments =
                    extractAssignments(response);

                // Prevent stale requests from overwriting newer data.
                if (
                    requestId === assignmentsRequestId.current
                ) {
                    setAssignments(nextAssignments);
                }

                return nextAssignments;
            } catch (error) {
                SCOPED_LOGGER.error(
                    "Failed to fetch user role assignments",
                    error
                );

                if (
                    requestId === assignmentsRequestId.current
                ) {
                    setAssignmentsError(error);
                }

                throw error;
            } finally {
                if (
                    requestId === assignmentsRequestId.current
                ) {
                    setAssignmentsLoading(false);
                }
            }
        },
        [
            userId,
            endpoints.listUserRoles,
            SCOPED_LOGGER,
        ]
    );

    // ----------------------------------------------------------------
    // Mutations
    // ----------------------------------------------------------------

    /**
     * Grant a role to a user.
     *
     * The assignment list is refreshed after a successful grant.
     */
    const grantRole = useCallback(
        async ({
            authority,
            expiresAt = null,
            targetUserId = userId,
        } = {}) => {
            if (isMissing(targetUserId)) {
                throw new Error(
                    "RolesAssignmentProvider: cannot grant a role without a userId."
                );
            }

            if (isMissing(authority)) {
                throw new Error(
                    "RolesAssignmentProvider: cannot grant a role without an authority."
                );
            }

            setMutationCount((count) => count + 1);
            setMutationError(null);

            try {
                const api = getApi();

                const url = resolveEndpoint(
                    endpoints.grantRole,
                    {
                        userId: targetUserId,
                        authority,
                    },
                    "grantRole"
                );

                const requestBody = {
                    authority,
                    expiresAt,
                };

                SCOPED_LOGGER.debug(
                    "Granting role to user",
                    {
                        userId: targetUserId,
                        authority,
                        expiresAt,
                        url,
                    }
                );

                const response = await api.post(
                    url,
                    requestBody
                );

                try {
                    await refreshAssignments(targetUserId);
                } catch (refreshError) {
                    SCOPED_LOGGER.warn(
                        "Role granted successfully, but assignments could not be refreshed.",
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
                setMutationCount((count) =>
                    Math.max(0, count - 1)
                );
            }
        },
        [
            userId,
            endpoints.grantRole,
            refreshAssignments,
            SCOPED_LOGGER,
        ]
    );

    /**
     * Revoke a role assignment.
     * 
     * The assignment list is refreshed after a successful revoke.
     */
    const revokeRole = useCallback(
        async ({
            targetUserId = userId,
            authority,
        } = {}) => {
            if (isMissing(targetUserId)) {
                throw new Error(
                    "RolesAssignmentProvider: cannot revoke a role without a userId."
                );
            }

            if (isMissing(authority)) {
                throw new Error(
                    "RolesAssignmentProvider: cannot revoke a role without an authority."
                );
            }

            setMutationCount((count) => count + 1);
            setMutationError(null);

            try {
                const api = getApi();

                const url = resolveEndpoint(
                    endpoints.revokeRole,
                    {
                        userId: targetUserId,
                        revokeRole: authority,
                    },
                    "revokeRole"
                );

                SCOPED_LOGGER.debug(
                    "Revoking role from user",
                    {
                        userId: targetUserId,
                        authority,
                        url,
                    }
                );

                const response = await api.delete(url);

                try {
                    await refreshAssignments(targetUserId);
                } catch (refreshError) {
                    SCOPED_LOGGER.warn(
                        "Role revoked successfully, but assignments could not be refreshed.",
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
                setMutationCount((count) =>
                    Math.max(0, count - 1)
                );
            }
        },
        [
            userId,
            endpoints.revokeRole,
            refreshAssignments,
            SCOPED_LOGGER,
        ]
    );

    // ----------------------------------------------------------------
    // Local state management
    // ----------------------------------------------------------------

    /**
     * Clear assignments and invalidate any outstanding requests.
     *
     * Useful when logging out or switching users.
     */
    const clearAssignments = useCallback(() => {
        assignmentsRequestId.current += 1;

        setAssignments([]);
        setAssignmentsLoading(false);
        setAssignmentsError(null);
        setMutationError(null);
    }, []);

    // ----------------------------------------------------------------
    // Lifecycle
    // ----------------------------------------------------------------

    /**
     * Load assignments when the provider mounts or the user changes.
     *
     * Invalidate outstanding requests during cleanup so that
     * responses from a previous user cannot update current state.
     */
    useEffect(() => {
        if (!autoFetch || isMissing(userId)) {
            clearAssignments();
            return undefined;
        }

        refreshAssignments(userId).catch(() => {
            // Errors are exposed through assignmentsError.
        });

        return () => {
            assignmentsRequestId.current += 1;
        };
    }, [
        autoFetch,
        userId,
        refreshAssignments,
        clearAssignments,
    ]);

    // ----------------------------------------------------------------
    // Context value
    // ----------------------------------------------------------------

    const value = useMemo(
        () => ({
            // Data
            assignments,
            userId,

            // Loading
            assignmentsLoading,
            mutationLoading,

            loading:
                assignmentsLoading || mutationLoading,

            // Errors
            assignmentsError,
            mutationError,

            // Queries
            refreshAssignments,

            // Mutations
            grantRole,
            revokeRole,

            // Local state
            clearAssignments,
        }),
        [
            assignments,
            userId,
            assignmentsLoading,
            mutationLoading,
            assignmentsError,
            mutationError,
            refreshAssignments,
            grantRole,
            revokeRole,
            clearAssignments,
        ]
    );

    return (
        <RolesAssignmentContext.Provider value={value}>
            {children}
        </RolesAssignmentContext.Provider>
    );
}
