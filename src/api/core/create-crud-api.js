import logger from "../../logger";

import {
    buildEndpoint,
    apiRequest,
} from "./api-utils";

export function createCrudApi({
    resourceName,
    mapOne = (x) => x,
    mapMany = (x) => x,
    aliases = {},
}) {

    return ({
        get,
        getAll,
        create,
        update,
        remove,
    }) => (client) => {

        const logPrefix =
            `[${resourceName}Api]`;

        const crudMethods = {

            getById: ({ id }) => {

                const endpoint =
                    buildEndpoint(
                        get,
                        { id }
                    );

                logger.debug(
                    `${logPrefix}.getById start`,
                    {
                        endpoint,
                        id,
                    }
                );

                return apiRequest({

                    request: () =>
                        client.get(endpoint),

                    onSuccess: (response) =>
                        mapOne(response.data),

                    onError: (error) => {

                        logger.error(
                            `${logPrefix}.getById failed`,
                            {
                                endpoint,
                                id,
                                error,
                            }
                        );
                    },
                });
            },

            getAll: (data) => {

                logger.debug(
                    `${logPrefix}.getAll start`,
                    {
                        endpoint: getAll,
                        payload: data,
                    }
                );

                return apiRequest({

                    request: () =>
                        client.get(getAll, data),

                    onSuccess: (response) =>
                        mapMany(response.data),

                    onError: (error) => {

                        logger.error(
                            `${logPrefix}.getAll failed`,
                            {
                                endpoint: getAll,
                                payload: data,
                                error,
                            }
                        );
                    },
                });
            },

            create: (data) => {

                logger.debug(
                    `${logPrefix}.create start`,
                    {
                        endpoint: create,
                        payload: data,
                    }
                );

                return apiRequest({

                    request: () =>
                        client.post(create, data),

                    onError: (error) => {

                        logger.error(
                            `${logPrefix}.create failed`,
                            {
                                endpoint: create,
                                payload: data,
                                error,
                            }
                        );
                    },
                });
            },

            update: (data) => {

                logger.debug(
                    `${logPrefix}.update start`,
                    {
                        endpoint: update,
                        payload: data,
                    }
                );

                return apiRequest({

                    request: () =>
                        client.patch(update, data),

                    onError: (error) => {

                        logger.error(
                            `${logPrefix}.update failed`,
                            {
                                endpoint: update,
                                payload: data,
                                error,
                            }
                        );
                    },
                });
            },

            remove: (data) => {

                logger.debug(
                    `${logPrefix}.remove start`,
                    {
                        endpoint: remove,
                        payload: data,
                    }
                );

                return apiRequest({

                    request: () =>
                        client.delete(remove, data),

                    onError: (error) => {

                        logger.error(
                            `${logPrefix}.remove failed`,
                            {
                                endpoint: remove,
                                payload: data,
                                error,
                            }
                        );
                    },
                });
            },
        };

        /**
         * ---------------------------------------------------------------------
         * Apply aliases
         * ---------------------------------------------------------------------
         */

        const aliasedMethods = {};

        Object.entries(crudMethods).forEach(
            ([methodName, fn]) => {

                const alias =
                    aliases[methodName];

                aliasedMethods[
                    alias || methodName
                ] = fn;
            }
        );

        return aliasedMethods;
    };
}