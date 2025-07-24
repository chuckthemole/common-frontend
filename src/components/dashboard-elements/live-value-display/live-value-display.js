import React from 'react';

/**
 * LiveValueDisplay
 * 
 * Displays a labeled value with optional unit. Renders as a circular element by default.
 *
 * @param {string} label - The label shown above the display.
 * @param {string|number} value - The value to display.
 * @param {string} [unit] - The unit shown next to the value.
 * @param {string} [activeColor='is-info'] - Bulma color class to apply for the active display.
 */
function LiveValueDisplay({
    label,
    value,
    unit = '',
    activeColor = 'is-info'
}) {
    return (
        <div className="is-flex is-flex-direction-column is-align-items-center">
            <p className="mb-2">{label}</p>
            <div
                className={`box has-text-centered ${activeColor}`}
                style={{
                    borderRadius: '50%',
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none'
                }}
            >
                <span className="title is-4">
                    {value} {unit}
                </span>
            </div>
        </div>
    );
}

export default LiveValueDisplay;
