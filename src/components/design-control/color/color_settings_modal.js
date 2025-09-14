import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { isModalActive, modal_style, setModalActive, setModalInactive } from "../../modal_manager";
import { useColorSettings } from "./use_color_settings";
import { predefinedColorLayouts } from "./predefined_color_layouts";
import colorsJson from "../../../constants/colors.json";

/**
 * ColorSettingsModal
 * -----------------
 * - Full-featured modal for editing global site colors
 * - Applies changes live via CSS variables using useColorSettings
 * - Supports saving/loading named layouts to localStorage
 * - Optional preview swatches next to color pickers
 * - Handles long labels with truncation and tooltips
 */
export default function ColorSettingsModal({ preview = true }) {
    // Hook to manage live color values
    const { colors, setColors } = useColorSettings();

    // Modal open state
    const [modalIsOpen, setModalIsOpen] = useState(false);

    // Stored layouts: predefined + user-saved
    const [savedLayouts, setSavedLayouts] = useState({ ...predefinedColorLayouts });

    // Currently selected layout name
    const [selectedLayout, setSelectedLayout] = useState("");

    // Load saved layouts from localStorage on mount
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("savedColorLayouts") || "{}");
        setSavedLayouts((prev) => ({ ...prev, ...stored }));
    }, []);

    // --------------------
    // Modal open/close handlers
    // --------------------
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

    // --------------------
    // Color update handler
    // --------------------
    const handleChange = (key, value) => {
        setColors((prev) => ({ ...prev, [key]: value }));
    };

    // --------------------
    // Layout management handlers
    // --------------------
    const handleSaveLayout = () => {
        const name = prompt("Enter a name for this color layout:");
        if (!name) return;

        const newLayouts = { ...savedLayouts, [name]: colors };
        setSavedLayouts(newLayouts);
        localStorage.setItem("savedColorLayouts", JSON.stringify(newLayouts));
        setSelectedLayout(name);
    };

    const handleLoadLayout = (name) => {
        if (!name) return;

        const layout = savedLayouts[name];
        if (layout) {
            // Merge user layout with default colors from colors.json
            setColors({ ...colorsJson, ...layout });
            setSelectedLayout(name);
        }
    };

    const handleDeleteLayout = (name) => {
        const { [name]: _, ...rest } = savedLayouts;
        setSavedLayouts(rest);
        localStorage.setItem("savedColorLayouts", JSON.stringify(rest));
        if (selectedLayout === name) setSelectedLayout("");
    };

    // --------------------
    // Render
    // --------------------
    return (
        <>
            <button onClick={openModal} className="button is-info">
                Color Settings
            </button>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Color Selector"
                style={{
                    ...modal_style,
                    content: {
                        ...modal_style.content,
                        top: "50%",
                        left: "50%",
                        right: "auto",
                        bottom: "auto",
                        transform: "translate(-50%, -50%)",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        width: "90vw",
                        maxWidth: "1200px",
                        padding: "2rem",
                        zIndex: 10000, // ensure content is above header
                    },
                    overlay: {
                        ...modal_style.overlay,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 9999, // overlay also above header
                    },
                }}
            >
                <div className="modal-content">
                    <h2 className="title is-4 mb-4">Color Settings</h2>

                    {/* Saved Layouts Dropdown */}
                    <div className="field mb-4">
                        <label className="label">Saved Layouts</label>
                        <div className="control is-flex" style={{ gap: "1rem" }}>
                            <div className="select is-fullwidth">
                                <select
                                    value={selectedLayout}
                                    onChange={(e) => handleLoadLayout(e.target.value)}
                                    title={selectedLayout}
                                    style={{
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        maxWidth: "100%",
                                    }}
                                >
                                    <option value="">-- Select a layout --</option>
                                    {Object.keys(savedLayouts).map((name) => (
                                        <option key={name} value={name} title={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedLayout && (
                                <button
                                    className="button is-danger"
                                    onClick={() => handleDeleteLayout(selectedLayout)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Color Pickers */}
                    <div className="columns is-multiline">
                        {Object.entries(colors).map(([key, value]) => (
                            <div className="column is-one-quarter" key={key}>
                                <div className="field">
                                    <label
                                        className="label"
                                        title={key.charAt(0).toUpperCase() + key.slice(1)}
                                        style={{
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </label>
                                    <div
                                        className="control is-flex is-align-items-center"
                                        style={{ gap: "1rem" }}
                                    >
                                        <input
                                            type="color"
                                            value={value}
                                            onChange={(e) => handleChange(key, e.target.value)}
                                            style={{ flex: "1 1 auto" }}
                                        />
                                        {preview && (
                                            <div
                                                style={{
                                                    width: "50px",
                                                    height: "25px",
                                                    backgroundColor: value,
                                                    border: "1px solid #ccc",
                                                    flexShrink: 0,
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Save / Done Buttons */}
                    <div
                        className="field mt-4 has-text-right"
                        style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}
                    >
                        <button className="button is-warning" onClick={handleSaveLayout}>
                            Save Layout
                        </button>
                        <button className="button is-success" onClick={closeModal}>
                            Done
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
