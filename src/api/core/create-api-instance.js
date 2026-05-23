import { createClient } from "./api-utils";

import logger from "../../logger";

export function createApiInitializer({
    createApi,
    label,
}) {

    let apiInstance = null;

    return {

        initialize(config, apiName = "MAIN") {

            const client =
                createClient(apiName);

            apiInstance =
                createApi(config)(client);

            logger.debug(
                `[initialize${label}Api] initialized`,
                {
                    apiName,
                    config,
                }
            );

            return apiInstance;
        },

        get() {

            return apiInstance;
        },
    };
}