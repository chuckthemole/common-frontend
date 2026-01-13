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
    visibleRows = 3, // scrollable mode
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
    const dropdownContent = (
        <>
            {searchable && (
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="input is-small"
                    onClick={(e) => e.stopPropagation()}
                />
            )}

            {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                    const isSelected = opt.value === selected;
                    return (
                        <div
                            key={opt.value}
                            className={`single-selector-option ${isSelected ? "has-background-info-light" : ""}`}
                            onClick={() => handleSelect(opt.value)}
                        >
                            {opt.label}
                            {isSelected && <span>✓</span>}
                        </div>
                    );
                })
            ) : (
                <div className="single-selector-no-results">No results</div>
            )}
        </>
    );

    const optionsContainer = (
        <div
            ref={menuRef}
            className={`single-selector-options box ${ui === "scrollable" ? "scrollable-container" : ""}`}
            style={{
                maxHeight: ui === "scrollable" ? `${visibleRows * 40}px` : "220px",
                ...(ui === "dropdown" && portalTarget ? menuStyle : {}),
            }}
        >
            {dropdownContent}
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
                    className={`single-selector-input box ${disabled ? "disabled" : ""}`}
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