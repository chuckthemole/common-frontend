/**
 * -----------------------------------------------------------------------------
 * Default Navigation Configuration
 * -----------------------------------------------------------------------------
 *
 * This can later move into:
 *
 * /user/navigation/user-navigation.config.js
 *
 * if it grows significantly.
 */
export const DEFAULT_SECTIONS = [
    {
        id: "account",

        label: "Account",

        collapsible: true,

        defaultOpen: true,

        items: [
            {
                id: "profile",

                label: "Profile",

                href: "/user/profile",
            },

            {
                id: "security",

                label: "Security",

                href: "/user/security",
            },

            {
                id: "preferences",

                label: "Preferences",

                href: "/user/preferences",
            },
        ],
    },

    {
        id: "activity",

        label: "Activity",

        collapsible: true,

        defaultOpen: true,

        items: [
            {
                id: "notifications",

                label: "Notifications",

                href: "/user/notifications",
            },

            {
                id: "retention",

                label: "Retention Policies",

                href: "/user/retention",
            },

            {
                id: "audit",

                label: "Audit Logs",

                href: "/user/audit",
            },
        ],
    },

    {
        id: "developer",

        label: "Developer",

        collapsible: true,

        defaultOpen: false,

        items: [
            {
                id: "api-keys",

                label: "API Keys",

                href: "/user/api-keys",
            },

            {
                id: "webhooks",

                label: "Webhooks",

                href: "/user/webhooks",
            },
        ],
    },
];