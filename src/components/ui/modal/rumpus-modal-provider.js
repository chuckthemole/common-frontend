import React, {
    useEffect,
    useCallback,
    useState
} from "react";
import Modal from "react-modal";
import { RumpusModalContext } from "./rumpus-modal-context";
import logger from "../../../logger";

/**
 * RumpusModalProvider
 *
 * Wrap your app once at a high level.
 * Ensures only one modal can be active at a time.
 */
export default function RumpusModalProvider({
    appElement,
    children
}) {
    const [activeModal, setActiveModal] = useState(null);

    /**
     * Configure react-modal's app element for accessibility.
     *
     * react-modal requires a reference to the root application element so it can
     * hide background content from screen readers when a modal is open.
     *
     * This effect:
     * - Runs only on the client
     * - Executes once the appElement is available
     * - Is safe to reuse across multiple applications
     * - Avoids hard coding DOM selectors inside the library
     *
     * The try/catch prevents crashes in edge cases such as:
     * - Invalid elements
     * - Tests or unusual rendering environments
     */
    useEffect(() => {
        if (!appElement) {
            logger.debug("[RumpusModalProvider] No appElement, returning.")
            return;
        }

        try {
            Modal.setAppElement(appElement);
            logger.debug("[RumpusModalProvider] App element set for react-modal");
        } catch (err) {
            logger.warn(
                "[RumpusModalProvider] Failed to set app element for react-modal",
                err
            );
        }
    }, [appElement]);

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
