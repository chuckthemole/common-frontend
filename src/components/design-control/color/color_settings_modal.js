import React, { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
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
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedLayout, setSelectedLayout] = useState("");

    const colorSettings = useContext(ColorSettingsContext);

    if (!colorSettings) {
        logger.warn("ColorSettingsModal must be used inside ColorSettingsProvider");
        return null;
    }

    const { values, setColor, defaults, layouts } = colorSettings;

    /* ----------------------------
       Modal open / close
    ----------------------------- */
    const openModal = () => {
        if (!isModalActive()) {
            setModalIsOpen(true);
            setModalActive();
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setModalInactive();
    };

    /* ----------------------------
       Apply predefined layout
    ----------------------------- */
    const applyLayout = (layoutName) => {
        if (!layoutName) return;

        const layout = layouts[layoutName];
        if (!layout) return;

        Object.entries(layout).forEach(([key, value]) => setColor(key, value));
        setSelectedLayout(layoutName);
    };

    /* ----------------------------
       Reset to defaults
    ----------------------------- */
    const resetColors = () => {
        Object.entries(colorSettings.defaults).forEach(([key, value]) =>
            setColor(key, value)
        );
        setSelectedLayout("");
    };


    /* ----------------------------
       Render
    ----------------------------- */
    return (
        <>
            <button onClick={openModal} className="button is-info">
                {buttonLabel}
            </button>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Color Settings"
                style={{
                    ...modal_style,
                    content: {
                        ...modal_style.content,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        width: "90vw",
                        maxWidth: "1200px",
                        padding: "2rem",
                        zIndex: 10000,
                    },
                    overlay: {
                        ...modal_style.overlay,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 9999,
                    },
                }}
            >
                <div className="modal-content">
                    <h2 className="title is-4 mb-4">Color Settings</h2>

                    {/* ----------------------------
                        Predefined Layout Selector
                    ----------------------------- */}
                    <div className="field mb-4">
                        <label className="label">Predefined Layouts</label>
                        <SingleSelector
                            options={Object.keys(layouts).map((name) => ({
                                value: name,
                                label: name,
                            }))}
                            value={selectedLayout}
                            onChange={(v) => applyLayout(v)}
                            searchable
                            placeholder="— Select a layout —"
                            portalTarget={document.body}
                        />
                    </div>

                    {/* ----------------------------
                       Color Pickers
                    ----------------------------- */}
                    <div className="columns is-multiline">
                        {Object.entries(colorSettings.slots).map(([key, cfg]) => {
                            const value = values[key];
                            const label = key.replace(/-/g, " ");
                            return (
                                <div className="column is-one-quarter" key={key}>
                                    <div className="field">
                                        <label
                                            className="label"
                                            title={key}
                                            style={{
                                                textOverflow: "ellipsis",
                                                overflow: "hidden",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {label}
                                        </label>

                                        <div
                                            className="control is-flex is-align-items-center"
                                            style={{ gap: "1rem" }}
                                        >
                                            <input
                                                type="color"
                                                value={value || "#000000"}
                                                onChange={(e) => setColor(key, e.target.value)}
                                                style={{ flex: "1 1 auto" }}
                                            />

                                            {preview && (
                                                <div
                                                    style={{
                                                        width: "40px",
                                                        height: "24px",
                                                        backgroundColor: value,
                                                        border: "1px solid #ccc",
                                                        borderRadius: "4px",
                                                        flexShrink: 0,
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ----------------------------
                       Footer Actions
                    ----------------------------- */}
                    <div
                        className="field mt-4"
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "1rem",
                        }}
                    >
                        <button
                            className="button is-light"
                            onClick={resetColors}
                        >
                            Reset
                        </button>

                        <button
                            className="button is-success"
                            onClick={closeModal}
                        >
                            Done
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
