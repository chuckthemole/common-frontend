import React from "react";

import {
    EditableTitle,
    ToggleSwitch,
    SectionCard,
} from "../../../dashboard-elements";
import { Tooltip } from "../../../ui";

export default function ProjectsSection({
    section,
    onToggle,
    onToggleTitle,
    onUpdateTitle,
    onUpdateItems,
    onAddProject,
    onMoveProject,
    onRemoveProject,
}) {
    const items = section.data.items ?? [];

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
            <button
                type="button"
                className="button is-small mb-3"
                onClick={onAddProject}
            >
                + Add Project
            </button>

            {items.map((project, index) => (
                <div key={index} className="box mb-3">
                    <input
                        className="input mb-2"
                        placeholder="Project title"
                        value={project.title}
                        onChange={(e) => {
                            const next = [...items];
                            next[index] = { ...next[index], title: e.target.value };
                            onUpdateItems(next);
                        }}
                    />

                    <input
                        className="input mb-3"
                        placeholder="Project link"
                        value={project.link}
                        onChange={(e) => {
                            const next = [...items];
                            next[index] = { ...next[index], link: e.target.value };
                            onUpdateItems(next);
                        }}
                    />

                    <div className="buttons">
                        <button
                            type="button"
                            className="button is-small"
                            onClick={() => onMoveProject(index, -1)}
                        >
                            ↑
                        </button>
                        <button
                            type="button"
                            className="button is-small"
                            onClick={() => onMoveProject(index, 1)}
                        >
                            ↓
                        </button>
                        <button
                            type="button"
                            className="button is-small is-danger"
                            onClick={() => onRemoveProject(index)}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ))}
        </SectionCard>
    );
}
