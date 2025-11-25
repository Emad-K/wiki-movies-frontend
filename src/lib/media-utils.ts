/**
 * Format the date range for a TV show based on its status and air dates.
 *
 * Logic:
 * - Returning Series: "YYYY - Present"
 * - Ended / Canceled: "YYYY - YYYY" (or just "YYYY" if start/end years are same)
 * - Other: "YYYY"
 */
export function getTVDateRange(
  firstAirDate: string | undefined | null,
  lastAirDate: string | undefined | null,
  status: string | undefined | null
): string | null {
  if (!firstAirDate) return null

  const startYear = new Date(firstAirDate).getFullYear()

  if (status === 'Returning Series' || status === 'In Production') {
    return `${startYear} – Present`
  }

  if ((status === 'Ended' || status === 'Canceled') && lastAirDate) {
    const endYear = new Date(lastAirDate).getFullYear()
    return startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`
  }

  return `${startYear}`
}

/**
 * Determine if the status badge should be shown for a TV show.
 *
 * Logic:
 * - Show only if 'Canceled' or 'Pilot'
 * - Hide 'Returning Series', 'Ended', 'In Production', 'Planned'
 */
export function shouldShowTVStatus(status: string | undefined | null): boolean {
  if (!status) return false
  return ['Canceled', 'Pilot'].includes(status)
}
