import React, { useState } from "react";

/**
 * Collapsible
 * --------------------------------------------------------------------------
 * Reusable expandable container with arrow toggle.
 *
 * Designed to behave similarly to SingleSelector:
 * - clickable header
 * - arrow indicator
 * - smooth reveal of children
 * - reusable for forms, JSON, sections, etc.
 */
export default function Collapsible({
    label,
    children,
    defaultOpen = false,
    disabled = false,
}) {
    const [open, setOpen] = useState(defaultOpen);

    const toggle = () => {
        if (disabled) return;
        setOpen((prev) => !prev);
    };

    return (
        <div className="box">
            {/* Header */}
            <div
                onClick={toggle}
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: disabled ? "not-allowed" : "pointer",
                    userSelect: "none",
                    opacity: disabled ? 0.6 : 1,
                }}
            >
                <h4 className="title is-6" style={{ margin: 0 }}>
                    {label}
                </h4>

                <span style={{ fontSize: "0.8rem" }}>
                    {open ? "▲" : "▼"}
                </span>
            </div>

            {/* Content */}
            {open && (
                <div style={{ marginTop: "1rem" }}>
                    {children}
                </div>
            )}
        </div>
    );
}