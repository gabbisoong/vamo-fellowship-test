// Fellowship utility functions

export function calculateDaysRemaining(fellowshipStartDate: Date): number {
  const now = new Date()
  const start = new Date(fellowshipStartDate)
  const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, 100 - daysPassed)
}

export function calculateProgressPercentage(fellowshipStartDate: Date): number {
  const now = new Date()
  const start = new Date(fellowshipStartDate)
  const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.min(100, (daysPassed / 100) * 100)
}

export function hasFellowshipExpired(fellowshipStartDate: Date): boolean {
  return calculateDaysRemaining(fellowshipStartDate) === 0
}

export function getFellowshipStatus(
  fellowshipStartDate: Date,
  customerProofsCount: number,
  fellowshipStatus: string
): {
  daysRemaining: number
  progressPercentage: number
  isExpired: boolean
  hasPassed: boolean
  canSubmit: boolean
  status: string
} {
  const daysRemaining = calculateDaysRemaining(fellowshipStartDate)
  const progressPercentage = calculateProgressPercentage(fellowshipStartDate)
  const isExpired = hasFellowshipExpired(fellowshipStartDate)
  const hasPassed = customerProofsCount >= 10
  const canSubmit = isExpired && fellowshipStatus === 'active'

  return {
    daysRemaining,
    progressPercentage,
    isExpired,
    hasPassed,
    canSubmit,
    status: fellowshipStatus
  }
}
