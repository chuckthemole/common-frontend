import React from 'react';
import ToggleSwitch from './toggle-switch';

/**
 * ToggleSwitchBox
 *
 * Wraps ToggleSwitch in a labeled box layout
 *
 * @param {Object} props
 * @param {string} props.label - Text label below the switch
 * @param {boolean} props.checked - Initial checked state
 * @param {function} props.onChange - Callback when toggled
 * @param {string} [props.color='is-info'] - Bulma color class for active state
 */
function ToggleSwitchBox({ label, checked, onChange, color = 'is-info' }) {
    return (
        <div className="field" style={{ textAlign: 'center' }}>
            <ToggleSwitch checked={checked} onChange={onChange} color={color} />
            {label && (
                <div
                    style={{
                        marginTop: '0.5rem',
                        userSelect: 'none',
                        fontWeight: '600'
                    }}
                >
                    {label}
                </div>
            )}
        </div>
    );
}

export default ToggleSwitchBox;
