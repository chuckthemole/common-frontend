import React from 'react';

/**
 * Slider
 *
 * A labeled slider input component using Bulma styles.
 * Displays current value with optional unit and tooltip.
 *
 * @component
 * @param {Object} props
 * @param {string} props.label - Label text displayed above the slider.
 * @param {number} props.value - Current slider value.
 * @param {number} [props.min=0] - Minimum slider value.
 * @param {number} [props.max=100] - Maximum slider value.
 * @param {number} [props.step=1] - Slider step increment.
 * @param {function} props.onChange - Callback called with new numeric value on change.
 * @param {string} [props.unit='%'] - Unit string to display next to value.
 * @param {boolean} [props.showValue=true] - Whether to display the current value below the slider.
 * @param {string} [props.color='is-info'] - Bulma color class for the slider.
 * @param {boolean} [props.showTooltip=true] - Whether to show native tooltip with current value.
 * @param {Object} [props.style] - Inline styles for the container div.
 *
 * @returns {JSX.Element} A styled slider input with label and value display.
 */
function Slider({
    label,
    value,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    unit = '%',
    showValue = true,
    color = 'is-info',
    showTooltip = true,
    style = {}
}) {
    const safeValue = Math.min(Math.max(value, min), max);
    const tooltip = showTooltip ? `${safeValue}${unit}` : undefined;

    return (
        <div
            className="box field mb-4"
            style={{ textAlign: 'center', ...style }}
            title={tooltip}
        >
            <label className="label">{label}</label>
            <div className="control">
                <input
                    type="range"
                    className={`slider is-fullwidth ${color}`}
                    min={min}
                    max={max}
                    step={step}
                    value={safeValue}
                    onChange={e => onChange(Number(e.target.value))}
                />
                {showValue && (
                    <p className="has-text-centered mt-2 has-text-weight-semibold">
                        {safeValue} {unit}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Slider;
