import React, { useState, useEffect } from 'react';
import './toggle-switch.css';

/**
 * ToggleSwitch
 *
 * A physical-style horizontal toggle switch component (no box/label wrapper).
 * 
 * Component keeps internal state for immediate UI feedback
 * while notifying the parent of changes. The internal state is synced
 * with parent updates to avoid drift.
 *
 * @param {Object} props
 * @param {boolean} props.checked - Initial checked state from parent
 * @param {function} props.onChange - Callback when toggled (newChecked: boolean) => void
 * @param {string} [props.color='is-info'] - Bulma color class applied when active
 * @param {string} [props.id] - Optional input ID for accessibility
 */
function ToggleSwitch({ checked: propChecked = false, onChange, color = 'is-info', id, disabled = false }) {
    const [checked, setChecked] = useState(propChecked);

    const inputId = id || `toggle-${Math.random().toString(36).substring(2, 8)}`;

    const handleToggle = () => {
        if (disabled) return;  // <--- respect disabled
        const newState = !checked;
        setChecked(newState);
        onChange?.(newState);
    };

    useEffect(() => {
        if (propChecked !== checked) setChecked(propChecked);
    }, [propChecked]);

    const handleKeyDown = (e) => {
        if (disabled) return; // <--- respect disabled
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleToggle();
        }
    };

    return (
        <div
            className={`toggle-switch ${checked ? color : 'toggle-off'}`}
            role="switch"
            aria-checked={checked}
            tabIndex={0}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            style={{ display: 'inline-block', opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
            <input
                id={inputId}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange?.(e.target.checked)}
                disabled={disabled}  // important
                className="toggle-switch-checkbox"
                style={{ display: 'none' }}
            />
            <span className="toggle-switch-slider" />
        </div>
    );
}

export default ToggleSwitch;
