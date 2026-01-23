import React, { useState } from "react";
import { Tooltip } from "../../ui";

export default function EditableTitle({
    value,
    defaultValue,
    onChange
}) {
    const [editing, setEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);

    const handleSave = () => {
        onChange(localValue.trim() || defaultValue);
        setEditing(false);
    };

    return (
        <div className="editable-title is-flex is-align-items-center">
            {!editing ? (
                <>
                    <span className="mr-2">{value || defaultValue}</span>
                    <Tooltip text="Edit title">
                        <button
                            type="button"
                            className="button is-small is-light"
                            onClick={() => setEditing(true)}
                            title="Edit title"
                        >
                            ✎
                        </button>
                    </Tooltip>
                </>
            ) : (
                <>
                    <input
                        className="input is-small mr-2"
                        style={{ width: "150px" }}
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave();
                            if (e.key === "Escape") setEditing(false);
                        }}
                        autoFocus
                    />
                    <button type="button" className="button is-small is-primary mr-1" onClick={handleSave}>
                        Save
                    </button>
                    <button type="button" className="button is-small" onClick={() => setEditing(false)}>
                        Cancel
                    </button>
                </>
            )}
        </div>
    );
}