/**
 * Modal for selecting layout preferences.
 * It uses the LayoutSettingsContext to persist and sync layout configuration
 * (e.g., column width) across the app, and modal_manager for consistent modal state tracking.
 */

import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import {
    isModalActive,
    modal_style,
    setModalActive,
    setModalInactive,
} from "../../modal_manager";
import { useLayoutSettings, layoutOptions } from "./layout_settings_context";

export default function LayoutSettingsModal() {
    const { layout, setLayoutSetting, initialized } = useLayoutSettings();
    const [modalIsOpen, setModalIsOpen] = useState(false);

    /**
     * Ensure modal never displays before layout settings are initialized.
     * Prevents users from interacting with stale or undefined data.
     */
    useEffect(() => {
        if (!initialized && modalIsOpen) {
            setModalIsOpen(false);
        }
    }, [initialized, modalIsOpen]);

    /**
     * Opens modal safely — checks global modal manager to avoid overlap.
     */
    const openModal = useCallback(() => {
        if (!isModalActive()) {
            setModalIsOpen(true);
            setModalActive();
        }
    }, []);

    /**
     * Closes modal and updates modal manager state.
     */
    const closeModal = useCallback(() => {
        setModalIsOpen(false);
        setModalInactive();
    }, []);

    /**
     * Handles select change and updates the layout context directly.
     * This ensures a single source of truth (context), avoiding internal modal state drift.
     */
    const handleSelect = useCallback(
        (value) => {
            setLayoutSetting("columnWidth", value);
        },
        [setLayoutSetting]
    );

    return (
        <>
            {/* Trigger button for opening modal */}
            <button
                onClick={openModal}
                className="button is-info"
                aria-label="Open Layout Settings"
            >
                Layout Settings
            </button>

            {/* Layout Settings Modal */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Layout Settings Modal"
                ariaHideApp={false} // Disable app hiding for non-root mounting
                shouldCloseOnOverlayClick={true}
                shouldCloseOnEsc={true}
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
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                    },
                    overlay: {
                        ...modal_style.overlay,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 9999,
                    },
                }}
            >
                <h2 className="title is-4 mb-4">Layout Settings</h2>

                {/* If settings not loaded, show loader */}
                {!initialized ? (
                    <p>Loading settings…</p>
                ) : (
                    <div className="field">
                        <label className="label">Main Content Width</label>
                        <div className="control select is-fullwidth">
                            <select
                                value={layout.columnWidth}
                                onChange={(e) => handleSelect(e.target.value)}
                                aria-label="Select layout width"
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
                    <button
                        className="button is-success"
                        onClick={closeModal}
                        aria-label="Close Layout Settings"
                    >
                        Done
                    </button>
                </div>
            </Modal>
        </>
    );
}
