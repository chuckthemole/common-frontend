import { createEventStore } from "./event-store";
import logger from "../../logger";

let _eventStoreInstance = null;

/**
 * getEventStore
 * -----------------------------------------------------------------------------
 * Singleton accessor for EventStore.
 *
 * Ensures:
 *  - only one instance per app runtime
 *  - consistent persistence layer usage
 */
export const getEventStore = (persistence) => {
    if (!_eventStoreInstance) {
        if (!persistence) {
            throw new Error("[EventStore] persistence is required for initialization");
        }

        _eventStoreInstance = createEventStore(persistence);
        logger.debug("[EventStore] instance created");
    }

    return _eventStoreInstance;
};