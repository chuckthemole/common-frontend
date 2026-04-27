import logger from "../../logger";

/**
 * --------------------------------------------------------------------------
 * Event key namespace
 * All persisted event keys are prefixed with this value.
 * Example: event:user.created:123456789
 * --------------------------------------------------------------------------
 */
const EVENT_KEY_PREFIX = "event:";

/**
 * EventStore
 * -----------------------------------------------------------------------------
 * Provides CRUD-style access to persisted event logs.
 *
 * NOTE:
 * Event logs are typically append-only. Update/Delete should be used cautiously.
 */
export const createEventStore = (persistence) => {
    if (!persistence) {
        throw new Error("[EventStore] persistence is required");
    }

    const buildKey = (eventName, id) => `${EVENT_KEY_PREFIX}${eventName}:${id}`;

    return {
        /**
         * CREATE (append new event)
         */
        async create(event) {
            try {
                const enrichedEvent = {
                    ...event,
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                };

                await persistence.append("events", enrichedEvent);

                return enrichedEvent;
            } catch (err) {
                logger.error("[EventStore] create failed", err);
                return null;
            }
        },

        /**
         * READ all events
         */
        async getAll() {
            try {
                const events = await persistence.getAll("events");

                logger.debug("[EventStore] getAll fetched events:", events);

                return (events || []).map((event, idx) => ({
                    ...event,
                    _index: idx,
                }));
            } catch (err) {
                logger.error("[EventStore] getAll failed", err);
                return [];
            }
        },

        /**
         * READ single event by key
         */
        async getByKey(key) {
            try {
                const raw = await persistence.getItem(key);
                return raw ? { key, ...JSON.parse(raw) } : null;
            } catch (err) {
                logger.error(`[EventStore] getByKey failed: ${key}`, err);
                return null;
            }
        },

        /**
         * READ by event name
         */
        async getByEvent(eventName) {
            const all = await this.getAll();
            return all.filter((e) => e.event === eventName);
        },

        /**
         * QUERY (custom filter)
         */
        async query(predicateFn) {
            const all = await this.getAll();
            return all.filter(predicateFn);
        },

        /**
         * UPDATE (replace entire event)
         */
        async update(key, updatedEvent) {
            try {
                await persistence.setItem(key, JSON.stringify(updatedEvent));
                return { key, ...updatedEvent };
            } catch (err) {
                logger.error(`[EventStore] update failed: ${key}`, err);
                return null;
            }
        },

        /**
         * DELETE single event
         */
        async remove(key) {
            try {
                await persistence.removeItem(key);
                return true;
            } catch (err) {
                logger.error(`[EventStore] remove failed: ${key}`, err);
                return false;
            }
        },

        /**
         * DELETE all events
         */
        async clear() {
            try {
                await persistence.clearCollection("events");

                logger.debug("[EventStore] cleared all events");
                return true;
            } catch (err) {
                logger.error("[EventStore] clear failed", err);
                return false;
            }
        },
    };
};