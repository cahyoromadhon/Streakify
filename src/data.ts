import type { Habit } from './types'

export const initialHabits: Habit[] = [
  {
    id: 'read',
    name: 'Read 20 pages',
    icon: 'book',
    color: '#6258e8',
    completedDates: ['2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28'],
    createdAt: '2026-10-20',
  },
  {
    id: 'water',
    name: 'Drink 8 glasses of water',
    icon: 'water',
    color: '#20a4f3',
    completedDates: ['2026-10-26', '2026-10-27'],
    createdAt: '2026-10-20',
  },
  {
    id: 'run',
    name: 'Morning run',
    icon: 'run',
    color: '#f97316',
    completedDates: ['2026-10-23', '2026-10-25', '2026-10-28'],
    createdAt: '2026-10-22',
  },
]
