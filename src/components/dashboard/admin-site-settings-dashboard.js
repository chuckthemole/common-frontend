import React, { useState } from "react";
import FontSettingsModal from "../design-control/font/font_settings_modal";
import ColorSettingsModal from "../design-control/color/color_settings_modal";

/**
 * Admin Site Settings Dashboard
 * - Global look and feel management
 * - Modal-driven controls (placeholders for your buttons/modals)
 * - Extensible with other global settings
 */
export default function AdminSiteSettingsDashboard() {
    // State placeholders
    const [fontSettings, setFontSettings] = useState({});
    const [colorSettings, setColorSettings] = useState({});
    const [layoutSettings, setLayoutSettings] = useState({});
    const [seoSettings, setSeoSettings] = useState({});
    const [advancedSettings, setAdvancedSettings] = useState({});

    // Generic handler placeholder (you can expand with actual modal data later)
    const handleOpenModal = (settingType) => {
        console.log(`Open modal for ${settingType}`);
        // Your modal logic here
    };

    return (
        <div className="admin-site-settings-dashboard">
            <h2>Site Settings Dashboard (Admin)</h2>

            {/* Font Settings */}
            <section>
                <h3>Font Settings</h3>
                <p>Control the global fonts for your site.</p>
                <FontSettingsModal preview={true} secondaryFont={true} />
            </section>

            {/* Color Settings */}
            <section>
                <h3>Color Settings</h3>
                <p>Manage primary, secondary, and background colors for the site.</p>
                <ColorSettingsModal />
            </section>

            {/* Layout Settings */}
            <section>
                <h3>Layout Settings</h3>
                <p>Adjust global layout options like header, footer, and sidebar positions.</p>
                {/* Placeholder button for modal */}
                <button onClick={() => handleOpenModal("layout")}>Edit Layout Settings</button>
            </section>

            {/* SEO Settings */}
            <section>
                <h3>SEO Settings</h3>
                <p>Manage meta tags, keywords, and other SEO-related global settings.</p>
                {/* Placeholder button for modal */}
                <button onClick={() => handleOpenModal("seo")}>Edit SEO Settings</button>
            </section>

            {/* Advanced / Miscellaneous Settings */}
            <section>
                <h3>Advanced Settings</h3>
                <p>Other global admin options like scripts, analytics, cookies, or integrations.</p>
                {/* Placeholder button for modal */}
                <button onClick={() => handleOpenModal("advanced")}>Edit Advanced Settings</button>
            </section>
        </div>
    );
}
