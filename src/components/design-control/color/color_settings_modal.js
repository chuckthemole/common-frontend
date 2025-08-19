import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { isModalActive, modal_style, setModalActive, setModalInactive } from "../../modal_manager";

const defaultColors = {
    primary: "#8A4D76",
    link: "#FA7C91",
    background: "#ffffff",
    text: "#363636"
};

export default function ColorSettingsModal({ preview = true }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [colors, setColors] = useState({
        primary: localStorage.getItem("primaryColor") || defaultColors.primary,
        link: localStorage.getItem("linkColor") || defaultColors.link,
        background: localStorage.getItem("backgroundColor") || defaultColors.background,
        text: localStorage.getItem("textColor") || defaultColors.text
    });

    useEffect(() => {
        Object.entries(colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}-color`, value);
            localStorage.setItem(`${key}Color`, value);
        });
    }, [colors]);

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
            <a onClick={openModal} className="button is-light">
                Color Settings
            </a>

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
