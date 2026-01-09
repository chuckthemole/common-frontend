import React from "react";
import { RumpusModalContext } from './rumpus-modal-context';
import logger from "../../../logger";

/**
 * useRumpusModal
 *
 * Access global modal state.
 * Throws if used outside provider.
 */
export function useRumpusModal() {
    const context = React.useContext(RumpusModalContext);

    if (!context) {
        logger.error(
            "[useRumpusModal] Hook used outside of <RumpusModalProvider>"
        );
        throw new Error(
            "useRumpusModal must be used inside a RumpusModalProvider"
        );
    }

    return context;
}
