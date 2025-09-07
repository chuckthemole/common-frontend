import React, { useState } from "react";

/**
 * Layout modes
 */
export const TaskLayout = {
    GRID: "grid",
    HORIZONTAL: "horizontal",
};

/**
 * Generic reusable TasksTemplate (Bulma version, with default checkbox toggle)
 *
 * @param {Array} tasks - List of task objects [{ id, title, description, assignedTo, completed }]
 * @param {Object} currentUser - The logged-in user object { id, name }
 * @param {Boolean} isAdmin - Whether the current user is an admin
 * @param {Function} onToggleComplete - Callback when task completion is toggled (taskId, newValue) => {}
 * @param {String} layout - Layout type: "grid" (default) or "horizontal"
 */
export default function TasksTemplate({
    tasks = [],
    currentUser,
    isAdmin = false,
    onToggleComplete,
    layout = TaskLayout.GRID,
}) {
    const [expanded, setExpanded] = useState({});

    const toggleExpand = (taskId) => {
        setExpanded((prev) => ({
            ...prev,
            [taskId]: !prev[taskId],
        }));
    };

    const visibleTasks = isAdmin
        ? tasks
        : tasks.filter((task) => task.assignedTo?.id === currentUser?.id);

    if (visibleTasks.length === 0) {
        return <p className="has-text-grey-light is-italic">No tasks available.</p>;
    }

    return (
        <div
            className={
                layout === TaskLayout.GRID
                    ? "columns is-multiline"
                    : "task-list-horizontal"
            }
        >
            {visibleTasks.map((task) => {
                const isCompleted = task.completed;
                const boxStyle = {
                    opacity: isCompleted ? 0.6 : 1,
                    backgroundColor: isCompleted ? "#f0f0f0" : "white",
                    cursor: layout === TaskLayout.HORIZONTAL ? "pointer" : "default",
                };

                if (layout === TaskLayout.HORIZONTAL) {
                    const isOpen = expanded[task.id] || false;

                    return (
                        <div
                            key={task.id}
                            className="box mb-3"
                            style={boxStyle}
                        >
                            {/* Top section: title + checkbox */}
                            <div className="is-flex is-align-items-center is-justify-content-space-between">
                                <div
                                    className="is-flex-grow-1 pr-4"
                                    onClick={() => toggleExpand(task.id)}
                                >
                                    <p className="title is-5 mb-0">{task.title}</p>
                                </div>

                                <div className="is-flex-shrink-0">
                                    <label className="checkbox">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={(e) =>
                                                onToggleComplete?.(task.id, e.target.checked)
                                            }
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Expandable description */}
                            {isOpen && task.description && (
                                <div
                                    className="mt-3 p-3"
                                    style={{
                                        backgroundColor: "#f5f5f5",
                                        borderRadius: "6px",
                                    }}
                                >
                                    <p className="subtitle is-6 has-text-grey mb-0">
                                        {task.description}
                                    </p>
                                </div>
                            )}

                            {/* Assigned to always visible at bottom */}
                            {isAdmin && task.assignedTo && (
                                <p className="is-size-7 has-text-grey mt-2">
                                    Assigned to: {task.assignedTo.name}
                                </p>
                            )}
                        </div>
                    );
                }

                // Default grid layout
                return (
                    <div key={task.id} className="column is-one-third">
                        <div className="card" style={boxStyle}>
                            <header className="card-header">
                                <p className="card-header-title mb-2">{task.title}</p>
                                <div className="card-header-icon">
                                    <label className="checkbox">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={(e) =>
                                                onToggleComplete?.(task.id, e.target.checked)
                                            }
                                        />
                                    </label>
                                </div>
                            </header>

                            {task.description && (
                                <div className="card-content">
                                    <div className="content">
                                        <p className="subtitle is-6">{task.description}</p>
                                    </div>
                                </div>
                            )}

                            {isAdmin && task.assignedTo && (
                                <footer className="card-footer">
                                    <p className="card-footer-item has-text-grey is-size-7">
                                        Assigned to: {task.assignedTo.name}
                                    </p>
                                </footer>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
