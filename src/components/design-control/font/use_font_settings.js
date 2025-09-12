import { useState, useEffect, useMemo } from "react";
import { google_fonts, system_fonts, custom_fonts } from "../../../constants/fonts";

/**
 * Custom hook to manage global font settings.
 * Handles:
 *  - Primary and secondary fonts
 *  - Enabled font sources
 *  - Applying fonts as CSS variables
 *  - Persisting selections to localStorage
 */
export function useFontSettings({ secondaryFont = false } = {}) {
    // Toggle which font sources are enabled
    const [enabledSources, setEnabledSources] = useState({
        google: true,
        system: true,
        custom: true,
    });

    // Load saved fonts or fallback to defaults
    const savedPrimary = localStorage.getItem("primaryFont") || google_fonts[0].value;
    const savedSecondary = localStorage.getItem("secondaryFont") || system_fonts[0].value;

    const [currentFont, setCurrentFont] = useState(savedPrimary);
    const [currentSecondaryFont, setCurrentSecondaryFont] = useState(savedSecondary);

    // Combine fonts from enabled sources
    const fonts = useMemo(() => {
        let f = [];
        if (enabledSources.google) f = f.concat(google_fonts);
        if (enabledSources.system) f = f.concat(system_fonts);
        if (enabledSources.custom) f = f.concat(custom_fonts);
        return f;
    }, [enabledSources]);

    // Helper to apply a font globally
    const applyFont = (fontValue) => {
        document.documentElement.style.setProperty("--primary-font", fontValue);
        localStorage.setItem("primaryFont", fontValue);

        const fontObj = fonts.find((f) => f.value === fontValue);
        if (fontObj?.url) {
            const linkId = `font-${fontObj.name}`;
            if (!document.getElementById(linkId)) {
                const link = document.createElement("link");
                link.id = linkId;
                link.rel = "stylesheet";
                link.href = fontObj.url;
                document.head.appendChild(link);
            }
        }
    };

    // Apply primary font whenever it changes
    useEffect(() => {
        applyFont(currentFont);
    }, [currentFont, fonts]);

    // Apply secondary font if enabled
    useEffect(() => {
        if (secondaryFont) {
            document.documentElement.style.setProperty("--secondary-font", currentSecondaryFont);
            localStorage.setItem("secondaryFont", currentSecondaryFont);

            const fontObj = fonts.find((f) => f.value === currentSecondaryFont);
            if (fontObj?.url) {
                const linkId = `font-${fontObj.name}`;
                if (!document.getElementById(linkId)) {
                    const link = document.createElement("link");
                    link.id = linkId;
                    link.rel = "stylesheet";
                    link.href = fontObj.url;
                    document.head.appendChild(link);
                }
            }
        }
    }, [currentSecondaryFont, secondaryFont, fonts]);

    // Toggle a font source (google/system/custom)
    const toggleSource = (source) => {
        setEnabledSources((prev) => ({ ...prev, [source]: !prev[source] }));
    };

    // Global initializer to apply fonts from localStorage without rendering modal
    const initFonts = () => {
        const storedPrimary = localStorage.getItem("primaryFont");
        if (storedPrimary) applyFont(storedPrimary);

        if (secondaryFont) {
            const storedSecondary = localStorage.getItem("secondaryFont");
            if (storedSecondary) {
                document.documentElement.style.setProperty("--secondary-font", storedSecondary);
            }
        }
    };

    return {
        fonts,
        currentFont,
        setCurrentFont,
        currentSecondaryFont,
        setCurrentSecondaryFont,
        enabledSources,
        toggleSource,
        initFonts,
    };
}
