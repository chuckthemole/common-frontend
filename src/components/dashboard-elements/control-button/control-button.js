import React, { useState } from 'react';

/**
 * A toggleable control button component with optional circular styling
 * and optional "hold to activate" behavior.
 *
 * @param {Object} props
 * @param {string} props.label - Text displayed above the button.
 * @param {string} [props.activeColor='is-primary'] - Bulma color class for active state.
 * @param {boolean} [props.circular=false] - If true, renders a round button.
 * @param {boolean} [props.holdToActivate=false] - If true, button only stays active while being held.
 *
 * @returns {JSX.Element}
 */
function ControlButton({
    label,
    activeColor = 'is-primary',
    circular = false,
    holdToActivate = false,
}) {
    const [isActive, setIsActive] = useState(false);

    const toggleActive = () => {
        if (!holdToActivate) {
            setIsActive((prev) => !prev);
        }
    };

    const handleMouseDown = () => {
        if (holdToActivate) {
            setIsActive(true);
        }
    };

    const handleMouseUp = () => {
        if (holdToActivate) {
            setIsActive(false);
        }
    };

    const circularStyles = circular
        ? {
            width: '3rem',
            height: '3rem',
            padding: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        }
        : {};

    const deactiveStyle = !isActive
        ? {
            backgroundColor: '#e0e0e0',
            color: '#4a4a4a',
            border: '1px solid #ccc',
        }
        : {};

    const tooltip = isActive
        ? holdToActivate ? 'Release to deactivate' : 'Click to deactivate'
        : holdToActivate ? 'Hold to activate' : 'Click to activate';

    return (
        <div className="is-flex is-flex-direction-column is-align-items-center m-2">
            <span style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>{label}</span>
            <button
                className={`button ${isActive ? activeColor : ''} ${circular ? 'is-rounded' : ''}`}
                onClick={toggleActive}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ ...circularStyles, ...deactiveStyle }}
                title={tooltip}
            >
                {circular && (
                    <div
                        style={{
                            width: '1rem',
                            height: '1rem',
                            backgroundColor: '#333',
                            borderRadius: '50%',
                        }}
                    />
                )}
                {!circular && label}
            </button>
        </div>
    );
}

export default ControlButton;
