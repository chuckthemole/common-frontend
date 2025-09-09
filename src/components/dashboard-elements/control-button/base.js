import React, { useState, useEffect } from "react";

/**
 * ControlButtonBase
 *
 * Core toggleable control button logic.
 * Handles toggle state, hold-to-activate behavior, tooltip, and circular support.
 * Visual styles (colors, borders) should be applied by a wrapper or CSS classes.
 *
 * @param {Object} props
 * @param {boolean} [props.circular=false] - Renders a round button if true.
 * @param {boolean} [props.holdToActivate=false] - Button stays active only while held.
 * @param {boolean} [props.toggle=true] - If true, button toggles its pressed state; otherwise behaves momentarily.
 * @param {function} [props.onToggle] - Callback when active state changes.
 * @param {React.ReactNode} [props.children] - Content inside the button.
 * @param {string} [props.className] - Additional CSS class names to apply.
 * @param {Object} [props.style] - Inline styles for the button (optional).
 * @param {string} [props.tooltip] - Optional consumer-provided tooltip. Defaults to internal logic.
 *
 * @returns {JSX.Element}
 */
export function ControlButtonBase({
    checked: propChecked,
    circular = true,
    holdToActivate = false,
    toggle = true,
    onToggle,
    children,
    className = "",
    style = {},
    tooltip: consumerTooltip,
}) {
    const [internalChecked, setInternalChecked] = useState(propChecked || false);

    // Keep internal state in sync with parent
    useEffect(() => {
        if (propChecked !== undefined && propChecked !== internalChecked) {
            setInternalChecked(propChecked);
        }
    }, [propChecked]);

    const handleClick = () => {
        if (toggle && !holdToActivate) {
            const next = !internalChecked;
            setInternalChecked(next);
            onToggle?.(next);
        }
    };

    const handleMouseDown = () => {
        if (holdToActivate) {
            setInternalChecked(true);
            onToggle?.(true);
        }
    };

    const handleMouseUp = () => {
        if (holdToActivate) {
            setInternalChecked(false);
            onToggle?.(false);
        }
    };

    const circularStyles = circular
        ? {
            width: "3rem",
            height: "3rem",
            padding: 0,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
        }
        : {};

    const tooltip = consumerTooltip;

    return (
        <button
            className={`${className} ${internalChecked ? "is-active" : ""}`}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ ...circularStyles, ...style }}
            title={tooltip}
        >
            {children}
        </button>
    );
}
