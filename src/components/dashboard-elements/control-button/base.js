import React, { useState } from "react";

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
    circular = false,
    holdToActivate = false,
    toggle = true, // Toggle behavior
    onToggle,
    children,
    className = "",
    style = {},
    tooltip: consumerTooltip, // new prop
}) {
    const [isActive, setIsActive] = useState(false);

    // Toggle active state if toggle is enabled
    const toggleActive = () => {
        if (toggle && !holdToActivate) {
            setIsActive((prev) => {
                const next = !prev;
                onToggle?.(next);
                return next;
            });
        }
    };

    // Handle hold-to-activate press
    const handleMouseDown = () => {
        if (holdToActivate) {
            setIsActive(true);
            onToggle?.(true);
        }
    };

    // Handle releasing hold-to-activate
    const handleMouseUp = () => {
        if (holdToActivate) {
            setIsActive(false);
            onToggle?.(false);
        }
    };

    // Circular styling if requested
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

    // Default tooltip text depending on state
    const defaultTooltip = isActive
        ? holdToActivate
            ? "Release to deactivate"
            : "Click to deactivate"
        : holdToActivate
            ? "Hold to activate"
            : "Click to activate";

    // Use consumer-provided tooltip if given, else default
    const tooltip = consumerTooltip || defaultTooltip;

    return (
        <button
            className={`${className} ${isActive ? "is-active" : ""}`} // add is-active for CSS
            onClick={toggleActive}
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
