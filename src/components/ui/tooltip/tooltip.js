import React from "react";
import classNames from "classnames";

export default function Tooltip({
    text,
    children,
    variant = "dark",
    size = "medium",
}) {
    const tooltipClass = classNames("tooltip-container", {
        "tooltip-small": size === "small",
        "tooltip-medium": size === "medium",
        "tooltip-large": size === "large",
    });

    // Bulma-compatible color mapping
    const colorClass = classNames({
        "has-background-dark has-text-white": variant === "dark",
        "has-background-light has-text-dark": variant === "light",
        "has-background-info has-text-white": variant === "info",
        "has-background-success has-text-white": variant === "success",
        "has-background-danger has-text-white": variant === "error",
    });

    return (
        <div className={tooltipClass}>
            {children}
            <span
                className={classNames(
                    "tooltip-text",
                    colorClass // has-background-info, has-background-success, etc.
                )}
            >
                {text}
            </span>
        </div>
    );
}
