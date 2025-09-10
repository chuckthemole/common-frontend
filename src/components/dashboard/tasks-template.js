import React, { useState, useEffect } from "react";
import ToggleSwitch from "../dashboard-elements/toggle-switch/toggle-switch";
import ControlButtonCartoon from "../dashboard-elements/control-button/control-button-cartoon";
import ControlButtonRealistic from "../dashboard-elements/control-button/control-button-realistic";
import { debugComponents } from "../../utils/component_debugger";

debugComponents(
    {
        ToggleSwitch,
        ControlButtonCartoon,
    },
    "tasks-template"
);

export const TaskLayout = {
    GRID: "grid",
    HORIZONTAL: "horizontal",
};

export default function TasksTemplate({
    tasks = [],
    currentUser,
    isAdmin = false,
    layout = TaskLayout.GRID,
    taskUiElements,
    onTasksChange,
    allowReopen = false,
}) {
    const [expanded, setExpanded] = useState({});
    const [localTasks, setLocalTasks] = useState(tasks);

    useEffect(() => setLocalTasks(tasks), [tasks]);

    const updateTasks = (updater) => {
        setLocalTasks((prev) => {
            const newTasks = typeof updater === "function" ? updater(prev) : updater;
            onTasksChange?.(newTasks);
            return newTasks;
        });
    };

    const toggleExpand = (taskId) => {
        setExpanded((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    const visibleTasks = isAdmin
        ? localTasks
        : localTasks.filter((t) => t.assignedTo?.id === currentUser?.id);

    if (!visibleTasks.length)
        return <p className="has-text-grey-light is-italic">No tasks available.</p>;

    // Render UI elements per task
    const renderUiElements = (task) => {
        const customElements = taskUiElements?.(task) || [];

        // Determine which built-in buttons are already present
        const hasHighlight = customElements.some(
            (el) => el.action === TasksTemplate.builtInActions.highlight
        );
        const hasDelete = customElements.some(
            (el) => el.action === TasksTemplate.builtInActions.deleteTask
        );

        // Combine custom elements with default built-in buttons if missing
        const elements = [
            ...customElements,
            !hasHighlight && {
                action: TasksTemplate.builtInActions.highlight,
                component: ControlButtonCartoon,
                props: { label: "Highlight", circular: true },
            },
            !hasDelete && {
                action: TasksTemplate.builtInActions.deleteTask,
                component: ControlButtonRealistic,
                props: { label: "Delete", circular: true, color: "red" },
            },
        ].filter(Boolean);

        // Flex container for horizontal layout spacing
        const containerStyle =
            layout === TaskLayout.HORIZONTAL
                ? { display: "flex", gap: "0.5rem", alignItems: "center" }
                : {};

        return (
            <div style={containerStyle}>
                {elements.map(({ component, props = {}, action }, idx) => {
                    const handleChange = (val) => action?.(val, task, updateTasks);

                    const isDisabled =
                        (action === TasksTemplate.builtInActions.toggleComplete ||
                            action === TasksTemplate.builtInActions.highlight) &&
                        task.completed &&
                        !allowReopen;

                    // Render ToggleSwitch for toggleComplete
                    if (!component && action === TasksTemplate.builtInActions.toggleComplete) {
                        return (
                            <ToggleSwitch
                                key={idx}
                                {...props}
                                checked={task.completed}
                                onChange={handleChange}
                                disabled={isDisabled}
                            />
                        );
                    }

                    // Render ControlButton variants (Cartoon, Realistic, etc.)
                    const Component =
                        component ||
                        (action === TasksTemplate.builtInActions.highlight
                            ? ControlButtonCartoon
                            : action === TasksTemplate.builtInActions.deleteTask
                                ? ControlButtonRealistic
                                : null);

                    if (!Component) return null;

                    const isHighlight = action === TasksTemplate.builtInActions.highlight;

                    return (
                        <Component
                            key={idx}
                            {...props}
                            checked={
                                isHighlight
                                    ? task.highlighted
                                    : action === TasksTemplate.builtInActions.toggleComplete
                                        ? task.completed
                                        : undefined
                            } // sync with task state if needed
                            onToggle={(val) => handleChange(val)} // trigger built-in action
                            disabled={isDisabled}
                        />
                    );
                })}
            </div>
        );
    };


    return (
        <div
            className={
                layout === TaskLayout.GRID ? "columns is-multiline" : "task-list-horizontal"
            }
        >
            {visibleTasks.map((task) => {
                const boxStyle = {
                    opacity: task.completed ? 0.5 : 1,
                    backgroundColor: task.highlighted
                        ? "#fff8dc"
                        : task.completed
                            ? "#f0f0f0"
                            : "white",
                    cursor: task.completed
                        ? allowReopen
                            ? "pointer"
                            : "not-allowed"
                        : layout === TaskLayout.HORIZONTAL
                            ? "pointer"
                            : "default",
                    transition: "opacity 0.2s, background-color 0.2s",
                    padding: "0.75rem",
                    borderRadius: "6px",
                };

                const isOpen = expanded[task.id] || false;

                return (
                    <div
                        key={task.id}
                        className={layout === TaskLayout.GRID ? "column is-one-third" : "box mb-3"}
                        style={boxStyle}
                    >
                        <div className="is-flex is-align-items-center is-justify-content-space-between">
                            <div
                                className="is-flex-grow-1 pr-4"
                                onClick={() =>
                                    (!task.completed || allowReopen) && toggleExpand(task.id)
                                }
                            >
                                <p className="title is-5 mb-0">{task.title}</p>
                            </div>
                            <div className="is-flex-shrink-0">{renderUiElements(task)}</div>
                        </div>

                        {isOpen && task.description && (
                            <div
                                className="mt-3 p-3"
                                style={{ backgroundColor: "#f5f5f5", borderRadius: "6px" }}
                            >
                                {task.description.split("\n").map((line, idx) => (
                                    <React.Fragment key={idx}>
                                        <p className="subtitle is-6 has-text-grey mb-0">{line}</p>
                                        <br />
                                    </React.Fragment>
                                ))}
                            </div>
                        )}



                        {isAdmin && task.assignedTo?.length > 0 && (
                            <p className="is-size-7 has-text-grey mt-2">
                                Assigned to: {task.assignedTo.map((u) => u.name).join(", ")}
                                {task.dueDate && (
                                    <>
                                        {" • Due: "}
                                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </>
                                )}
                            </p>
                        )}

                    </div>
                );
            })}
        </div>
    );
}

// Built-in actions
TasksTemplate.builtInActions = {
    toggleComplete: (checked, task, setTasks) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, completed: checked } : t))
        );
    },
    highlight: (_, task, setTasks) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, highlighted: !t.highlighted } : t))
        );
    },
    deleteTask: (_, task, setTasks) => {
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
    },
};
