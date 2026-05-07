import logger from "../../../logger";

/**
 * --------------------------------------------------------------------------
 * Retention key namespace
 * --------------------------------------------------------------------------
 */
const RETENTION_COLLECTION =
    "retention-policies";

/**
 * createRetentionStore
 * -----------------------------------------------------------------------------
 * Provides CRUD-style access to retention policies.
 *
 * Policies may target:
 *  - all logs
 *  - specific event categories
 *  - specific transports
 *  - future compliance domains
 */
export const createRetentionStore = (
    persistence
) => {
    if (!persistence) {
        throw new Error(
            "[RetentionStore] persistence is required"
        );
    }

    return {

        /**
         * CREATE
         */
        async create(policy) {
            try {
                const enrichedPolicy = {
                    ...policy,

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString(),
                };

                await persistence.append(
                    RETENTION_COLLECTION,
                    enrichedPolicy
                );

                logger.debug(
                    "[RetentionStore] policy created",
                    enrichedPolicy
                );

                return enrichedPolicy;
            } catch (err) {
                logger.error(
                    "[RetentionStore] create failed",
                    err
                );

                return null;
            }
        },

        /**
         * READ all policies
         */
        async getAll() {
            try {
                const policies =
                    await persistence.getAll(
                        RETENTION_COLLECTION
                    );

                logger.debug(
                    "[RetentionStore] getAll fetched policies:",
                    policies
                );

                return policies || [];
            } catch (err) {
                logger.error(
                    "[RetentionStore] getAll failed",
                    err
                );

                return [];
            }
        },

        /**
         * READ single policy by target
         */
        async getByTarget(target) {
            try {
                const policies =
                    await this.getAll();

                return (
                    policies.find(
                        (policy) =>
                            policy.target ===
                            target
                    ) || null
                );
            } catch (err) {
                logger.error(
                    `[RetentionStore] getByTarget failed: ${target}`,
                    err
                );

                return null;
            }
        },

        /**
         * QUERY
         */
        async query(predicateFn) {
            try {
                const policies =
                    await this.getAll();

                return policies.filter(
                    predicateFn
                );
            } catch (err) {
                logger.error(
                    "[RetentionStore] query failed",
                    err
                );

                return [];
            }
        },

        /**
         * UPDATE
         */
        async update(target, updates) {
            try {
                const policies =
                    await this.getAll();

                const nextPolicies =
                    policies.map((policy) => {
                        if (
                            policy.target !==
                            target
                        ) {
                            return policy;
                        }

                        return {
                            ...policy,
                            ...updates,

                            updatedAt:
                                new Date().toISOString(),
                        };
                    });

                await persistence.setCollection(
                    RETENTION_COLLECTION,
                    nextPolicies
                );

                logger.debug(
                    `[RetentionStore] updated policy: ${target}`
                );

                return (
                    nextPolicies.find(
                        (policy) =>
                            policy.target ===
                            target
                    ) || null
                );
            } catch (err) {
                logger.error(
                    `[RetentionStore] update failed: ${target}`,
                    err
                );

                return null;
            }
        },

        /**
         * DELETE
         */
        async remove(target) {
            try {
                const policies =
                    await this.getAll();

                const nextPolicies =
                    policies.filter(
                        (policy) =>
                            policy.target !==
                            target
                    );

                await persistence.setCollection(
                    RETENTION_COLLECTION,
                    nextPolicies
                );

                logger.debug(
                    `[RetentionStore] removed policy: ${target}`
                );

                return true;
            } catch (err) {
                logger.error(
                    `[RetentionStore] remove failed: ${target}`,
                    err
                );

                return false;
            }
        },

        /**
         * DELETE all policies
         */
        async clear() {
            try {
                await persistence.clearCollection(
                    RETENTION_COLLECTION
                );

                logger.debug(
                    "[RetentionStore] cleared all policies"
                );

                return true;
            } catch (err) {
                logger.error(
                    "[RetentionStore] clear failed",
                    err
                );

                return false;
            }
        },
    };
};