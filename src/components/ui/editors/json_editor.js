import React, { useState, useEffect, useCallback } from "react";
import logger from "../../../logger";
import { JsonEditor as Editor } from "json-edit-react";
import { isColor } from "../../../utils";

export default function JsonEditor({
    data,
    onChange,
    onSave,
    title = "JSON Editor"
}) {
    const [editorData, setEditorData] = useState(data || {});
    const [error, setError] = useState(null);
    const [viewOnly, setViewOnly] = useState(true); // default: locked (view mode)
    const [dirty, setDirty] = useState(false);

    /**
     * Intelligent refresh:
     * Only refresh data from parent when:
     * - viewOnly = true (user not editing)
     * - incoming data is actually different
     */
    useEffect(() => {
        if (!viewOnly) return; // don’t override edits while unlocked

        const incoming = JSON.stringify(data || {});
        const current = JSON.stringify(editorData);

        if (incoming !== current) {
            logger.debug("JsonEditor: refreshing data from props");
            setEditorData(data || {});
        }
    }, [data, viewOnly]);

    const handleSave = () => {
        try {
            const copy = JSON.parse(JSON.stringify(editorData)); // deep copy
            if (onSave) onSave(copy);
            logger.debug("JsonEditor: Saved JSON", copy);
            setDirty(false);
            setViewOnly(true); // lock again after save
        } catch (err) {
            setError(err.message);
            logger.error("JsonEditor: Error on save", err);
        }
    };

    const handleCancel = () => {
        setEditorData(data || {}); // revert to latest from props
        setDirty(false);
        setViewOnly(true);
    };

    // Keyboard shortcut Ctrl+S to save
    const handleKeyDown = useCallback(
        (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s" && !viewOnly) {
                e.preventDefault();
                handleSave();
            }
        },
        [editorData, viewOnly]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const renderColorInputs = (obj) => {
        // deep walk through object to find colors
        const walk = (data, path = []) => {
            if (!data || typeof data !== "object") return [];
            return Object.entries(data).flatMap(([key, value]) => {
                const currentPath = [...path, key];
                if (isColor(value)) {
                    return (
                        <div key={currentPath.join(".")} className="mb-1">
                            <label className="mr-2">{currentPath.join(".")}:</label>
                            <input
                                type="color"
                                value={value}
                                onChange={(e) => {
                                    const copy = { ...editorData };
                                    let cursor = copy;
                                    for (let i = 0; i < path.length; i++) {
                                        cursor = cursor[path[i]];
                                    }
                                    cursor[key] = e.target.value;
                                    setEditorData(copy);
                                    setDirty(true);
                                    onChange?.(copy);
                                }}
                            />
                            <span className="ml-2">{value}</span>
                        </div>
                    );
                } else if (typeof value === "object") {
                    return walk(value, currentPath);
                }
                return [];
            });
        };
        return walk(obj);
    };

    return (
        <div className="box has-background-white-ter has-text-black p-5">
            <div className="flex justify-between items-center mb-3">
                <h2 className="title is-4 has-text-black">{title}</h2>

                {viewOnly ? (
                    <button
                        onClick={() => setViewOnly(false)}
                        className="button is-warning is-info"
                    >
                        Edit
                    </button>
                ) : (
                    <div className="buttons are-small">
                        <button
                            onClick={handleSave}
                            className="button is-success"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="button is-danger"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="notification is-danger is-light">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <Editor
                data={editorData}
                setData={(newData) => {
                    setEditorData(newData);
                    setDirty(true);
                    setError(null);
                    if (onChange) onChange(newData);
                }}
                viewOnly={viewOnly}
            />

            {!viewOnly && renderColorInputs(editorData)}

            {!viewOnly && dirty && (
                <p className="mt-2 has-text-warning-dark italic">
                    Unsaved changes
                </p>
            )}
        </div>
    );
}
