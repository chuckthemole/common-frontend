import React, { useState, useEffect } from "react";
import { getNamedApi } from "../api";
import logger from "../logger";

export default function MachineTaskManager() {
    const [machines, setMachines] = useState([]);
    const [machineForm, setMachineForm] = useState({});
    const [editingIndex, setEditingIndex] = useState(null);
    const [showChildModal, setShowChildModal] = useState(false);
    const [childForm, setChildForm] = useState({});
    const [activeMachineIndex, setActiveMachineIndex] = useState(null);

    const endpoints = {
        getMachines: "/api/arduino_consumer/arduino/get-machines/",
        getTasks: "/api/arduino_consumer/arduino/get-tasks/",
        addMachine: "/api/arduino_consumer/arduino/add-machine/",
        removeMachine: "/api/arduino_consumer/arduino/remove-machine/",
        updateTask: "/api/arduino_consumer/arduino/task-update/",
        deleteMachines: "/api/arduino_consumer/arduino/delete-machines/",
    };

    // Fetch machines and tasks
    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                const api = getNamedApi("RUMPSHIFT_API");
                const [machinesResp, tasksResp] = await Promise.all([
                    api.get(endpoints.getMachines),
                    api.get(endpoints.getTasks),
                ]);

                if (!isMounted) return;

                const merged = (machinesResp.data || []).map((m) => {
                    const tasksForMachine = (tasksResp.data || [])
                        .filter((t) => t.ip === m.ip)
                        .map((t) => ({
                            taskName: t.taskName,
                            notes: t.notes || "",
                            status: t.status || "idle",
                        }));
                    return { ...m, tasks: tasksForMachine };
                });

                setMachines(merged);
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

    // Add or update machine
    async function saveMachine() {
        if (!machineForm.name || !machineForm.ip) return;
        const api = getNamedApi("RUMPSHIFT_API");
        const payload = { alias: machineForm.name, ip: machineForm.ip };

        try {
            if (editingIndex !== null) {
                const updated = [...machines];
                updated[editingIndex] = { ...updated[editingIndex], ...machineForm };
                setMachines(updated);
                setEditingIndex(null);
            } else {
                setMachines([...machines, { ...machineForm, tasks: [] }]);
            }
            await api.post(endpoints.addMachine, payload);
            logger.info("Machine saved successfully");
        } catch (err) {
            logger.error("Error saving machine:", err);
        } finally {
            setMachineForm({});
        }
    }

    function editMachine(index) {
        setMachineForm({ ...machines[index] });
        setEditingIndex(index);
    }

    async function removeMachine(index) {
        const machine = machines[index];
        if (machine.tasks.some((t) => t.status !== "idle")) {
            alert("Cannot remove machine with active tasks. Stop them first.");
            return;
        }
        const api = getNamedApi("RUMPSHIFT_API");
        try {
            await api.post(endpoints.removeMachine, { alias: machine.alias, ip: machine.ip });
            setMachines(machines.filter((_, i) => i !== index));
        } catch (err) {
            logger.error("Error removing machine:", err);
        }
    }

    async function updateTask(machine, task, status) {
        const api = getNamedApi("RUMPSHIFT_API");
        const payload = {
            alias: machine.alias || machine.name,
            ip: machine.ip,
            taskName: task.taskName,
            notes: task.notes || "",
            status,
        };
        try {
            await api.post(endpoints.updateTask, payload);
        } catch (err) {
            logger.error("Error updating task:", err);
        }
    }

    function startTask(machineIndex, taskData) {
        const updated = [...machines];
        updated[machineIndex].tasks.push({ ...taskData, status: "running" });
        setMachines(updated);
        setShowChildModal(false);
        updateTask(updated[machineIndex], taskData, "running");
    }

    function pauseTask(machineIndex, taskIndex) {
        const updated = [...machines];
        updated[machineIndex].tasks[taskIndex].status = "paused";
        setMachines(updated);
        updateTask(updated[machineIndex], updated[machineIndex].tasks[taskIndex], "paused");
    }

    function resumeTask(machineIndex, taskIndex) {
        const updated = [...machines];
        updated[machineIndex].tasks[taskIndex].status = "running";
        setMachines(updated);
        updateTask(updated[machineIndex], updated[machineIndex].tasks[taskIndex], "running");
    }

    function killTask(machineIndex, taskIndex) {
        const updated = [...machines];
        const task = updated[machineIndex].tasks[taskIndex];
        updated[machineIndex].tasks.splice(taskIndex, 1);
        setMachines(updated);
        updateTask(updated[machineIndex], task, "kill");
    }

    async function deleteMachines(forceClean) {
        const api = getNamedApi("RUMPSHIFT_API");
        try {
            const res = await api.post(endpoints.deleteMachines, { force_clean: forceClean });
            alert(res.data.message || "Delete request completed");
            // Refresh machines list after deletion
            const machinesResp = await api.get(endpoints.getMachines);
            setMachines(machinesResp.data || []);
        } catch (err) {
            console.error(err);
            alert("Failed to delete machines");
        }
    }


    return (
        <div>
            <h2 className="title is-4">Machines & Tasks Manager</h2>

            <ul className="machine-list">
                {machines.map((m, mi) => {
                    const allIdle = m.tasks.every(t => t.status === "idle");

                    return (
                        <li key={m.ip} style={{ borderBottom: "1px solid #ddd" }}>
                            <div className="p-2 is-flex is-justify-content-space-between is-align-items-center">
                                <div>
                                    <strong>Machine:</strong> {m.alias || m.name} (IP: {m.ip})

                                    {m.tasks.length > 0 && (
                                        <div style={{ marginTop: "4px" }}>
                                            {m.tasks.map((t, ti) => (
                                                <div key={ti} style={{ marginBottom: "2px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span>
                                                        <strong>Task:</strong> {t.taskName} ({t.status})
                                                    </span>
                                                    <span>
                                                        {t.status === "running" && (
                                                            <>
                                                                <button
                                                                    className="button is-small is-warning ml-1"
                                                                    onClick={() => pauseTask(mi, ti)}
                                                                >
                                                                    Pause
                                                                </button>
                                                                <button
                                                                    className="button is-small is-danger ml-1"
                                                                    onClick={() => killTask(mi, ti)}
                                                                >
                                                                    Kill
                                                                </button>
                                                            </>
                                                        )}
                                                        {t.status === "paused" && (
                                                            <>
                                                                <button
                                                                    className="button is-small is-success ml-1"
                                                                    onClick={() => resumeTask(mi, ti)}
                                                                >
                                                                    Resume
                                                                </button>
                                                                <button
                                                                    className="button is-small is-danger ml-1"
                                                                    onClick={() => killTask(mi, ti)}
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

                                {/* Right-aligned buttons for machine actions */}
                                <div>
                                    {allIdle && (
                                        <>
                                            <button
                                                className="button is-info is-small mr-1"
                                                onClick={() => editMachine(mi)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="button is-danger is-small mr-1"
                                                onClick={() => removeMachine(mi)}
                                            >
                                                Remove
                                            </button>
                                            <button
                                                className="button is-success is-small"
                                                onClick={() => {
                                                    setActiveMachineIndex(mi);
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
                        </li>
                    );
                })}
            </ul>

            {/* Add/Edit Machine Form */}
            <div className="box mt-3">
                <h3 className="subtitle is-6">Add / Edit Machine</h3>
                <div className="field is-grouped is-flex-wrap-wrap">
                    <div className="control">
                        <input className="input" placeholder="Machine Name" value={machineForm.name || ""} onChange={e => setMachineForm({ ...machineForm, name: e.target.value })} />
                    </div>
                    <div className="control">
                        <input className="input" placeholder="Machine IP" value={machineForm.ip || ""} onChange={e => setMachineForm({ ...machineForm, ip: e.target.value })} />
                    </div>
                    <div className="control">
                        <button className="button is-info" onClick={saveMachine}>{editingIndex !== null ? "Update" : "Add"}</button>
                    </div>
                    {editingIndex !== null && (
                        <div className="control">
                            <button className="button is-light" onClick={() => { setMachineForm({}); setEditingIndex(null); }}>Cancel</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Run Task Modal */}
            {showChildModal && activeMachineIndex !== null && (
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
                            <button className="button is-success" onClick={() => startTask(activeMachineIndex, childForm)} disabled={!childForm.taskName}>Start</button>
                            <button className="button" onClick={() => setShowChildModal(false)}>Cancel</button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Delete Idle / All Machines Buttons */}
            <div style={{ marginTop: "16px" }}>
                <button className="button is-warning" onClick={() => deleteMachines(false)}>Delete Idle Machines</button>
                <button className="button is-danger" style={{ marginLeft: "8px" }} onClick={() => deleteMachines(true)}>Force Delete All Machines</button>
            </div>
        </div>
    );
}
