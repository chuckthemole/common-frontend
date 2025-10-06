import React, { useState } from "react";
import ToggleSwitch from "../toggle-switch/toggle-switch";

/**
 * TaskFilterMenuWithModal
 * ------------------------
 * Wraps TaskFilterMenu in a modal if desired, with a button to open it.
 *
 * Props:
 * @param {boolean} [isModal=false] - Whether to render filters inside a modal.
 * @param {Array<Object>} filters - Filter definitions (see TaskFilterMenu docs).
 * @param {Object} values - Current filter values (key-value map)
 * @param {Function} onChange - Called when filter values change.
 * @param {Object} [styles] - Optional styles
 * @param {string} [buttonLabel="Open Filters"] - Label for the open modal button
 */
export default function TaskFilterMenuWithModal({
    isModal = false,
    filters,
    values,
    onChange,
    styles = {},
    buttonLabel = "Open Filters",
}) {
    if (!filters || !Array.isArray(filters)) return null;

    const [isOpen, setIsOpen] = useState(false);

    const handleFilterChange = (key, value) => {
        onChange?.({ ...values, [key]: value });
    };

    const content = (
        <div
            style={{
                padding: "1rem",
                background: "#fff",
                borderRadius: "8px",
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                alignItems: "center",
                ...styles.container,
            }}
        >
            {filters.map((filter) => {
                const { key, type, label, options = [], toggleLabels = ["Off", "On"] } = filter;
                const value = values[key];

                if (type === "multi-select") {
                    return (
                        <div key={key} style={{ display: "flex", flexDirection: "column", ...styles.filter }}>
                            <label style={{ marginBottom: "0.25rem" }}>{label}</label>
                            <select
                                multiple
                                value={value || []}
                                onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                                    handleFilterChange(key, selected);
                                }}
                                style={styles.input}
                            >
                                {options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    );
                }

                if (type === "select") {
                    return (
                        <div key={key} style={{ display: "flex", flexDirection: "column", ...styles.filter }}>
                            <label style={{ marginBottom: "0.25rem" }}>{label}</label>
                            <select
                                value={value ?? ""}
                                onChange={(e) => handleFilterChange(key, e.target.value)}
                                style={styles.input}
                            >
                                <option value="">--Select--</option>
                                {options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    );
                }

                if (type === "checkbox") {
                    return (
                        <div key={key} style={{ display: "flex", alignItems: "center", ...styles.filter }}>
                            <ToggleSwitch checked={!!value} onChange={(checked) => handleFilterChange(key, checked)} />
                            <label style={{ marginLeft: "0.25rem" }}>{label}</label>
                        </div>
                    );
                }

                if (type === "toggle") {
                    return (
                        <div key={key} style={{ display: "flex", alignItems: "center", ...styles.filter }}>
                            <label style={{ marginRight: "0.5rem" }}>{label}:</label>
                            <ToggleSwitch
                                checked={value === toggleLabels[1]}
                                onChange={(checked) =>
                                    handleFilterChange(key, checked ? toggleLabels[1] : toggleLabels[0])
                                }
                            />
                            <span style={{ marginLeft: "0.5rem" }}>
                                {value === toggleLabels[1] ? toggleLabels[1] : toggleLabels[0]}
                            </span>
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );

    // If not modal, just render content
    if (!isModal) return content;

    // Render button + modal logic
    return (
        <>
            <a className="button is-info" onClick={() => setIsOpen(true)}>{buttonLabel}</a>
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => setIsOpen(false)}
                >
                    <div onClick={(e) => e.stopPropagation()}>{content}</div>
                </div>
            )}
        </>
    );
}
