import React from "react";

/**
 * A wrapper for a control button with a label displayed above it.
 * Allows choosing a custom button component (default, cartoon, retro, etc.).
 *
 * @param {Object} props
 * @param {string} props.label - Text displayed above the button.
 * @param {React.ComponentType} [props.ButtonComponent] - The button component to render (default: ControlButton).
 * @param {Object} [props.buttonProps] - Additional props passed to the button.
 *
 * @returns {JSX.Element}
 */
function ControlButtonBox({ label, ButtonComponent, ...buttonProps }) {
    // Fallback to default button if none provided
    const Button = ButtonComponent || require("./control-button").default;

    return (
        <div className="is-flex is-flex-direction-column is-align-items-center m-2">
            {label && (
                <span style={{ marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                    {label}
                </span>
            )}
            <Button {...buttonProps}>
                {!buttonProps.circular && label}
            </Button>
        </div>
    );
}

export default ControlButtonBox;
