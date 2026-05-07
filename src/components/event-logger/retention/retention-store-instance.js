import logger from "../../../logger";

import {
    createRetentionStore,
} from "./retention-store";

let _retentionStoreInstance =
    null;

/**
 * getRetentionStore
 * -----------------------------------------------------------------------------
 * Singleton accessor for RetentionStore.
 *
 * Ensures:
 *  - only one instance per app runtime
 *  - consistent persistence usage
 */
export const getRetentionStore = (
    persistence
) => {
    if (!_retentionStoreInstance) {

        if (!persistence) {
            throw new Error(
                "[RetentionStore] persistence is required for initialization"
            );
        }

        _retentionStoreInstance =
            createRetentionStore(
                persistence
            );

        logger.debug(
            "[RetentionStore] instance created"
        );
    }

    return _retentionStoreInstance;
};