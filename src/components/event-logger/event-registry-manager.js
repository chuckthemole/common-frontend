import logger from "../../logger";
import { EventRegistry } from "./event-registry";

/**
 * EventRegistryManager
 * -----------------------------------------------------------------------------
 * Central source of truth for all event definitions.
 *
 * Supports:
 *  - reading registry
 *  - extending (append/override)
 *  - UI helpers (display names, etc.)
 */
class EventRegistryManager {
    constructor() {
        this.registry = { ...EventRegistry };
    }

    /**
     * Get full registry
     */
    getAll() {
        return this.registry;
    }

    /**
     * Get single event config
     */
    get(eventName) {
        return this.registry[eventName];
    }

    /**
     * Register or override a single event
     */
    register(eventName, config) {
        if (!eventName || typeof config !== "object") {
            logger.warn("[EventRegistry] Invalid registration", { eventName, config });
            return;
        }

        this.registry[eventName] = {
            ...this.registry[eventName],
            ...config,
        };

        logger.debug(`[EventRegistry] Registered event: ${eventName}`);
    }

    /**
     * Bulk register events
     */
    registerMany(events = {}) {
        Object.entries(events).forEach(([eventName, config]) => {
            this.register(eventName, config);
        });
    }

    /**
     * Get display name (safe fallback)
     */
    getDisplayName(eventName) {
        const evt = this.get(eventName);

        if (!evt) return eventName;

        return (
            evt.displayName ||
            `${evt.entity || ""} ${evt.action || ""}`.trim() ||
            eventName
        );
    }

    /**
     * Get dropdown options for UI
     */
    getOptions() {
        return Object.entries(this.registry).map(([key, val]) => ({
            value: key,
            label: this.getDisplayName(key),
        }));
    }

    getEntity(eventName) {
        return this.registry[eventName]?.entity || null;
    }

    getEntities() {
        return Array.from(
            new Set(
                Object.values(this.registry)
                    .map((e) => e.entity)
                    .filter(Boolean)
            )
        );
    }
}

// singleton
export const eventRegistryManager = new EventRegistryManager();