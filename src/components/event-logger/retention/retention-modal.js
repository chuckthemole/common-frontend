import React, {
    useContext,
    useEffect,
    useMemo,
    useState,
    useCallback,
} from "react";

import {
    useRumpusModal,
    RumpusModal,
    useToast,
} from "../../ui";

import logger from "../../../logger";

import RetentionContext from "./retention-context";

import RetentionForm from "./retention-form";

import {
    DEFAULT_RETENTION_POLICY,
} from "./retention.constants";

/**
 * -----------------------------------------------------------------------------
 * EventLoggerRetentionModal
 * -----------------------------------------------------------------------------
 *
 * Modal wrapper around RetentionForm.
 *
 * Responsibilities:
 *  - modal lifecycle
 *  - draft state lifecycle
 *  - persistence actions
 *  - save/cancel behavior
 *  - toast notifications
 *
 * Intentionally delegates all editing UI to RetentionForm.
 * -----------------------------------------------------------------------------
 */

const MODAL_ID =
    "event-logger-retention-settings";

export default function EventLoggerRetentionModal({
    buttonLabel = "Retention Settings",
}) {
    /**
     * -------------------------------------------------------------------------
     * Modal Infrastructure
     * -------------------------------------------------------------------------
     */
    const {
        activeModal,
        openModal,
        closeModal,
    } = useRumpusModal();

    const toast = useToast();

    /**
     * -------------------------------------------------------------------------
     * Retention Context
     * -------------------------------------------------------------------------
     */
    const retentionSettings =
        useContext(RetentionContext);

    if (!retentionSettings) {
        logger.warn(
            "[EventLoggerRetentionModal] Must be used inside RetentionProvider"
        );

        return null;
    }

    const {
        loading,
        addPolicy,
        updatePolicy,
        getPolicyForTarget,
    } = retentionSettings;

    /**
     * -------------------------------------------------------------------------
     * Modal State
     * -------------------------------------------------------------------------
     */
    const isOpen =
        activeModal === MODAL_ID;

    /**
     * -------------------------------------------------------------------------
     * Existing Policy
     * -------------------------------------------------------------------------
     *
     * Fallback to defaults if policy not yet created.
     */
    const existingPolicy = useMemo(() => {
        return (
            getPolicyForTarget("all") ||
            DEFAULT_RETENTION_POLICY
        );
    }, [getPolicyForTarget]);

    /**
     * -------------------------------------------------------------------------
     * Draft Policy State
     * -------------------------------------------------------------------------
     *
     * Local editable state used while modal is open.
     */
    const [draftPolicy, setDraftPolicy] =
        useState(existingPolicy);

    /**
     * -------------------------------------------------------------------------
     * Sync Draft On Open
     * -------------------------------------------------------------------------
     *
     * Ensures latest persisted policy is loaded each time modal opens.
     */
    useEffect(() => {
        if (isOpen) {
            setDraftPolicy(existingPolicy);
        }
    }, [isOpen, existingPolicy]);

    /**
     * -------------------------------------------------------------------------
     * Save Policy
     * -------------------------------------------------------------------------
     */
    const handleSave =
        useCallback(async () => {
            try {
                /**
                 * -------------------------------------------------------------
                 * Update existing policy
                 * -------------------------------------------------------------
                 */
                if (existingPolicy?.id) {
                    await updatePolicy(
                        existingPolicy.id,
                        draftPolicy
                    );
                }

                /**
                 * -------------------------------------------------------------
                 * Create default policy
                 * -------------------------------------------------------------
                 */
                else {
                    await addPolicy({
                        ...draftPolicy,

                        id: "default-policy",

                        target: "all",
                    });
                }

                /**
                 * -------------------------------------------------------------
                 * Success Notification
                 * -------------------------------------------------------------
                 */
                toast.success(
                    <div>
                        <strong>
                            Retention policy saved.
                        </strong>

                        <div>
                            Logs archive after{" "}
                            <strong>
                                {
                                    draftPolicy.activeDays
                                } days
                            </strong>
                        </div>

                        <div>
                            Archived logs delete after{" "}
                            <strong>
                                {
                                    draftPolicy.archiveDays
                                } days
                            </strong>
                        </div>

                        <div>
                            Frequency:{" "}
                            <strong>
                                {
                                    draftPolicy.frequency
                                }
                            </strong>
                        </div>
                    </div>,
                    {
                        position:
                            "bottom-center",

                        width: "full",

                        duration: null,
                    }
                );

                closeModal(MODAL_ID);
            } catch (error) {
                logger.error(
                    "[EventLoggerRetentionModal] Failed to save retention policy",
                    error
                );

                toast.error(
                    "Failed to save retention policy."
                );
            }
        }, [
            addPolicy,
            closeModal,
            draftPolicy,
            existingPolicy,
            toast,
            updatePolicy,
        ]);

    /**
     * -------------------------------------------------------------------------
     * Cancel Editing
     * -------------------------------------------------------------------------
     */
    const handleCancel =
        useCallback(() => {
            setDraftPolicy(existingPolicy);

            closeModal(MODAL_ID);
        }, [
            closeModal,
            existingPolicy,
        ]);

    return (
        <>
            {/* ------------------------------------------------------------- */}
            {/* Open Modal Button                                             */}
            {/* ------------------------------------------------------------- */}

            <button
                className="button is-info"
                onClick={() =>
                    openModal(MODAL_ID)
                }
            >
                {buttonLabel}
            </button>

            {/* ------------------------------------------------------------- */}
            {/* Modal                                                         */}
            {/* ------------------------------------------------------------- */}

            <RumpusModal
                draggable
                isOpen={isOpen}
                title="Retention Settings"
                onRequestClose={
                    handleCancel
                }
            >
                <div className="content">

                    <h3 className="title is-5">
                        Event Log Retention
                    </h3>

                    {/* ----------------------------------------------------- */}
                    {/* Reusable Retention Form                              */}
                    {/* ----------------------------------------------------- */}

                    <RetentionForm
                        value={draftPolicy}
                        onChange={setDraftPolicy}
                        disabled={loading}
                    />

                    {/* ----------------------------------------------------- */}
                    {/* Action Buttons                                        */}
                    {/* ----------------------------------------------------- */}

                    <div className="buttons is-right">

                        <button
                            className="button"
                            onClick={
                                handleCancel
                            }
                        >
                            Cancel
                        </button>

                        <button
                            className="button is-primary"
                            disabled={loading}
                            onClick={handleSave}
                        >
                            Save
                        </button>

                    </div>

                </div>
            </RumpusModal>
        </>
    );
}