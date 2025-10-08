import React, { useState, useEffect, useRef } from "react";

/**
 * SingleSelector
 *
 * A modern, dropdown-style single-select component.
 * Consistent with MultiSelector, but allows only one selection at a time.
 *
 * Props:
 * @param {Array<{ value: string, label: string }>} options - Options to select from
 * @param {string} value - Currently selected value
 * @param {function} onChange - Callback when selection changes (newValue: string) => void
 * @param {string} [placeholder='Select...'] - Placeholder text when no option selected
 * @param {boolean} [disabled=false] - Disable input interaction
 * @param {boolean} [searchable=false] - Optional: enable input search
 */
function SingleSelector({
    options = [],
    value = "",
    onChange,
    placeholder = "Select...",
    disabled = false,
    searchable = false,
}) {
    const [selected, setSelected] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef(null);

    useEffect(() => {
        setSelected(value);
    }, [value]);

    const handleSelect = (val) => {
        if (disabled) return;
        setSelected(val);
        onChange?.(val);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedLabel =
        options.find((opt) => opt.value === selected)?.label || "";

    return (
        <div
            className={`single-selector-container ${disabled ? "is-disabled" : ""}`}
            ref={containerRef}
            style={{ position: "relative", width: "100%" }}
        >
            {/* Main clickable box */}
            <div
                className="single-selector-input box"
                style={{
                    cursor: disabled ? "not-allowed" : "pointer",
                    minHeight: "2.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.75rem",
                    backgroundColor: disabled ? "#f5f5f5" : "#fff",
                }}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span
                    className={`${!selectedLabel ? "has-text-grey-light" : ""
                        }`}
                >
                    {selectedLabel || placeholder}
                </span>
                <span style={{ fontSize: "0.8rem" }}>{isOpen ? "▲" : "▼"}</span>
            </div>

            {/* Dropdown options */}
            {isOpen && !disabled && (
                <div
                    className="single-selector-options box"
                    style={{
                        maxHeight: "220px",
                        overflowY: "auto",
                        marginTop: "0.25rem",
                        padding: "0.25rem",
                        zIndex: 15,
                        position: "absolute",
                        width: "100%",
                        boxShadow:
                            "0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1)",
                        borderRadius: "6px",
                        backgroundColor: "#fff",
                    }}
                >
                    {searchable && (
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="input is-small"
                            style={{
                                marginBottom: "0.5rem",
                                width: "100%",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => {
                            const isSelected = opt.value === selected;
                            return (
                                <div
                                    key={opt.value}
                                    className={`single-selector-option ${isSelected ? "has-background-info-light" : ""
                                        }`}
                                    style={{
                                        padding: "0.5rem 0.75rem",
                                        cursor: "pointer",
                                        borderRadius: "4px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        transition: "background 0.2s ease",
                                    }}
                                    onClick={() => handleSelect(opt.value)}
                                >
                                    {opt.label}
                                    {isSelected && <span>✓</span>}
                                </div>
                            );
                        })
                    ) : (
                        <div
                            style={{
                                padding: "0.5rem",
                                color: "#999",
                                textAlign: "center",
                            }}
                        >
                            No results
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SingleSelector;
