import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { isModalActive, modal_style, setModalActive, setModalInactive } from "../../modal_manager";
import { useColorSettings } from "./use_color_settings";
import { predefinedColorLayouts } from "./predefined_color_layouts";

/**
 * ColorSettingsModal
 * - Allows admin to edit global color palette
 * - Applies changes live via CSS variables
 * - Optional preview swatches
 * - Full-width modal layout
 * - Supports saving/loading named color layouts
 * - Truncates long text with tooltip
 */
export default function ColorSettingsModal({ preview = true }) {
    const { colors, setColors } = useColorSettings();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [savedLayouts, setSavedLayouts] = useState({});
    const [selectedLayout, setSelectedLayout] = useState("");

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("savedColorLayouts") || "{}");
        setSavedLayouts({ ...predefinedColorLayouts, ...stored });
    }, []);


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

    const handleChange = (key, value) => {
        setColors((prev) => ({ ...prev, [key]: value }));
    };

    const handleSaveLayout = () => {
        const name = prompt("Enter a name for this color layout:");
        if (!name) return;
        const newLayouts = { ...savedLayouts, [name]: colors };
        setSavedLayouts(newLayouts);
        localStorage.setItem("savedColorLayouts", JSON.stringify(newLayouts));
        setSelectedLayout(name);
    };

    const handleLoadLayout = (name) => {
        if (savedLayouts[name]) {
            setColors(savedLayouts[name]);
            setSelectedLayout(name);
        }
    };

    const handleDeleteLayout = (name) => {
        const { [name]: _, ...rest } = savedLayouts;
        setSavedLayouts(rest);
        localStorage.setItem("savedColorLayouts", JSON.stringify(rest));
        if (selectedLayout === name) setSelectedLayout("");
    };

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
                        padding: "2rem"
                    },
                    overlay: {
                        ...modal_style.overlay,
                        backgroundColor: "rgba(0, 0, 0, 0.5)"
                    }
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
                                    title={selectedLayout} // Tooltip for selected text
                                    style={{
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        maxWidth: "100%"
                                    }}
                                >
                                    <option value="">-- Select a layout --</option>
                                    {Object.keys(savedLayouts).map((name) => (
                                        <option
                                            key={name}
                                            value={name}
                                            title={name} // Tooltip for long names
                                        >
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
                                        title={key.charAt(0).toUpperCase() + key.slice(1)} // Tooltip for truncated labels
                                        style={{
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap"
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
                                                    flexShrink: 0
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
