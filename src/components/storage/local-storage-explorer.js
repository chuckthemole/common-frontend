import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { JsonEditor } from "../ui";
import logger from "../../logger";
import {
    tryParseJSON,
    stringifyValue,
    isLongValue,
} from "../../utils";

/* ============================================================
   LocalStorageExplorer
   ============================================================ */

export default function LocalStorageExplorer() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [expandedKeys, setExpandedKeys] = useState({});

    // JSON editor state (progressive disclosure)
    const [editingKey, setEditingKey] = useState(null);
    const [editingValue, setEditingValue] = useState(null);

    /* ------------------------------------------------------------
       Load localStorage into memory
    ------------------------------------------------------------ */
    const loadStorage = useCallback(() => {
        const result = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const rawValue = localStorage.getItem(key);

            const { parsed, isJson } = tryParseJSON(rawValue);

            result.push({
                key,
                rawValue,
                value: parsed,
                isJson,
            });
        }

        setItems(result);
        logger.debug("[LocalStorageExplorer] Loaded items", result);
    }, []);

    /* ------------------------------------------------------------
       Effects
    ------------------------------------------------------------ */
    useEffect(() => {
        loadStorage();

        // Sync across tabs/windows
        const onStorage = (e) => {
            logger.debug("[LocalStorageExplorer] storage event", e);
            loadStorage();
        };

        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [loadStorage]);

    /* ------------------------------------------------------------
       Filtering
    ------------------------------------------------------------ */
    const filteredItems = useMemo(() => {
        if (!search.trim()) return items;

        const term = search.toLowerCase();

        return items.filter(({ key, value }) => {
            const valueStr = stringifyValue(value, true).toLowerCase();
            return (
                key.toLowerCase().includes(term) ||
                valueStr.includes(term)
            );
        });
    }, [items, search]);

    /* ------------------------------------------------------------
       Actions
    ------------------------------------------------------------ */
    const toggleExpand = (key) => {
        setExpandedKeys((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleCopy = async (value) => {
        const text = stringifyValue(value, true);
        try {
            await navigator.clipboard.writeText(text);
            logger.debug("[LocalStorageExplorer] Copied value");
        } catch (err) {
            logger.error("[LocalStorageExplorer] Copy failed", err);
        }
    };

    const handleDelete = (key) => {
        localStorage.removeItem(key);
        logger.info("[LocalStorageExplorer] Deleted key", key);
        loadStorage();
    };

    const openJsonEditor = (key, value) => {
        setEditingKey(key);
        setEditingValue(value);
        logger.debug("[LocalStorageExplorer] Editing JSON key", key);
    };

    const closeJsonEditor = () => {
        setEditingKey(null);
        setEditingValue(null);
    };

    const saveJsonEditor = async (newData) => {
        try {
            localStorage.setItem(editingKey, JSON.stringify(newData));
            logger.info("[LocalStorageExplorer] Saved JSON key", editingKey);
            closeJsonEditor();
            loadStorage();
        } catch (err) {
            logger.error("[LocalStorageExplorer] Failed to save JSON", err);
        }
    };

    /* ============================================================
       Render
       ============================================================ */

    return (
        <div className="box local-storage-explorer">
            {/* ---------- Header ---------- */}
            <div className="mb-4">
                <h3 className="title is-5 mb-2">Local Storage Explorer</h3>
                <input
                    className="input"
                    placeholder="Search keys or values…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* ---------- Table ---------- */}
            <div className="table-container">
                <table className="table is-fullwidth is-striped">
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Value</th>
                            <th className="has-text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredItems.map(({ key, value, isJson }) => {
                            const expanded = expandedKeys[key];
                            const long = isLongValue(value);

                            return (
                                <tr key={key}>
                                    <td className="has-text-weight-semibold">
                                        {key}
                                    </td>

                                    <td style={{ maxWidth: "480px" }}>
                                        {/* Collapsed preview */}
                                        {long && !expanded && (
                                            <div className="has-text-grey">
                                                {stringifyValue(value, true).slice(0, 120)}…
                                            </div>
                                        )}

                                        {/* Expanded or short value */}
                                        {(!long || expanded) && (
                                            <pre
                                                style={{
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                    margin: 0,
                                                }}
                                            >
                                                {stringifyValue(value, isJson)}
                                            </pre>
                                        )}

                                        {/* Expand / collapse */}
                                        {long && (
                                            <button
                                                className="button is-text is-small px-0 mt-1"
                                                onClick={() => toggleExpand(key)}
                                            >
                                                {expanded ? "Collapse" : "Expand"}
                                            </button>
                                        )}
                                    </td>

                                    <td className="has-text-right">
                                        <div className="buttons is-right">
                                            {isJson && (
                                                <button
                                                    className="button is-small is-info"
                                                    onClick={() => openJsonEditor(key, value)}
                                                >
                                                    Edit JSON
                                                </button>
                                            )}
                                            <button
                                                className="button is-small"
                                                onClick={() => handleCopy(value)}
                                            >
                                                Copy
                                            </button>
                                            <button
                                                className="button is-small is-danger is-light"
                                                onClick={() => handleDelete(key)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {!filteredItems.length && (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="has-text-centered has-text-grey"
                                >
                                    No matching localStorage entries
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ---------- Footer ---------- */}
            <div className="mt-3">
                <button className="button is-small" onClick={loadStorage}>
                    Reload
                </button>
            </div>

            {/* ---------- JSON Editor Panel ---------- */}
            {editingKey && (
                <div className="mt-5">
                    <div className="box">
                        <div className="level mb-3">
                            <div className="level-left">
                                <h4 className="title is-6">
                                    Editing JSON: {editingKey}
                                </h4>
                            </div>
                            <div className="level-right">
                                <button
                                    className="button is-small"
                                    onClick={closeJsonEditor}
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <JsonEditor
                            data={editingValue}
                            title="LocalStorage JSON"
                            onChange={setEditingValue}
                            onSave={saveJsonEditor}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
