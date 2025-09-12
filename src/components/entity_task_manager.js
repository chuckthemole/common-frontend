import React, { useState, useEffect } from "react";
import { getNamedApi } from "../api";
import logger from "../logger";

/**
 * EntityTaskManager
 * -----------------
 * Generic parent-child relationship manager (e.g., Machines → Tasks).
 *
 * Configurable props:
 * - parentName / childName / apiName / endpoints
 * - formatter: formats parent display name
 * - renderParentExtra: extra JSX in parent row
 * - renderParentFormFields: extra fields in Add/Edit form
 * - formatParentPayload: required function to format parent payload for API
 * - formatChildPayload: required function to format child payload for API
 */
export default function EntityTaskManager({
    parentName,
    childName,
    apiName,
    endpoints,
    formatter = (p) => "(unnamed)",
    renderParentExtra,
    renderParentFormFields,
    formatParentPayload, // REQUIRED
    formatChildPayload, // REQUIRED
}) {
    if (!formatParentPayload) logger.error("formatParentPayload lambda is required!");
    if (!formatChildPayload) logger.error("formatChildPayload lambda is required!");

    const [parents, setParents] = useState([]);
    const [parentForm, setParentForm] = useState({});
    const [editingIndex, setEditingIndex] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [childForm, setChildForm] = useState({});
    const [activeParentIndex, setActiveParentIndex] = useState(null);
    const [expandedIndex, setExpandedIndex] = useState(null);

    // --- Load parents + children ---
    useEffect(() => {
        async function fetchData() {
            try {
                const api = getNamedApi(apiName);
                const [parentsResp, childrenResp] = await Promise.all([
                    api.get(endpoints.getParents),
                    api.get(endpoints.getChildren),
                ]);

                const merged = (parentsResp.data || []).map((p) => {
                    const backendChild = (childrenResp.data || []).find(
                        (c) => c.parentId === p.id
                    ) || null;

                    const child = backendChild
                        ? { ...backendChild }
                        : null;

                    return {
                        ...p,
                        id: p.id ?? `parent-${Math.random()}`, // ensure unique key
                        child,
                    };
                });

                setParents(merged);
                setActiveParentIndex(null);
            } catch (err) {
                logger.error(`Error fetching ${parentName}s or ${childName}s:`, err);
            }
        }

        fetchData();
    }, [apiName, endpoints, parentName, childName]);

    // --- Save / Update parent ---
    async function saveParent() {
        if (!parentForm) return;
        const api = getNamedApi(apiName);
        const payload = formatParentPayload(parentForm);

        try {
            if (editingIndex !== null) {
                const updated = [...parents];
                updated[editingIndex] = { ...updated[editingIndex], ...parentForm };
                setParents(updated);
                setEditingIndex(null);
            } else {
                setParents([...parents, { ...parentForm, child: null }]);
            }

            await api.post(endpoints.addParent, payload);
        } catch (err) {
            logger.error(`Error saving ${parentName}:`, err);
        } finally {
            setParentForm({});
        }
    }

    function editParent(index) {
        const p = parents[index];
        setParentForm({ ...p });
        setEditingIndex(index);
    }

    async function removeParent(index) {
        const parentToRemove = parents[index];
        if (parentToRemove.child?.status && parentToRemove.child.status !== "idle") {
            alert(`Cannot remove ${parentName} with active ${childName}. Stop it first.`);
            return;
        }

        try {
            const api = getNamedApi(apiName);
            await api.post(endpoints.removeParent, formatParentPayload(parentToRemove));
            setParents(parents.filter((_, i) => i !== index));
        } catch (err) {
            logger.error(`Error removing ${parentName}:`, err);
        }
    }

    async function sendChildUpdate(parent, childData, status) {
        const api = getNamedApi(apiName);
        const payload = formatChildPayload(parent, childData, status);

        try {
            await api.post(endpoints.updateChild, payload);
        } catch (err) {
            logger.error(`Error updating ${childName}:`, err);
        }
    }

    function startChild(index, childData) {
        const updated = [...parents];
        updated[index].child = { ...childData, status: "running" };
        setParents(updated);
        setShowModal(false);
        sendChildUpdate(updated[index], childData, "running");
    }

    function pauseChild(index) {
        const updated = [...parents];
        if (updated[index].child) {
            updated[index].child.status = "paused";
            setParents(updated);
            sendChildUpdate(updated[index], updated[index].child, "paused");
        }
    }

    function killChild(index) {
        const updated = [...parents];
        if (updated[index].child) {
            const oldChild = { ...updated[index], ...updated[index].child };
            updated[index].child = null;
            setParents(updated);
            sendChildUpdate(oldChild, oldChild, "kill");
        }
    }

    return (
        <div>
            <h2 className="title is-4">{parentName} &amp; {childName} Manager</h2>

            <ul className="parent-list">
                {parents.map((p, i) => {
                    const childStatus = p.child?.status || "idle";
                    const hasNotes = p.child?.notes?.trim();

                    return (
                        <li key={p.id} style={{ borderBottom: "1px solid #ddd" }}>
                            <div
                                className="p-2 is-flex is-justify-content-space-between is-align-items-center"
                                onClick={() => hasNotes && setExpandedIndex(expandedIndex === i ? null : i)}
                                style={{ cursor: hasNotes ? "pointer" : "default" }}
                            >
                                <div>
                                    <strong>{parentName}:</strong> {formatter(p)} <br />
                                    <strong>{childName}:</strong>{" "}
                                    {p.child ? `${p.child.name || "(unnamed)"} (${childStatus})` : `No active ${childName}`}
                                    {hasNotes && <span style={{ fontStyle: "italic", marginLeft: 8 }}>(click to view notes)</span>}
                                    {renderParentExtra && renderParentExtra(p)}
                                </div>

                                <div>
                                    {childStatus === "idle" && <button className="button is-small is-success mr-2" onClick={() => { setActiveParentIndex(i); setChildForm({}); setShowModal(true); }}>Run</button>}
                                    {childStatus === "running" && <>
                                        <button className="button is-small is-warning mr-2" onClick={() => pauseChild(i)}>Pause</button>
                                        <button className="button is-small is-danger mr-2" onClick={() => killChild(i)}>Kill</button>
                                    </>}
                                    {childStatus === "paused" && <>
                                        <button className="button is-small is-success mr-2" onClick={() => startChild(i, p.child)}>Resume</button>
                                        <button className="button is-small is-danger mr-2" onClick={() => killChild(i)}>Kill</button>
                                    </>}
                                    <button className="button is-small is-info mr-2" onClick={() => editParent(i)}>Edit</button>
                                    <button className="button is-small is-danger" onClick={() => removeParent(i)} disabled={childStatus !== "idle"} title={childStatus !== "idle" ? `Cannot remove ${parentName} with active ${childName}` : ""}>Remove</button>
                                </div>
                            </div>

                            {expandedIndex === i && hasNotes && (
                                <div style={{ padding: "0.5rem 1rem", background: "#f9f9f9", fontStyle: "italic" }}>
                                    Notes: {p.child.notes}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            {/* Add/Edit Parent Form */}
            <div className="box mt-3">
                <h3 className="subtitle is-6">Add / Edit {parentName}</h3>
                <div className="field is-grouped is-flex-wrap-wrap">
                    <div className="control">
                        <input
                            className="input"
                            placeholder={`${parentName} Name`}
                            value={parentForm.name || ""}
                            onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })}
                        />
                    </div>

                    {renderParentFormFields && renderParentFormFields(parentForm, setParentForm)}

                    <div className="control">
                        <button className="button is-info" onClick={saveParent}>{editingIndex !== null ? "Update" : "Add"}</button>
                    </div>
                    {editingIndex !== null && (
                        <div className="control">
                            <button className="button is-light" onClick={() => { setParentForm({}); setEditingIndex(null); }}>Cancel</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Child Modal */}
            {showModal && (
                <div className="modal is-active">
                    <div className="modal-background" onClick={() => setShowModal(false)}></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">Start {childName}</p>
                            <button className="delete" aria-label="close" onClick={() => setShowModal(false)}></button>
                        </header>
                        <section className="modal-card-body">
                            <div className="field">
                                <label className="label">{childName} Name</label>
                                <div className="control">
                                    <input
                                        className="input"
                                        placeholder={`Enter ${childName} name`}
                                        value={childForm.name || ""}
                                        onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
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
                            <button className="button is-success" onClick={() => startChild(activeParentIndex, childForm)} disabled={!childForm.name}>Start</button>
                            <button className="button" onClick={() => setShowModal(false)}>Cancel</button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
