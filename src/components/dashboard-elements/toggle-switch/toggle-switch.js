import React from 'react';
import './toggle-switch.css';

/**
 * ToggleSwitch
 *
 * A physical-style horizontal toggle switch component.
 * Shows a sliding circular knob that moves left/right with color changes.
 *
 * @component
 * @param {Object} props
 * @param {string} props.label - Text label displayed below the switch.
 * @param {boolean} props.checked - Current toggle state.
 * @param {function} props.onChange - Callback called with new boolean state on toggle.
 * @param {string} [props.color='is-info'] - Bulma color class for active state.
 * @param {string} [props.id] - Optional id for the input element.
 *
 * @returns {JSX.Element}
 */
function ToggleSwitch({ label, checked, onChange, color = 'is-info', id }) {
    const inputId = id || `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`;

    const handleToggle = () => {
        onChange(!checked);
    };

    const handleKeyDown = (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleToggle();
        }
    };

    return (
        <div className="field" style={{ textAlign: 'center' }}>
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
                    onChange={e => onChange(e.target.checked)}
                    className="toggle-switch-checkbox"
                    style={{ display: 'none' }}
                />
                <span className="toggle-switch-slider" />
            </div>
            <div
                style={{
                    marginTop: '0.5rem',
                    userSelect: 'none',
                    fontWeight: '600'
                }}
            >
                {label}
            </div>
        </div>
    );
}

export default ToggleSwitch;
