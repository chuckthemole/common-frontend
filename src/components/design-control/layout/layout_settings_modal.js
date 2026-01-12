/**
 * LayoutSettingsModal
 *
 * Modal for selecting layout preferences.
 *
 * - Uses LayoutSettingsContext to persist layout configuration
 * - Uses RumpusModal + useRumpusModal for modal state (no modal_manager)
 * - Guards against rendering before layout settings are initialized
 */

import React, { useCallback, useEffect } from "react";
import { RumpusModal } from "../../ui/modal";
import { useRumpusModal } from "../../ui/modal/use-rumpus-modal";
import { useLayoutSettings, layoutOptions } from "./layout_settings_context";
import SingleSelector from "../../dashboard-elements/single-selector/single-selector";

export default function LayoutSettingsModal() {
    const { layout, setLayoutSetting, initialized } = useLayoutSettings();
    const { activeModal, openModal, closeModal } = useRumpusModal();

    /**
     * Unique modal id for Rumpus modal registry
     */
    const modalId = "layout-settings-modal";
    const isOpen = activeModal === modalId;

    /**
     * Close modal automatically if layout settings become uninitialized
     * (extra safety for async bootstrap / app reload scenarios)
     */
    useEffect(() => {
        if (!initialized && isOpen) {
            closeModal(modalId);
        }
    }, [initialized, isOpen, closeModal]);

    /**
     * Open modal handler
     */
    const handleOpen = useCallback(() => {
        if (!initialized) return;
        openModal(modalId);
    }, [initialized, openModal]);

    /**
     * Close modal handler
     */
    const handleClose = useCallback(() => {
        closeModal(modalId);
    }, [closeModal]);

    /**
     * Update layout setting directly via context
     */
    const handleSelect = useCallback(
        (value) => {
            setLayoutSetting("columnWidth", value);
        },
        [setLayoutSetting]
    );

    /**
     * Map layout options to SingleSelector format
     */
    const selectorOptions = layoutOptions.map((opt) => ({
        value: opt,
        label: opt.replace("is-", "").replace("-", " "),
    }));

    return (
        <>
            {/* Trigger button */}
            <button
                type="button"
                onClick={handleOpen}
                className="button is-info"
                aria-label="Open Layout Settings"
                disabled={!initialized}
            >
                Layout Settings
            </button>

            {/* Layout Settings Modal */}
            <RumpusModal
                isOpen={isOpen}
                onRequestClose={handleClose}
                title="Layout Settings"
                maxWidth="400px"
                draggable
            >
                {!initialized ? (
                    <p>Loading settings…</p>
                ) : (
                    <div className="field">
                        <label className="label">Main Content Width</label>
                        <div className="control">
                            <SingleSelector
                                options={selectorOptions}
                                value={layout.columnWidth}
                                onChange={handleSelect}
                                portalTarget={document.body}
                            />
                        </div>
                    </div>
                )}

                <div className="buttons is-right mt-4">
                    <button
                        type="button"
                        className="button is-success"
                        onClick={handleClose}
                        aria-label="Close Layout Settings"
                    >
                        Done
                    </button>
                </div>
            </RumpusModal>
        </>
    );
}
