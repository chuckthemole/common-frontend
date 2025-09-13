import React from 'react';
import PropTypes from 'prop-types';

/**
 * A number stepper component with a label on the top-left,
 * centered numeric display, minus button on the left, and plus button on the right.
 *
 * @param {Object} props
 * @param {number} props.value - The current value displayed.
 * @param {function} props.onChange - Callback when the value changes.
 * @param {number} [props.min=0] - Minimum value allowed.
 * @param {number} [props.max=100] - Maximum value allowed.
 * @param {string} [props.label] - Optional label displayed above the stepper.
 */
function NumberStepper({ value, onChange, min = 0, max = 100, label }) {
    const decrement = () => {
        if (value > min) onChange(value - 1);
    };

    const increment = () => {
        if (value < max) onChange(value + 1);
    };

    return (
        <div className="number-stepper-wrapper">
            {label && <div className="stepper-label">{label}</div>}
            <div className="number-stepper">
                <button
                    className="stepper-button"
                    onClick={decrement}
                    aria-label="Decrement"
                >
                    −
                </button>
                <div className="stepper-value">{value}</div>
                <button
                    className="stepper-button"
                    onClick={increment}
                    aria-label="Increment"
                >
                    +
                </button>
            </div>
        </div>
    );
}

NumberStepper.propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    label: PropTypes.string,
};

export default NumberStepper;
