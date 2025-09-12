import React, { useState } from "react";
import FontSettingsModal from "../design-control/font/font_settings_modal";
import ColorSettingsModal from "../design-control/color/color_settings_modal";

/**
 * Admin Site Settings Dashboard
 * - Global look and feel management
 * - Modal-driven controls (Font & Color)
 * - Extensible with other global settings
 */
export default function AdminSiteSettingsDashboard() {
    // State placeholders
    const [fontSettings, setFontSettings] = useState({});
    const [colorSettings, setColorSettings] = useState({});
    const [layoutSettings, setLayoutSettings] = useState({});
    const [seoSettings, setSeoSettings] = useState({});
    const [advancedSettings, setAdvancedSettings] = useState({});

    const handleOpenModal = (settingType) => {
        console.log(`Open modal for ${settingType}`);
        // Your modal logic here
    };

    return (
        <div className="admin-site-settings-dashboard container">
            <h2 className="title is-3 mb-5">Site Settings Dashboard</h2>

            <div className="columns is-multiline">

                {/* Font Settings */}
                <div className="column is-half">
                    <div className="card">
                        <header className="card-header">
                            <p className="card-header-title">Font Settings</p>
                        </header>
                        <div className="card-content">
                            <div className="content">
                                <p>Control the global fonts for your site.</p>
                                <FontSettingsModal preview={true} secondaryFont={true} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Color Settings */}
                <div className="column is-half">
                    <div className="card">
                        <header className="card-header">
                            <p className="card-header-title">Color Settings</p>
                        </header>
                        <div className="card-content">
                            <div className="content">
                                <p>Manage primary, secondary, and background colors for the site.</p>
                                <ColorSettingsModal />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layout Settings */}
                <div className="column is-half">
                    <div className="card">
                        <header className="card-header">
                            <p className="card-header-title">Layout Settings</p>
                        </header>
                        <div className="card-content">
                            <div className="content">
                                <p>Adjust global layout options like header, footer, and sidebar positions.</p>
                                <button className="button is-info" onClick={() => handleOpenModal("layout")}>
                                    Edit Layout Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Settings */}
                <div className="column is-half">
                    <div className="card">
                        <header className="card-header">
                            <p className="card-header-title">SEO Settings</p>
                        </header>
                        <div className="card-content">
                            <div className="content">
                                <p>Manage meta tags, keywords, and other SEO-related global settings.</p>
                                <button className="button is-info" onClick={() => handleOpenModal("seo")}>
                                    Edit SEO Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Settings */}
                <div className="column is-full">
                    <div className="card">
                        <header className="card-header">
                            <p className="card-header-title">Advanced Settings</p>
                        </header>
                        <div className="card-content">
                            <div className="content">
                                <p>Other global admin options like scripts, analytics, cookies, or integrations.</p>
                                <button className="button is-info" onClick={() => handleOpenModal("advanced")}>
                                    Edit Advanced Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
