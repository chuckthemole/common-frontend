import React, { useState, useEffect, useRef } from 'react';

/**
 * MultiSelector
 *
 * A modern, chip-style or highlighted multi-select component.
 * 
 * Props:
 * @param {Array<{value: string, label: string}>} options - Options to select from
 * @param {Array<string>} value - Currently selected values
 * @param {function} onChange - Callback when selection changes (newValues: string[]) => void
 * @param {string} [placeholder='Select...'] - Placeholder text
 * @param {boolean} [disabled=false] - Disable input
 * @param {('chip'|'highlighted'|'checked')} [selectionType='chip'] - How selections are represented
 */
function MultiSelector({
    options = [],
    value = [],
    onChange,
    placeholder = 'Select...',
    disabled = false,
    selectionType = 'chip'
}) {
    const [selected, setSelected] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        setSelected(value);
    }, [value]);

    const toggleOption = (val) => {
        if (disabled) return;
        const newSelected = selected.includes(val)
            ? selected.filter((v) => v !== val)
            : [...selected, val];
        setSelected(newSelected);
        onChange?.(newSelected);
    };

    const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderSelected = () => {
        if (selected.length === 0) return <span className="has-text-grey-light">{placeholder}</span>;

        return (
            <div className="multi-selector-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {selected.map((val) => {
                    const opt = options.find((o) => o.value === val);
                    return (
                        <span
                            key={val}
                            className="tag is-info is-light"
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); toggleOption(val); }}
                        >
                            {opt?.label || val}
                            <button
                                type="button"
                                className="delete is-small"
                                style={{ marginLeft: '0.25rem' }}
                                onClick={(e) => { e.stopPropagation(); toggleOption(val); }}
                            ></button>
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`multi-selector-container ${disabled ? 'is-disabled' : ''}`} ref={containerRef}>
            <div
                className="multi-selector-input box"
                style={{ cursor: disabled ? 'not-allowed' : 'pointer', minHeight: '2.5rem' }}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                {renderSelected()}
                <span style={{ float: 'right', fontSize: '0.8rem' }}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && !disabled && (
                <div
                    className="multi-selector-options box"
                    style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        marginTop: '0.25rem',
                        padding: '0.25rem',
                        zIndex: 10,
                        position: 'absolute',
                        width: '100%',
                    }}
                >
                    {options.map((opt) => {
                        const isSelected = selected.includes(opt.value);
                        return (
                            <div
                                key={opt.value}
                                className={`multi-selector-option ${isSelected ? 'has-background-info-light' : ''}`}
                                style={{
                                    padding: '0.25rem 0.5rem',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    marginBottom: '0.25rem'
                                }}
                                onClick={() => toggleOption(opt.value)}
                            >
                                {opt.label}
                                {selectionType === 'checked' && isSelected && <span style={{ float: 'right' }}>✓</span>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MultiSelector;
