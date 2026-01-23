import { useCallback } from "react";
import { DEFAULT_PAGE } from "./personal-page.schema";
import logger from "../../../logger";

/**
 * usePageSections
 *
 * Domain-level hook for reading and mutating `page.sections`.
 *
 * Responsibilities:
 * - Centralize section lookup logic
 * - Provide safe fallbacks for missing sections
 * - Perform targeted, non-destructive updates
 * - Emit debug logs at mutation boundaries
 */
export function usePageSections(page, setPage) {
    /* ============================================================
       Internal helpers
       ============================================================ */

    /**
     * Safely resolve the sections array from page state
     */
    const getSections = () => {
        if (!page || !Array.isArray(page.sections)) {
            logger.warn("[usePageSections] page.sections is missing or invalid", {
                page,
            });
            return [];
        }
        return page.sections;
    };

    /* ============================================================
       Read helpers
       ============================================================ */

    /**
     * Find a section by ID (unsafe: may return undefined)
     */
    const sectionById = useCallback(
        (id) => {
            const section = getSections().find((s) => s.id === id);

            if (!section) {
                logger.debug("[usePageSections] sectionById: not found", { id });
            }

            return section;
        },
        [page]
    );

    /**
     * Find a section by ID, falling back to DEFAULT_PAGE
     * This guarantees a usable shape for rendering.
     */
    const getSectionSafe = useCallback(
        (id) => {
            const existing = sectionById(id);
            if (existing) return existing;

            const fallback =
                DEFAULT_PAGE.sections.find((s) => s.id === id) ?? {
                    id,
                    enabled: false,
                    showTitle: false,
                    title: "",
                    defaultTitle: "",
                    data: {},
                };

            logger.warn("[usePageSections] getSectionSafe: using fallback", {
                id,
                fallback,
            });

            return fallback;
        },
        [sectionById]
    );

    /* ============================================================
       Write helpers
       ============================================================ */

    /**
     * Merge partial data into a section's `data` object.
     * This is the ONLY approved way to update section data.
     */
    const updateSection = useCallback((id, partialData) => {
        logger.debug("[usePageSections] updateSection", {
            id,
            partialData,
        });

        setPage((prev) => {
            if (!Array.isArray(prev.sections)) {
                logger.error("[usePageSections] updateSection: invalid prev.sections", {
                    prev,
                });
                return prev;
            }

            return {
                ...prev,
                sections: prev.sections.map((s) =>
                    s.id === id
                        ? { ...s, data: { ...s.data, ...partialData } }
                        : s
                ),
            };
        });
    }, [setPage]);

    /**
     * Enable or disable an entire section
     */
    const toggleSection = useCallback((id, enabled) => {
        logger.debug("[usePageSections] toggleSection", { id, enabled });

        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id ? { ...s, enabled } : s
            ),
        }));
    }, [setPage]);

    /**
     * Show or hide the section title in preview
     */
    const toggleSectionTitle = useCallback((id, showTitle) => {
        logger.debug("[usePageSections] toggleSectionTitle", {
            id,
            showTitle,
        });

        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id ? { ...s, showTitle } : s
            ),
        }));
    }, [setPage]);

    /**
     * Update the editable title text for a section
     */
    const updateSectionTitle = useCallback((id, title) => {
        logger.debug("[usePageSections] updateSectionTitle", {
            id,
            title,
        });

        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id ? { ...s, title } : s
            ),
        }));
    }, [setPage]);

    /* ============================================================
       Public API
       ============================================================ */

    return {
        // read
        sectionById,
        getSectionSafe,

        // write
        updateSection,
        toggleSection,
        toggleSectionTitle,
        updateSectionTitle,
    };
}
