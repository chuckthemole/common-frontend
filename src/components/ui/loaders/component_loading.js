import React from "react";

/**
 * ComponentLoading
 *
 * Props:
 * - type: "progress" | "text" (default: "progress")
 * - color: "primary" | "info" | "success" | "warning" | "danger" | "dark" | "light"
 * - size: "small" | "medium" | "large"
 * - message: string (for text loading)
 */
const ComponentLoading = ({
    type = "progress",
    color = "primary",
    size = "medium",
    message = "Loading..."
}) => {
    if (type === "text") {
        return (
            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#4a4a4a" }}>
                {message}
                <span className="loading-dots">...</span>
            </div>
        );
    }

    if (type === "progress") {
        // Animated progress bars with different colors/sizes
        const bars = [
            { size: "small", color: "primary" },
            { size: "small", color: "info" },
            { size: "medium", color: "success" },
            { size: "large", color: "danger" }
        ];

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {bars.map((b, idx) => (
                    <progress
                        key={idx}
                        className={`progress is-${b.size} is-${b.color}`}
                        max="100"
                    >
                        Loading
                    </progress>
                ))}
            </div>
        );
    }

    return null;
};

export default ComponentLoading;
