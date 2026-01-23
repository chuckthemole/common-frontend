import React from "react";
import { SectionCard } from "./sections-helper";
import { EditableTitle, ToggleSwitch } from "../../../dashboard-elements";
import { Tooltip } from "../../../ui";

export default function HomeSection({
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
            headerExtra={
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
            onChange={onToggle}
        >
            <input
                className="input mb-2"
                placeholder="Name"
                value={section.data.name}
                onChange={
                    (e) => onUpdate({ name: e.target.value })
                }
            />
            <input
                className="input mb-2"
                placeholder="Tagline"
                value={section.data.tagline}
                onChange={
                    (e) => onUpdate({ tagline: e.target.value })
                }
            />
            <input
                className="input"
                placeholder="Profile Image URL"
                value={section.data.profileImage}
                onChange={
                    (e) => onUpdate({ profileImage: e.target.value })
                }
            />
        </SectionCard>
    );
}