import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

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
 * @param {HTMLElement} [portalTarget] - Optional DOM node to render dropdown into (e.g. document.body)
 */
function SingleSelector({
    options = [],
    value = "",
    onChange,
    placeholder = "Select...",
    disabled = false,
    searchable = false,
    portalTarget = null,
    ui = "dropdown", // "dropdown" | "scrollable"
}) {
    const [selected, setSelected] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [menuStyle, setMenuStyle] = useState({});
    const containerRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        setSelected(value);
    }, [value]);

    const handleSelect = (val) => {
        if (disabled) return;
        setSelected(val);
        onChange?.(val);
        if (ui === "dropdown") {
            setIsOpen(false);
        }
        setSearchTerm("");
    };

    /**
     * Close when clicking outside, dropdown only ** works across portals ** 
     */
    useEffect(() => {
        if (!isOpen || ui !== "dropdown") return;

        const handleClickOutside = (e) => {
            if (
                containerRef.current?.contains(e.target) ||
                menuRef.current?.contains(e.target)
            ) {
                return;
            }
            setIsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    /**
     * Compute dropdown position when opening
     */
    useEffect(() => {
        if (!isOpen || !portalTarget || !containerRef.current || ui !== "dropdown") return;

        const rect = containerRef.current.getBoundingClientRect();

        setMenuStyle({
            position: "fixed",
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 11000,
        });
    }, [isOpen, portalTarget, ui]);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedLabel =
        options.find((opt) => opt.value === selected)?.label || "";

    /* ---------- Dropdown / Scrollable Options ---------- */
    const optionsContainer = (
        <div
            ref={menuRef}
            className="single-selector-options box"
            style={{
                maxHeight: "220px",
                overflowY: "auto",
                padding: "0.25rem",
                borderRadius: "6px",
                backgroundColor: "#fff",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                ...(ui === "dropdown"
                    ? portalTarget
                        ? menuStyle
                        : { position: "absolute", top: "100%", marginTop: "0.25rem", width: "100%", zIndex: 15 }
                    : { position: "relative", marginTop: "0.5rem", width: "100%" }),
            }}
        >
            {searchable && (
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="input is-small"
                    style={{ marginBottom: "0.5rem" }}
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
    );

    return (
        <div
            ref={containerRef}
            className={`single-selector-container ${disabled ? "is-disabled" : ""}`}
            style={{ position: "relative", width: "100%" }}
        >
            {/* Input */}
            {ui === "dropdown" && (
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
                    onClick={() => !disabled && setIsOpen((o) => !o)}
                >
                    <span className={!selectedLabel ? "has-text-grey-light" : ""}>
                        {selectedLabel || placeholder}
                    </span>
                    <span style={{ fontSize: "0.8rem" }}>{isOpen ? "▲" : "▼"}</span>
                </div>
            )}

            {/* Options */}
            {(ui === "dropdown" && isOpen && !disabled
                ? portalTarget
                    ? createPortal(optionsContainer, portalTarget)
                    : optionsContainer
                : ui === "scrollable"
                    ? optionsContainer
                    : null)}
        </div>
    );
}

export default SingleSelector;