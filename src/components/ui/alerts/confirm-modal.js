import React from "react";
import {
    RumpusModal,
    useRumpusModal
} from "../modal";

/**
 * ConfirmModal
 *
 * Generic confirmation dialog built on RumpusModal.
 *
 * Usage:
 *  - Controlled via modalId + useRumpusModal
 *  - Designed for destructive or sensitive actions
 */
export default function ConfirmModal({
    modalId,
    title = "Confirm action",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false,
    onConfirm,
    onCancel,
    maxWidth = "420px",
    draggable = false
}) {
    const { activeModal, closeModal } = useRumpusModal();
    const isOpen = activeModal === modalId;

    const handleCancel = () => {
        closeModal(modalId);
        onCancel?.();
    };

    const handleConfirm = () => {
        onConfirm?.();
        closeModal(modalId);
    };

    return (
        <RumpusModal
            isOpen={isOpen}
            onRequestClose={handleCancel}
            title={title}
            maxWidth={maxWidth}
            draggable={draggable}
            className={danger ? "rumpus-modal--danger" : undefined}
            headerClassName={danger ? "rumpus-modal-header--danger" : undefined}
            bodyClassName={danger ? "rumpus-modal-body--danger" : undefined}
        >
            <div className="p-4">
                <div className="mb-4">
                    {typeof message === "string" ? <p>{message}</p> : message}
                </div>

                <div className="buttons is-right">
                    <button
                        type="button"
                        className="button is-light"
                        onClick={handleCancel}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className={`button ${danger ? "is-danger" : "is-primary"}`}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </RumpusModal>
    );
}
