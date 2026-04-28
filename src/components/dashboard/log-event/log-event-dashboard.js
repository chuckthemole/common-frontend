import React, { useEffect, useMemo, useState } from "react";
import { SingleSelector, ToggleSwitch } from "../../dashboard-elements";
import logger, { useScopedLogger } from "../../../logger";
import { LocalPersistence } from "../../../persistence";
import { getEventStore, eventRegistryManager } from "../../event-logger";
import { PortalContainer, Tooltip } from "../../ui";

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
    const eventStore = getEventStore(LocalPersistence);

    const [events, setEvents] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState("ALL");
    const [viewMode, setViewMode] = useState(initialViewMode);
    const [timestampFormat, setTimestampFormat] = useState(TimestampFormat.HUMAN);

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

    /**
     * Clear all events from storage + UI
     */
    const handleClearAll = async () => {
        SCOPED_LOGGER.info("Clearing all events");

        await eventStore.clear();
        setEvents([]);
        setSelectedEntity("ALL");
    };

    /**
     * Flatten event for table view
     */
    const flattenEvent = (event) => ({
        event: event.event,
        entity: event.entity,
        action: event.action,
        timestamp: event.timestamp,
        ...event.metadata,
        ...event.context
    });

    const tableRows = useMemo(
        () => filteredEvents.map(flattenEvent),
        [filteredEvents]
    );

    const allColumns = useMemo(() => {
        const keys = new Set();

        for (const row of tableRows) {
            Object.keys(row).forEach((k) => keys.add(k));
        }

        return Array.from(keys);
    }, [tableRows]);

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

    return (
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
                                />)}
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
                    <button
                        className="button is-danger"
                        onClick={handleClearAll}
                        disabled={!events.length}
                    >
                        Clear All
                    </button>
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
                            Showing {filteredEvents.length} event(s)
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
                                    filteredEvents.map((event, idx) => (
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
                                                        {col === "timestamp" ? (
                                                            <Tooltip
                                                                text={`Click to change format (current: ${timestampFormat})`}
                                                            >
                                                                <span
                                                                    onClick={cycleTimestampFormat}
                                                                    style={{
                                                                        cursor: "pointer",
                                                                        userSelect: "none",
                                                                        textDecoration: "underline dotted",
                                                                    }}
                                                                >
                                                                    {col}
                                                                </span>
                                                            </Tooltip>
                                                        ) : (
                                                            col
                                                        )}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {tableRows.map((row, idx) => (
                                                <tr
                                                    key={idx}
                                                    style={{
                                                        background:
                                                            idx % 2 === 0
                                                                ? "#ffffff"
                                                                : "#f7f7f7",
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
                                                            {useFormatTimestampOrJSONStringify(col, row)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}