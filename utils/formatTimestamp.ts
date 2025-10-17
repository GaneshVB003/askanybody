
import type { Timestamp } from '../types';

export const formatTimestamp = (timestamp: Timestamp): string => {
  if (!timestamp) {
    return '';
  }
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};
