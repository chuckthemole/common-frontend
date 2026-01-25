import React, {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import {
    JsonEditor,
    PortalContainer,
    useRumpusModal,
    ConfirmModal
} from "../ui";
import { SingleSelector } from "../dashboard-elements";
import logger from "../../logger";
import { tryParseJSON, stringifyValue, isLongValue } from "../../utils";

/* ============================================================
   Constants
   ============================================================ */

const SEARCH_SCOPES = {
    BOTH: "both",
    KEYS: "keys",
    VALUES: "values",
};

const PAGE_SIZE = 20; // Number of rows per page

/* ============================================================
   LocalStorageExplorer Component
   ============================================================ */

export default function LocalStorageExplorer() {

    const modalId = "clear-local-storage-confirm";
    const { openModal } = useRumpusModal();

    /* ------------------------
       State
    ------------------------ */
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [searchScope, setSearchScope] = useState(SEARCH_SCOPES.BOTH);
    const [expandedKeys, setExpandedKeys] = useState({});
    const [editingKey, setEditingKey] = useState(null);
    const [editingValue, setEditingValue] = useState(null);
    const [page, setPage] = useState(0); // Pagination page index

    /* ------------------------
       Load localStorage
    ------------------------ */
    const loadStorage = useCallback(() => {
        const result = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const rawValue = localStorage.getItem(key);
            const { parsed, isJson } = tryParseJSON(rawValue);

            result.push({ key, rawValue, value: parsed, isJson });
        }
        setItems(result);
        logger.debug("[LocalStorageExplorer] Loaded items", result);
    }, []);

    /* ------------------------
       Sync across tabs
    ------------------------ */
    useEffect(() => {
        loadStorage();
        const onStorage = (e) => {
            logger.debug("[LocalStorageExplorer] storage event", e);
            loadStorage();
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [loadStorage]);

    /* ------------------------
       Filtering
    ------------------------ */
    const filteredItems = useMemo(() => {
        if (!search.trim()) return items;

        const term = search.toLowerCase();
        return items.filter(({ key, value }) => {
            const keyMatch = key.toLowerCase().includes(term);
            const valueMatch = stringifyValue(value, true).toLowerCase().includes(term);

            switch (searchScope) {
                case SEARCH_SCOPES.KEYS:
                    return keyMatch;
                case SEARCH_SCOPES.VALUES:
                    return valueMatch;
                case SEARCH_SCOPES.BOTH:
                default:
                    return keyMatch || valueMatch;
            }
        });
    }, [items, search, searchScope]);

    /* ------------------------
       Paginate filtered items
    ------------------------ */
    const paginatedItems = useMemo(() => {
        const start = page * PAGE_SIZE;
        return filteredItems.slice(start, start + PAGE_SIZE);
    }, [filteredItems, page]);

    /* ------------------------
       Actions
    ------------------------ */
    const toggleExpand = (key) => {
        setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
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

    const handleClearAllConfirmed = () => {
        try {
            localStorage.clear();
            logger.warn("[LocalStorageExplorer] Cleared ALL localStorage");
            loadStorage();
        } catch (err) {
            logger.error("[LocalStorageExplorer] Failed to clear localStorage", err);
        }
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
                <h3 className="title is-5 mb-3">Local Storage Explorer</h3>
                <div className="columns is-mobile">
                    <div className="column is-two-thirds">
                        <input
                            className="input"
                            placeholder="Search…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        />
                    </div>
                    <div className="column">
                        <PortalContainer id="editor-dropdowns">
                            {(portalTarget) => (
                                <SingleSelector
                                    options={[
                                        { value: SEARCH_SCOPES.BOTH, label: "Keys & Values" },
                                        { value: SEARCH_SCOPES.KEYS, label: "Keys only" },
                                        { value: SEARCH_SCOPES.VALUES, label: "Values only" },
                                    ]}
                                    value={searchScope}
                                    onChange={(v) => { setSearchScope(v); setPage(0); }}
                                    placeholder="Search scope"
                                    portalTarget={portalTarget}
                                />
                            )}
                        </PortalContainer>
                    </div>
                </div>
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
                        {paginatedItems.map(({ key, value, isJson }) => {
                            const expanded = expandedKeys[key];
                            const long = isLongValue(value);

                            return (
                                <tr key={key}>
                                    <td className="has-text-weight-semibold">{key}</td>
                                    <td style={{ maxWidth: "480px" }}>
                                        {long && !expanded && (
                                            <div className="has-text-grey">
                                                {stringifyValue(value, true).slice(0, 120)}…
                                            </div>
                                        )}

                                        {(!long || expanded) && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <pre
                                                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, flex: 1 }}
                                                >
                                                    {stringifyValue(value, isJson)}
                                                </pre>

                                                {/* ---------- Color Picker ---------- */}
                                                {typeof value === "string" && /^#([0-9A-Fa-f]{3}){1,2}$/.test(value) && (
                                                    <input
                                                        type="color"
                                                        value={value}
                                                        onChange={(e) => {
                                                            const newColor = e.target.value;
                                                            localStorage.setItem(key, newColor);
                                                            loadStorage(); // refresh the state
                                                        }}
                                                        title="Edit color"
                                                        style={{ width: "36px", height: "36px", border: "none", padding: 0 }}
                                                    />
                                                )}
                                            </div>
                                        )}

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

                        {!paginatedItems.length && (
                            <tr>
                                <td colSpan={3} className="has-text-centered has-text-grey">
                                    No matching localStorage entries
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ---------- Pagination Controls ---------- */}
            {filteredItems.length > PAGE_SIZE && (
                <div className="mt-3 has-text-centered">
                    <button
                        className="button is-small mr-2"
                        onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        disabled={page === 0}
                    >
                        Previous
                    </button>
                    <button
                        className="button is-small"
                        onClick={() =>
                            setPage((p) => ((p + 1) * PAGE_SIZE >= filteredItems.length ? p : p + 1))
                        }
                        disabled={(page + 1) * PAGE_SIZE >= filteredItems.length}
                    >
                        Next
                    </button>
                    <p className="mt-1 is-size-7">
                        Page {page + 1} of {Math.ceil(filteredItems.length / PAGE_SIZE)}
                    </p>
                </div>
            )}

            {/* ---------- Footer ---------- */}
            <div className="mt-3 is-flex is-justify-content-space-between">
                <button className="button is-small" onClick={loadStorage}>
                    Reload
                </button>

                <button
                    className="button is-small is-danger is-light"
                    onClick={() => openModal(modalId)}
                >
                    Clear All Local Storage
                </button>
            </div>


            {/* ---------- JSON Editor ---------- */}
            {editingKey && (
                <div className="mt-5">
                    <div className="box">
                        <div className="level mb-3">
                            <div className="level-left">
                                <h4 className="title is-6">Editing JSON: {editingKey}</h4>
                            </div>
                            <div className="level-right">
                                <button className="button is-small" onClick={closeJsonEditor}>
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

            {/* ---------- Confirm Modal ---------- */}
            <ConfirmModal
                modalId={modalId}
                title="Clear all local storage?"
                danger
                confirmText="Yes, clear everything"
                cancelText="Cancel"
                draggable
                message={
                    <>
                        <p>
                            This will permanently delete <strong>ALL localStorage entries</strong>
                            for this site.
                        </p>
                        <p className="mt-2">
                            This action cannot be undone.
                        </p>
                    </>
                }
                onConfirm={handleClearAllConfirmed}
            />
        </div>
    );
}
