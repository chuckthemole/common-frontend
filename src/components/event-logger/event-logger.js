import { EventRegistry } from "./event-registry";
import logger from "../../logger";

class EventLogger {
  constructor() {
    if (EventLogger.instance) {
      return EventLogger.instance;
    }
    EventLogger.instance = this;
  }

  log(event, options = {}) {
    const base = EventRegistry[event];

    if (!base) {
      logger.warn(`[EventLogger] Unknown event: ${event}`);
      return;
    }

    const payload = {
      event,
      entity: base.entity,
      action: base.action,
      timestamp: new Date().toISOString(),
      metadata: options.metadata || {},
    };

    // Custom transport if provided
    if (options.transport && typeof options.transport === "function") {
      options.transport(payload);
    } else {
      logger.log("[EventLogger]", payload);
    }
  }
}

// Singleton instance
export const eventLogger = new EventLogger();