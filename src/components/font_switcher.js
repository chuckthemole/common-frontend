import React, { useState, useEffect, useMemo } from "react";
import Modal from "react-modal";
import { isModalActive, modal_style, setModalActive, setModalInactive } from "./modal_manager";
import { google_fonts, system_fonts, custom_fonts } from "../constants/fonts";

export default function FontSwitcherModal({ preview = false }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [enabledSources, setEnabledSources] = useState({
        google: true,
        system: true,
        custom: true,
    });

    const savedFont = localStorage.getItem("primaryFont") || google_fonts[0].value;
    const [currentFont, setCurrentFont] = useState(savedFont);

    // Build available fonts dynamically
    const fonts = useMemo(() => {
        let f = [];
        if (enabledSources.google) f = f.concat(google_fonts);
        if (enabledSources.system) f = f.concat(system_fonts);
        if (enabledSources.custom) f = f.concat(custom_fonts);
        return f;
    }, [enabledSources]);

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

                    {/* Dropdown + optional preview */}
                    <div className={`field ${preview ? "is-flex" : ""}`} style={{ gap: "1rem" }}>
                        <div>
                            <label className="label">Select Font</label>
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