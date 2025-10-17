import React, { useState, useEffect, useCallback } from "react";
import logger from "../../../logger";
import { JsonEditor as Editor } from "json-edit-react";

export default function JsonEditor({ data, onChange, onSave, title = 'JSON Editor' }) {
    const [editorData, setEditorData] = useState(data || {});
    const [error, setError] = useState(null);

    // Keep local state in sync if parent data changes
    useEffect(() => {
        setEditorData(data || {});
    }, [data]);

    const handleSave = () => {
        try {
            const copy = JSON.parse(JSON.stringify(editorData)); // deep copy
            if (onSave) onSave(copy);
            logger.debug("JsonEditor: Saved JSON", copy);
        } catch (err) {
            setError(err.message);
            logger.error("JsonEditor: Error on save", err);
        }
    };

    // Keyboard shortcut Ctrl+S to save
    const handleKeyDown = useCallback(
        (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                handleSave();
            }
        },
        [editorData]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className="box has-background-dark has-text-white p-5">
            <h2 className="title is-4 has-text-white">{title}</h2>

            {error && (
                <div className="notification is-danger is-light">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <Editor
                data={editorData}
                setData={setEditorData}
                onUpdate={({ newData }) => {
                    setEditorData(newData);
                    if (onChange) onChange(newData);
                    setError(null);
                }}
            />

            <div className="buttons mt-4">
                <button
                    onClick={handleSave}
                    className="button is-link is-medium"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}
