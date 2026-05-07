class RetentionManager {
    constructor({
        eventStore,
        retentionStore,
    }) {
        this.eventStore = eventStore;
        this.retentionStore =
            retentionStore;
    }

    async processPolicies() {
        const policies =
            await this.retentionStore.getPolicies();

        for (const policy of policies) {
            if (!policy.enabled) {
                continue;
            }

            await this.applyPolicy(policy);
        }
    }

    async applyPolicy(policy) {
        const now = Date.now();

        const archiveThreshold =
            new Date(
                now -
                policy.activeDays *
                24 *
                60 *
                60 *
                1000
            );

        await this.eventStore.archiveOlderThan({
            target: policy.target,
            before: archiveThreshold,
        });

        if (
            typeof policy.archiveDays ===
            'number'
        ) {
            const deleteThreshold =
                new Date(
                    now -
                    (
                        policy.activeDays +
                        policy.archiveDays
                    ) *
                    24 *
                    60 *
                    60 *
                    1000
                );

            await this.eventStore.deleteArchivedOlderThan(
                {
                    target: policy.target,
                    before: deleteThreshold,
                }
            );
        }
    }
}

export default RetentionManager;