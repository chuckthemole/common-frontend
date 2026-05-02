import React, { useState, useCallback } from "react";
import classNames from "classnames";
import logger, { useScopedLogger } from "../../../logger";

/**
 * Clockwise-ish rotation order for tooltip placements
 */
const PLACEMENT_ROTATION = [
    "bottom-left",
    "bottom",
    "bottom-right",
    "right",
    "top-right",
    "top",
    "top-left",
    "left",
];

/**
 * Tooltip
 * -----------------------------------------------------------------------------
 * Lightweight tooltip component with:
 *  - configurable placement
 *  - optional click-to-rotate positioning (useful near viewport edges)
 *  - size + variant styling
 *  - debug logging via scoped logger
 *
 * Notes:
 *  - Accepts JSX in `text` (not just strings)
 *  - Rotation is opt-in via `rotatable`
 *  - Does NOT yet auto-detect viewport overflow (future enhancement)
 */
export default function Tooltip({
    text,
    children,
    variant = "dark",
    size = "medium",
    placement = "bottom",
    rotatable = false,
    animated = false,
    debug = false,
}) {
    const SCOPED_LOGGER = useScopedLogger("Tooltip", logger);

    /**
     * Internal placement state
     * Allows dynamic rotation without mutating parent props
     */
    const [currentPlacement, setCurrentPlacement] = useState(placement);

    /**
     * Rotate tooltip placement in predefined order
     */
    const rotatePlacement = useCallback(() => {
        const currentIndex = PLACEMENT_ROTATION.indexOf(currentPlacement);

        // fallback if placement not found
        const safeIndex = currentIndex === -1 ? 0 : currentIndex;
        const nextPlacement =
            PLACEMENT_ROTATION[(safeIndex + 1) % PLACEMENT_ROTATION.length];

        if (debug) {
            SCOPED_LOGGER.debug("Rotating tooltip placement", {
                from: currentPlacement,
                to: nextPlacement,
            });
        }

        setCurrentPlacement(nextPlacement);
    }, [currentPlacement, debug, SCOPED_LOGGER]);

    const resetPlacement = useCallback(() => {
        if (debug) {
            SCOPED_LOGGER.debug("Resetting tooltip placement", {
                backTo: placement,
            });
        }

        setCurrentPlacement(placement);
    }, [placement, debug, SCOPED_LOGGER]);

    /**
     * Handle click for rotation (only when enabled)
     * Stops propagation so parent click handlers aren't triggered
     */
    const handleClick = (e) => {
        if (!rotatable) return;

        e.stopPropagation();
        rotatePlacement();
    };

    /**
     * Keyboard accessibility (Enter / Space triggers rotation)
     */
    const handleKeyDown = (e) => {
        if (!rotatable) return;

        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            rotatePlacement();
        }
    };

    /**
     * Tooltip container classes
     */
    const tooltipClass = classNames(
        "tooltip-container",
        `tooltip-${currentPlacement}`,
        {
            "tooltip-small": size === "small",
            "tooltip-medium": size === "medium",
            "tooltip-large": size === "large",
            "tooltip-animated": animated,
        }
    );

    /**
     * Color / theme classes
     */
    const colorClass = classNames({
        "has-background-dark has-text-white": variant === "dark",
        "has-background-light has-text-dark": variant === "light",
        "has-background-info has-text-white": variant === "info",
        "has-background-success has-text-white": variant === "success",
        "has-background-danger has-text-white": variant === "error",
    });

    return (
        <div
            className={tooltipClass}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onMouseLeave={resetPlacement}
            role={rotatable ? "button" : undefined}
            tabIndex={rotatable ? 0 : undefined}
            aria-label={typeof text === "string" ? text : "Tooltip"}
            style={{
                cursor: rotatable ? "pointer" : "default",
            }}
        >
            {/* Trigger element */}
            {children}

            {/* Tooltip content */}
            <span
                className={classNames("tooltip-text", colorClass)}
            >
                {text}
            </span>
        </div>
    );
}