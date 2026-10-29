import {
  eachDayOfInterval,
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
  subDays,
} from 'date-fns'
import type { Habit } from '../types'

export const STORAGE_KEY = 'habitly-habits-v1'
export const todayKey = format(new Date(), 'yyyy-MM-dd')

export function isHabitListComplete(habits: Habit[], date: Date): boolean {
  const key = format(date, 'yyyy-MM-dd')
  const activeHabits = habits.filter((habit) => isHabitScheduledForDate(habit, key))
  return activeHabits.length > 0 && activeHabits.every((habit) => isHabitCompleteOnDate(habit, key))
}

export function isHabitCompleteOnDate(habit: Habit, key: string): boolean {
  if (habit.progressType === 'numeric') {
    return (habit.numericCompleted?.[key] ?? 0) >= (habit.progressConfig?.numericTarget ?? 1)
  }
  if (habit.progressType === 'timer') {
    return (habit.timerCompleted?.[key] ?? 0) >= (habit.progressConfig?.timerMinutes ?? 1)
  }
  const items = habit.progressConfig?.checklistItems?.filter(Boolean) ?? []
  if (!items.length || (habit.progressType !== 'checklist' && habit.type !== 'single_task')) return habit.completedDates.includes(key)
  if (!habit.checklistCompleted?.[key] && habit.completedDates.includes(key)) return true
  const completed = new Set(habit.checklistCompleted?.[key] ?? [])
  const count = items.filter((item) => completed.has(item)).length
  if (habit.type === 'single_task' || habit.progressConfig?.checklistSuccess === 'all') return count === items.length
  if (habit.progressConfig?.checklistSuccess === 'custom') return count >= Math.min(items.length, Math.max(1, habit.progressConfig.checklistSuccessCount ?? 1))
  if (habit.progressConfig?.checklistSuccess === 'any') return count > 0
  return count >= Math.min(items.length, habit.progressConfig?.checklistSuccessCount ?? 1)
}

export function isHabitScheduledForDate(habit: Habit, key: string): boolean {
  const startKey = habit.scheduledDate ?? habit.startDate ?? habit.createdAt
  if (key < startKey) return false
  if (habit.hasEndDate && habit.endDate && key > habit.endDate) return false
  if (!habit.frequency) return habit.scheduledDate ? habit.scheduledDate === key : true

  const date = parseISO(key)
  switch (habit.frequency.type) {
    case 'days_of_week':
      return habit.frequency.daysOfWeek?.includes(date.getDay()) ?? false
    case 'days_of_month':
      return habit.frequency.daysOfMonth?.includes(date.getDate()) ?? false
    case 'days_of_year':
      return habit.frequency.daysOfYear?.includes(format(date, 'MM-dd')) ?? false
    case 'days_per_period': {
      const periodDays = Math.max(1, habit.frequency.periodDays ?? 7)
      const occurrences = Math.max(1, habit.frequency.occurrences ?? 1)
      return differenceInCalendarDays(date, parseISO(startKey)) % periodDays < occurrences
    }
    case 'flexible_interval':
      return differenceInCalendarDays(date, parseISO(startKey)) % Math.max(1, habit.frequency.intervalDays ?? 1) === 0
    default:
      return true
  }
}

export function getDailyStreak(habits: Habit[], referenceDate = new Date()): number {
  let cursor = startOfDay(referenceDate)
  let streak = 0

  while (isHabitListComplete(habits, cursor)) {
    streak += 1
    cursor = subDays(cursor, 1)
  }
  return streak
}

export function getStreak(habit: Habit, referenceDate = new Date()): number {
  const completed = new Set(habit.completedDates)
  let cursor = startOfDay(referenceDate)
  let streak = 0

  if (!completed.has(format(cursor, 'yyyy-MM-dd'))) {
    cursor = subDays(cursor, 1)
  }

  while (completed.has(format(cursor, 'yyyy-MM-dd'))) {
    streak += 1
    cursor = subDays(cursor, 1)
  }
  return streak
}

export function getLongestStreak(habit: Habit): number {
  const dates = [...new Set(habit.completedDates)].sort()
  let longest = 0
  let current = 0
  dates.forEach((value, index) => {
    const previous = index > 0 ? parseISO(dates[index - 1]) : null
    const currentDate = parseISO(value)
    if (previous && isSameDay(currentDate, subDays(previous, -1))) current += 1
    else current = 1
    longest = Math.max(longest, current)
  })
  return longest
}

export function getWeekStatus(habit: Habit, referenceDate = new Date()) {
  const start = subDays(startOfDay(referenceDate), 6)
  return eachDayOfInterval({ start, end: startOfDay(referenceDate) }).map((date) => ({
    date,
    key: format(date, 'yyyy-MM-dd'),
    completed: habit.completedDates.includes(format(date, 'yyyy-MM-dd')),
    isToday: isSameDay(date, referenceDate),
  }))
}

export function isDateCompleted(habit: Habit, date: Date) {
  return habit.completedDates.includes(format(date, 'yyyy-MM-dd'))
}

export function isDateInFuture(date: Date) {
  return isAfter(startOfDay(date), startOfDay(new Date()))
}

export function isDateInPast(date: Date) {
  return isBefore(startOfDay(date), startOfDay(new Date()))
}
