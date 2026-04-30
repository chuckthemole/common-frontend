import React, { useEffect, useMemo, useState } from "react";
import { SingleSelector, ToggleSwitch } from "../../dashboard-elements";
import logger, { useScopedLogger } from "../../../logger";
import { LocalPersistence } from "../../../persistence";
import { getEventStore, eventRegistryManager } from "../../event-logger";
import { Alert, ConfirmModal, PortalContainer, Tooltip, useRumpusModal } from "../../ui";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faInfo } from "@fortawesome/free-solid-svg-icons";

export const EventViewMode = Object.freeze({
    JSON: "json",
    TABLE: "table",
    TIMELINE: "timeline", // TODO: not implemented
});

export const TimestampFormat = Object.freeze({
    ISO: "iso",                 // raw (what you have now)
    HUMAN: "human",             // locale string
    RELATIVE: "relative",       // "2m ago"
});

/**
 * EventDashboard
 * -----------------------------------------------------------------------------
 * A debugging/inspection UI for persisted event logs.
 *
 * Features:
 *  - Entity-based filtering
 *  - JSON / Table toggle view
 *  - Horizontal + vertical scroll safe rendering
 *  - Sticky control bar for usability on large datasets
 */
export default function EventDashboard({
    initialViewMode = EventViewMode.TABLE
}) {
    const SCOPED_LOGGER = useScopedLogger("EventDashboard", logger);
    const { openModal } = useRumpusModal();
    const eventStore = getEventStore(LocalPersistence);
    const [events, setEvents] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState("ALL");
    const [viewMode, setViewMode] = useState(initialViewMode);
    const [timestampFormat, setTimestampFormat] = useState(TimestampFormat.HUMAN);
    const [expandedRowIndex, setExpandedRowIndex] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

    // sorting state
    const [sortConfig, setSortConfig] = useState({
        key: "timestamp",
        direction: "desc",
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 250); // 200–300ms

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    /**
     * Load persisted events on mount
     */
    useEffect(() => {
        const loadEvents = async () => {
            SCOPED_LOGGER.debug("Loading events");

            try {
                const all = await eventStore.getAll();

                SCOPED_LOGGER.debug("Loaded events:", all?.length ?? 0);
                SCOPED_LOGGER.debug("Events: ", all);
                setEvents(all || []);
            } catch (err) {
                SCOPED_LOGGER.error("Failed to load events", err);
            } finally {
                SCOPED_LOGGER.debug("Finished loadEvents");
            }
        };

        loadEvents();
    }, [eventStore]);

    /**
     * Build entity dropdown options from event registry
     */
    const entityOptions = useMemo(() => {
        const entities = new Set();

        for (const e of events) {
            const entity = eventRegistryManager.getEntity?.(e?.event);
            if (entity) entities.add(entity);
        }

        return [
            { value: "ALL", label: "All Entities" },
            ...Array.from(entities).map((entity) => ({
                value: entity,
                label: entity,
            })),
        ];
    }, [events]);

    /**
     * Filter events by selected entity
     */
    const filteredEvents = useMemo(() => {
        if (selectedEntity === "ALL") return events;

        return events.filter((e) => {
            const entity = eventRegistryManager.getEntity?.(e.event);
            return entity === selectedEntity;
        });
    }, [events, selectedEntity]);

    const parseSearchQuery = (query) => {
        const tokens = query
            .toLowerCase()
            .split(" ")
            .map(t => t.trim())
            .filter(Boolean);

        const structured = {};
        const freeText = [];

        for (const token of tokens) {
            const [key, value] = token.split(":");

            if (value) {
                structured[key] = value;
            } else {
                freeText.push(token);
            }
        }

        return { structured, freeText };
    };

    const searchedEvents = useMemo(() => {
        if (!debouncedQuery.trim()) return filteredEvents;

        const { structured, freeText } = parseSearchQuery(debouncedQuery);

        return filteredEvents.filter((event) => {
            const flat = {
                timestamp: event.timestamp,
                id: event.context?.userId ?? "",
                username: event.context?.username ?? "",
                component: event.entity ?? "",
                action: event.action ?? "",
                ...event.metadata,
            };

            // structured filters (username:john)
            for (const key in structured) {
                const val = flat[key];
                if (!val || !String(val).toLowerCase().includes(structured[key])) {
                    return false;
                }
            }

            if (freeText.length > 0) {
                const combined = Object.values(flat)
                    .map(v =>
                        typeof v === "object"
                            ? JSON.stringify(v)
                            : String(v)
                    )
                    .join(" ")
                    .toLowerCase();

                return freeText.every(term => combined.includes(term));
            }

            return true;
        });
    }, [filteredEvents, debouncedQuery]);

    /**
     * Clear all events from storage + UI
     */
    const handleClearAll = async () => {
        SCOPED_LOGGER.info("Clearing all events");
        openModal("clearLogsModal");
    };

    const handleSort = (col) => {
        setSortConfig((prev) => {
            if (prev.key === col) {
                return {
                    key: col,
                    direction: prev.direction === "asc" ? "desc" : "asc",
                };
            }

            return {
                key: col,
                direction: "asc",
            };
        });
    };

    const isHomogeneous = useMemo(() => {
        if (!filteredEvents.length) return true;

        const firstKeys = Object.keys(filteredEvents[0]?.metadata || {}).sort().join(",");

        return filteredEvents.every(e => {
            const keys = Object.keys(e?.metadata || {}).sort().join(",");
            return keys === firstKeys;
        });
    }, [filteredEvents]);

    /**
     * Flatten event for table view
     */
    const flattenEvent = (event) => {
        const base = {
            timestamp: event.timestamp,
            ID: event.context?.userId ?? null,
            username: event.context?.username ?? null,
            component: event.entity,
            action: event.action,
        };

        if (isHomogeneous) {
            return {
                ...base,
                ...event.metadata,
            };
        }

        return {
            ...base,
            metadata: event.metadata,
        };
    };

    const tableRows = useMemo(() => {
        const rows = searchedEvents.map(flattenEvent);

        if (!sortConfig?.key) return rows;

        const sorted = [...rows].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (sortConfig.key === "timestamp") {
                return new Date(aVal) - new Date(bVal);
            }

            if (typeof aVal === "number" && typeof bVal === "number") {
                return aVal - bVal;
            }

            return String(aVal).localeCompare(String(bVal));
        });

        return sortConfig.direction === "asc" ? sorted : sorted.reverse();
    }, [searchedEvents, sortConfig]);

    const getSortIndicator = (col) => {
        const isActive = sortConfig.key === col;

        return (
            <span
                style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    marginLeft: "4px",
                    lineHeight: "8px",
                    opacity: isActive ? 0.9 : 0.25,
                    transform: "translateY(-1px)",
                    fontSize: "10px",
                    userSelect: "none",
                }}
            >
                <span style={{ marginBottom: "-2px" }}>▴</span>
                <span>▾</span>
            </span>
        );
    };

    const allColumns = useMemo(() => {
        const keys = new Set();

        for (const row of tableRows) {
            Object.keys(row).forEach((k) => keys.add(k));
        }

        return Array.from(keys);
    }, [tableRows]);

    const highlightText = (text) => {
        if (!debouncedQuery.trim()) return text;

        const terms = searchQuery
            .toLowerCase()
            .split(" ")
            .filter(Boolean);

        let str = String(text);

        for (const term of terms) {
            const regex = new RegExp(`(${term})`, "gi");
            str = str.replace(regex, "<mark>$1</mark>");
        }

        return <span dangerouslySetInnerHTML={{ __html: str }} />;
    };

    const renderCell = (col, row) => {
        if (col === "timestamp") {
            return formatTimestamp(row[col]);
        }

        if (col === "metadata" && typeof row[col] === "object") {
            return (
                <button
                    className="button is-small is-light"
                    onClick={() =>
                        setExpandedRowIndex(prev =>
                            prev === row.__index ? null : row.__index
                        )
                    }
                >
                    {expandedRowIndex === row.__index ? "Hide" : "View"}
                </button>
            );
        }

        const value =
            typeof row[col] === "object"
                ? JSON.stringify(row[col])
                : String(row[col] ?? "");

        return highlightText(value);
    };

    const formatTimestamp = (ts) => {
        if (!ts) return "";

        const date = new Date(ts);

        switch (timestampFormat) {
            case TimestampFormat.ISO:
                return date.toISOString();

            case TimestampFormat.HUMAN:
                return date.toLocaleString();

            case TimestampFormat.RELATIVE: {
                const diff = Date.now() - date.getTime();
                const seconds = Math.floor(diff / 1000);

                if (seconds < 60) return `${seconds}s ago`;
                if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
                if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
                return `${Math.floor(seconds / 86400)}d ago`;
            }

            default:
                return ts;
        }
    };

    const cycleTimestampFormat = () => {
        setTimestampFormat((prev) => {
            switch (prev) {
                case TimestampFormat.HUMAN:
                    return TimestampFormat.RELATIVE;
                case TimestampFormat.RELATIVE:
                    return TimestampFormat.ISO;
                default:
                    return TimestampFormat.HUMAN;
            }
        });
    };

    const useFormatTimestampOrJSONStringify = (col, row) => {
        if (col === "timestamp") {
            return formatTimestamp(row[col]);
        }

        return typeof row[col] === "object"
            ? JSON.stringify(row[col])
            : String(row[col] ?? "");
    };

    const isJson = viewMode === EventViewMode.JSON;
    const isTyping = searchQuery !== debouncedQuery;

    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    overflow: "hidden",
                }}
            >
                {/* =========================================================
                STICKY TOP BAR
            ========================================================= */}
                <div
                    className="box"
                    style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem",
                        flexWrap: "wrap",
                    }}
                >
                    <h2 className="title is-5 mb-0">Events</h2>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                            width: "100%",
                        }}
                    >
                        {/* ================= SEARCH ROW ================= */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "8px",
                                width: "100%",
                            }}
                        >
                            <Tooltip
                                text={
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: "6px" }}>
                                            Search tips
                                        </div>

                                        <ul
                                            style={{
                                                paddingLeft: "18px",
                                                margin: 0,
                                                listStyleType: "disc", // force bullets
                                            }}
                                        >
                                            <li><code>john</code> → search all fields</li>
                                            <li><code>username:john</code></li>
                                            <li><code>action:click</code></li>
                                            <li><code>component:button</code></li>
                                            <li><code>john error</code> → multi-term</li>
                                        </ul>
                                    </div>
                                }
                                variant="info"
                                size="large"
                                placement="bottom-left"
                                rotatable
                                debug
                            >
                                <span
                                    style={{
                                        cursor: "pointer",
                                        // fontSize: "12px",
                                        // opacity: 0.6,
                                        userSelect: "none",
                                    }}
                                >
                                    <FontAwesomeIcon icon={faInfo} />
                                </span>
                            </Tooltip>
                            <input
                                className="input"
                                type="text"
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    flex: 1,
                                    minWidth: "200px",
                                }}
                            />

                            {isTyping && (
                                <span style={{ fontSize: "11px", opacity: 0.5 }}>
                                    filtering...
                                </span>
                            )}
                        </div>

                        {/* ================= FILTER ROW ================= */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                flexWrap: "wrap",
                            }}
                        >
                            {/* Entity filter */}
                            <div style={{ minWidth: "220px" }}>
                                <PortalContainer id="editor-dropdowns">
                                    {(portalTarget) => (
                                        <SingleSelector
                                            options={entityOptions}
                                            value={selectedEntity}
                                            onChange={setSelectedEntity}
                                            placeholder="Select entity..."
                                            searchable
                                            portalTarget={portalTarget}
                                        />
                                    )}
                                </PortalContainer>
                            </div>

                            {/* View toggle */}
                            <Tooltip
                                text={
                                    isJson
                                        ? "Switch to table view (flattened rows)"
                                        : "Switch to JSON view (raw event payloads)"
                                }
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        padding: "6px 10px",
                                        border: "1px solid #e5e5e5",
                                        borderRadius: "6px",
                                        background: "#fafafa",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            opacity: isJson ? 0.5 : 1,
                                            fontWeight: !isJson ? 600 : 400,
                                        }}
                                    >
                                        Rows
                                    </span>

                                    <ToggleSwitch
                                        checked={isJson}
                                        onChange={(checked) =>
                                            setViewMode(
                                                checked ? EventViewMode.JSON : EventViewMode.TABLE
                                            )
                                        }
                                    />

                                    <span
                                        style={{
                                            fontSize: "12px",
                                            opacity: isJson ? 1 : 0.5,
                                            fontWeight: isJson ? 600 : 400,
                                        }}
                                    >
                                        JSON
                                    </span>
                                </div>
                            </Tooltip>

                            {/* Clear */}
                            <Tooltip text="Delete all saved logs">
                                <button
                                    className="button is-danger"
                                    onClick={handleClearAll}
                                    disabled={!events.length}
                                >
                                    Clear All
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                {/* =========================================================
                MAIN CONTENT AREA
            ========================================================= */}
                <div
                    style={{
                        flex: 1,
                        padding: "1.5rem",
                        minWidth: 0,
                        overflow: "hidden",
                    }}
                >
                    {!filteredEvents.length ? (
                        <p className="has-text-grey">No events found.</p>
                    ) : (
                        <>
                            <h3 className="title is-6 mb-3">
                                Showing {searchedEvents.length} event(s)
                            </h3>

                            {/* Scroll container */}
                            <div
                                style={{
                                    maxHeight: "70vh",
                                    overflowY: "auto",
                                    overflowX: "auto",
                                    border: "1px solid #eee",
                                    borderRadius: "6px",
                                }}
                            >
                                {/* ensures table can expand horizontally */}
                                <div style={{ minWidth: "100%", width: "max-content" }}>
                                    {/* ================= JSON VIEW ================= */}
                                    {viewMode === EventViewMode.JSON &&
                                        searchedEvents.map((event, idx) => (
                                            <pre
                                                key={event.key || idx}
                                                style={{
                                                    margin: 0,
                                                    padding: "10px",
                                                    fontSize: "12px",
                                                    background: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                                                    borderBottom: "1px solid #eee",
                                                    whiteSpace: "pre",
                                                }}
                                            >
                                                {JSON.stringify(event, null, 2)}
                                            </pre>
                                        ))}

                                    {/* ================= TABLE VIEW ================= */}
                                    {viewMode === "table" && (
                                        <table
                                            className="table is-fullwidth is-narrow"
                                            style={{
                                                margin: 0,
                                                minWidth: "100%",
                                            }}
                                        >
                                            <thead>
                                                <tr>
                                                    {allColumns.map((col) => (
                                                        <th key={col}>
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "6px",
                                                                    width: "100%",
                                                                }}
                                                            >
                                                                {/* Sortable column label */}
                                                                <span
                                                                    onClick={() => handleSort(col)}
                                                                    style={{
                                                                        cursor: "pointer",
                                                                        userSelect: "none",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "4px",
                                                                    }}
                                                                >
                                                                    {col}
                                                                    {getSortIndicator(col)}
                                                                </span>

                                                                {col === "timestamp" && (
                                                                    <Tooltip text="Cycle timestamp format">
                                                                        <span
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                cycleTimestampFormat();
                                                                            }}
                                                                            style={{
                                                                                cursor: "pointer",
                                                                                // fontSize: "11px",
                                                                                // opacity: 0.55,
                                                                                userSelect: "none",
                                                                                paddingLeft: "4px",
                                                                                lineHeight: 1,
                                                                            }}
                                                                        >
                                                                            <FontAwesomeIcon icon={faClock} />
                                                                        </span>
                                                                    </Tooltip>
                                                                )}

                                                            </div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {tableRows.map((row, idx) => {
                                                    // attach index so renderCell can access it
                                                    const rowWithIndex = { ...row, __index: idx };

                                                    return (
                                                        <React.Fragment key={idx}>
                                                            {/* -------- MAIN ROW -------- */}
                                                            <tr
                                                                style={{
                                                                    background: idx % 2 === 0 ? "#ffffff" : "#f7f7f7",
                                                                }}
                                                            >
                                                                {allColumns.map((col) => (
                                                                    <td
                                                                        key={col}
                                                                        style={{
                                                                            whiteSpace: "nowrap",
                                                                            fontSize: "13px",
                                                                            maxWidth: "300px",
                                                                            overflow: "hidden",
                                                                            textOverflow: "ellipsis",
                                                                        }}
                                                                    >
                                                                        {renderCell(col, rowWithIndex)}
                                                                    </td>
                                                                ))}
                                                            </tr>

                                                            {/* -------- EXPANDED METADATA ROW -------- */}
                                                            {expandedRowIndex === idx && row.metadata && (
                                                                <tr>
                                                                    <td colSpan={allColumns.length}>
                                                                        <pre
                                                                            style={{
                                                                                margin: 0,
                                                                                padding: "12px",
                                                                                fontSize: "12px",
                                                                                background: "#fafafa",
                                                                                borderTop: "1px solid #eee",
                                                                                whiteSpace: "pre-wrap",
                                                                                wordBreak: "break-word",
                                                                            }}
                                                                        >
                                                                            {JSON.stringify(row.metadata, null, 2)}
                                                                        </pre>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {successMessage && (
                        <Alert
                            message={successMessage}
                            type="success"
                            persistent={false}
                            size="medium"
                            position="bottom"
                            onClose={() => setSuccessMessage(null)}
                        />
                    )}

                </div>
            </div>

            <ConfirmModal
                modalId="clearLogsModal"
                title="Delete All Logs?"
                message="This will permanently delete ALL saved logs. Are you sure?"
                confirmText="Delete All"
                cancelText="Cancel"
                danger
                onConfirm={async () => {
                    try {
                        await eventStore.clear();
                        setEvents([]);
                        setSelectedEntity("ALL");
                        setSuccessMessage("All saved logs have been cleared.");
                    } catch (err) {
                        SCOPED_LOGGER.error("Failed to clear logs:", err);
                        setError("Failed to clear saved logs.");
                    }
                }}
            />
        </>
    );
}