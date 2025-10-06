import React, { useState } from "react";
import ToggleSwitch from "../toggle-switch/toggle-switch";
import MultiSelector from "../multi-selector/multi_selector";

/**
 * TaskFilterMenu
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
export default function TaskFilterMenu({
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

    const handleResetAll = () => {
        const resetValues = {};
        filters.forEach((f) => {
            switch (f.type) {
                case "multi-select":
                    resetValues[f.key] = [];
                    break;
                case "select":
                    resetValues[f.key] = "";
                    break;
                case "checkbox":
                    resetValues[f.key] = false;
                    break;
                case "toggle":
                    resetValues[f.key] = f.toggleLabels?.[0] || "Off";
                    break;
                default:
                    resetValues[f.key] = null;
            }
        });
        onChange?.(resetValues);
    };

    const renderFilter = (filter) => {
        const { key, type, label, options = [], toggleLabels = ["Off", "On"], selectionType } = filter;
        const value = values[key];

        switch (type) {
            case "multi-select":
                return (
                    <div key={key} style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ marginBottom: "0.25rem" }}>{label}</label>
                        <MultiSelector
                            options={options}
                            value={value || []}
                            onChange={(newValues) => handleFilterChange(key, newValues)}
                            placeholder={`Select ${label.toLowerCase()}...`}
                            disabled={styles.disabled}
                            selectionType={selectionType || "chip"}
                        />
                    </div>
                );
            case "select":
                return (
                    <div key={key} style={{ display: "flex", flexDirection: "column" }}>
                        <label style={{ marginBottom: "0.25rem" }}>{label}</label>
                        <MultiSelector
                            options={options}
                            value={value ? [value] : []}
                            onChange={(newValues) => handleFilterChange(key, newValues[0] || "")}
                            placeholder={`Select ${label.toLowerCase()}...`}
                            disabled={styles.disabled}
                            selectionType={selectionType || "chip"}
                        />
                    </div>
                );
            case "checkbox":
                return (
                    <div key={key} style={{ display: "flex", alignItems: "center" }}>
                        <ToggleSwitch checked={!!value} onChange={(checked) => handleFilterChange(key, checked)} />
                        <label style={{ marginLeft: "0.25rem" }}>{label}</label>
                    </div>
                );
            case "toggle":
                return (
                    <div key={key} style={{ display: "flex", alignItems: "center" }}>
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
            default:
                return null;
        }
    };

    const content = (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                ...styles.container,
            }}
        >
            {filters.map((filter, index) => (
                <div key={filter.key} style={{ padding: "0.5rem 0" }}>
                    {renderFilter(filter)}
                    {index < filters.length - 1 && (
                        <hr style={{ margin: "0.5rem 0", borderColor: "#ddd" }} />
                    )}
                </div>
            ))}

            <div style={{ marginTop: "1rem", textAlign: "right" }}>
                <button className="button is-light is-small" onClick={handleResetAll}>
                    Reset All Filters
                </button>
            </div>
        </div>
    );

    if (!isModal) return content;

    return (
        <>
            <a className="button is-info" onClick={() => setIsOpen(true)}>
                {buttonLabel}
            </a>
            {isOpen && (
                <div className="modal is-active" onClick={() => setIsOpen(false)}>
                    <div className="modal-background"></div>
                    <div
                        className="modal-card"
                        style={{
                            minHeight: "400px",  // enough to show first filters
                            maxHeight: "85vh",
                            overflowY: "auto",
                            width: "95%",
                            maxWidth: "700px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="modal-card-head">
                            <p className="modal-card-title">{buttonLabel}</p>
                            <button
                                className="delete"
                                aria-label="close"
                                onClick={() => setIsOpen(false)}
                            ></button>
                        </header>
                        <section className="modal-card-body">{content}</section>
                    </div>
                </div>
            )}
        </>
    );
}
