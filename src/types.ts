export type HabitIcon =
  | 'book'
  | 'water'
  | 'run'
  | 'meditate'
  | 'code'
  | 'music'
  | 'dumbbell'
  | 'heart'
  | 'home'
  | 'laptop'
  | 'plane'
  | 'shopping'
  | 'food'
  | 'wallet'
  | 'gift'
  | 'camera'
  | 'study'
  | 'pet'
export type HabitType = 'habit' | 'single_task'
export type ProgressType = 'yes_no' | 'numeric' | 'checklist' | 'timer'
export type FrequencyType = 'every_day' | 'days_of_week' | 'days_of_month' | 'days_of_year' | 'days_per_period' | 'flexible_interval'

export interface HabitFrequency {
  type: FrequencyType
  daysOfWeek?: number[]
  daysOfMonth?: number[]
  daysOfYear?: string[]
  occurrences?: number
  periodDays?: number
  intervalDays?: number
}

export interface Habit {
  id: string
  name: string
  icon: HabitIcon
  color: string
  completedDates: string[]
  createdAt: string
  startDate?: string
  scheduledDate?: string
  type?: HabitType
  progressType?: ProgressType
  frequency?: HabitFrequency
  progressConfig?: {
    numericTarget?: number
    numericUnit?: string
    checklistItems?: string[]
    checklistSuccess?: 'all' | 'custom' | 'any' | 'minimum'
    checklistSuccessCount?: number
    timerMinutes?: number
  }
  checklistCompleted?: Record<string, string[]>
  numericCompleted?: Record<string, number>
  timerCompleted?: Record<string, number>
  endDate?: string
  hasEndDate?: boolean
  priority?: number
}

export interface HabitForm {
  name: string
  icon: HabitIcon
  color: string
  startDate: string
  type: HabitType
  progressType: ProgressType
  frequency: HabitFrequency
  numericTarget?: number
  numericUnit?: string
  checklistItems?: string[]
  checklistSuccess?: 'all' | 'custom' | 'any' | 'minimum'
  checklistSuccessCount?: number
  timerMinutes?: number
  hasEndDate: boolean
  endDate?: string
  priority?: number
}
