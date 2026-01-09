import React, { useCallback, useState } from "react";
import { RumpusModalContext } from "./rumpus-modal-context";
import logger from "../../../logger";

/**
 * RumpusModalProvider
 *
 * Wrap your app once at a high level.
 * Ensures only one modal can be active at a time.
 */
export default function RumpusModalProvider({ children }) {
    const [activeModal, setActiveModal] = useState(null);

    /**
     * Open a modal by ID
     */
    const openModal = useCallback((id) => {
        logger.debug(`[RumpusModalProvider] openModal called with id: "${id}"`);
        setActiveModal((prev) => {
            if (prev === id) {
                logger.debug(`[RumpusModalProvider] Modal "${id}" is already active`);
                return prev;
            }
            logger.debug(`[RumpusModalProvider] Activating modal "${id}"`);
            return id;
        });
    }, []);

    /**
     * Close modal
     * - If id is provided, only closes if it matches
     * - If no id, force closes whatever is open
     */
    const closeModal = useCallback((id) => {
        logger.debug(`[RumpusModalProvider] closeModal called with id: "${id}"`);
        setActiveModal((current) => {
            if (!id || current === id) {
                if (current) {
                    logger.debug(`[RumpusModalProvider] Closing modal "${current}"`);
                } else {
                    logger.debug(`[RumpusModalProvider] No modal was active`);
                }
                return null;
            }
            logger.debug(`[RumpusModalProvider] Modal "${current}" remains active (id mismatch)`);
            return current;
        });
    }, []);

    logger.debug(`[RumpusModalProvider] Rendering provider, activeModal: "${activeModal}"`);

    return (
        <RumpusModalContext.Provider
            value={{
                activeModal,
                openModal,
                closeModal,
            }}
        >
            {children}
        </RumpusModalContext.Provider>
    );
}
