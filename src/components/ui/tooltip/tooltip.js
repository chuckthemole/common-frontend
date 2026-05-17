import React, { useState, useCallback, useMemo } from "react";
import classNames from "classnames";
import logger, { useScopedLogger } from "../../../logger";
import { useToast } from "../toast";

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
    copyable = false,
    copyText = null,
    onCopy,
}) {
    const SCOPED_LOGGER = useScopedLogger("Tooltip", logger);

    const toast = useToast();

    /**
     * Internal placement state
     * Allows dynamic rotation without mutating parent props
     */
    const [currentPlacement, setCurrentPlacement] = useState(placement);

    const [copied, setCopied] = useState(false);

    const resolvedCopyText =
        useMemo(() => {

            if (copyText != null) {
                return copyText;
            }

            if (typeof text === "string") {
                return text;
            }

            return null;

        }, [
            copyText,
            text,
        ]);


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

    const handleCopy = useCallback(
        async (e) => {
            e.stopPropagation();

            SCOPED_LOGGER.debug("COPY ATTEMPT", resolvedCopyText);
            SCOPED_LOGGER.debug("clipboard exists?", !!navigator.clipboard);

            if (!copyable || !resolvedCopyText) {
                SCOPED_LOGGER.debug("Not copyable");
                return;
            }

            try {
                await navigator.clipboard.writeText(resolvedCopyText);

                setCopied(true);

                onCopy?.(resolvedCopyText);

                toast.success(
                    `Text "${resolvedCopyText}" copied successfully!`,
                    {
                        position: "bottom-center",
                        width: "full",
                    }
                );

                SCOPED_LOGGER.debug("Tooltip copied text", {
                    text: resolvedCopyText,
                });

                setTimeout(() => {
                    setCopied(false);
                }, 1200);

            } catch (err) {
                SCOPED_LOGGER.error("Tooltip copy failed", err);
                toast.error("Copy failed");
            }
        },
        [copyable, resolvedCopyText, onCopy, SCOPED_LOGGER]
    );

    /**
    * -------------------------------------------------------------------------
    * Click
    * -------------------------------------------------------------------------
    */
    const handleClick = useCallback(async (e) => {

        /**
         * Prevent bubbling into parent rows/buttons/etc.
         */
        e.stopPropagation();

        /**
         * -------------------------------------------------------------
         * Copyable only
         * -------------------------------------------------------------
         */

        if (copyable && !rotatable) {

            await handleCopy(e);

            return;
        }

        /**
         * -------------------------------------------------------------
         * Rotatable only
         * -------------------------------------------------------------
         */

        if (rotatable && !copyable) {

            rotatePlacement();

            return;
        }

        /**
         * -------------------------------------------------------------
         * Both enabled
         * -------------------------------------------------------------
         *
         * Single click copies.
         * Double click rotates.
         */

        if (copyable && rotatable) {

            await handleCopy(e);
        }

    }, [
        copyable,
        rotatable,
        handleCopy,
        rotatePlacement,
    ]);

    const handleDoubleClick = useCallback((e) => {

        if (!(copyable && rotatable)) {
            return;
        }

        e.stopPropagation();

        rotatePlacement();

    }, [
        copyable,
        rotatable,
        rotatePlacement,
    ]);

    const interactionHint = useMemo(() => {

        if (copyable && rotatable) {
            return "Single click to copy\nDouble click to rotate";
        }

        if (copyable) {
            return "Click to copy";
        }

        if (rotatable) {
            return "Click to rotate";
        }

        return null;

    }, [
        copyable,
        rotatable,
    ]);

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
            onDoubleClick={handleDoubleClick}
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

            <span
                className={classNames(
                    "tooltip-text",
                    colorClass,
                    {
                        "tooltip-copyable": copyable,
                        "tooltip-copied": copied,
                    }
                )}
                style={{
                    cursor:
                        copyable || rotatable
                            ? "pointer"
                            : "default",

                    transition:
                        "background 120ms ease, transform 120ms ease",
                }}
            >

                <div className="tooltip-content">

                    <div>
                        {text}
                    </div>

                    {
                        interactionHint && (
                            <div className="tooltip-hint">
                                {interactionHint}
                            </div>
                        )
                    }

                </div>

            </span>
        </div>
    );
}