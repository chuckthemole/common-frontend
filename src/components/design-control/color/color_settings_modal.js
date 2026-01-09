import React, { useContext, useEffect, useState } from "react";
import { RumpusModal } from "../../ui/modal";
import Modal from "react-modal";
import Draggable from "react-draggable";
import {
    isModalActive,
    modal_style,
    setModalActive,
    setModalInactive,
} from "../../modal_manager";
import { ColorSettingsContext } from "./color_settings_context";
import { predefinedColorLayouts } from "./predefined_color_layouts";
import SingleSelector from "../../dashboard-elements/single-selector/single-selector";
import logger from "../../../logger";

/**
 * ColorSettingsModal
 *
 * - UI-only modal for editing global color values
 * - Uses ColorSettingsProvider via context
 * - Uses colors.json as the canonical list of color slots
 * - Supports predefined color layouts
 * - Applies changes live via CSS variables
 */
export default function ColorSettingsModal({
    preview = true,
    buttonLabel = "Color Settings",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLayout, setSelectedLayout] = useState("");

    const colorSettings = useContext(ColorSettingsContext);

    if (!colorSettings) {
        logger.warn("ColorSettingsModal must be used inside ColorSettingsProvider");
        return null;
    }

    const { values, setColor, defaults, layouts, slots } = colorSettings;

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

    /* ----------------------------
       Render
    ----------------------------- */
    return (
        <>
            <button onClick={() => setIsOpen(true)} className="button is-info">
                {buttonLabel}
            </button>

            <RumpusModal
                isOpen={isOpen}
                onRequestClose={() => setIsOpen(false)}
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
                                onChange={(e) => setColor(key, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="is-flex is-justify-content-flex-end mt-4">
                    <button className="button is-light mr-2" onClick={resetColors}>
                        Reset
                    </button>
                    <button
                        className="button is-success"
                        onClick={() => setIsOpen(false)}
                    >
                        Done
                    </button>
                </div>
            </RumpusModal>
        </>
    );
}
