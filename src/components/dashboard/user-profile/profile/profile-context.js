import React from "react";

/**
 * ProfileContext
 *
 * Central source of truth for saved personal page profiles.
 * This context owns:
 * - persisted profiles
 * - active profile selection
 * - profile CRUD semantics
 *
 * It intentionally does NOT own editor draft state.
 */
export const ProfileContext = React.createContext(null);
