import React, { useState } from 'react';
import './toggle-switch.css';
import { getApi } from '../../../api';

/**
 * ToggleSwitch
 *
 * A physical-style horizontal toggle switch component.
 * Shows a sliding circular knob that moves left/right with color changes.
 *
 * @component
 * @param {Object} props
 * @param {string} props.label - Text label displayed below the switch.
 * @param {string} props.apiBase - Base API URL (e.g., '/api/items').
 * @param {string|number} props.resourceId - ID of the resource to update.
 * @param {string} [props.color='is-info'] - Bulma color class for active state.
 * @param {string} [props.id] - Optional id for the input element.
 *
 * @returns {JSX.Element}
 */
function ToggleSwitch({ label, apiBase, resourceId, color = 'is-info', id }) {

    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(true);


    const inputId = id || `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`;

    // Load state from server
    useEffect(() => {
        const fetchState = async () => {
            try {
                const response = await fetch(apiBase);
                if (response.ok) {
                    const data = await response.json();
                    setChecked(data.state);
                } else {
                    console.error('Failed to load toggle state');
                }
            } catch (err) {
                console.error('Error fetching toggle state:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchState();
    }, [resourceId]);

    const handleToggle = async () => {
        const newState = !checked;
        setChecked(newState);
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
