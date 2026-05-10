import React, { useCallback } from "react";

import {
    DurationInput,
    JsonEditor,
    Collapsible,
    PortalContainer,
    Panel,
} from "../../ui";

import { SingleSelector } from "../../dashboard-elements";

/**
 * -----------------------------------------------------------------------------
 * Retention Job Frequency Options
 * -----------------------------------------------------------------------------
 *
 * Centralized here so:
 *  - UI stays consistent everywhere
 *  - easy future expansion
 *  - reusable across modal/page/admin usage
 * -----------------------------------------------------------------------------
 */
const FREQUENCY_OPTIONS = [
    { label: "Hourly", value: "hourly" },
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
];

/**
 * -----------------------------------------------------------------------------
 * RetentionForm
 * -----------------------------------------------------------------------------
 *
 * Reusable retention policy editor.
 *
 * Responsibilities:
 *  - render editable retention policy fields
 *  - render current JSON snapshot
 *  - emit updated policy values upward
 *
 * Intentionally DOES NOT:
 *  - persist data
 *  - own modal state
 *  - perform API calls
 *  - show toast notifications
 *
 * This makes the form reusable across:
 *  - modals
 *  - settings pages
 *  - admin dashboards
 *  - embedded editors
 *
 * -----------------------------------------------------------------------------
 *
 * Props:
 *
 * value:
 *  Current retention policy object
 *
 * onChange:
 *  Callback receiving updated policy object
 *
 * disabled:
 *  Disables editing interactions
 *
 * showJson:
 *  Toggle JSON preview section
 *
 * -----------------------------------------------------------------------------
 */
export default function RetentionForm({
    value = {},
    onChange,
    disabled = false,
    showJson = true,
}) {
    /**
     * -------------------------------------------------------------------------
     * Update Helper
     * -------------------------------------------------------------------------
     *
     * Centralized immutable update helper.
     */
    const update = useCallback(
        (key, nextValue) => {
            onChange?.({
                ...value,
                [key]: nextValue,
            });
        },
        [onChange, value]
    );

    return (
        <div className="content">

            {/* ----------------------------------------------------------------- */}
            {/* Current Policy JSON                                               */}
            {/* ----------------------------------------------------------------- */}

            {showJson && (
                <Panel
                    heading="Current Saved Policy"
                    items={[
                        {
                            key: "policy-json",
                            type: "custom",
                            content: (
                                <Collapsible label={"JSON"}>
                                    <JsonEditor
                                        data={value}
                                        viewOnly
                                    />
                                </Collapsible>
                            ),
                        },
                    ]}
                />
            )}

            {/* ----------------------------------------------------------------- */}
            {/* Retention Configuration Fields                                    */}
            {/* ----------------------------------------------------------------- */}

            <Panel
                heading="Retention Configuration"
                items={[
                    {
                        key: "retention-form",
                        type: "custom",
                        content: (
                            <div className="columns">

                                {/* ------------------------------------------------- */}
                                {/* Retention Durations                               */}
                                {/* ------------------------------------------------- */}

                                <div className="column">

                                    {/* Archive Duration */}
                                    <div className="field">
                                        <label className="label">
                                            Archive Logs After
                                        </label>

                                        <DurationInput
                                            disabled={disabled}
                                            value={{
                                                amount:
                                                    value.activeDays ?? 30,

                                                unit: "days",
                                            }}
                                            onChange={(duration) =>
                                                update(
                                                    "activeDays",
                                                    duration.amount
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Delete Duration */}
                                    <div className="field">
                                        <label className="label">
                                            Delete Archived Logs After
                                        </label>

                                        <DurationInput
                                            disabled={disabled}
                                            value={{
                                                amount:
                                                    value.archiveDays ?? 90,

                                                unit: "days",
                                            }}
                                            onChange={(duration) =>
                                                update(
                                                    "archiveDays",
                                                    duration.amount
                                                )
                                            }
                                        />
                                    </div>

                                </div>

                                {/* ------------------------------------------------- */}
                                {/* Frequency Selector                                */}
                                {/* ------------------------------------------------- */}

                                <div className="column">

                                    <div className="field">
                                        <label className="label">
                                            Retention Job Frequency
                                        </label>

                                        {/* ----------------------------------------- */}
                                        {/* PortalContainer prevents dropdown clipping */}
                                        {/* in modals                                 */}
                                        {/* ----------------------------------------- */}

                                        <PortalContainer
                                            id="retention-frequency-selector"
                                        >
                                            {(portalTarget) => (
                                                <SingleSelector
                                                    disabled={disabled}
                                                    value={
                                                        value.frequency
                                                    }
                                                    options={
                                                        FREQUENCY_OPTIONS
                                                    }
                                                    portalTarget={
                                                        portalTarget
                                                    }
                                                    onChange={(frequency) =>
                                                        update(
                                                            "frequency",
                                                            frequency
                                                        )
                                                    }
                                                />
                                            )}
                                        </PortalContainer>

                                    </div>

                                </div>

                            </div>
                        ),
                    },
                ]}
            />

        </div>
    );
}