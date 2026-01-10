import React, { useContext, useState } from "react";
import { RumpusModal } from "../../ui/modal";
import { FontSettingsContext } from "./font_settings_context";
import SingleSelector from "../../dashboard-elements/single-selector/single-selector";
import ToggleSwitch from "../../dashboard-elements/toggle-switch/toggle-switch";
import logger from "../../../logger";
import { useRumpusModal } from "../../ui/modal/use-rumpus-modal";

/**
 * FontSettingsModal
 *
 * UI-only modal for configuring font sources and font slots.
 *
 * Responsibilities:
 * - Toggle font sources (google / system / custom)
 * - Assign fonts to configured font slots
 * - Optionally preview font output
 *
 * Notes:
 * - Uses RumpusModal for consistent modal behavior
 * - Modal visibility is controlled by RumpusModalProvider
 * - All changes are applied immediately via context
 */
export default function FontSettingsModal({
    preview = false,
    buttonLabel = "Font Settings",
}) {
    const { activeModal, openModal, closeModal } = useRumpusModal();

    const context = useContext(FontSettingsContext);

    if (!context) {
        logger.warn(
            "FontSettingsModal must be used inside FontSettingsProvider"
        );
        return null;
    }

    const {
        fonts,
        values,
        setFont,
        enabledSources,
        toggleSource,
    } = context;

    const modalId = "font-settings";
    const isOpen = activeModal === modalId;

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => openModal(modalId)}
                className="button is-info"
            >
                {buttonLabel}
            </button>

            <RumpusModal
                isOpen={isOpen}
                onRequestClose={() => closeModal(modalId)}
                title="Font Settings"
                draggable
                maxWidth="800px"
            >
                {/* ----------------------------
                   Font source toggles
                ----------------------------- */}
                <div className="columns is-multiline mb-5">
                    {["google", "system", "custom"].map((source) => (
                        <div key={source} className="column is-4">
                            <div className="is-flex is-align-items-center">
                                <ToggleSwitch
                                    checked={enabledSources[source]}
                                    onChange={() => toggleSource(source)}
                                />
                                <span className="ml-2">
                                    {source.charAt(0).toUpperCase() +
                                        source.slice(1)}{" "}
                                    Fonts
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ----------------------------
                   Font slot selectors
                ----------------------------- */}
                {Object.entries(values).map(([slotKey, value]) => (
                    <div
                        key={slotKey}
                        className={`field ${preview ? "is-flex" : ""}`}
                        style={{
                            gap: "1rem",
                            alignItems: "center",
                            marginBottom: "1.5rem",
                        }}
                    >
                        {/* Selector */}
                        <div style={{ flex: 1 }}>
                            <label className="label">
                                {slotKey.replace(/([A-Z])/g, " $1")}
                            </label>

                            <SingleSelector
                                options={fonts.map((font) => ({
                                    value: font.value,
                                    label: font.name,
                                }))}
                                value={value}
                                onChange={(v) => setFont(slotKey, v)}
                                searchable
                                placeholder="— Select font —"
                                portalTarget={document.body}
                            />
                        </div>

                        {/* Optional preview */}
                        {preview && (
                            <div
                                className="box"
                                style={{
                                    fontFamily: value,
                                    minWidth: "220px",
                                    textAlign: "center",
                                }}
                            >
                                <p>The quick brown fox</p>
                                <p>jumps over the lazy dog.</p>
                            </div>
                        )}
                    </div>
                ))}
            </RumpusModal>
        </>
    );
}
