import React from "react";
import { useRouteError, Link } from "react-router-dom";
import logger from "../../../logger";
import { ConfirmModal, useRumpusModal } from "../../ui";
import { ErrorType } from "./error-type";

/**
 * ErrorPage
 *
 * A sophisticated, developer-friendly error page:
 * - Classifies error types
 * - Shows status code & message
 * - Dev-only stack trace
 * - Logger integration
 * - Retry & Home buttons
 * - Copy debug info via ConfirmModal
 * - Suggestions for user actions
 */
export default function ErrorPage() {
    const error = useRouteError();
    const { openModal } = useRumpusModal();

    // Log error
    logger.error("[ErrorPage] Caught error:", error);

    const statusText = error?.statusText || error?.message || "An unexpected error occurred";
    const statusCode = error?.status || "UNKNOWN";

    // Determine error type
    const errorType =
        statusCode === 404
            ? ErrorType.NOT_FOUND
            : statusCode === 401
                ? ErrorType.UNAUTHORIZED
                : statusCode === 403
                    ? ErrorType.FORBIDDEN
                    : statusCode >= 500
                        ? ErrorType.SERVER_ERROR
                        : ErrorType.DEFAULT;

    // Copy debug info
    const handleCopyDebugInfo = () => {
        const debugInfo = {
            type: errorType.statusText,
            statusCode,
            message: statusText,
            stack: error?.stack || "No stack available",
            url: window.location.href,
            timestamp: new Date().toISOString(),
        };

        navigator.clipboard
            .writeText(JSON.stringify(debugInfo, null, 2))
            .then(() => {
                logger.info("[ErrorPage] Debug info copied to clipboard:", debugInfo);
            })
            .catch((err) => {
                logger.error("[ErrorPage] Failed to copy debug info", err);
            });
    };

    // Render actionable suggestions
    const renderSuggestions = () => {
        const suggestions = [];
        if (statusCode === 404) suggestions.push("Check the URL for typos.");
        if (statusCode === 401 || statusCode === 403)
            suggestions.push("Ensure you are logged in and have proper permissions.");
        if (statusCode >= 500) suggestions.push("Try again later or contact support.");
        if (!suggestions.length) suggestions.push("Try reloading the page.");

        return (
            <ul style={{ textAlign: "left", marginTop: "0.5rem" }}>
                {suggestions.map((s, idx) => (
                    <li key={idx}>• {s}</li>
                ))}
            </ul>
        );
    };

    return (
        <div
            id="error_page"
            className="is-flex is-flex-direction-column is-justify-content-center is-align-items-center"
            style={{ minHeight: "100vh", padding: "2rem" }}
        >
            <div className="box" style={{ maxWidth: "700px", width: "100%" }}>
                {/* Main Error */}
                <h1 className="is-size-1 has-text-weight-bold has-text-danger mb-3">
                    {errorType.message}
                </h1>

                <p className="is-size-5 mb-2">
                    {statusText} <span className="has-text-grey">({statusCode})</span>
                </p>

                {/* Suggestions */}
                <div className="mb-3">
                    <strong>Suggested Actions:</strong>
                    {renderSuggestions()}
                </div>

                {/* Dev-only stack trace */}
                {process.env.NODE_ENV === "development" && error?.stack && (
                    <div style={{ marginTop: "1rem" }}>
                        <strong>Stack Trace (Dev Only):</strong>
                        <pre
                            style={{
                                backgroundColor: "#f5f5f5",
                                padding: "1rem",
                                borderRadius: "6px",
                                overflowX: "auto",
                                maxHeight: "300px",
                            }}
                        >
                            {error.stack}
                        </pre>
                    </div>
                )}

                {/* Action buttons */}
                <div className="buttons mt-4 is-flex is-justify-content-center" style={{ gap: "1rem" }}>
                    <Link to="/" className="button is-primary">
                        Go Home
                    </Link>
                    <button
                        className="button is-warning"
                        onClick={() => window.location.reload()}
                        title="Retry loading the page"
                    >
                        Retry
                    </button>
                    <button
                        className="button is-info"
                        onClick={() => openModal("copyDebugModal")} // <-- Correct trigger
                        title="Copy error debug info with confirmation"
                    >
                        Copy Debug Info
                    </button>
                </div>

                {/* Optional URL & timestamp info */}
                <div className="mt-3 has-text-left has-text-grey" style={{ fontSize: "0.85rem" }}>
                    <p>URL: {window.location.href}</p>
                    <p>Timestamp: {new Date().toISOString()}</p>
                </div>
            </div>

            {/* Confirm Modal for copying debug info */}
            <ConfirmModal
                modalId="copyDebugModal"
                title="Copy Debug Info"
                message="Do you want to copy debug info to clipboard? This can help with support or debugging."
                confirmText="Copy"
                cancelText="Cancel"
                onConfirm={handleCopyDebugInfo}
                danger={false}
            />
        </div>
    );
}