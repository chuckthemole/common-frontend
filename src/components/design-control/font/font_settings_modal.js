import React, { useState, useEffect, useMemo } from "react";
import Modal from "react-modal";
import { isModalActive, modal_style, setModalActive, setModalInactive } from "../../modal_manager";
import { google_fonts, system_fonts, custom_fonts } from "../../../constants/fonts";

export default function FontSettingsModal({ preview = false, secondaryFont = false }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [enabledSources, setEnabledSources] = useState({
        google: true,
        system: true,
        custom: true,
    });

    // Load saved fonts or fall back to defaults
    const savedPrimary = localStorage.getItem("primaryFont") || google_fonts[0].value;
    const savedSecondary = localStorage.getItem("secondaryFont") || system_fonts[0].value;

    const [currentFont, setCurrentFont] = useState(savedPrimary);
    const [currentSecondaryFont, setCurrentSecondaryFont] = useState(savedSecondary);

    // Build available fonts dynamically
    const fonts = useMemo(() => {
        let f = [];
        if (enabledSources.google) f = f.concat(google_fonts);
        if (enabledSources.system) f = f.concat(system_fonts);
        if (enabledSources.custom) f = f.concat(custom_fonts);
        return f;
    }, [enabledSources]);

    // Handle primary font
    useEffect(() => {
        document.documentElement.style.setProperty("--primary-font", currentFont);
        localStorage.setItem("primaryFont", currentFont);

        const fontObj = fonts.find((f) => f.value === currentFont);
        if (fontObj?.url) {
            const linkId = `font-${fontObj.name}`;
            if (!document.getElementById(linkId)) {
                const link = document.createElement("link");
                link.id = linkId;
                link.rel = "stylesheet";
                link.href = fontObj.url;
                document.head.appendChild(link);
            }
        }
    }, [currentFont, fonts]);

    // Handle secondary font (if enabled)
    useEffect(() => {
        if (secondaryFont) {
            document.documentElement.style.setProperty("--secondary-font", currentSecondaryFont);
            localStorage.setItem("secondaryFont", currentSecondaryFont);

            const fontObj = fonts.find((f) => f.value === currentSecondaryFont);
            if (fontObj?.url) {
                const linkId = `font-${fontObj.name}`;
                if (!document.getElementById(linkId)) {
                    const link = document.createElement("link");
                    link.id = linkId;
                    link.rel = "stylesheet";
                    link.href = fontObj.url;
                    document.head.appendChild(link);
                }
            }
        }
    }, [currentSecondaryFont, secondaryFont, fonts]);

    const toggleSource = (source) => {
        setEnabledSources((prev) => ({ ...prev, [source]: !prev[source] }));
    };

    /** Modal handlers */
    function openModal() {
        if (!isModalActive()) {
            setModalIsOpen(true);
            setModalActive();
        }
    }

    function closeModal() {
        setModalIsOpen(false);
        setModalInactive();
    }

    return (
        <>
            {/* Button to open modal */}
            <a onClick={openModal} className="button is-light">
                Font Settings
            </a>

            {/* Modal Window */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal-content"
                style={modal_style}
                contentLabel="Font Source Selector"
            >
                <div className="modal-content box">
                    <h2 className="title is-4">Font Settings</h2>

                    {/* Source toggles */}
                    <div className="field">
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                checked={enabledSources.google}
                                onChange={() => toggleSource("google")}
                            />{" "}
                            Google Fonts
                        </label>
                    </div>
                    <div className="field">
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                checked={enabledSources.system}
                                onChange={() => toggleSource("system")}
                            />{" "}
                            System Fonts
                        </label>
                    </div>
                    <div className="field">
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                checked={enabledSources.custom}
                                onChange={() => toggleSource("custom")}
                            />{" "}
                            Custom Fonts
                        </label>
                    </div>

                    {/* Primary font selector */}
                    <div className={`field ${preview ? "is-flex" : ""}`} style={{ gap: "1rem" }}>
                        <div>
                            <label className="label">Primary Font</label>
                            <div className="control">
                                <div className="select">
                                    <select
                                        value={currentFont}
                                        onChange={(e) => setCurrentFont(e.target.value)}
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

                    {/* Secondary font selector (if enabled) */}
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
