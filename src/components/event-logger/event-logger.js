import { eventRegistryManager } from "./event-registry-manager";
import { createScopedLogger } from "../../logger";

const SCOPED_LOGGER = createScopedLogger("EventLogger");

/**
 * EventLogger
 * -----------------------------------------------------------------------------
 * A lightweight, singleton-based event logging system.
 *
 * Responsibilities:
 *  - Normalize and structure event payloads
 *  - Validate events against a central registry (eventRegistryManager)
 *  - Route events through a configurable transport layer
 *  - Provide safe fallback logging when no transport is configured
 *
 * Design Notes:
 *  - Uses a Singleton pattern to ensure a single shared logging instance
 *  - Supports a global transport (set once at app initialization)
 *  - Allows per-call transport overrides via options.transport
 *  - Uses grouped logging for better developer experience in debugging
 */
class EventLogger {
    constructor() {
        // Enforce singleton pattern: reuse existing instance if already created
        if (EventLogger.instance) {
            SCOPED_LOGGER.debug("Returning existing instance");
            return EventLogger.instance;
        }

        SCOPED_LOGGER.debug("Creating new instance");

        /**
         * transport: Function | null
         * ---------------------------------------------------------------------
         * Optional global transport function used to send event payloads
         * to an external system (API, storage, analytics service, etc).
         *
         * Signature:
         *   async function transport(payload) {}
         *
         * If not set, logger will fallback to console/debug logging.
         */
        this.transport = null;

        this.context = {};

        EventLogger.instance = this;
    }

    /**
     * setTransport
     * -------------------------------------------------------------------------
     * Registers a global transport function for all events.
     *
     * @param {Function} tansportFunction - async function that receives payload
     *
     * Example:
     *   eventLogger.setTransport(async (payload) => {
     *       await api.post("/events", payload);
     *   });
     */
    setTransport(tansportFunction) {
        if (typeof tansportFunction !== "function") {
            SCOPED_LOGGER.warn("transport must be a function");
            return;
        }

        this.transport = tansportFunction;
        SCOPED_LOGGER.debug("transport registered");
    }

    setContext(context = {}) {
        this.context = { ...this.context, ...context };
        SCOPED_LOGGER.debug("context updated", this.context);
    }

    /**
     * log
     * -------------------------------------------------------------------------
     * Main entry point for logging events.
     *
     * @param {string} event - Event name (must exist in eventRegistryManager)
     * @param {Object} options
     * @param {Object} options.metadata - Arbitrary metadata for the event
     * @param {Function} options.transport - Optional override transport
     *
     * Flow:
     *  1. Validate event against eventRegistryManager
     *  2. Build normalized payload
     *  3. Resolve transport (override → global → fallback)
     *  4. Dispatch event via transport or fallback logger
     */
    log(event, options = {}) {
        SCOPED_LOGGER.debug(`${event}`);

        try {
            /**
             * Step 1: Validate event exists in registry
             * -------------------------------------------------------------
             * Ensures consistent structure and prevents arbitrary event names
             */
            const base = eventRegistryManager.get(event);

            if (!base) {
                SCOPED_LOGGER.warn(`Unknown event: ${event}`);
                return;
            }

            /**
             * Step 2: Construct normalized payload
             * -------------------------------------------------------------
             * Standardizes all events for consistent downstream processing
             */
            const payload = {
                event,                         // raw event name
                entity: base.entity,           // domain entity (e.g., "User")
                action: base.action,           // action type (e.g., "created")
                timestamp: new Date().toISOString(), // ISO timestamp
                context: this.context,
                metadata: options.metadata || {},    // custom event data
            };

            SCOPED_LOGGER.debug("Built payload", payload);

            /**
             * Step 3: Resolve transport
             * -------------------------------------------------------------
             * Priority:
             *   1. Per-call override (options.transport)
             *   2. Global transport (this.transport)
             *   3. Fallback logging
             */
            const transport = options.transport || this.transport;

            /**
             * Step 4: Dispatch event
             * -------------------------------------------------------------
             * If transport exists → send event externally
             * Otherwise → fallback to internal logging
             */
            if (transport && typeof transport === "function") {
                SCOPED_LOGGER.debug("Using transport layer");

                // Note: transport may be async, but we intentionally do not await
                // to avoid blocking UI or caller execution
                transport(payload);
            } else {
                SCOPED_LOGGER.debug("No transport found → fallback logger");
                SCOPED_LOGGER.debug("[EventLogger]", payload);
            }
        } catch (err) {
            /**
             * Error Handling:
             * -------------------------------------------------------------
             * Ensures logging failures do not break application flow
             */
            SCOPED_LOGGER.error("Failed to log event", err);
        } finally {
            SCOPED_LOGGER.debug("Finished log");
        }
    }
}

/**
 * Singleton Export
 * -----------------------------------------------------------------------------
 * Ensures a single shared instance across the entire application.
 *
 * Usage:
 *   import { eventLogger } from "...";
 *   eventLogger.log("user.created", { metadata: {...} });
 */
export const eventLogger = new EventLogger();