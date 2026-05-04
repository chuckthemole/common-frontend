import React, { useMemo } from "react";
import { SingleSelector } from "../../../dashboard-elements";
import { PortalContainer } from "../../../ui";

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
    const handleAmountChange = (e) => {
        const amount = parseInt(e.target.value, 10) || 0;
        onChange?.({ ...value, amount });
    };

    const handleUnitChange = (option) => {
        if (!option) return;
        onChange?.({ ...value, unit: option.value });
    };

    return (
        <div className="duration-input field has-addons">
            {/* Number input */}
            <div className="control">
                <input
                    type="number"
                    className="input"
                    min={min}
                    value={value.amount}
                    onChange={handleAmountChange}
                />
            </div>

            {/* SingleSelector */}
            <div className="control" style={{ minWidth: "140px" }}>
                <PortalContainer id="duration-input-dropdown">
                    {(portalTarget) => (
                        <SingleSelector
                            options={TIME_UNITS}
                            value={selectedUnit}
                            onChange={handleUnitChange}
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