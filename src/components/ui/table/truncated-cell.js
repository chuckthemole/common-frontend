import React from "react";
import PropTypes from "prop-types";
import logger from "../../../logger";

export default function TruncatedCell({
    value,
    maxWidth = "220px",
}) {

    if (!value) {
        return "—";
    }

    return (
            <div
                style={{
                    maxWidth,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                    cursor: "help",
                }}
            >
                {value}
            </div>
    );
}