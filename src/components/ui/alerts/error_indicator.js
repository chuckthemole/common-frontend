import React, { useState } from "react";
import { Tooltip } from "../tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import logger from "../../../logger";

export default function ErrorIndicator({ message, copyable = false }) {
    const [copied, setCopied] = useState(false);

    const handleClick = async (e) => {
        if (!copyable) return;

        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(message || "Unknown rendering error");
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            logger.error("Failed to copy error message:", err, { message });
        }
    };

    return (
        <Tooltip
            text={message || "Unknown rendering error"}
            variant="error"
            size="small"
        >
            <span
                className="icon is-small has-text-danger"
                style={{
                    cursor: copyable ? "pointer" : "help",
                    display: "inline-flex",
                    alignItems: "center",
                }}
                aria-label="Component error"
                onClick={handleClick}
            >
                <FontAwesomeIcon icon={faExclamationTriangle} />
                {copyable && copied && (
                    <span
                        style={{
                            marginLeft: "4px",
                            fontSize: "0.65rem",
                            color: "inherit",
                        }}
                    >
                        Copied!
                    </span>
                )}
            </span>
        </Tooltip>
    );
}
