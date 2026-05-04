import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * NumberStepper
 *
 * Supports:
 * - button increment/decrement
 * - optional direct input editing (inputCapable)
 */
function NumberStepper({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    label,
    inputCapable = false,
}) {
    const [internalValue, setInternalValue] = useState(value);

    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    const clamp = (val) => {
        if (val == null || isNaN(val)) return min;
        return Math.min(max, Math.max(min, val));
    };

    const decrement = () => {
        const next = clamp(value - step);
        onChange(next);
    };

    const increment = () => {
        const next = clamp(value + step);
        onChange(next);
    };

    const handleInputChange = (e) => {
        const raw = e.target.value;
        setInternalValue(raw);

        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed)) {
            onChange(clamp(parsed));
        }
    };

    const handleBlur = () => {
        const parsed = parseInt(internalValue, 10);
        const safeValue = clamp(parsed);
        setInternalValue(safeValue);
        onChange(safeValue);
    };

    return (
        <div className="number-stepper-wrapper">
            {label && <div className="stepper-label">{label}</div>}

            <div className="number-stepper">
                <button
                    className="stepper-button"
                    onClick={decrement}
                    disabled={value <= min}
                    aria-label="Decrement"
                >
                    −
                </button>

                {/* VALUE DISPLAY / INPUT */}
                {inputCapable ? (
                    <input
                        type="number"
                        className="stepper-input"
                        value={internalValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        min={min}
                        max={max}
                        step={step}
                    />
                ) : (
                    <div className="stepper-value">{value}</div>
                )}

                <button
                    className="stepper-button"
                    onClick={increment}
                    disabled={value >= max}
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
    step: PropTypes.number,
    label: PropTypes.string,
    inputCapable: PropTypes.bool,
};

export default NumberStepper;