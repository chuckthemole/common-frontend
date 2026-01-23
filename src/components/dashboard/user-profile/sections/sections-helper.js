import React from "react";
import Tooltip from "../../../ui/tooltip/tooltip";
import ToggleSwitch from "../../../dashboard-elements/toggle-switch/toggle-switch";

export const SectionCard = ({ title, enabled, onChange, headerExtra, children }) => (
    <div className="box mb-5">
        <div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
            <div className="is-flex is-align-items-center gap-2">
                <h3 className="title is-5 mb-0">{title}</h3>
                {headerExtra}
            </div>
            <Tooltip text="Enable/disable section">
                <ToggleSwitch checked={enabled} onChange={onChange} />
            </Tooltip>
        </div>
        {enabled && children}
    </div>
);