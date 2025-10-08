import React, { useState, useEffect } from "react";

/**
 * Alert Component (Bulma-based)
 * ------------------------------
 * Props:
 * - message: string | JSX content to display
 * - type: "success" | "error" | "info" | "warning"
 * - duration: number (optional, auto-dismiss after ms)
 * - persistent: boolean (if true, alert won't auto-dismiss)
 * - size: "small" | "medium" | "large" | "full"
 * - position: "top" | "bottom"
 * - onClose: callback when alert is dismissed
 */
const Alert = ({
    message,
    type = "info",
    duration = 3000,
    persistent = false,
    size = "medium",
    position = "top",
    fullWidth = true,
    onClose,
}) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!persistent && duration) {
            const timer = setTimeout(() => handleClose(), duration);
            return () => clearTimeout(timer);
        }
    }, [duration, persistent]);

    const handleClose = () => {
        setVisible(false);
        if (onClose) onClose();
    };

    if (!visible) return null;

    // Map type to Bulma color classes
    const typeClassMap = {
        success: "is-success",
        error: "is-danger",
        info: "is-info",
        warning: "is-warning",
    };

    // Map size to Bulma size classes
    const sizeClassMap = {
        small: "is-small",
        medium: "is-medium",
        large: "is-large",
    };

    // Container styles for position and width
    const containerStyle = {
        position: "fixed",
        [position]: "1rem",
        left: fullWidth ? 0 : "50%",
        transform: fullWidth ? "none" : "translateX(-50%)",
        zIndex: 9999,
        width: fullWidth ? "100%" : "auto",
        display: "flex",
        justifyContent: "center",
        pointerEvents: "auto",
        padding: "0.5rem",
    };

    return (
        <div style={containerStyle}>
            <div className={`notification ${typeClassMap[type]} ${sizeClassMap[size]}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: fullWidth ? "100%" : "auto" }}>
                <div>{message}</div>
                <button
                    className="delete"
                    onClick={handleClose}
                />
            </div>
        </div>
    );
};

export default Alert;
