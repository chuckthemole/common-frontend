import { eventRegistryManager } from "./event-registry-manager";
import logger from "../../logger";

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
            logger.debug("[EventLogger] Returning existing instance");
            return EventLogger.instance;
        }

        logger.debug("[EventLogger] Creating new instance");

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
            logger.warn("[EventLogger] transport must be a function");
            return;
        }

        this.transport = tansportFunction;
        logger.debug("[EventLogger] transport registered");
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
        // Group logs for better readability in devtools
        logger.groupCollapsed?.(`[EventLogger] ${event}`);

        try {
            /**
             * Step 1: Validate event exists in registry
             * -------------------------------------------------------------
             * Ensures consistent structure and prevents arbitrary event names
             */
            const base = eventRegistryManager.get(event);

            if (!base) {
                logger.warn(`Unknown event: ${event}`);
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
                metadata: options.metadata || {},    // custom event data
            };

            logger.debug("Built payload", payload);

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
                logger.debug("Using transport layer");

                // Note: transport may be async, but we intentionally do not await
                // to avoid blocking UI or caller execution
                transport(payload);
            } else {
                logger.debug("No transport found → fallback logger");
                logger.debug("[EventLogger]", payload);
            }
        } catch (err) {
            /**
             * Error Handling:
             * -------------------------------------------------------------
             * Ensures logging failures do not break application flow
             */
            logger.error("[EventLogger] Failed to log event", err);
        } finally {
            // Always close log group to prevent console nesting issues
            logger.groupEnd?.();
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