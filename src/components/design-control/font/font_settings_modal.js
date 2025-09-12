import React, { useState } from "react";
import Modal from "react-modal";
import { isModalActive, modal_style, setModalActive, setModalInactive } from "../../modal_manager";
import { useFontSettings } from "./use_font_settings";

/**
 * Modal for selecting site-wide fonts.
 * - Allows toggling sources: Google, System, Custom
 * - Allows selecting primary and secondary fonts
 * - Optional preview of fonts
 */
export default function FontSettingsModal({ preview = false, secondaryFont = false }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const {
        fonts,
        currentFont,
        setCurrentFont,
        currentSecondaryFont,
        setCurrentSecondaryFont,
        enabledSources,
        toggleSource,
    } = useFontSettings({ secondaryFont });

    /** Modal handlers */
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
            {/* Optional button to open modal */}
            <button onClick={openModal} className="button is-info">
                Font Settings
            </button>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal-content"
                style={modal_style}
                contentLabel="Font Selector"
            >
                <div className="modal-content box">
                    <h2 className="title is-4">Font Settings</h2>

                    {/* Font source toggles */}
                    {["google", "system", "custom"].map((src) => (
                        <div className="field" key={src}>
                            <label className="checkbox">
                                <input
                                    type="checkbox"
                                    checked={enabledSources[src]}
                                    onChange={() => toggleSource(src)}
                                />{" "}
                                {src.charAt(0).toUpperCase() + src.slice(1)} Fonts
                            </label>
                        </div>
                    ))}

                    {/* Primary font selector */}
                    <div className={`field ${preview ? "is-flex" : ""}`} style={{ gap: "1rem" }}>
                        <div>
                            <label className="label">Primary Font</label>
                            <div className="control">
                                <div className="select">
                                    <select value={currentFont} onChange={(e) => setCurrentFont(e.target.value)}>
                                        {fonts.map((font) => (
                                            <option key={font.name} value={font.value}>
                                                {font.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {preview && (
                            <div
                                className="box"
                                style={{
                                    fontFamily: currentFont,
                                    minWidth: "200px",
                                    textAlign: "center",
                                }}
                            >
                                <p>The quick brown fox</p>
                                <p>jumps over the lazy dog.</p>
                            </div>
                        )}
                    </div>

                    {/* Secondary font selector */}
                    {secondaryFont && (
                        <div className={`field ${preview ? "is-flex" : ""}`} style={{ gap: "1rem" }}>
                            <div>
                                <label className="label">Secondary Font</label>
                                <div className="control">
                                    <div className="select">
                                        <select
                                            value={currentSecondaryFont}
                                            onChange={(e) => setCurrentSecondaryFont(e.target.value)}
                                        >
                                            {fonts.map((font) => (
                                                <option key={font.name} value={font.value}>
                                                    {font.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {preview && (
                                <div
                                    className="box"
                                    style={{
                                        fontFamily: currentSecondaryFont,
                                        minWidth: "200px",
                                        textAlign: "center",
                                    }}
                                >
                                    <p>The quick brown fox</p>
                                    <p>jumps over the lazy dog.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Close button */}
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
