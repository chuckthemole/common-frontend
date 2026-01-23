import React from "react";

import {
    EditableTitle,
    ToggleSwitch,
    SectionCard,
} from "../../../dashboard-elements";
import { Tooltip } from "../../../ui";

export default function ContactSection({
    section,
    onToggle,
    onToggleTitle,
    onUpdateTitle,
    onUpdate,
}) {
    return (
        <SectionCard
            title={
                <EditableTitle
                    value={section.title}
                    defaultValue={section.defaultTitle}
                    onChange={onUpdateTitle}
                />
            }
            headerActions={
                <Tooltip text="Show or hide this section’s title in the preview">
                    <div className="is-flex is-flex-direction-column is-align-items-center ml-3">
                        <ToggleSwitch
                            checked={section.showTitle}
                            color="is-info"
                            onChange={onToggleTitle}
                        />
                    </div>
                </Tooltip>
            }
            enabled={section.enabled}
            onToggle={onToggle}
        >
            <input
                className="input"
                type="email"
                placeholder="Email"
                value={section.data.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
            />
        </SectionCard>
    );
}
