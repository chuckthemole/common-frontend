import React, { useState } from "react";
import Modal from "react-modal";
import { isModalActive, modal_style, setModalActive, setModalInactive } from "../../modal_manager";
import { useColorSettings } from "./use_color_settings";

export default function ColorSettingsModal({ preview = true }) {
    const { colors, setColors } = useColorSettings();
    const [modalIsOpen, setModalIsOpen] = useState(false);

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

    return (
        <>
            <button onClick={openModal} className="button is-info">
                Color Settings
            </button>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal-content"
                style={modal_style}
                contentLabel="Color Selector"
            >
                <div className="modal-content box">
                    <h2 className="title is-4">Color Settings</h2>
                    {Object.entries(colors).map(([key, value]) => (
                        <div className="field" key={key} style={{ marginBottom: "1rem" }}>
                            <label className="label">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                            <div className="control" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <input
                                    type="color"
                                    value={value}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                />
                                {preview && (
                                    <div
                                        style={{
                                            width: "50px",
                                            height: "25px",
                                            backgroundColor: value,
                                            border: "1px solid #ccc"
                                        }}
                                    />
                                )}
                            </div>
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
