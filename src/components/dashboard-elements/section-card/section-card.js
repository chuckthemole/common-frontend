import React from "react";
import { Tooltip } from "../../ui"
import { ToggleSwitch } from "../toggle-switch";

export default function SectionCard({
    title,
    headerActions,
    enabled = true,
    onToggle,
    children,
}) {
    return (
        <div className="box mb-5">
            <div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
                <div className="is-flex is-align-items-center gap-2">
                    <h3 className="title is-5 mb-0">{title}</h3>
                    {headerActions}
                </div>

                {onToggle && (
                    <Tooltip text="Enable/disable section">
                        <ToggleSwitch checked={enabled} onChange={onToggle} />
                    </Tooltip>
                )}
            </div>

            {enabled && children}
        </div>
    );
}