import React, { useContext, useState } from "react";
import { RumpusModal } from "../../ui/modal";
import { ColorSettingsContext } from "./color_settings_context";
import SingleSelector from "../../dashboard-elements/single-selector/single-selector";
import logger from "../../../logger";
import { Tooltip } from "../../ui";
import { useRumpusModal } from "../../ui/modal/use-rumpus-modal";

/**
 * ColorSettingsModal
 *
 * - UI-only modal for editing global color values
 * - Uses RumpusModal for layout/behavior
 * - Modal visibility is controlled by RumpusModalProvider
 */
export default function ColorSettingsModal({
    preview = true,
    buttonLabel = "Color Settings",
}) {
    const { activeModal, openModal, closeModal } = useRumpusModal();
    const [selectedLayout, setSelectedLayout] = useState("");

    const colorSettings = useContext(ColorSettingsContext);

    if (!colorSettings) {
        logger.warn(
            "ColorSettingsModal must be used inside ColorSettingsProvider"
        );
        return null;
    }

    const { values, setColor, defaults, layouts, slots } = colorSettings;

    const modalId = "color-settings";
    const isOpen = activeModal === modalId;

    const applyLayout = (layoutName) => {
        const layout = layouts?.[layoutName];
        if (!layout) return;

        Object.entries(layout).forEach(([key, value]) =>
            setColor(key, value)
        );
        setSelectedLayout(layoutName);
    };

    const resetColors = () => {
        Object.entries(defaults).forEach(([key, value]) =>
            setColor(key, value)
        );
        setSelectedLayout("");
    };

    return (
        <>
            <button
                onClick={() => openModal(modalId)}
                className="button is-info"
            >
                {buttonLabel}
            </button>

            <RumpusModal
                isOpen={isOpen}
                onRequestClose={() => closeModal(modalId)}
                title="Color Settings"
                draggable
            >
                {/* Layout selector */}
                <div className="field mb-4">
                    <label className="label">Predefined Layouts</label>
                    <SingleSelector
                        options={Object.keys(layouts || {}).map((name) => ({
                            value: name,
                            label: name,
                        }))}
                        value={selectedLayout}
                        onChange={applyLayout}
                        searchable
                        placeholder="— Select a layout —"
                        portalTarget={document.body}
                    />
                </div>

                {/* Color pickers */}
                <div className="columns is-multiline">
                    {Object.entries(slots).map(([key]) => (
                        <div className="column is-one-quarter" key={key}>
                            <label className="label">{key}</label>
                            <input
                                type="color"
                                value={values[key]}
                                onChange={(e) =>
                                    setColor(key, e.target.value)
                                }
                            />
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="is-flex is-justify-content-flex-end mt-4">
                    <Tooltip text="Reset color options to default">
                        <button
                            className="button is-light mr-2"
                            onClick={resetColors}
                        >
                            Reset
                        </button>
                    </Tooltip>
                </div>
            </RumpusModal>
        </>
    );
}
