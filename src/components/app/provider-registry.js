import React from "react";
import { AuthProvider } from "../auth";
import { CurrentUserProvider } from "../user";
import { EventLoggerProvider } from "../event-logger";
import {
    LayoutSettingsProvider,
    ColorSettingsProvider,
    FontSettingsProvider,
} from "../design-control";
import { RumpusModalProvider } from "../ui";
import { LocalPersistence } from "../../persistence";

/**
 * Provider registry using wrappers
 */
export const PROVIDER_REGISTRY = {
    theme: [
        ({ children }) => (
            <LayoutSettingsProvider>
                {children}
            </LayoutSettingsProvider>
        ),

        ({ children, appElement, config }) => {
            const themeConfig = config.theme || {};
            const colorConfig = themeConfig.color || {};

            return (
                <ColorSettingsProvider
                    target={appElement}
                    persistence={colorConfig.persistence || LocalPersistence}
                    defaultLayout={colorConfig.defaultLayout || "Ocean Blue"}
                    profileId={colorConfig.profileId || "global"}
                >
                    {children}
                </ColorSettingsProvider>
            );
        },
        ({ children, appElement, config }) => {
            const themeConfig = config.theme || {};
            const fontConfig = themeConfig.font || {};

            return (
                <FontSettingsProvider
                    target={appElement}
                    persistence={fontConfig.persistence || LocalPersistence}
                    slots={
                        fontConfig.slots || {
                            primary: {
                                cssVar: "--primary-font",
                                default: "Inter",
                                storageKey: "primaryFont",
                            },
                            secondary: {
                                cssVar: "--secondary-font",
                                default: "Arial",
                                storageKey: "secondaryFont",
                            },
                            quill: {
                                cssVar: "--quill-font",
                                default: "Arial",
                                storageKey: "quillFont",
                            },
                        }
                    }
                >
                    {children}
                </FontSettingsProvider>
            );
        },
    ],

    modal: [
        ({ children, appElement }) => (
            <RumpusModalProvider appElement={appElement}>
                {children}
            </RumpusModalProvider>
        ),
    ],

    auth: [
        ({ children }) => <AuthProvider>{children}</AuthProvider>,
    ],

    user: [
        ({ children }) => <CurrentUserProvider>{children}</CurrentUserProvider>,
    ],

    logger: [
        ({ children }) => <EventLoggerProvider>{children}</EventLoggerProvider>,
    ],
};