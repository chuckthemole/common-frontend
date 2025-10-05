// index.js
// -----------------------------------------------------------------------------
// Central export for persistence strategies and registry
// -----------------------------------------------------------------------------

import { ApiPersistence, LocalPersistence, MemoryPersistence } from "./persistence";
import {
    setPersistence,
    getPersistence,
    removePersistence,
    createPersistence,
    listPersistences,
} from "./api_persistence_registry";

export {
    // Persistence implementations
    ApiPersistence,
    LocalPersistence,
    MemoryPersistence,

    // Persistence registry functions
    setPersistence,
    getPersistence,
    removePersistence,
    createPersistence,
    listPersistences,
};
