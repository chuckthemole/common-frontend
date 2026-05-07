import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import RetentionContext from "./retention-context";
import {
    DEFAULT_RETENTION_POLICY,
} from "./retention.constants";
import {
    getRetentionStore,
} from "./retention-store-instance";
import { LocalPersistence } from "../../../persistence";
import logger from "../../../logger";

const retentionStore =
    getRetentionStore(
        LocalPersistence
    );

export default function RetentionProvider({
    children,
}) {
    const [policies, setPolicies] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    /**
     * ----------------------------------------------------------------------
     * Load policies
     * ----------------------------------------------------------------------
     */
    const loadPolicies =
        useCallback(async () => {
            try {
                const storedPolicies =
                    await retentionStore.getAll();

                /**
                 * Seed default policy
                 */
                if (
                    !storedPolicies.length
                ) {
                    const defaultPolicy =
                        await retentionStore.create(
                            DEFAULT_RETENTION_POLICY
                        );

                    setPolicies([
                        defaultPolicy,
                    ]);

                    return;
                }

                setPolicies(
                    storedPolicies
                );
            } catch (error) {
                logger.error(
                    "[RetentionProvider] Failed to load policies",
                    error
                );
            } finally {
                setLoading(false);
            }
        }, []);

    /**
     * Initial load
     */
    useEffect(() => {
        loadPolicies();
    }, [loadPolicies]);

    /**
     * ----------------------------------------------------------------------
     * Add policy
     * ----------------------------------------------------------------------
     */
    const addPolicy =
        useCallback(async (policy) => {
            try {
                const createdPolicy =
                    await retentionStore.create(
                        policy
                    );

                if (
                    !createdPolicy
                ) {
                    return null;
                }

                setPolicies(
                    (prev) => [
                        ...prev,
                        createdPolicy,
                    ]
                );

                return createdPolicy;
            } catch (error) {
                logger.error(
                    "[RetentionProvider] addPolicy failed",
                    error
                );

                return null;
            }
        }, []);

    /**
     * ----------------------------------------------------------------------
     * Update policy
     * ----------------------------------------------------------------------
     */
    const updatePolicy =
        useCallback(
            async (
                id,
                updates
            ) => {
                try {
                    const updatedPolicy =
                        await retentionStore.update(
                            id,
                            updates
                        );

                    if (
                        !updatedPolicy
                    ) {
                        return null;
                    }

                    setPolicies(
                        (prev) =>
                            prev.map(
                                (
                                    policy
                                ) => {
                                    if (
                                        policy.id !==
                                        id
                                    ) {
                                        return policy;
                                    }

                                    return updatedPolicy;
                                }
                            )
                    );

                    return updatedPolicy;
                } catch (error) {
                    logger.error(
                        "[RetentionProvider] updatePolicy failed",
                        error
                    );

                    return null;
                }
            },
            []
        );

    /**
     * ----------------------------------------------------------------------
     * Remove policy
     * ----------------------------------------------------------------------
     */
    const removePolicy =
        useCallback(
            async (id) => {
                try {
                    const success =
                        await retentionStore.remove(
                            id
                        );

                    if (!success) {
                        return false;
                    }

                    setPolicies(
                        (prev) =>
                            prev.filter(
                                (
                                    policy
                                ) =>
                                    policy.id !==
                                    id
                            )
                    );

                    return true;
                } catch (error) {
                    logger.error(
                        "[RetentionProvider] removePolicy failed",
                        error
                    );

                    return false;
                }
            },
            []
        );

    /**
     * ----------------------------------------------------------------------
     * Get policy by target
     * ----------------------------------------------------------------------
     */
    const getPolicyForTarget =
        useCallback(
            (target) => {
                return (
                    policies.find(
                        (
                            policy
                        ) =>
                            policy.target ===
                            target
                    ) || null
                );
            },
            [policies]
        );

    /**
     * ----------------------------------------------------------------------
     * Context value
     * ----------------------------------------------------------------------
     */
    const value = useMemo(
        () => {
            return {
                loading,

                policies,

                addPolicy,

                updatePolicy,

                removePolicy,

                getPolicyForTarget,

                reloadPolicies:
                    loadPolicies,
            };
        },
        [
            loading,
            policies,

            addPolicy,
            updatePolicy,
            removePolicy,

            getPolicyForTarget,

            loadPolicies,
        ]
    );

    return (
        <RetentionContext.Provider
            value={value}
        >
            {children}
        </RetentionContext.Provider>
    );
}