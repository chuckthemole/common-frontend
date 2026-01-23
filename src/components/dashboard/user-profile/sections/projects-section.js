import React, { useCallback } from "react";

import {
    EditableTitle,
    ToggleSwitch,
    SectionCard,
} from "../../../dashboard-elements";
import { Tooltip } from "../../../ui";
import logger from "../../../../logger";

/**
 * ProjectsSection
 *
 * Owns all logic related to editing and ordering projects.
 * The parent only provides a generic `onUpdate` function.
 */
export default function ProjectsSection({
    section,
    onToggle,
    onToggleTitle,
    onUpdateTitle,
    onUpdate,
}) {
    const items = section?.data?.items ?? [];

    /* ======================================================
       Helpers
       ====================================================== */

    /**
     * Persist updated items list to section data
     */
    const updateItems = useCallback(
        (nextItems) => {
            logger.debug("[ProjectsSection] Updating items", {
                count: nextItems.length,
            });

            onUpdate({ items: nextItems });
        },
        [onUpdate]
    );

    /**
     * Add a new empty project
     */
    const addProject = () => {
        logger.info("[ProjectsSection] Adding project");

        updateItems([
            ...items,
            { title: "", link: "" },
        ]);
    };

    /**
     * Remove a project by index
     */
    const removeProject = (index) => {
        logger.info("[ProjectsSection] Removing project", { index });

        updateItems(items.filter((_, i) => i !== index));
    };

    /**
     * Move a project up or down in the list
     */
    const moveProject = (index, direction) => {
        const target = index + direction;

        if (target < 0 || target >= items.length) {
            logger.debug("[ProjectsSection] Move ignored (out of bounds)", {
                index,
                direction,
            });
            return;
        }

        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];

        logger.debug("[ProjectsSection] Project reordered", {
            from: index,
            to: target,
        });

        updateItems(next);
    };

    /**
     * Update a single field on a project
     */
    const updateProjectField = (index, field, value) => {
        const next = [...items];
        next[index] = {
            ...next[index],
            [field]: value,
        };

        updateItems(next);
    };

    /* ======================================================
       Render
       ====================================================== */

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
            {/* Add Project */}
            <button
                type="button"
                className="button is-small mb-3"
                onClick={addProject}
            >
                + Add Project
            </button>

            {/* Project List */}
            {items.map((project, index) => (
                <div key={index} className="box mb-3">
                    <input
                        className="input mb-2"
                        placeholder="Project title"
                        value={project.title}
                        onChange={(e) =>
                            updateProjectField(index, "title", e.target.value)
                        }
                    />

                    <input
                        className="input mb-3"
                        placeholder="Project link"
                        value={project.link}
                        onChange={(e) =>
                            updateProjectField(index, "link", e.target.value)
                        }
                    />

                    <div className="buttons">
                        <button
                            type="button"
                            className="button is-small"
                            onClick={() => moveProject(index, -1)}
                            disabled={index === 0}
                        >
                            ↑
                        </button>

                        <button
                            type="button"
                            className="button is-small"
                            onClick={() => moveProject(index, 1)}
                            disabled={index === items.length - 1}
                        >
                            ↓
                        </button>

                        <button
                            type="button"
                            className="button is-small is-danger"
                            onClick={() => removeProject(index)}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ))}

            {!items.length && (
                <p className="has-text-grey is-size-7">
                    No projects added yet.
                </p>
            )}
        </SectionCard>
    );
}
