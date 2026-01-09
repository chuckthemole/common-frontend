import React from "react";
import Modal from "react-modal";
import Draggable from "react-draggable";
import {
    isModalActive,
    modal_style,
    setModalActive,
    setModalInactive,
} from "../../modal_manager";

export default function RumpusModal({
    isOpen,
    onRequestClose,
    title,
    draggable = false,
    width = "90vw",
    maxWidth = "1200px",
    children,
}) {
    const handleClose = () => {
        setModalInactive();
        onRequestClose?.();
    };

    const modalInner = (
        <div
            className="rumpus-modal"
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                background: "#fff",
            }}
        >
            {title && (
                <div
                    className="modal-header"
                    style={{
                        cursor: draggable ? "move" : "default",
                        padding: "1rem 1.25rem",
                        borderBottom: "1px solid #ccc",
                        userSelect: "none",
                        background: "#f3f4f6", // light gray
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                >
                    <h2 className="title is-5 mb-0">{title}</h2>

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close modal"
                        style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "1.25rem",
                            lineHeight: 1,
                            cursor: "pointer",
                            color: "#555",
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            <div
                className="modal-body"
                style={{
                    padding: "2rem",
                    overflowY: "auto",
                    flex: 1,
                }}
            >
                {children}
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onAfterOpen={() => !isModalActive() && setModalActive()}
            onRequestClose={handleClose}
            style={{
                overlay: {
                    ...modal_style.overlay,
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 9999,
                },
                content: {
                    position: "relative",
                    inset: "auto",
                    padding: 0,
                    width,
                    maxWidth,
                    maxHeight: "90vh",
                    overflow: "hidden",
                    borderRadius: "6px",
                    zIndex: 10000,
                },
            }}
            contentElement={
                draggable
                    ? (props, children) => (
                        <Draggable handle=".modal-header">
                            <div {...props}>{children}</div>
                        </Draggable>
                    )
                    : undefined
            }
        >
            {modalInner}
        </Modal>
    );
}
