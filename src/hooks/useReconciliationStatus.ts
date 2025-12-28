import { useMemo } from 'react';
import { ReconciliationStatus } from '../services/api/types';

/**
 * Hook to parse and normalize reconciliation_status from API response
 * Provides safe fallback values when the object is missing
 */
export const useReconciliationStatus = (
  reconciliationStatus?: ReconciliationStatus | null
): ReconciliationStatus => {
  return useMemo(() => {
    // If reconciliation_status is provided and valid, use it
    if (reconciliationStatus && typeof reconciliationStatus === 'object') {
      return {
        state: reconciliationStatus.state || 'processing',
        processing_count: reconciliationStatus.processing_count ?? 1,
        last_completed_at: reconciliationStatus.last_completed_at ?? null,
      };
    }

    // Fallback to dummy values when object is missing
    // This should be easy to remove later when backend always sends the object
    return {
      state: 'processing',
      processing_count: 1,
      last_completed_at: null,
    };
  }, [reconciliationStatus]);
};

/**
 * Utility function to format timestamp for display
 */
export const formatReconciliationTimestamp = (timestamp: string | null): string | null => {
  if (!timestamp) return null;

  try {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const isToday = dateOnly.getTime() === today.getTime();

    // Format time: 7:10 PM
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    const timeStr = date.toLocaleTimeString('en-US', timeOptions);

    if (isToday) {
      return timeStr; // e.g., "7:10 PM"
    }

    // Format date + time: 28 Dec, 7:10 PM
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
    };
    const dateStr = date.toLocaleDateString('en-US', dateOptions);
    return `${dateStr}, ${timeStr}`; // e.g., "28 Dec, 7:10 PM"
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return null;
  }
};

