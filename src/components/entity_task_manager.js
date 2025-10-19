import React, { useState, useEffect } from "react";
import { getNamedApi } from "../api";
import logger from "../logger";
import { ComponentLoading } from "./ui";

export default function EntityTaskManager({
    entityName,
    title,
    apiName,
    endpoints
}) {
    const [entities, setEntities] = useState([]);
    const [entityForm, setEntityForm] = useState({});
    const [editingIndex, setEditingIndex] = useState(null);
    const [showChildModal, setShowChildModal] = useState(false);
    const [childForm, setChildForm] = useState({});
    const [activeEntityIndex, setActiveEntityIndex] = useState(null);
    const [loadingEntityIndex, setLoadingEntityIndex] = useState(null);
    const [savingEntityIndex, setSavingEntityIndex] = useState(null);

    // Fetch entities and tasks
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
                console.error(err);
            }
        }

        fetchData();
        const intervalId = setInterval(fetchData, 10000);
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    // Add or update entity
    async function saveEntity() {
        if (!entityForm.alias) {
            logger.debug("No entityForm.alias in saveEntity.");
            return;
        }

        const api = getNamedApi(apiName);
        const payload = { alias: entityForm.alias, id: entityForm.id }; // include ID for update

        try {
            // set loading state for this entity
            if (editingIndex !== null) setSavingEntityIndex(editingIndex);

            const updated = [...entities];
            if (editingIndex !== null) {
                updated[editingIndex] = { ...updated[editingIndex], ...entityForm };
                setEntities(updated);
            } else {
                setEntities([...entities, { ...entityForm, tasks: [] }]);
            }

            // await backend confirmation
            await api.post(endpoints.addEntity, payload);
            logger.info(`${entityName} saved successfully`);

            // once done, refresh data from backend so it stays consistent
            const entitiesResp = await api.get(endpoints.getEntities);
            setEntities(entitiesResp.data || []);

        } catch (err) {
            logger.error(`Error saving ${entityName}:`, err);
        } finally {
            setSavingEntityIndex(null);
            setEntityForm({});
            setEditingIndex(null);
        }
    }

    function editEntity(index) {
        setEntityForm({ ...entities[index] });
        setEditingIndex(index);
    }

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
        } catch (err) {
            logger.error(`Error removing ${entityName}:`, err);
        }
    }

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

    function startTask(entityIndex, taskData) {
        const api = getNamedApi(apiName);

        // Set loading state for this entity
        setLoadingEntityIndex(entityIndex);

        api.post(endpoints.updateTask, {
            alias: entities[entityIndex].alias || entities[entityIndex].name,
            id: entities[entityIndex].id,
            taskName: taskData.taskName,
            notes: taskData.notes || "",
            status: "running"
        })
            .then((res) => {
                // Only update the entity on success
                const updated = [...entities];
                updated[entityIndex].tasks.push({ ...taskData, status: "running" });
                setEntities(updated);
            })
            .catch((err) => {
                logger.error(`Error starting task:`, err);
                alert("Failed to start task.");
            })
            .finally(() => {
                // Clear loading state
                setLoadingEntityIndex(null);
                setShowChildModal(false);
            });
    }


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

    async function deleteEntities(forceClean) {
        const api = getNamedApi(apiName);
        try {
            const res = await api.post(endpoints.deleteEntities, { force_clean: forceClean });
            alert(res.data.message || "Delete request completed");
            const entitiesResp = await api.get(endpoints.getEntities);
            setEntities(entitiesResp.data || []);
        } catch (err) {
            console.error(err);
            alert(`Failed to delete ${entityName}s`);
        }
    }

    return (
        <div>
            <h2 className="title is-4">{title}</h2>

            <ul className="entity-list">
                {entities.map((entity, entityIndex) => {
                    const allIdle = entity.tasks.every(task => task.status === "idle");

                    return (
                        <li key={entity.id || `temp-${entityIndex}`} style={{ borderBottom: "1px solid #ddd" }}>
                            {!entity.id || loadingEntityIndex === entityIndex || savingEntityIndex === entityIndex ? (
                                <ComponentLoading bars={1} />
                            ) : (
                                <>
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
                                                                alignItems: "center"
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
                                                    <button className="button is-info is-small mr-1" onClick={() => editEntity(entityIndex)}>
                                                        Edit
                                                    </button>
                                                    <button className="button is-danger is-small mr-1" onClick={() => removeEntity(entityIndex)}>
                                                        Remove
                                                    </button>
                                                    <button className="button is-success is-small" onClick={() => {
                                                        setActiveEntityIndex(entityIndex);
                                                        setChildForm({});
                                                        setShowChildModal(true);
                                                    }}>
                                                        Run Task
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
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
                            onChange={e => setEntityForm({ ...entityForm, alias: e.target.value })}
                        />
                    </div>
                    <div className="control">
                        <button className="button is-info" onClick={saveEntity}>
                            {editingIndex !== null ? "Update" : "Add"}
                        </button>
                    </div>
                    {editingIndex !== null && (
                        <div className="control">
                            <button className="button is-light" onClick={() => { setEntityForm({}); setEditingIndex(null); }}>
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
                            <button className="delete" aria-label="close" onClick={() => setShowChildModal(false)}></button>
                        </header>
                        <section className="modal-card-body">
                            <div className="field">
                                <label className="label">Task Name</label>
                                <div className="control">
                                    <input className="input" placeholder="Task Name" value={childForm.taskName || ""} onChange={e => setChildForm({ ...childForm, taskName: e.target.value })} />
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Notes</label>
                                <div className="control">
                                    <textarea className="textarea" placeholder="Optional notes" value={childForm.notes || ""} onChange={e => setChildForm({ ...childForm, notes: e.target.value })} />
                                </div>
                            </div>
                        </section>
                        <footer className="modal-card-foot">
                            <button className="button is-success" onClick={() => startTask(activeEntityIndex, childForm)} disabled={!childForm.taskName}>Start</button>
                            <button className="button" onClick={() => setShowChildModal(false)}>Cancel</button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Delete Idle / All Entities Buttons */}
            <div style={{ marginTop: "16px" }}>
                <button className="button is-warning" onClick={() => deleteEntities(false)}>Delete Idle {entityName}s</button>
                <button className="button is-danger" style={{ marginLeft: "8px" }} onClick={() => deleteEntities(true)}>Force Delete All {entityName}s</button>
            </div>
        </div>
    );
}
