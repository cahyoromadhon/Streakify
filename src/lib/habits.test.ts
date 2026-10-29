import { describe, expect, it } from 'vitest'
import { getDailyStreak, getLongestStreak, getStreak, isHabitCompleteOnDate, isHabitListComplete, isHabitScheduledForDate } from './habits'
import type { Habit } from '../types'

const habit: Habit = {
  id: 'test',
  name: 'Test habit',
  icon: 'book',
  color: '#6258e8',
  completedDates: ['2026-10-27', '2026-10-28', '2026-10-29'],
  createdAt: '2026-10-01',
}

describe('habit streak calculations', () => {
  it('counts a current consecutive streak', () => {
    expect(getStreak(habit, new Date('2026-10-29T12:00:00'))).toBe(3)
  })

  it('finds the longest completed run', () => {
    expect(getLongestStreak(habit)).toBe(3)
  })

  it('only counts a day when every habit is complete', () => {
    const secondHabit = { ...habit, id: 'second', completedDates: ['2026-10-29'] }
    expect(getDailyStreak([habit, secondHabit], new Date('2026-10-29T12:00:00'))).toBe(1)
    expect(getDailyStreak([habit, { ...secondHabit, completedDates: [] }], new Date('2026-10-29T12:00:00'))).toBe(0)
  })

  it('only considers a scheduled habit on its assigned date', () => {
    const scheduledHabit = { ...habit, scheduledDate: '2026-11-01', completedDates: ['2026-11-01'] }
    expect(isHabitListComplete([scheduledHabit], new Date('2026-10-29T12:00:00'))).toBe(false)
    expect(isHabitListComplete([scheduledHabit], new Date('2026-11-01T12:00:00'))).toBe(true)
  })

  it('matches selected days and flexible intervals', () => {
    const weekdayHabit = { ...habit, scheduledDate: '2026-10-26', frequency: { type: 'days_of_week' as const, daysOfWeek: [1, 3] } }
    const intervalHabit = { ...habit, scheduledDate: '2026-10-29', frequency: { type: 'flexible_interval' as const, intervalDays: 3 } }
    expect(isHabitScheduledForDate(weekdayHabit, '2026-10-28')).toBe(true)
    expect(isHabitScheduledForDate(weekdayHabit, '2026-10-29')).toBe(false)
    expect(isHabitScheduledForDate(intervalHabit, '2026-11-01')).toBe(true)
    expect(isHabitScheduledForDate(intervalHabit, '2026-10-31')).toBe(false)
  })

  it('keeps numeric progress below its target incomplete', () => {
    const numericHabit: Habit = {
      ...habit,
      progressType: 'numeric',
      progressConfig: { numericTarget: 10, numericUnit: 'pages' },
      numericCompleted: { '2026-10-29': 7 },
    }

    expect(isHabitCompleteOnDate(numericHabit, '2026-10-29')).toBe(false)
    expect(isHabitCompleteOnDate({ ...numericHabit, numericCompleted: { '2026-10-29': 10 } }, '2026-10-29')).toBe(true)
    expect(isHabitCompleteOnDate({ ...numericHabit, numericCompleted: { '2026-10-29': 12 } }, '2026-10-29')).toBe(true)
  })

  it('keeps timer progress below its target incomplete', () => {
    const timerHabit: Habit = {
      ...habit,
      progressType: 'timer',
      progressConfig: { timerMinutes: 30 },
      timerCompleted: { '2026-10-29': 15 },
    }

    expect(isHabitCompleteOnDate(timerHabit, '2026-10-29')).toBe(false)
    expect(isHabitCompleteOnDate({ ...timerHabit, timerCompleted: { '2026-10-29': 30 } }, '2026-10-29')).toBe(true)
    expect(isHabitCompleteOnDate({ ...timerHabit, timerCompleted: { '2026-10-29': 45 } }, '2026-10-29')).toBe(true)
  })
})
