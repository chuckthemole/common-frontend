import { useContext } from "react";
import { ColorSettingsContext } from "./color_settings_context";

export function useColorSettings() {
    const context = useContext(ColorSettingsContext);
    if (!context) {
        throw new Error("useColorSettings must be used within ColorSettingsProvider");
    }
    return context;
}