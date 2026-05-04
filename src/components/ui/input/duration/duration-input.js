import React, { useMemo } from "react";
import { SingleSelector } from "../../../dashboard-elements";
import { PortalContainer } from "../../../ui";
import { NumberStepper } from "../../../dashboard-elements";

const TIME_UNITS = [
    { label: "Minutes", value: "minutes" },
    { label: "Hours", value: "hours" },
    { label: "Days", value: "days" },
    { label: "Months", value: "months" },
    { label: "Years", value: "years" },
];

export default function DurationInput({
    value = { amount: 1, unit: "days" },
    onChange,
    min = 1,
    max = 999, // optional safety cap
}) {
    /**
     * Map current value → selector option
     */
    const selectedUnit = useMemo(() => {
        return TIME_UNITS.find((u) => u.value === value.unit) || null;
    }, [value.unit]);

    /**
     * Handlers
     */
    const handleAmountChange = (amount) => {
        if (amount == null) return;

        onChange?.({
            ...value,
            amount,
        });
    };

    const handleUnitChange = (option) => {
        if (!option) return;

        onChange?.({
            ...value,
            unit: option.value,
        });
    };

    return (
        <div className="duration-input field is-flex is-align-items-center" style={{ gap: "8px" }}>
            {/* Number Stepper */}
            <div className="control">
                <NumberStepper
                    value={value.amount}
                    onChange={handleAmountChange}
                    min={min}
                    max={max}
                    inputCapable
                />
            </div>

            {/* Unit Selector */}
            <div className="control" style={{ minWidth: "140px" }}>
                <PortalContainer id="duration-input-dropdown">
                    {(portalTarget) => (
                        <SingleSelector
                            options={TIME_UNITS}
                            value={selectedUnit?.value}
                            onChange={(val) => handleUnitChange(
                                TIME_UNITS.find((u) => u.value === val)
                            )}
                            placeholder="Unit"
                            portalTarget={portalTarget}
                            searchable={false}
                        />
                    )}
                </PortalContainer>
            </div>
        </div>
    );
}