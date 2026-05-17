import React, {
    useState,
    useMemo,
    useCallback,
    useRef,
} from "react";

import PropTypes from "prop-types";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faPlus,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

const DEFAULT_PALETTE = [
    "danger",
    "warning",
    "info",
    "success",
    "purple",
    "dark",
];

export const CHIP_COLOR_PALETTE = [
    "blue",
    "yellow",
    "purple",
    "green",
    "red",
    "cyan",
    "orange",
    "indigo",
    "lime",
    "rose",
    "teal",
    "pink",
    "emerald",
    "fuchsia",
    "amber",
    "violet",
    "sky",
    "coral",
    "slate",
    "mint",
    "gray",
    "lavender",
    "stone",
    "zinc",
];

/**
 * -----------------------------------------------------------------------------
 * ChipInput
 * -----------------------------------------------------------------------------
 *
 * Generic reusable chip/tag/token input.
 *
 * Supports:
 *  - removable chips
 *  - addable chips
 *  - readonly mode
 *  - keyboard add
 *  - custom colors
 *  - custom placeholder
 *  - generic item support
 *
 * Examples:
 *
 * <ChipInput
 *     items={["admin", "manager"]}
 * />
 *
 * <ChipInput
 *     items={[
 *         { label: "Admin", color: "danger" },
 *         { label: "User", color: "info" },
 *     ]}
 * />
 *
 * <ChipInput
 *     editable
 *     addable
 *     removable
 * />
 */
export default function ChipInput({
    items = [],
    placeholder = "Add item...",
    addLabel = "Add",
    editable = false,
    removable = false,
    addable = false,
    readonly = false,
    disabled = false,
    size = "medium",
    variant = "default",
    className,
    style,
    assignColors = false,
    colorPalette = [],

    /**
     * Callbacks
     */
    onAdd,
    onRemove,
    onClickChip,
}) {

    /**
     * -------------------------------------------------------------------------
     * Colors
     * -------------------------------------------------------------------------
     */
    const colorMapRef = useRef(new Map());
    const paletteIndexRef = useRef(0);

    const getColorForItem = useCallback((item) => {
        if (item.color) return item.color;

        const key = item.value || item.id || item.label;

        const existing = colorMapRef.current.get(key);
        if (existing) return existing;

        const palette =
            colorPalette?.length
                ? colorPalette
                : DEFAULT_PALETTE;

        const color = palette[paletteIndexRef.current % palette.length];
        paletteIndexRef.current += 1;

        colorMapRef.current.set(key, color);

        return color;
    }, [colorPalette]);

    /**
     * -------------------------------------------------------------------------
     * State
     * -------------------------------------------------------------------------
     */

    const [draftValue, setDraftValue] = useState("");

    /**
     * -------------------------------------------------------------------------
     * Normalized Items
     * -------------------------------------------------------------------------
     */
    const normalizedItems = useMemo(() => {
        return items.map((item) => {
            const normalized =
                typeof item === "string"
                    ? {
                        id: item,
                        label: item,
                        value: item,
                    }
                    : {
                        id: item.id ?? item.value ?? item.label,
                        label: item.label ?? String(item.value),
                        value: item.value ?? item.label,
                        disabled: item.disabled,
                    };

            return {
                ...normalized,
                color: assignColors
                    ? getColorForItem(normalized)
                    : item.color,
            };
        });
    }, [items, assignColors, getColorForItem]);

    /**
     * -------------------------------------------------------------------------
     * Add
     * -------------------------------------------------------------------------
     */

    const handleAdd = useCallback(() => {

        if (
            readonly ||
            disabled ||
            !editable ||
            !addable
        ) {
            return;
        }

        const trimmed = draftValue.trim();

        if (!trimmed) {
            return;
        }

        onAdd?.(trimmed);

        setDraftValue("");

    }, [
        readonly,
        disabled,
        editable,
        addable,
        draftValue,
        onAdd,
    ]);

    /**
     * -------------------------------------------------------------------------
     * Remove
     * -------------------------------------------------------------------------
     */

    const handleRemove = useCallback((item, e) => {

        e.stopPropagation();

        if (
            readonly ||
            disabled ||
            !editable ||
            !removable
        ) {
            return;
        }

        onRemove?.(item);

    }, [
        readonly,
        disabled,
        editable,
        removable,
        onRemove,
    ]);

    /**
     * -------------------------------------------------------------------------
     * KeyDown
     * -------------------------------------------------------------------------
     */

    const handleKeyDown = useCallback((e) => {

        if (
            !editable ||
            !addable
        ) {
            return;
        }

        /**
         * Add on enter
         */
        if (e.key === "Enter") {

            e.preventDefault();

            handleAdd();
        }

    }, [
        editable,
        addable,
        handleAdd,
    ]);

    /**
     * -------------------------------------------------------------------------
     * Classes
     * -------------------------------------------------------------------------
     */

    const containerClass = classNames(
        "chip-input",
        className,
        {
            "chip-input-small":
                size === "small",

            "chip-input-medium":
                size === "medium",

            "chip-input-large":
                size === "large",

            "chip-input-disabled":
                disabled,

            "chip-input-readonly":
                readonly,
        }
    );

    /**
     * -------------------------------------------------------------------------
     * Render
     * -------------------------------------------------------------------------
     */

    return (
        <div
            className={containerClass}
            style={style}
        >

            {
                normalizedItems.map((item) => {

                    const chipClass = classNames(
                        "chip-input-chip",
                        {
                            [`chip-${item.color}`]:
                                item.color,

                            "chip-clickable":
                                !!onClickChip,

                            "chip-disabled":
                                item.disabled,
                        }
                    );

                    return (
                        <div
                            key={item.id}
                            className={chipClass}
                            onClick={() => {

                                if (item.disabled) {
                                    return;
                                }

                                onClickChip?.(item);
                            }}
                        >

                            {/* LABEL */}

                            <span className="chip-label">
                                {item.label}
                            </span>

                            {/* REMOVE */}

                            {
                                editable &&
                                removable &&
                                !readonly &&
                                !item.disabled && (
                                    <button
                                        type="button"
                                        className="chip-remove"
                                        onClick={(e) =>
                                            handleRemove(item, e)
                                        }
                                    >

                                        <FontAwesomeIcon
                                            icon={faXmark}
                                        />

                                    </button>
                                )
                            }

                        </div>
                    );
                })
            }

            {/* -----------------------------------------------------------------
                ADD INPUT
            ------------------------------------------------------------------ */}

            {
                editable &&
                addable &&
                !readonly && (
                    <div className="chip-input-add">

                        <input
                            type="text"
                            value={draftValue}
                            placeholder={placeholder}
                            disabled={disabled}
                            onChange={(e) =>
                                setDraftValue(e.target.value)
                            }
                            onKeyDown={handleKeyDown}
                        />

                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={disabled}
                        >

                            <FontAwesomeIcon
                                icon={faPlus}
                            />

                            <span>
                                {addLabel}
                            </span>

                        </button>

                    </div>
                )
            }

        </div>
    );
}

ChipInput.propTypes = {
    items: PropTypes.array,

    placeholder: PropTypes.string,
    addLabel: PropTypes.string,

    editable: PropTypes.bool,
    removable: PropTypes.bool,
    addable: PropTypes.bool,

    readonly: PropTypes.bool,
    disabled: PropTypes.bool,

    size: PropTypes.oneOf([
        "small",
        "medium",
        "large",
    ]),

    variant: PropTypes.string,

    className: PropTypes.string,
    style: PropTypes.object,

    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    onClickChip: PropTypes.func,
};