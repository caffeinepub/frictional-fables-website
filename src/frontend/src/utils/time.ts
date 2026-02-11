/**
 * Formats a bigint timestamp (nanoseconds) into a human-readable relative time string
 * @param timestamp - Timestamp in nanoseconds (bigint)
 * @returns Human-readable time string (e.g., "Just now", "2 hours ago", or a date)
 */
export function formatRelativeTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}
