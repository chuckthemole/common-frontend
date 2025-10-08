import React, { useState, useEffect } from "react";
import ToggleSwitch from "../dashboard-elements/toggle-switch/toggle-switch";
import ControlButtonCartoon from "../dashboard-elements/control-button/control-button-cartoon";
import ControlButtonRealistic from "../dashboard-elements/control-button/control-button-realistic";
import Alert from "../ui/alerts/alert";
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
    showTaskButtons = false,
}) {
    const [expanded, setExpanded] = useState({});
    const [localTasks, setLocalTasks] = useState(tasks);
    const [alerts, setAlerts] = useState([]);

    const ALERT_LENGTH = 5000;

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

    const showAlert = (message, type = "info", duration = ALERT_LENGTH) => {
        const id = Date.now();
        setAlerts((prev) => [...prev, { id, message, type, duration }]);
    };

    const removeAlert = (id) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
    };

    if (!visibleTasks.length)
        return <p className="has-text-grey-light is-italic">No tasks available.</p>;

    const renderUiElements = (task) => {
        if (!showTaskButtons) return null;

        const customElements = taskUiElements?.(task) || [];

        const hasHighlight = customElements.some(
            (el) => el.action === TasksTemplate.builtInActions.highlight
        );
        const hasDelete = customElements.some(
            (el) => el.action === TasksTemplate.builtInActions.deleteTask
        );

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

        const containerStyle =
            layout === TaskLayout.HORIZONTAL
                ? { display: "flex", gap: "0.5rem", alignItems: "center" }
                : {};

        return (
            <div style={containerStyle}>
                {elements.map(({ component, props = {}, action }, idx) => {
                    const handleChange = (val) => {
                        action?.(val, task, updateTasks);
                        // trigger alert messages for built-in actions
                        if (action === TasksTemplate.builtInActions.highlight) {
                            showAlert(
                                `Task "${task.title}" highlighted!`,
                                "info"
                            );
                        } else if (action === TasksTemplate.builtInActions.deleteTask) {
                            showAlert(
                                `Task "${task.title}" deleted!`,
                                "error"
                            );
                        } else if (action === TasksTemplate.builtInActions.toggleComplete) {
                            showAlert(
                                `Task "${task.title}" marked ${val ? "complete" : "incomplete"
                                }`,
                                "success"
                            );
                        }
                    };

                    const isDisabled =
                        (action === TasksTemplate.builtInActions.toggleComplete ||
                            action === TasksTemplate.builtInActions.highlight) &&
                        task.completed &&
                        !allowReopen;

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
                            }
                            onToggle={(val) => handleChange(val)}
                            disabled={isDisabled}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div>
            {/* --- Render Alerts --- */}
            {alerts.map((a) => (
                <Alert
                    key={a.id}
                    message={a.message}
                    type={a.type}
                    duration={a.duration}
                    onClose={() => removeAlert(a.id)}
                    position="bottom"
                />
            ))}

            <div
                className={
                    layout === TaskLayout.GRID ? "columns is-multiline" : "task-list-horizontal"
                }
            >
                {visibleTasks.map((task) => {
                    const isOpen = expanded[task.id] || false;
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
                                {showTaskButtons && (
                                    <div className="is-flex-shrink-0">{renderUiElements(task)}</div>
                                )}
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
        </div>
    );
}

/** Built-in actions remain the same */
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
