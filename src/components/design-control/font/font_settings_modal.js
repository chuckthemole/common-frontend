import React, { useContext, useState } from "react";
import Modal from "react-modal";
import {
    isModalActive,
    modal_style,
    setModalActive,
    setModalInactive,
} from "../../modal_manager";
import { FontSettingsContext } from "./font_settings_context";
import SingleSelector from "../../dashboard-elements/single-selector/single-selector";
import ToggleSwitch from "../../dashboard-elements/toggle-switch/toggle-switch";
import logger from "../../../logger";

/**
 * FontSettingsModal
 * - Uses ToggleSwitch for font sources
 * - Uses SingleSelector for font slot selection
 */
export default function FontSettingsModal({
    preview = false,
    buttonLabel = "Font Settings",
}) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const context = useContext(FontSettingsContext);

    if (!context) {
        logger.warn("FontSettingsModal must be used inside FontSettingsProvider");
        return null;
    }

    const { fonts, values, setFont, enabledSources, toggleSource } = context;

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

    return (
        <>
            <button onClick={openModal} className="button is-info">
                {buttonLabel}
            </button>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Font Selector"
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
                        maxWidth: "800px",
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
                    <h2 className="title is-4">Font Settings</h2>

                    {/* Font source toggles */}
                    <div className="columns is-multiline mb-4">
                        {["google", "system", "custom"].map((src) => (
                            <div key={src} className="column is-4">
                                <ToggleSwitch
                                    checked={enabledSources[src]}
                                    onChange={() => toggleSource(src)}
                                />
                                <span className="ml-2">
                                    {src.charAt(0).toUpperCase() + src.slice(1)} Fonts
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Font slot selectors */}
                    {Object.entries(values).map(([slotKey, value]) => (
                        <div
                            key={slotKey}
                            className={`field ${preview ? "is-flex" : ""}`}
                            style={{ gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}
                        >
                            <div style={{ flex: 1 }}>
                                <label className="label">
                                    {slotKey.replace(/([A-Z])/g, " $1")}
                                </label>
                                <SingleSelector
                                    options={fonts.map((f) => ({ value: f.value, label: f.name }))}
                                    value={value}
                                    onChange={(v) => setFont(slotKey, v)}
                                    searchable
                                    portalTarget={document.body}
                                />
                            </div>

                            {preview && (
                                <div
                                    className="box"
                                    style={{
                                        fontFamily: value,
                                        minWidth: "200px",
                                        textAlign: "center",
                                    }}
                                >
                                    <p>The quick brown fox</p>
                                    <p>jumps over the lazy dog.</p>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="field mt-4">
                        <button className="button is-success" onClick={closeModal}>
                            Done
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
