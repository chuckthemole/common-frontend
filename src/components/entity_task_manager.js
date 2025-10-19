/**
 * EntityTaskManager.jsx
 *
 * PURPOSE:
 * --------
 * Generic React component that manages a list of entities and their tasks.
 * Each entity (for example, an ArduinoMachine or Worker) can:
 *  - Be added, edited, or removed
 *  - Run one or more tasks
 *  - Pause, resume, or kill tasks
 *  - Refresh its status periodically via API polling
 *
 * This component acts as a reusable manager for any entity type, given
 * API endpoints and configuration props.
 *
 * PROPS:
 * ------
 * @param {string} entityName - Human-readable singular name of the entity (e.g., "Machine", "Worker").
 * @param {string} title - Section title displayed above the list.
 * @param {string} apiName - Key used by `getNamedApi()` to determine which API client to use.
 * @param {object} endpoints - Object containing backend endpoint paths:
 *     {
 *       getEntities: string,
 *       getTasks: string,
 *       addEntity: string,
 *       removeEntity: string,
 *       updateTask: string,
 *       deleteEntities: string
 *     }
 *
 * EXAMPLE:
 * --------
 * <EntityTaskManager
 *   entityName="Machine"
 *   title="Machine Control Panel"
 *   apiName="RUMPSHIFT_API"
 *   endpoints={{
 *     getEntities: "/machines",
 *     getTasks: "/machine-tasks",
 *     addEntity: "/machines/add",
 *     removeEntity: "/machines/remove",
 *     updateTask: "/machine-tasks/update",
 *     deleteEntities: "/machines/delete"
 *   }}
 * />
 */

import React, { useState, useEffect, useRef } from "react";
import { getNamedApi } from "../api";
import logger from "../logger";
import { ComponentLoading } from "./ui";

export default function EntityTaskManager({ entityName, title, apiName, endpoints }) {
    // === STATE VARIABLES ===
    const [entities, setEntities] = useState([]);               // List of all entities
    const [entityForm, setEntityForm] = useState({});           // Current entity form (for add/edit)
    const [editingIndex, setEditingIndex] = useState(null);     // Which entity is being edited
    const [showChildModal, setShowChildModal] = useState(false);// Controls visibility of the Run Task modal
    const [childForm, setChildForm] = useState({});             // Task form data
    const [activeEntityIndex, setActiveEntityIndex] = useState(null); // Entity currently running a task
    const [loadingEntityIndex, setLoadingEntityIndex] = useState(null); // Entity loading indicator
    const [savingEntityIndex, setSavingEntityIndex] = useState(null);   // Entity saving indicator

    const intervalIdRef = useRef(null); // store polling interval so we can pause/resume safely

    // === DATA FETCHING ===
    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                const api = getNamedApi(apiName);
                const [entitiesResp, tasksResp] = await Promise.all([
                    api.get(endpoints.getEntities),
                    api.get(endpoints.getTasks),
                ]);

                if (!isMounted) return;

                // Merge tasks into each entity
                const merged = (entitiesResp.data || []).map((entity) => {
                    const tasksForThisEntity = (tasksResp.data || [])
                        .filter((task) => task.id === entity.id)
                        .map((task) => ({
                            taskName: task.taskName,
                            notes: task.notes || "",
                            status: task.status || "idle",
                        }));

                    return { ...entity, tasks: tasksForThisEntity };
                });

                setEntities(merged);
            } catch (err) {
                logger.error("Error fetching entities or tasks:", err);
            }
        }

        // Initial load + 10-second polling
        fetchData();
        intervalIdRef.current = setInterval(fetchData, 10000);

        return () => {
            isMounted = false;
            clearInterval(intervalIdRef.current);
        };
    }, [apiName, endpoints.getEntities, endpoints.getTasks]);

    // === SAVE ENTITY (ADD OR UPDATE) ===
    async function saveEntity() {
        if (!entityForm.alias) {
            logger.debug("Missing alias in saveEntity.");
            return;
        }

        const api = getNamedApi(apiName);
        const payload = { alias: entityForm.alias, id: entityForm.id };

        try {
            // Temporarily stop polling to avoid overwriting UI with stale data
            clearInterval(intervalIdRef.current);
            if (editingIndex !== null) setSavingEntityIndex(editingIndex);

            // Optimistically update UI
            const updated = [...entities];
            if (editingIndex !== null) {
                updated[editingIndex] = { ...updated[editingIndex], ...entityForm };
                setEntities(updated);
            } else {
                setEntities([...entities, { ...entityForm, tasks: [] }]);
            }

            // Save to backend
            await api.post(endpoints.addEntity, payload);
            logger.info(`${entityName} saved successfully`);

            // Refresh after saving
            const entitiesResp = await api.get(endpoints.getEntities);
            setEntities(entitiesResp.data || []);
        } catch (err) {
            logger.error(`Error saving ${entityName}:`, err);
        } finally {
            setSavingEntityIndex(null);
            setEntityForm({});
            setEditingIndex(null);

            // Restart polling
            const api = getNamedApi(apiName);
            intervalIdRef.current = setInterval(async () => {
                try {
                    const res = await api.get(endpoints.getEntities);
                    setEntities(res.data || []);
                } catch (err) {
                    logger.error("Polling error:", err);
                }
            }, 10000);
        }
    }

    // === EDIT ENTITY ===
    function editEntity(index) {
        setEntityForm({ ...entities[index] });
        setEditingIndex(index);
    }

    // === REMOVE ENTITY ===
    async function removeEntity(index) {
        const entity = entities[index];
        if (entity.tasks.some((t) => t.status !== "idle")) {
            alert(`Cannot remove ${entityName} with active tasks. Stop them first.`);
            return;
        }

        const api = getNamedApi(apiName);
        try {
            await api.post(endpoints.removeEntity, { alias: entity.alias, id: entity.id });
            setEntities(entities.filter((_, i) => i !== index));
            logger.info(`${entityName} removed successfully`);
        } catch (err) {
            logger.error(`Error removing ${entityName}:`, err);
        }
    }

    // === UPDATE TASK ===
    async function updateTask(entity, task, status) {
        const api = getNamedApi(apiName);
        const payload = {
            alias: entity.alias || entity.name,
            id: entity.id,
            taskName: task.taskName,
            notes: task.notes || "",
            status,
        };

        try {
            await api.post(endpoints.updateTask, payload);
        } catch (err) {
            logger.error(`Error updating task for ${entityName}:`, err);
        }
    }

    // === START TASK ===
    function startTask(entityIndex, taskData) {
        const api = getNamedApi(apiName);
        setLoadingEntityIndex(entityIndex);

        api
            .post(endpoints.updateTask, {
                alias: entities[entityIndex].alias || entities[entityIndex].name,
                id: entities[entityIndex].id,
                taskName: taskData.taskName,
                notes: taskData.notes || "",
                status: "running",
            })
            .then(() => {
                const updated = [...entities];
                updated[entityIndex].tasks.push({ ...taskData, status: "running" });
                setEntities(updated);
                logger.info(`Started task '${taskData.taskName}' on ${entityName}`);
            })
            .catch((err) => {
                logger.error("Error starting task:", err);
                alert("Failed to start task.");
            })
            .finally(() => {
                setLoadingEntityIndex(null);
                setShowChildModal(false);
            });
    }

    // === PAUSE, RESUME, KILL TASK ===
    function pauseTask(entityIndex, taskIndex) {
        const updated = [...entities];
        updated[entityIndex].tasks[taskIndex].status = "paused";
        setEntities(updated);
        updateTask(updated[entityIndex], updated[entityIndex].tasks[taskIndex], "paused");
    }

    function resumeTask(entityIndex, taskIndex) {
        const updated = [...entities];
        updated[entityIndex].tasks[taskIndex].status = "running";
        setEntities(updated);
        updateTask(updated[entityIndex], updated[entityIndex].tasks[taskIndex], "running");
    }

    function killTask(entityIndex, taskIndex) {
        const updated = [...entities];
        const task = updated[entityIndex].tasks[taskIndex];
        updated[entityIndex].tasks.splice(taskIndex, 1);
        setEntities(updated);
        updateTask(updated[entityIndex], task, "kill");
    }

    // === DELETE ALL ENTITIES ===
    async function deleteEntities(forceClean) {
        const api = getNamedApi(apiName);
        try {
            const res = await api.post(endpoints.deleteEntities, { force_clean: forceClean });
            alert(res.data.message || "Delete request completed");
            const entitiesResp = await api.get(endpoints.getEntities);
            setEntities(entitiesResp.data || []);
        } catch (err) {
            logger.error(`Failed to delete ${entityName}s:`, err);
            alert(`Failed to delete ${entityName}s`);
        }
    }

    // === RENDER ===
    return (
        <div>
            <h2 className="title is-4">{title}</h2>

            <ul className="entity-list">
                {entities.map((entity, entityIndex) => {
                    const allIdle = entity.tasks.every((task) => task.status === "idle");

                    return (
                        <li key={entity.id || `temp-${entityIndex}`} style={{ borderBottom: "1px solid #ddd" }}>
                            {!entity.id ||
                                loadingEntityIndex === entityIndex ||
                                savingEntityIndex === entityIndex ? (
                                <ComponentLoading bars={1} />
                            ) : (
                                <div className="p-2 is-flex is-justify-content-space-between is-align-items-center">
                                    <div>
                                        <strong>{entityName}:</strong> {entity.alias || entity.name} (ID: {entity.id})
                                        {entity.tasks.length > 0 && (
                                            <div style={{ marginTop: "4px" }}>
                                                {entity.tasks.map((task, taskIndex) => (
                                                    <div
                                                        key={`${entity.id}-${task.taskName}`}
                                                        style={{
                                                            marginBottom: "2px",
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <span>
                                                            <strong>Task:</strong> {task.taskName} ({task.status})
                                                        </span>
                                                        <span>
                                                            {task.status === "running" && (
                                                                <>
                                                                    <button
                                                                        className="button is-small is-warning ml-1"
                                                                        onClick={() => pauseTask(entityIndex, taskIndex)}
                                                                    >
                                                                        Pause
                                                                    </button>
                                                                    <button
                                                                        className="button is-small is-danger ml-1"
                                                                        onClick={() => killTask(entityIndex, taskIndex)}
                                                                    >
                                                                        Kill
                                                                    </button>
                                                                </>
                                                            )}
                                                            {task.status === "paused" && (
                                                                <>
                                                                    <button
                                                                        className="button is-small is-success ml-1"
                                                                        onClick={() => resumeTask(entityIndex, taskIndex)}
                                                                    >
                                                                        Resume
                                                                    </button>
                                                                    <button
                                                                        className="button is-small is-danger ml-1"
                                                                        onClick={() => killTask(entityIndex, taskIndex)}
                                                                    >
                                                                        Kill
                                                                    </button>
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        {allIdle && (
                                            <>
                                                <button
                                                    className="button is-info is-small mr-1"
                                                    onClick={() => editEntity(entityIndex)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="button is-danger is-small mr-1"
                                                    onClick={() => removeEntity(entityIndex)}
                                                >
                                                    Remove
                                                </button>
                                                <button
                                                    className="button is-success is-small"
                                                    onClick={() => {
                                                        setActiveEntityIndex(entityIndex);
                                                        setChildForm({});
                                                        setShowChildModal(true);
                                                    }}
                                                >
                                                    Run Task
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            {/* Add/Edit Entity Form */}
            <div className="box mt-3">
                <h3 className="subtitle is-6">Add / Edit {entityName}</h3>
                <div className="field is-grouped is-flex-wrap-wrap">
                    <div className="control">
                        <input
                            className="input"
                            placeholder={`${entityName} Name`}
                            value={entityForm.alias || ""}
                            onChange={(e) => setEntityForm({ ...entityForm, alias: e.target.value })}
                        />
                    </div>
                    <div className="control">
                        <button className="button is-info" onClick={saveEntity}>
                            {editingIndex !== null ? "Update" : "Add"}
                        </button>
                    </div>
                    {editingIndex !== null && (
                        <div className="control">
                            <button
                                className="button is-light"
                                onClick={() => {
                                    setEntityForm({});
                                    setEditingIndex(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Run Task Modal */}
            {showChildModal && activeEntityIndex !== null && (
                <div className="modal is-active">
                    <div className="modal-background" onClick={() => setShowChildModal(false)}></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">Start Task</p>
                            <button
                                className="delete"
                                aria-label="close"
                                onClick={() => setShowChildModal(false)}
                            ></button>
                        </header>
                        <section className="modal-card-body">
                            <div className="field">
                                <label className="label">Task Name</label>
                                <div className="control">
                                    <input
                                        className="input"
                                        placeholder="Task Name"
                                        value={childForm.taskName || ""}
                                        onChange={(e) => setChildForm({ ...childForm, taskName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Notes</label>
                                <div className="control">
                                    <textarea
                                        className="textarea"
                                        placeholder="Optional notes"
                                        value={childForm.notes || ""}
                                        onChange={(e) => setChildForm({ ...childForm, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                        </section>
                        <footer className="modal-card-foot">
                            <button
                                className="button is-success"
                                onClick={() => startTask(activeEntityIndex, childForm)}
                                disabled={!childForm.taskName}
                            >
                                Start
                            </button>
                            <button className="button" onClick={() => setShowChildModal(false)}>
                                Cancel
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Bulk Delete Buttons */}
            <div style={{ marginTop: "16px" }}>
                <button className="button is-warning" onClick={() => deleteEntities(false)}>
                    Delete Idle {entityName}s
                </button>
                <button
                    className="button is-danger"
                    style={{ marginLeft: "8px" }}
                    onClick={() => deleteEntities(true)}
                >
                    Force Delete All {entityName}s
                </button>
            </div>
        </div>
    );
}
