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
    const modalInner = (
        <div className="rumpus-modal">
            {title && (
                <div
                    className="modal-header"
                    style={{
                        cursor: draggable ? "move" : "default",
                        padding: "1.25rem 1.5rem",
                        borderBottom: "1px solid #ddd",
                        userSelect: "none",
                        background: "#fff",
                    }}
                >
                    <h2 className="title is-4 mb-0">{title}</h2>
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
            onRequestClose={() => {
                setModalInactive();
                onRequestClose?.();
            }}
            style={{
                overlay: {
                    ...modal_style.overlay,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
