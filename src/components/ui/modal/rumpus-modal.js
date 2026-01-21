import React, { useRef } from "react";
import Modal from "react-modal";
import Draggable from "react-draggable";

export default function RumpusModal({
    isOpen,
    onRequestClose,
    title,
    draggable = false,
    width = "90vw",
    maxWidth = "1200px",
    children,
}) {

    const nodeRef = useRef(null);

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
                        background: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <h2 className="title is-5 mb-0">{title}</h2>

                    <button
                        type="button"
                        onClick={onRequestClose}
                        aria-label="Close modal"
                        style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "1.25rem",
                            cursor: "pointer",
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
            onRequestClose={onRequestClose}
            style={{
                overlay: {
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
                },
            }}
            contentElement={
                draggable
                    ? (props, children) => (
                        <Draggable handle=".modal-header" nodeRef={nodeRef}>
                            <div {...props} ref={nodeRef}>
                                {children}
                            </div>
                        </Draggable>
                    )
                    : undefined
            }
        >
            {modalInner}
        </Modal>
    );
}
