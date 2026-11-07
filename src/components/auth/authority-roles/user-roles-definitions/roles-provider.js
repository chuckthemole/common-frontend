
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import RolesContext from "./roles-context";

import logger, {
    useScopedLogger,
} from "../../../../logger";

import { getApi } from "../../../../api/client/api";

const DEFAULT_ENDPOINTS = Object.freeze({
    listRoles: null,
    createRole: null,
});

/**
 * Extract an array from an Axios response or response body.
 *
 * Logs the response structure to help diagnose unexpected
 * backend response formats.
 */
function extractRoles(response, SCOPED_LOGGER) {
    SCOPED_LOGGER.debug(
        "[extractRoles] Inspecting API response",
        {
            responseExists: response !== null && response !== undefined,
            responseType: typeof response,
            isArray: Array.isArray(response),
            responseKeys:
                response && typeof response === "object"
                    ? Object.keys(response)
                    : [],
            hasData: response?.data !== undefined,
        }
    );

    const data = response?.data ?? response;

    SCOPED_LOGGER.debug(
        "[extractRoles] Inspecting response data",
        {
            dataType: typeof data,
            isArray: Array.isArray(data),
            dataKeys:
                data && typeof data === "object"
                    ? Object.keys(data)
                    : [],
        }
    );

    if (Array.isArray(data)) {
        SCOPED_LOGGER.debug(
            "[extractRoles] Response is a direct array.",
            { count: data.length }
        );

        return data;
    }

    if (Array.isArray(data?.roles)) {
        SCOPED_LOGGER.debug(
            "[extractRoles] Found roles array.",
            { count: data.roles.length }
        );

        return data.roles;
    }

    if (Array.isArray(data?.content)) {
        SCOPED_LOGGER.debug(
            "[extractRoles] Found content array.",
            { count: data.content.length }
        );

        return data.content;
    }

    if (Array.isArray(data?.items)) {
        SCOPED_LOGGER.debug(
            "[extractRoles] Found items array.",
            { count: data.items.length }
        );

        return data.items;
    }

    SCOPED_LOGGER.error(
        "[extractRoles] Could not find an array in the response.",
        {
            data,
            availableKeys:
                data && typeof data === "object"
                    ? Object.keys(data)
                    : [],
        }
    );

    throw new Error(
        "Expected the role definitions endpoint to return an array."
    );
}

/**
 * Log useful Axios / HTTP error details.
 */
function logApiError(SCOPED_LOGGER, message, error) {
    const response = error?.response;

    SCOPED_LOGGER.error(message, {
        errorMessage: error?.message,
        errorName: error?.name,
        errorCode: error?.code,

        requestUrl:
            error?.config?.url,

        requestMethod:
            error?.config?.method,

        baseURL:
            error?.config?.baseURL,

        httpStatus:
            response?.status,

        statusText:
            response?.statusText,

        responseData:
            response?.data,

        responseHeaders:
            response?.headers,

        hasRequest:
            Boolean(error?.request),

        hasResponse:
            Boolean(response),

        error,
    });
}

export default function RolesProvider({
    children,
    endpoints = DEFAULT_ENDPOINTS,
    autoFetch = true,
}) {
    const SCOPED_LOGGER = useScopedLogger(
        "RolesProvider",
        logger
    );

    const [roles, setRoles] = useState([]);

    const [rolesLoading, setRolesLoading] = useState(false);
    const [rolesError, setRolesError] = useState(null);

    const [mutationLoading, setMutationLoading] =
        useState(false);
    const [mutationError, setMutationError] = useState(null);

    const requestId = useRef(0);

    /**
     * Log provider initialization and configuration.
     */
    useEffect(() => {
        SCOPED_LOGGER.debug(
            "[RolesProvider] Provider mounted / configuration updated.",
            {
                autoFetch,
                endpoints,
                listRolesConfigured:
                    typeof endpoints?.listRoles === "string" &&
                    endpoints.listRoles.trim().length > 0,
                createRoleConfigured:
                    typeof endpoints?.createRole === "string" &&
                    endpoints.createRole.trim().length > 0,
                hasChildren: Boolean(children),
            }
        );

        return () => {
            SCOPED_LOGGER.debug(
                "[RolesProvider] Provider unmounting."
            );
        };
    }, [autoFetch, endpoints, children, SCOPED_LOGGER]);

    /**
     * Retrieve all available role definitions.
     */
    const refreshRoles = useCallback(async () => {
        const currentRequestId = ++requestId.current;
        const url = endpoints?.listRoles;

        SCOPED_LOGGER.debug(
            "[refreshRoles] Starting role definitions request.",
            {
                requestId: currentRequestId,
                url,
                endpointType: typeof url,
                endpointConfigured:
                    typeof url === "string" && url.trim().length > 0,
            }
        );

        setRolesLoading(true);
        setRolesError(null);

        try {
            /**
             * Validate endpoint before creating the request.
             */
            if (
                typeof url !== "string" ||
                !url.trim()
            ) {
                throw new Error(
                    "RolesProvider: endpoints.listRoles is not configured."
                );
            }

            SCOPED_LOGGER.debug(
                "[refreshRoles] Calling getApi()."
            );

            const api = getApi();

            SCOPED_LOGGER.debug(
                "[refreshRoles] API client initialized.",
                {
                    apiExists: Boolean(api),
                    getMethodAvailable:
                        typeof api?.get === "function",
                    postMethodAvailable:
                        typeof api?.post === "function",
                    baseURL: api?.defaults?.baseURL,
                    timeout: api?.defaults?.timeout,
                    withCredentials:
                        api?.defaults?.withCredentials,
                }
            );

            if (!api || typeof api.get !== "function") {
                throw new Error(
                    "RolesProvider: getApi() did not return a valid API client."
                );
            }

            SCOPED_LOGGER.debug(
                "[refreshRoles] Sending GET request.",
                {
                    requestId: currentRequestId,
                    url,
                    method: "GET",
                    baseURL: api.defaults?.baseURL,
                }
            );

            const response = await api.get(url);

            SCOPED_LOGGER.debug(
                "[refreshRoles] GET request succeeded.",
                {
                    requestId: currentRequestId,
                    status: response?.status,
                    statusText: response?.statusText,
                    responseHeaders: response?.headers,
                }
            );

            SCOPED_LOGGER.debug(
                "[refreshRoles] Parsing response."
            );

            const nextRoles = extractRoles(
                response,
                SCOPED_LOGGER
            );

            if (currentRequestId === requestId.current) {
                SCOPED_LOGGER.debug(
                    "[refreshRoles] Updating roles state.",
                    {
                        requestId: currentRequestId,
                        count: nextRoles.length,
                    }
                );

                setRoles(nextRoles);
            } else {
                SCOPED_LOGGER.warn(
                    "[refreshRoles] Ignoring stale request result.",
                    {
                        requestId: currentRequestId,
                        latestRequestId: requestId.current,
                    }
                );
            }

            SCOPED_LOGGER.debug(
                "[refreshRoles] Role definitions retrieved successfully.",
                {
                    count: nextRoles.length,
                    roles: nextRoles,
                }
            );

            return nextRoles;
        } catch (error) {
            logApiError(
                SCOPED_LOGGER,
                "[refreshRoles] Failed to fetch role definitions.",
                error
            );

            if (currentRequestId === requestId.current) {
                setRolesError(error);
            }

            throw error;
        } finally {
            if (currentRequestId === requestId.current) {
                SCOPED_LOGGER.debug(
                    "[refreshRoles] Request finished.",
                    { requestId: currentRequestId }
                );

                setRolesLoading(false);
            }
        }
    }, [endpoints?.listRoles, SCOPED_LOGGER]);

    /**
     * Create a new role definition.
     *
     * Pass the request object expected by the backend's
     * CreateAuthorityRequest directly.
     */
    const createRole = useCallback(
        async (roleData) => {
            SCOPED_LOGGER.debug(
                "[createRole] Starting role creation.",
                {
                    roleData,
                    endpoint: endpoints?.createRole,
                }
            );

            if (!roleData) {
                SCOPED_LOGGER.debug(
                    "[createRole] Validation failed: roleData is missing or falsy.",
                    {
                        roleData,
                        type: typeof roleData,
                    }
                );

                throw new Error("createRole requires roleData.");
            }

            if (typeof roleData !== "object") {
                SCOPED_LOGGER.debug(
                    "[createRole] Validation failed: roleData must be an object.",
                    {
                        roleData,
                        type: typeof roleData,
                        isArray: Array.isArray(roleData),
                    }
                );

                throw new Error(
                    `createRole requires a role definition object. Received: ${typeof roleData}.`
                );
            }

            if (Array.isArray(roleData)) {
                SCOPED_LOGGER.debug(
                    "[createRole] Validation failed: roleData cannot be an array.",
                    {
                        roleData,
                        type: typeof roleData,
                    }
                );

                throw new Error("createRole requires a single role definition object.");
            }

            if (
                typeof endpoints?.createRole !== "string" ||
                !endpoints.createRole.trim()
            ) {
                throw new Error(
                    "RolesProvider: endpoints.createRole is not configured."
                );
            }

            setMutationLoading(true);
            setMutationError(null);

            try {
                const api = getApi();

                if (!api || typeof api.post !== "function") {
                    throw new Error(
                        "RolesProvider: getApi() did not return a valid API client."
                    );
                }

                SCOPED_LOGGER.debug(
                    "[createRole] Sending POST request.",
                    {
                        url: endpoints.createRole,
                        roleData,
                        baseURL: api.defaults?.baseURL,
                    }
                );

                const response = await api.post(
                    endpoints.createRole,
                    roleData
                );

                const createdRole = response?.data ?? response;

                SCOPED_LOGGER.debug(
                    "[createRole] Role definition created.",
                    {
                        status: response?.status,
                        createdRole,
                    }
                );

                try {
                    SCOPED_LOGGER.debug(
                        "[createRole] Refreshing role definitions."
                    );

                    await refreshRoles();

                } catch (refreshError) {
                    SCOPED_LOGGER.warn(
                        "[createRole] Role created, but definitions could not be refreshed.",
                        refreshError
                    );
                }

                return createdRole;
            } catch (error) {
                setMutationError(error);

                logApiError(
                    SCOPED_LOGGER,
                    "[createRole] Failed to create role definition.",
                    error
                );

                throw error;
            } finally {
                setMutationLoading(false);

                SCOPED_LOGGER.debug(
                    "[createRole] Mutation finished."
                );
            }
        },
        [
            endpoints?.createRole,
            refreshRoles,
            SCOPED_LOGGER,
        ]
    );

    /**
 * Delete a role definition by its authority name.
 *
 * Uses the configured listRoles endpoint:
 * DELETE /admin/authority-roles/{authority}
 *
 * @param {string} authority
 *        Authority name, e.g. ROLE_DEVELOPER
 *
 * @returns {Promise<void>}
 */
    const deleteRole = useCallback(
        async (authority) => {

            SCOPED_LOGGER.debug(
                "[deleteRole] Starting role deletion.",
                {
                    authority,
                    endpoint: endpoints?.listRoles,
                }
            );

            /**
             * Validate authority.
             */
            if (
                typeof authority !== "string" ||
                !authority.trim()
            ) {
                throw new Error(
                    "deleteRole requires a valid authority name."
                );
            }

            /**
             * Validate endpoint.
             */
            if (
                typeof endpoints?.listRoles !== "string" ||
                !endpoints.listRoles.trim()
            ) {
                throw new Error(
                    "RolesProvider: endpoints.listRoles is not configured."
                );
            }

            setMutationLoading(true);
            setMutationError(null);

            try {

                const api = getApi();

                if (!api || typeof api.delete !== "function") {
                    throw new Error(
                        "RolesProvider: getApi() did not return a valid API client."
                    );
                }

                const encodedAuthority = encodeURIComponent(
                    authority.trim()
                );

                const url = `${endpoints.listRoles.replace(/\/+$/, "")}/${encodedAuthority}`;

                SCOPED_LOGGER.debug(
                    "[deleteRole] Sending DELETE request.",
                    {
                        url,
                        authority,
                        baseURL: api.defaults?.baseURL,
                    }
                );

                const response = await api.delete(url);

                SCOPED_LOGGER.debug(
                    "[deleteRole] Role definition deleted.",
                    {
                        authority,
                        status: response?.status,
                        statusText: response?.statusText,
                    }
                );

                /**
                 * Refresh role definitions after successful deletion.
                 */
                try {

                    SCOPED_LOGGER.debug(
                        "[deleteRole] Refreshing role definitions."
                    );

                    await refreshRoles();

                } catch (refreshError) {

                    SCOPED_LOGGER.warn(
                        "[deleteRole] Role deleted, but definitions could not be refreshed.",
                        refreshError
                    );

                }

                return response?.data;

            } catch (error) {

                setMutationError(error);

                logApiError(
                    SCOPED_LOGGER,
                    "[deleteRole] Failed to delete role definition.",
                    error
                );

                throw error;

            } finally {

                setMutationLoading(false);

                SCOPED_LOGGER.debug(
                    "[deleteRole] Mutation finished."
                );

            }
        },
        [
            endpoints?.listRoles,
            refreshRoles,
            SCOPED_LOGGER,
        ]
    );

    /**
     * Automatically retrieve definitions when the provider mounts.
     */
    useEffect(() => {
        SCOPED_LOGGER.debug(
            "[RolesProvider] Auto-fetch effect executed.",
            {
                autoFetch,
                listRolesEndpoint: endpoints?.listRoles,
            }
        );

        if (!autoFetch) {
            SCOPED_LOGGER.debug(
                "[RolesProvider] Auto-fetch disabled. Skipping request."
            );

            return undefined;
        }

        SCOPED_LOGGER.debug(
            "[RolesProvider] Triggering initial role definitions fetch."
        );

        refreshRoles().catch((error) => {
            SCOPED_LOGGER.error(
                "[RolesProvider] Initial role fetch rejected.",
                error?.message
            );
            // Error is exposed through rolesError.
        });

        return () => {
            SCOPED_LOGGER.debug(
                "[RolesProvider] Auto-fetch effect cleanup. Invalidating pending requests.",
                {
                    previousRequestId: requestId.current,
                }
            );

            requestId.current += 1;
        };
    }, [
        autoFetch,
        endpoints?.listRoles,
        refreshRoles,
        SCOPED_LOGGER,
    ]);

    const value = useMemo(
        () => ({
            // Data
            roles,

            // Loading state
            rolesLoading,
            mutationLoading,
            loading: rolesLoading || mutationLoading,

            // Errors
            rolesError,
            mutationError,

            // Queries
            refreshRoles,

            // Mutations
            createRole,
            deleteRole,
        }),
        [
            roles,
            rolesLoading,
            mutationLoading,
            rolesError,
            mutationError,
            refreshRoles,
            createRole,
            deleteRole,
        ]
    );

    SCOPED_LOGGER.debug(
        "[RolesProvider] Rendering context.",
        {
            roleCount: roles.length,
            rolesLoading,
            mutationLoading,
            hasRolesError: Boolean(rolesError),
            hasMutationError: Boolean(mutationError),
        }
    );

    return (
        <RolesContext.Provider value={value}>
            {children}
        </RolesContext.Provider>
    );
}
