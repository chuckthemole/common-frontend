import { useState } from "react";
import { createClient } from "../api-utils";
import logger from "../../../logger";
import { mapUsers } from "./map-user";

let userApi = null;

export function initializeUserApi(config, apiName = "MAIN") {
    const client = createClient(apiName);

    userApi = createUserApi(config)(client);

    logger.debug("[initializeUserApi] initialized", {
        apiName,
        config,
    });

    return userApi;
}

export function getUserApi() {
    return userApi;
}

/**
 * Maps domain operations to endpoint paths on a given client.
 *
 * @param {object} endpoints
 * @param {string} endpoints.get
 * @param {string} endpoints.create
 * @param {string} endpoints.update
 * @param {string} endpoints.remove
 * @returns {(client: object) => UserApiInstance}
 */
export const createUserApi =
    ({ get, getAll, create, update, remove }) =>
        (client) => {
            logger.debug("[createUserApi] building api instance", {
                endpoints: {
                    get,
                    getAll,
                    create,
                    update,
                    remove,
                },
                client,
            });

            return {
                getUser: (data) => {
                    logger.debug("[createUserApi.getUser] request start", {
                        endpoint: get,
                        payload: data,
                    });

                    return client
                        .get(get, data)
                        .then((response) => {
                            logger.debug("[createUserApi.getUser] request success", {
                                endpoint: get,
                                response,
                            });

                            return response;
                        })
                        .catch((error) => {
                            logger.error("[createUserApi.getUser] request failed", {
                                endpoint: get,
                                payload: data,
                                error,
                                message: error?.message,
                                stack: error?.stack,
                            });

                            throw error;
                        });
                },

                getAll: (data) => {
                    logger.debug("[createUserApi.getAll] request start", {
                        endpoint: getAll,
                        payload: data,
                    });

                    return client
                        .get(getAll, data)
                        .then((response) => {
                            return mapUsers(response.data)
                        })
                        .catch((error) => {
                            logger.error("[createUserApi.getAll] request failed", {
                                endpoint: getAll,
                                payload: data,
                                error,
                                message: error?.message,
                                stack: error?.stack,
                            });

                            throw error;
                        });
                },

                createUser: (data) => {
                    logger.debug("[createUserApi.createUser] request start", {
                        endpoint: create,
                        payload: data,
                    });

                    return client
                        .post(create, data)
                        .then((response) => {
                            logger.debug("[createUserApi.createUser] request success", {
                                endpoint: create,
                                response,
                            });

                            return response;
                        })
                        .catch((error) => {
                            logger.error("[createUserApi.createUser] request failed", {
                                endpoint: create,
                                payload: data,
                                error,
                                message: error?.message,
                                stack: error?.stack,
                            });

                            throw error;
                        });
                },

                updateUser: (data) => {
                    logger.debug("[createUserApi.updateUser] request start", {
                        endpoint: update,
                        payload: data,
                    });

                    return client
                        .patch(update, data)
                        .then((response) => {
                            logger.debug("[createUserApi.updateUser] request success", {
                                endpoint: update,
                                response,
                            });

                            return response;
                        })
                        .catch((error) => {
                            logger.error("[createUserApi.updateUser] request failed", {
                                endpoint: update,
                                payload: data,
                                error,
                                message: error?.message,
                                stack: error?.stack,
                            });

                            throw error;
                        });
                },

                removeUser: (data) => {
                    logger.debug("[createUserApi.removeUser] request start", {
                        endpoint: remove,
                        payload: data,
                    });

                    return client
                        .delete(remove, data)
                        .then((response) => {
                            logger.debug("[createUserApi.removeUser] request success", {
                                endpoint: remove,
                                response,
                            });

                            return response;
                        })
                        .catch((error) => {
                            logger.error("[createUserApi.removeUser] request failed", {
                                endpoint: remove,
                                payload: data,
                                error,
                                message: error?.message,
                                stack: error?.stack,
                            });

                            throw error;
                        });
                },
            };
        };