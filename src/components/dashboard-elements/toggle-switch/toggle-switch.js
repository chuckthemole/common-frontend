import React, { useState, useEffect } from 'react';
import './toggle-switch.css';

/**
 * ToggleSwitch
 *
 * A physical-style horizontal toggle switch component (no box/label wrapper).
 *
 * @param {Object} props
 * @param {boolean} props.checked - Initial checked state
 * @param {function} props.onChange - Callback when toggled
 * @param {string} [props.color='is-info'] - Bulma color class for active state
 * @param {string} [props.id] - Optional input id
 */
function ToggleSwitch({ checked: initialChecked = false, onChange, color = 'is-info', id }) {
    const [checked, setChecked] = useState(initialChecked);

    const inputId = id || `toggle-${Math.random().toString(36).substring(2, 8)}`;

    const handleToggle = () => {
        const newState = !checked;
        setChecked(newState);
        onChange?.(newState);
    };

    const handleKeyDown = (e) => {
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
            style={{ display: 'inline-block' }}
        >
            <input
                id={inputId}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange?.(e.target.checked)}
                className="toggle-switch-checkbox"
                style={{ display: 'none' }}
            />
            <span className="toggle-switch-slider" />
        </div>
    );
}

export default ToggleSwitch;
