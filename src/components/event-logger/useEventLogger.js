import { eventLogger } from "./event-logger";

export function useEventLogger() {
  const logEvent = (event, metadata = {}) => {
    eventLogger.log(event, { metadata });
  };

  return { logEvent };
}