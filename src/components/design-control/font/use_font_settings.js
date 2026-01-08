import { useContext } from "react";
import { FontSettingsContext } from "./font_settings_context";

export function useFontSettings() {
    const context = useContext(FontSettingsContext);

    if (!context) {
        throw new Error(
            "useFontSettings must be used within a FontSettingsProvider"
        );
    }

    return context;
}
