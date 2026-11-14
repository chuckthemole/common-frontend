import React from "react";
import { AuthProvider } from "../auth";
import { CurrentUserProvider } from "../user";
import { EventLoggerProvider, RetentionProvider } from "../event-logger";
import {
    LayoutSettingsProvider,
    ColorSettingsProvider,
    FontSettingsProvider,
} from "../design-control";
import { RumpusModalProvider, ToastProvider } from "../ui";
import { LocalPersistence } from "../../persistence";
import { RolesAssignmentProvider } from "../auth/authority-roles";
import { RolesProvider } from "../auth/authority-roles";

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

    // TODO: let's refactor this to ui instead of modal
    modal: [
        ({ children, appElement }) => (
            <RumpusModalProvider
                appElement={appElement}
            >
                <ToastProvider>
                    {children}
                </ToastProvider>
            </RumpusModalProvider>
        ),
    ],

    auth: [
        ({ children }) => (
            // TODO: looking at AuthProvier, it looks like a user's auth.
            // so maybe we should move down to user?
            <AuthProvider>
                {children}
            </AuthProvider>
        ),
        ({ children, config }) => {
            const authConfig = config.auth || {};
            const rolesConfig = authConfig.roles || {};

            return (
                <RolesProvider
                    endpoints={rolesConfig.endpoints}
                >
                    {children}
                </RolesProvider>
            );
        },
        ({ children, config }) => {
            const authConfig = config.auth || {};
            const rolesConfig = authConfig.roles_assignments || {};

            return (
                <RolesAssignmentProvider
                    // userId={rolesConfig.userId || null}
                    endpoints={rolesConfig.endpoints}
                >
                    {children}
                </RolesAssignmentProvider>
            );
        },
    ],

    user: [
        ({ children }) => (
            <CurrentUserProvider>{children}</CurrentUserProvider>
        ),
    ],

    logger: [
        ({ children }) => (
            <EventLoggerProvider>
                <RetentionProvider>
                    {children}
                </RetentionProvider>
            </EventLoggerProvider>
        ),
    ],
};