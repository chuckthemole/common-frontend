import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { isModalActive, modal_style, setModalActive, setModalInactive } from "../../modal_manager";
import { useLayoutSettings, layoutOptions } from "./layout_settings_context";

export default function LayoutSettingsModal() {
    const { layout, setLayoutSetting, initialized } = useLayoutSettings();
    const [modalIsOpen, setModalIsOpen] = useState(false);

    // Wait for persistence to load before showing anything
    useEffect(() => {
        if (!initialized && modalIsOpen) {
            setModalIsOpen(false);
        }
    }, [initialized]);

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

    const handleSelect = (value) => {
        setLayoutSetting("columnWidth", value);
    };

    return (
        <>
            <button onClick={openModal} className="button is-info">
                Layout Settings
            </button>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Layout Selector"
                ariaHideApp={false}
                style={{
                    ...modal_style,
                    content: {
                        ...modal_style.content,
                        top: "50%",
                        left: "50%",
                        right: "auto",
                        bottom: "auto",
                        transform: "translate(-50%, -50%)",
                        maxHeight: "80vh",
                        overflowY: "auto",
                        width: "400px",
                        zIndex: 10000,
                        padding: "2rem",
                        borderRadius: "12px",
                        backgroundColor: "#fff",
                    },
                    overlay: {
                        ...modal_style.overlay,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 9999,
                    },
                }}
            >
                <h2 className="title is-4 mb-4">Layout Settings</h2>

                {!initialized ? (
                    <p>Loading settings…</p>
                ) : (
                    <div className="field">
                        <label className="label">Main Content Width</label>
                        <div className="control select is-fullwidth">
                            <select
                                value={layout.columnWidth}
                                onChange={(e) => handleSelect(e.target.value)}
                            >
                                {layoutOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt.replace("is-", "").replace("-", " ")}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <div className="buttons is-right mt-4">
                    <button className="button is-success" onClick={closeModal}>
                        Done
                    </button>
                </div>
            </Modal>
        </>
    );
}
