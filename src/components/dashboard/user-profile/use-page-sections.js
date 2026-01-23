import React from "react";
import { DEFAULT_PAGE } from "./personal-page.schema";
import logger from "../../../logger";

/**
 * Domain hook for working with `page.sections`
 *
 * This hook centralizes:
 * - how sections are found
 * - how they are updated
 * - how we avoid blowing away data accidentally
 */
export function usePageSections(page, setPage) {

    /* -------------------------------------------
       Read helpers
       ------------------------------------------- */

    const sectionById = (id) => {
        if (!page?.sections) return undefined;
        return page.sections.find((s) => s.id === id);
    };

    const getSectionSafe = (id) => {
        const section = sectionById(id);

        if (section) return section;

        // fallback to defaults if missing
        return (
            DEFAULT_PAGE.sections.find((s) => s.id === id) || {
                id,
                enabled: false,
                showTitle: false,
                title: "",
                defaultTitle: "",
                data: {},
            }
        );
    };

    /* -------------------------------------------
       Write helpers
       ------------------------------------------- */

    /**
     * Merge partial data into a section’s `data` object
     * (never replace the whole thing)
     */
    const updateSection = (id, partialData) => {
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id
                    ? { ...s, data: { ...s.data, ...partialData } }
                    : s
            ),
        }));
    };

    const toggleSection = (id, enabled) => {
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id ? { ...s, enabled } : s
            ),
        }));
    };

    const toggleSectionTitle = (id, showTitle) => {
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id ? { ...s, showTitle } : s
            ),
        }));
    };

    const updateSectionTitle = (id, title) => {
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id ? { ...s, title } : s
            ),
        }));
    };

    /* -------------------------------------------
       Public API
       ------------------------------------------- */

    return {
        sectionById,
        getSectionSafe,
        updateSection,
        toggleSection,
        toggleSectionTitle,
        updateSectionTitle,
    };
}
