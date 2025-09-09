import React from "react";
import { ControlButtonBase } from "./base";

/**
 * ControlButton
 *
 * Default implementation of ControlButton.
 * Applies default inline styles for inactive and circular states.
 *
 * @param {Object} props - Props passed to ControlButtonBase.
 * @returns {JSX.Element}
 */
export default function ControlButton({
    children,
    circular = false,
    activeColor = "is-primary",
    ...rest
}) {
    // Default inactive style
    const deactiveStyle = !circular
        ? {
            backgroundColor: "#e0e0e0",
            color: "#4a4a4a",
            border: "1px solid #ccc",
        }
        : {};

    // Content for circular buttons
    const circularContent =
        circular && !children ? (
            <div
                style={{
                    width: "1rem",
                    height: "1rem",
                    backgroundColor: "#333",
                    borderRadius: "50%",
                }}
            />
        ) : (
            children
        );

    return (
        <ControlButtonBase
            {...rest}
            circular={circular}
            style={deactiveStyle}
            className={`button ${circular ? "is-rounded" : ""} ${activeColor}`}
        >
            {circularContent}
        </ControlButtonBase>
    );
}
