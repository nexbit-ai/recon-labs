import { useMemo } from 'react';
import { ReconciliationStatus } from '../services/api/types';

/**
 * Extended type that includes computed state based on processing_count
 */
export interface NormalizedReconciliationStatus extends ReconciliationStatus {
  state: 'processing' | 'processed'; // Computed from processing_count
}

/**
 * Hook to parse and normalize reconciliation_status from API response
 * Derives state from processing_count: 0 = processed, >0 = processing
 * Returns null when reconciliation_status is not provided (graceful handling)
 */
export const useReconciliationStatus = (
  reconciliationStatus?: ReconciliationStatus | null
): NormalizedReconciliationStatus | null => {
  return useMemo(() => {
    // If reconciliation_status is provided and valid, use it
    if (reconciliationStatus && typeof reconciliationStatus === 'object') {
      const processingCount = reconciliationStatus.processing_count ?? 0;
      return {
        platform: reconciliationStatus.platform || '',
        processing_count: processingCount,
        last_completed_at: reconciliationStatus.last_completed_at ?? null,
        // Derive state from processing_count: 0 = processed, >0 = processing
        state: processingCount > 0 ? 'processing' : 'processed',
      };
    }

    // Return null when reconciliation_status is not provided - handle gracefully
    return null;
  }, [reconciliationStatus]);
};

/**
 * Utility function to format timestamp for display
 * Uses UTC time to match backend timestamp format
 */
export const formatReconciliationTimestamp = (timestamp: string | null): string | null => {
  if (!timestamp) return null;

  try {
    const date = new Date(timestamp);
    const now = new Date();
    
    // Use UTC for date comparisons
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const dateOnlyUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const isToday = dateOnlyUTC.getTime() === todayUTC.getTime();

    // Format time using UTC: 7:10 PM
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    };
    const timeStr = date.toLocaleTimeString('en-US', timeOptions);

    if (isToday) {
      return timeStr; // e.g., "7:10 PM"
    }

    // Format date + time using UTC: 28 Dec, 7:10 PM
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    };
    const dateStr = date.toLocaleDateString('en-US', dateOptions);
    return `${dateStr}, ${timeStr}`; // e.g., "28 Dec, 7:10 PM"
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return null;
  }
};

