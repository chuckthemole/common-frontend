import React from "react";
import { useRumpusModal } from "../ui/modal/use-rumpus-modal";
import { RumpusModal } from "../ui/modal";

/**
 * Generic modal trigger wrapper.
 *
 * Handles:
 * - rendering trigger (button/link/text)
 * - opening/closing modal
 * - modal shell
 *
 * DOES NOT handle:
 * - auth
 * - forms
 * - business logic
 */
export default function ModalTrigger({
    modalId,
    title,
    children,

    triggerType = "button",
    triggerLabel = "Open",
    triggerClassName = "",
    disabled = false,

    onOpen,
    onClose,
}) {
    const { activeModal, openModal, closeModal } = useRumpusModal();

    const isOpen = activeModal === modalId;

    const handleTriggerClick = (e) => {
        if (disabled) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        openModal(modalId);
        onOpen?.();
    };

    const handleClose = () => {
        closeModal(modalId);
        onClose?.();
    };

    const commonProps = {
        onClick: handleTriggerClick,
        "aria-disabled": disabled,
    };

    const renderTrigger = () => {
        switch (triggerType) {
            case "link":
                return (
                    <a
                        href="#"
                        className={triggerClassName || "navbar-item"}
                        {...commonProps}
                    >
                        {triggerLabel}
                    </a>
                );

            case "text":
                return (
                    <span
                        role="button"
                        tabIndex={0}
                        className={triggerClassName}
                        {...commonProps}
                    >
                        {triggerLabel}
                    </span>
                );

            case "button":
            default:
                return (
                    <button
                        type="button"
                        className={triggerClassName || "button is-primary"}
                        disabled={disabled}
                        {...commonProps}
                    >
                        {triggerLabel}
                    </button>
                );
        }
    };

    return (
        <>
            {renderTrigger()}

            <RumpusModal
                isOpen={isOpen}
                onRequestClose={handleClose}
                title={title}
                maxWidth="480px"
                draggable
            >
                {children}
            </RumpusModal>
        </>
    );
}