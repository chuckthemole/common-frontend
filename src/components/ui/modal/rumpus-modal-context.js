import React from "react";

/**
 * RumpusModalContext
 *
 * Holds global modal state.
 *
 * activeModal: string | null
 * openModal: (id: string) => void
 * closeModal: (id?: string) => void
 */
export const RumpusModalContext = React.createContext(null);
