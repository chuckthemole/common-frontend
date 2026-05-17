import { useState } from "react";
import { createClient } from "../api-utils";

/**
 * Maps domain operations to endpoint paths on a given client.
 *
 * @param {object} endpoints
 * @param {string} endpoints.get
 * @param {string} endpoints.create
 * @param {string} endpoints.update
 * @param {string} endpoints.remove
 * @returns {(client: object) => BugApiInstance}
 */
export const bugApi = ({ get, create, update, remove }) => (client) => ({
    getBug: (data) => client.get(get, data),
    createBug: (data) => client.post(create, data),
    updateBug: (data) => client.patch(update, data),
    removeBug: (data) => client.delete(remove, data),
});

/**
 * Initializes and holds a bug API instance in state.
 * Call `reinit` to swap either the client, the endpoints, or both.
 *
 * @param {object} initialEndpoints - { get, create, update, remove }
 * @param {string} initialApiName   - Passed to getNamedApi
 *
 * @returns {{ api: BugApiInstance, reinit: (endpoints?, apiName?) => void }}
 */
export const useBugApi = (initialEndpoints, initialApiName) => {
    const [api, setApi] = useState(() => {
        const instance = bugApi(initialEndpoints)(createClient(initialApiName));
        instance._endpoints = initialEndpoints;
        instance._apiName = initialApiName;
        return instance;
    });

    /**
     * Reinitializes the api instance.
     * Both args are optional — omit either to keep the current value.
     *
     * @param {object} [nextEndpoints]
     * @param {string} [nextApiName]
     */
    const reinit = (nextEndpoints, nextApiName) =>
        setApi((current) => {
            const endpoints = nextEndpoints ?? current._endpoints;
            const apiName = nextApiName ?? current._apiName;
            const instance = bugApi(endpoints)(createClient(apiName));
            instance._endpoints = endpoints;
            instance._apiName = apiName;
            return instance;
        });

    return { api, reinit };
};