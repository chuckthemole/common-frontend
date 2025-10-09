import React from "react";
import classNames from "classnames";

export default function Tooltip({
    text,
    children,
    variant = "dark",
    size = "medium",
}) {
    const tooltipClass = classNames("tooltip-container", {
        // Variants
        "tooltip-dark": variant === "dark",
        "tooltip-light": variant === "light",
        "tooltip-info": variant === "info",
        "tooltip-success": variant === "success",
        "tooltip-error": variant === "error",
        // Sizes
        "tooltip-small": size === "small",
        "tooltip-medium": size === "medium",
        "tooltip-large": size === "large",
    });

    return (
        <div className={tooltipClass}>
            {children}
            <span className="tooltip-text">{text}</span>
        </div>
    );
}
