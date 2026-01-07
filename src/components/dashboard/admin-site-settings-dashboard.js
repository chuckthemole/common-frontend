import React, { useState } from "react";
import FontSettingsModal from "../design-control/font/font_settings_modal";
import ColorSettingsModal from "../design-control/color/color_settings_modal";
import LayoutSettingsModal from "../design-control/layout/layout_settings_modal";
import { useFontSettings } from "../design-control/font/use_font_settings";

/**
 * Admin Site Settings Dashboard
 * - Global look and feel management
 * - Modal-driven controls (Font & Color)
 * - Extensible with other global settings
 */
export default function AdminSiteSettingsDashboard() {
    const [colorSettings, setColorSettings] = useState({});
    const [seoSettings, setSeoSettings] = useState({});
    const [advancedSettings, setAdvancedSettings] = useState({});

    const fontSettings = useFontSettings({
        target: document.documentElement,
        persist: true,
        slots: {
            primaryFont: {
                cssVar: "--primary-font",
                default: "Inter",
                storageKey: "primaryFont",
            },
            secondaryFont: {
                cssVar: "--secondary-font",
                default: "Arial",
                storageKey: "secondaryFont",
            },
        },
    });

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
                                <FontSettingsModal
                                    preview={true}
                                    fontSettings={fontSettings}
                                    buttonLabel="Font"
                                />
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
                                {/* Directly include LayoutSettingsModal for admin control */}
                                <LayoutSettingsModal />
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
                                <button className="button is-info">
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
                                <button className="button is-info">
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
