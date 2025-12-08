import { OfflineQueue, QueuedRequest } from './offline-queue';
import { clockIn, clockOut } from '@/actions/time';
import { addRodPass } from '@/actions/drilling';
import { updateDailyReport } from '@/actions/reports';
import { toast } from 'sonner';

export const SyncManager = {
    sync: async () => {
        if (typeof window === 'undefined' || !navigator.onLine) return;

        const queue = OfflineQueue.getAll();
        const pending = queue.filter(item => item.status === 'PENDING');

        if (pending.length === 0) return;

        let syncedCount = 0;
        let failedCount = 0;
        const processedIds: string[] = [];

        console.log(`[SyncManager] Syncing ${pending.length} items...`);

        // Process sequentially to maintain order (especially for clock in/out)
        for (const item of pending) {
            try {
                let result;

                switch (item.type) {
                    case 'TIME_CLOCK_IN':
                        result = await clockIn(item.payload);
                        break;
                    case 'TIME_CLOCK_OUT':
                        result = await clockOut(item.payload);
                        break;
                    case 'ROD_PASS':
                        result = await addRodPass(item.payload);
                        break;
                    case 'DAILY_REPORT':
                        // Assuming payload has { id, data }
                        result = await updateDailyReport(item.payload);
                        break;
                }

                if (result?.success || result?.data) { // Handle different result shapes if any
                    syncedCount++;
                    processedIds.push(item.id);
                } else {
                    console.error(`[SyncManager] Failed to sync item ${item.id}:`, result?.error);
                    failedCount++;
                    // Optional: Mark as FAILED in queue instead of removing?
                    // For now, we leave it pending or remove it? Currently logic removes only successful ones.
                    // If we leave it, it might block forever.
                }

            } catch (error) {
                console.error(`[SyncManager] Error syncing item ${item.id}:`, error);
                failedCount++;
            }
        }

        if (syncedCount > 0) {
            OfflineQueue.removeMany(processedIds);
            toast.success(`Synced ${syncedCount} offline items`);
        }

        if (failedCount > 0) {
            toast.error(`Failed to sync ${failedCount} items. check internet connection.`);
        }

        return { synced: syncedCount, failed: failedCount };
    }
};
