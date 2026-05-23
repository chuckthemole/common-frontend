import { createClient } from "../../core/api-utils";

import logger from "../../../logger";

import {
    mapProfile,
    mapProfiles,
} from "./map-profile";

let profileApi = null;

/* =============================================================================
   Initialize
============================================================================= */

export function initializeProfileApi(
    config,
    apiName = "MAIN"
) {

    const client =
        createClient(apiName);

    profileApi =
        createProfileApi(config)(client);

    logger.debug(
        "[initializeProfileApi] initialized",
        {
            apiName,
            config,
        }
    );

    return profileApi;
}

/* =============================================================================
   Getter
============================================================================= */

export function getProfileApi() {

    return profileApi;
}

/* =============================================================================
   Factory
============================================================================= */

/**
 * Maps domain operations to endpoint paths on a given client.
 *
 * @param {object} endpoints
 * @param {string} endpoints.get
 * @param {string} endpoints.getAll
 * @param {string} endpoints.create
 * @param {string} endpoints.update
 * @param {string} endpoints.remove
 *
 * @returns {(client: object) => ProfileApiInstance}
 */
export const createProfileApi =
    ({
        get,
        getAll,
        create,
        update,
        remove,
    }) =>
        (client) => {

            logger.debug(
                "[createProfileApi] building api instance",
                {
                    endpoints: {
                        get,
                        getAll,
                        create,
                        update,
                        remove,
                    },
                    client,
                }
            );

            return {

                /* =================================================================
                   Get Profile
                ================================================================= */

                getProfile: ({ id }) => {

                    const endpoint =
                        get.replace(
                            ":id",
                            encodeURIComponent(id)
                        );

                    logger.debug(
                        "[createProfileApi.getProfile] request start",
                        {
                            endpoint,
                            id,
                        }
                    );

                    return client
                        .get(endpoint)
                        .then((response) => {

                            logger.debug(
                                "[createProfileApi.getProfile] request success",
                                {
                                    endpoint,
                                    response,
                                }
                            );

                            return mapProfile(
                                response.data
                            );
                        })
                        .catch((error) => {

                            logger.error(
                                "[createProfileApi.getProfile] request failed",
                                {
                                    endpoint,
                                    id,
                                    error,
                                    message:
                                        error?.message,
                                    stack:
                                        error?.stack,
                                }
                            );

                            throw error;
                        });
                },

                /* =================================================================
                   Get All Profiles
                ================================================================= */

                getAllProfiles: (data) => {

                    logger.debug(
                        "[createProfileApi.getAllProfiles] request start",
                        {
                            endpoint: getAll,
                            payload: data,
                        }
                    );

                    return client
                        .get(getAll, data)
                        .then((response) => {

                            logger.debug(
                                "[createProfileApi.getAllProfiles] request success",
                                {
                                    endpoint: getAll,
                                    response,
                                }
                            );

                            return mapProfiles(
                                response.data
                            );
                        })
                        .catch((error) => {

                            logger.error(
                                "[createProfileApi.getAllProfiles] request failed",
                                {
                                    endpoint: getAll,
                                    payload: data,
                                    error,
                                    message:
                                        error?.message,
                                    stack:
                                        error?.stack,
                                }
                            );

                            throw error;
                        });
                },

                /* =================================================================
                   Create Profile
                ================================================================= */

                createProfile: (data) => {

                    logger.debug(
                        "[createProfileApi.createProfile] request start",
                        {
                            endpoint: create,
                            payload: data,
                        }
                    );

                    return client
                        .post(create, data)
                        .then((response) => {

                            logger.debug(
                                "[createProfileApi.createProfile] request success",
                                {
                                    endpoint: create,
                                    response,
                                }
                            );

                            return response;
                        })
                        .catch((error) => {

                            logger.error(
                                "[createProfileApi.createProfile] request failed",
                                {
                                    endpoint: create,
                                    payload: data,
                                    error,
                                    message:
                                        error?.message,
                                    stack:
                                        error?.stack,
                                }
                            );

                            throw error;
                        });
                },

                /* =================================================================
                   Update Profile
                ================================================================= */

                updateProfile: (data) => {

                    logger.debug(
                        "[createProfileApi.updateProfile] request start",
                        {
                            endpoint: update,
                            payload: data,
                        }
                    );

                    return client
                        .patch(update, data)
                        .then((response) => {

                            logger.debug(
                                "[createProfileApi.updateProfile] request success",
                                {
                                    endpoint: update,
                                    response,
                                }
                            );

                            return response;
                        })
                        .catch((error) => {

                            logger.error(
                                "[createProfileApi.updateProfile] request failed",
                                {
                                    endpoint: update,
                                    payload: data,
                                    error,
                                    message:
                                        error?.message,
                                    stack:
                                        error?.stack,
                                }
                            );

                            throw error;
                        });
                },

                /* =================================================================
                   Remove Profile
                ================================================================= */

                removeProfile: (data) => {

                    logger.debug(
                        "[createProfileApi.removeProfile] request start",
                        {
                            endpoint: remove,
                            payload: data,
                        }
                    );

                    return client
                        .delete(remove, data)
                        .then((response) => {

                            logger.debug(
                                "[createProfileApi.removeProfile] request success",
                                {
                                    endpoint: remove,
                                    response,
                                }
                            );

                            return response;
                        })
                        .catch((error) => {

                            logger.error(
                                "[createProfileApi.removeProfile] request failed",
                                {
                                    endpoint: remove,
                                    payload: data,
                                    error,
                                    message:
                                        error?.message,
                                    stack:
                                        error?.stack,
                                }
                            );

                            throw error;
                        });
                },
            };
        };