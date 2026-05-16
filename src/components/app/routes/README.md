# Route Configuration System

This directory contains the application's config-driven
dashboard routing architecture.

Goals:
- centralize route definitions
- reduce route duplication
- keep navigation + routes synchronized
- support auth wrappers and future permissions

Example:
```jsx
import {
    createRouteElement,
} from "./routeFactories";

export const ROUTE_ELEMENTS = {

    index:
        createRouteElement(
            UserLandingPageIndex
        ),

    profile:
        createRouteElement(
            UserProfilePage,
            {
                requireAuth: true,
            }
        ),

    security:
        createRouteElement(SecurityPage),

    preferences:
        createRouteElement(PreferencesPage),

    notifications:
        createRouteElement(NotificationsPage),

    retention:
        createRouteElement(RetentionPoliciesPage),

    audit:
        createRouteElement(AuditLogsPage),

    "api-keys":
        createRouteElement(ApiKeysPage),

    webhooks:
        createRouteElement(WebhooksPage),
};
```