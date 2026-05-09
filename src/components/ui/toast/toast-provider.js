import React, {
    useCallback,
    useMemo,
    useState,
} from "react";

import ToastContext from "./toast-context";

import {
    POSITION_STYLES,
    TOAST_WIDTHS,
} from "./position.styles";

import { Alert } from "../alerts";

/**
 * -----------------------------------------------------------------------------
 * ToastProvider
 * -----------------------------------------------------------------------------
 *
 * Global notification/toast infrastructure.
 *
 * Responsibilities:
 *  - queue toast notifications
 *  - manage toast lifecycle
 *  - support multiple screen positions
 *  - render stacked notifications
 *
 * This provider intentionally owns:
 *  - positioning
 *  - stacking
 *  - toast state
 *
 * While Alert remains a purely visual component.
 *
 * -----------------------------------------------------------------------------
 * Supported positions:
 *
 *  top-left
 *  top-center
 *  top-right
 *
 *  bottom-left
 *  bottom-center
 *  bottom-right
 *
 * -----------------------------------------------------------------------------
 */

const DEFAULT_DURATION = 4000;
const DEFAULT_POSITION = "top-right";

export default function ToastProvider({
    children,
}) {
    /**
     * -------------------------------------------------------------------------
     * Toast State
     * -------------------------------------------------------------------------
     */
    const [toasts, setToasts] = useState([]);

    /**
     * -------------------------------------------------------------------------
     * Remove Toast
     * -------------------------------------------------------------------------
     */
    const removeToast = useCallback((id) => {
        setToasts((prev) =>
            prev.filter((toast) => toast.id !== id)
        );
    }, []);

    /**
     * -------------------------------------------------------------------------
     * Push Toast
     * -------------------------------------------------------------------------
     *
     * Adds a toast into the global queue.
     */
    const pushToast = useCallback((toast) => {
        const id = crypto.randomUUID();

        setToasts((prev) => [
            ...prev,
            {
                id,

                duration: DEFAULT_DURATION,

                position: DEFAULT_POSITION,

                width: "auto",

                ...toast,
            },
        ]);
    }, []);

    /**
     * -------------------------------------------------------------------------
     * Typed Toast Helpers
     * -------------------------------------------------------------------------
     *
     * Ergonomic API:
     *
     * toast.success(...)
     * toast.error(...)
     * toast.info(...)
     * toast.warning(...)
     */
    const success = useCallback(
        (message, options = {}) => {
            pushToast({
                type: "success",
                message,
                ...options,
            });
        },
        [pushToast]
    );

    const error = useCallback(
        (message, options = {}) => {
            pushToast({
                type: "error",
                message,
                ...options,
            });
        },
        [pushToast]
    );

    const info = useCallback(
        (message, options = {}) => {
            pushToast({
                type: "info",
                message,
                ...options,
            });
        },
        [pushToast]
    );

    const warning = useCallback(
        (message, options = {}) => {
            pushToast({
                type: "warning",
                message,
                ...options,
            });
        },
        [pushToast]
    );

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    /**
     * -------------------------------------------------------------------------
     * Group Toasts By Position
     * -------------------------------------------------------------------------
     *
     * Enables multiple independent toast stacks:
     *
     *  top-right
     *  bottom-center
     *  etc...
     */
    const groupedToasts = useMemo(() => {
        return toasts.reduce((acc, toast) => {
            const position =
                toast.position || DEFAULT_POSITION;

            if (!acc[position]) {
                acc[position] = [];
            }

            acc[position].push(toast);

            return acc;
        }, {});
    }, [toasts]);

    /**
     * -------------------------------------------------------------------------
     * Public Context Value
     * -------------------------------------------------------------------------
     */
    const value = useMemo(
        () => ({
            success,
            error,
            info,
            warning,
            clearAllToasts
        }),
        [success, error, info, warning, clearAllToasts]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* ------------------------------------------------------------- */}
            {/* Toast Viewports                                               */}
            {/* ------------------------------------------------------------- */}

            {Object.entries(groupedToasts).map(
                ([position, items]) => {
                    const positionStyles =
                        POSITION_STYLES[position] ||
                        POSITION_STYLES[DEFAULT_POSITION];

                    const widthStyles =
                        TOAST_WIDTHS[
                        items?.[0]?.width ||
                        "auto"
                        ] || TOAST_WIDTHS.auto;

                    return (
                        <div
                            key={position}
                            style={{
                                position: "fixed",

                                zIndex: 9999,

                                display: "flex",

                                flexDirection: "column",

                                gap: "0.5rem",

                                pointerEvents: "none",

                                ...positionStyles,

                                ...widthStyles,
                            }}
                        >
                            {/* ------------------------------------------------------------- */}
                            {/* Header Actions (Clear All)                                   */}
                            {/* ------------------------------------------------------------- */}

                            {items.length > 1 && (
                                <div
                                    style={{
                                        pointerEvents: "auto",
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    <button
                                        className="button is-small is-danger is-light"
                                        onClick={clearAllToasts}
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}

                            {/* ------------------------------------------------------------- */}
                            {/* Toast List                                                   */}
                            {/* ------------------------------------------------------------- */}

                            {items.map((toast) => {
                                const toastWidth =
                                    TOAST_WIDTHS[toast.width || "auto"] ||
                                    TOAST_WIDTHS.auto;

                                return (
                                    <div
                                        key={toast.id}
                                        style={{
                                            pointerEvents: "auto",
                                            ...toastWidth,
                                        }}
                                    >
                                        <Alert
                                            type={toast.type}
                                            message={toast.message}
                                            duration={toast.duration}
                                            size={toast.size}
                                            onClose={() => removeToast(toast.id)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                }
            )}
        </ToastContext.Provider>
    );
}