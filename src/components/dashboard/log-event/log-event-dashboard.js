import React, { useEffect, useMemo, useState } from "react";
import { SingleSelector, ToggleSwitch } from "../../dashboard-elements";
import logger, { useScopedLogger } from "../../../logger";
import { LocalPersistence } from "../../../persistence";
import { getEventStore, eventRegistryManager, EventLoggerRetentionModal } from "../../event-logger";
import {
    useToast,
    ConfirmModal,
    PortalContainer,
    Tooltip,
    useRumpusModal,
    DurationInput
} from "../../ui";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faInfo } from "@fortawesome/free-solid-svg-icons";
import {
    TimestampFormat,
    formatTimestamp,
    cycleTimestampFormat,
    filterEvents,
    sortRows,
    getColumns,
    highlightText
} from "../../../utils";

import { flattenEvent, isHomogeneousMetadata } from "../../event-logger";

export const EventViewMode = Object.freeze({
    JSON: "json",
    TABLE: "table",
    TIMELINE: "timeline", // TODO: not implemented
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
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
    const toast = useToast();

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

    const searchedEvents = useMemo(() => {
        if (!debouncedQuery.trim()) return filteredEvents;

        return filterEvents(
            filteredEvents,
            debouncedQuery,
            (event) => ({
                timestamp: event.timestamp,
                id: event.context?.userId ?? "",
                username: event.context?.username ?? "",
                component: event.entity ?? "",
                action: event.action ?? "",
                ...event.metadata,
            })
        );
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

    const tableRows = useMemo(() => {
        const isHomogeneous = isHomogeneousMetadata(searchedEvents);

        const rows = searchedEvents.map((event) =>
            flattenEvent(event, { isHomogeneous })
        );

        return sortRows(rows, sortConfig);
    }, [searchedEvents, sortConfig]);

    const getSortIndicator = (col) => {
        const isActive = sortConfig.key === col;

        return (
            <span
                className={
                    `inspection-table__sort-indicator ${isActive
                        ? "inspection-table__sort-indicator--active"
                        : ""
                    }`
                }
            >
                <span className="inspection-table__sort-indicator-top">
                    ▴
                </span>

                <span>
                    ▾
                </span>
            </span>
        );
    };

    const allColumns = useMemo(() => {
        return getColumns(tableRows);
    }, [tableRows]);

    const renderCell = (col, row) => {
        if (col === "timestamp") {
            return formatTimestamp(row[col], timestampFormat);
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

        return (
            <span
                dangerouslySetInnerHTML={{
                    __html: highlightText(value, searchQuery),
                }}
            />
        );
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
                {
                    /* =========================================================
                    STICKY TOP BAR
                    ========================================================= */
                }
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
                                alignItems: "center",
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
                                placement="bottom-right"
                                rotatable
                                animated
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

                            <EventLoggerRetentionModal />

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
                            <div className="inspection-table-container">
                                {/* ensures table can expand horizontally */}
                                <div className="inspection-table-inner">
                                    {/* ================= JSON VIEW ================= */}
                                    {viewMode === EventViewMode.JSON &&
                                        searchedEvents.map((event, idx) => (
                                            <pre
                                                key={event.key || idx}
                                                className="inspection-table__json-row"
                                            >
                                                {JSON.stringify(event, null, 2)}
                                            </pre>
                                        ))}

                                    {/* ================= TABLE VIEW ================= */}
                                    {viewMode === "table" && (
                                        <table className="table is-fullwidth is-narrow inspection-table">
                                            <thead>
                                                <tr>
                                                    {allColumns.map((col) => (
                                                        <th key={col}>
                                                            <div className="inspection-table__header-content">
                                                                {/* Sortable column label */}
                                                                <span
                                                                    onClick={() => handleSort(col)}
                                                                    className="inspection-table__sort-trigger"
                                                                >
                                                                    {col}
                                                                    {getSortIndicator(col)}
                                                                </span>

                                                                {col === "timestamp" && (
                                                                    <Tooltip text="Cycle timestamp format">
                                                                        <span
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setTimestampFormat((prev) => cycleTimestampFormat(prev));
                                                                            }}
                                                                            className="inspection-table__timestamp-toggle"
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
                                                            <tr className="inspection-table__row">
                                                                {allColumns.map((col) => (
                                                                    <td key={col}>
                                                                        {renderCell(col, rowWithIndex)}
                                                                    </td>
                                                                ))}
                                                            </tr>

                                                            {/* -------- EXPANDED METADATA ROW -------- */}
                                                            {expandedRowIndex === idx && row.metadata && (
                                                                <tr>
                                                                    <td
                                                                        colSpan={allColumns.length}
                                                                        className="inspection-table__expanded-cell"
                                                                    >
                                                                        <pre className="inspection-table__expanded-content">
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
                        toast.success(
                            "All saved logs have been cleared.",
                            {
                                position: "bottom-center",
                                width: "full",
                                duration: null
                            }
                        );
                    } catch (err) {
                        SCOPED_LOGGER.error("Failed to clear logs:", err);
                        setError("Failed to clear saved logs.");
                    }
                }}
            />
        </>
    );
}