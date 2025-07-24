import React from 'react';

/**
 * ProgressMeter
 *
 * Displays a labeled progress bar with customizable value, max, and color.
 * Optionally shows a tooltip and/or percentage text below the bar.
 *
 * @component
 * @param {Object} props
 * @param {number} props.value - Current progress value.
 * @param {number} [props.max=100] - Maximum progress value.
 * @param {string} [props.color='is-success'] - Bulma color class for progress bar (e.g. 'is-danger', 'is-info').
 * @param {string} props.label - Label text shown above the progress bar.
 * @param {boolean} [props.showTooltip=true] - Whether to show tooltip with percentage on hover.
 * @param {boolean} [props.showPercent=false] - Whether to display percent complete text below the progress bar.
 * @param {Object} [props.style] - Optional inline styles for outer container.
 *
 * @returns {JSX.Element} The rendered progress meter component.
 */
function ProgressMeter({
    value,
    max = 100,
    color = 'is-success',
    label,
    showTooltip = true,
    showPercent = false,
    style = {}
}) {
    const safeValue = Math.min(Math.max(value, 0), max);
    const percent = ((safeValue / max) * 100).toFixed(1);

    return (
        <div
            className="box mb-3"
            style={{ textAlign: 'center', ...style }}
            title={showTooltip ? `${percent}%` : undefined}
        >
            <label className="label">{label}</label>
            <progress className={`progress ${color}`} value={safeValue} max={max}>
                {percent}%
            </progress>
            {showPercent && (
                <p className="has-text-weight-semibold mt-2">{percent}% complete</p>
            )}
        </div>
    );
}

export default ProgressMeter;
