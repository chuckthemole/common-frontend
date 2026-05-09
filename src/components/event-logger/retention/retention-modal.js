import React, {
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useRumpusModal, RumpusModal, DurationInput, useToast, PortalContainer, JsonEditor, Collapsible } from "../../ui";
import { SingleSelector } from "../../dashboard-elements";
import RetentionContext from "./retention-context";
import logger from "../../../logger";
import {
    DEFAULT_RETENTION_POLICY,
} from "./retention.constants";

const FREQUENCY_OPTIONS = [
    { label: "Hourly", value: "hourly" },
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
];

export default function EventLoggerRetentionModal({
    buttonLabel = "Retention Settings",
}) {
    const {
        activeModal,
        openModal,
        closeModal,
    } = useRumpusModal();

    const retentionSettings = useContext(RetentionContext);

    const toast = useToast();

    if (!retentionSettings) {
        logger.warn(
            "EventLoggerRetentionSettingsModal must be used inside RetentionProvider"
        );

        return null;
    }

    const {
        loading,
        addPolicy,
        updatePolicy,
        getPolicyForTarget,
    } = retentionSettings;

    const modalId =
        "event-logger-retention-settings";

    const isOpen =
        activeModal === modalId;

    const existingPolicy = useMemo(() => {
        return (
            getPolicyForTarget("all") ||
            DEFAULT_RETENTION_POLICY
        );
    }, [getPolicyForTarget]);

    const [draftPolicy, setDraftPolicy] =
        useState(existingPolicy);

    useEffect(() => {
        if (isOpen) {
            setDraftPolicy(existingPolicy);
        }
    }, [isOpen, existingPolicy]);

    const updateDraft = (
        key,
        value
    ) => {
        setDraftPolicy((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = async () => {
        try {
            if (existingPolicy?.id) {
                await updatePolicy(
                    existingPolicy.id,
                    draftPolicy
                );
            } else {
                await addPolicy({
                    ...draftPolicy,
                    id: "default-policy",
                    target: "all",
                });
            }

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
                </div>,
                {
                    position: "bottom-center",
                    width: "full",
                    duration: null
                }
            );

            closeModal(modalId);
        } catch (error) {
            logger.error(
                "Failed to save retention policy",
                error
            );
        }
    };

    const handleCancel = () => {
        setDraftPolicy(existingPolicy);

        closeModal(modalId);
    };

    return (
        <>
            {/* Button */}
            <button
                onClick={() =>
                    openModal(modalId)
                }
                className="button is-info"
            >
                {buttonLabel}
            </button>

            {/* Modal */}
            <RumpusModal
                isOpen={isOpen}
                onRequestClose={
                    handleCancel
                }
                title="Retention Settings"
                draggable
            >
                <div className="content">

                    <h3 className="title is-5">
                        Event Log Retention
                    </h3>

                    <Collapsible label={"Current Saved Policy"}>
                        <JsonEditor
                            data={existingPolicy}
                        />
                    </Collapsible>

                    <div className="columns">
                        <div className="column">
                            <div className="field">
                                <label className="label">
                                    Archive Logs After
                                </label>

                                <DurationInput
                                    value={{
                                        amount:
                                            draftPolicy.activeDays,
                                        unit: "days",
                                    }}
                                    onChange={(
                                        value
                                    ) => {
                                        updateDraft(
                                            "activeDays",
                                            value.amount
                                        );
                                    }}
                                />
                            </div>

                            <div className="field">
                                <label className="label">
                                    Delete Archived Logs After
                                </label>

                                <DurationInput
                                    value={{
                                        amount:
                                            draftPolicy.archiveDays,
                                        unit: "days",
                                    }}
                                    onChange={(
                                        value
                                    ) => {
                                        updateDraft(
                                            "archiveDays",
                                            value.amount
                                        );
                                    }}
                                />
                            </div>
                        </div>

                        {/* Job Frequency */}
                        <div className="field column">
                            <label className="label">
                                Retention Job Frequency
                            </label>


                            <PortalContainer id="job-frequency-input-dropdown">
                                {(portalTarget) => (
                                    <SingleSelector
                                        value={draftPolicy.frequency}
                                        options={FREQUENCY_OPTIONS}
                                        onChange={(value) =>
                                            updateDraft("frequency", value)
                                        }
                                    />
                                )}
                            </PortalContainer>
                        </div>
                    </div>


                    <div
                        className="buttons is-right"
                    >
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
                            onClick={
                                handleSave
                            }
                            disabled={loading}
                        >
                            Save
                        </button>
                    </div>

                </div>
            </RumpusModal>
        </>
    );
}