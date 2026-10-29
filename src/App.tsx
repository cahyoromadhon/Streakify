import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  BookOpen,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Check,
  Droplets,
  Dumbbell,
  Flame,
  Gift,
  Goal,
  Heart,
  House,
  Laptop,
  LayoutDashboard,
  Menu,
  ListChecks,
  Music2,
  Camera,
  Pencil,
  PawPrint,
  Plane,
  Plus,
  Rocket,
  ShoppingBag,
  Settings,
  Sparkles,
  GraduationCap,
  Timer,
  Hash,
  Trash2,
  Utensils,
  Wallet,
  X,
} from 'lucide-react'
import { addDays, differenceInCalendarDays, format, getDay, isSameDay, parseISO, startOfMonth, startOfWeek, subDays } from 'date-fns'
import { initialHabits } from './data'
import { getDailyStreak, getStreak, isDateInFuture, isHabitCompleteOnDate, isHabitListComplete, isHabitScheduledForDate, STORAGE_KEY, todayKey } from './lib/habits'
import type { FrequencyType, Habit, HabitForm, HabitIcon, HabitType, ProgressType } from './types'

const iconMap = {
  book: BookOpen,
  water: Droplets,
  run: Rocket,
  meditate: Sparkles,
  code: Goal,
  music: Music2,
  dumbbell: Dumbbell,
  heart: Heart,
  home: House,
  laptop: Laptop,
  plane: Plane,
  shopping: ShoppingBag,
  food: Utensils,
  wallet: Wallet,
  gift: Gift,
  camera: Camera,
  study: GraduationCap,
  pet: PawPrint,
}

const iconOptions: { value: HabitIcon; label: string }[] = [
  { value: 'book', label: 'Book' },
  { value: 'water', label: 'Water' },
  { value: 'run', label: 'Run' },
  { value: 'meditate', label: 'Mind' },
  { value: 'code', label: 'Work' },
  { value: 'music', label: 'Music' },
  { value: 'dumbbell', label: 'Fitness' },
  { value: 'heart', label: 'Health' },
  { value: 'home', label: 'Home' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'plane', label: 'Travel' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'food', label: 'Food' },
  { value: 'wallet', label: 'Finance' },
  { value: 'gift', label: 'Gift' },
  { value: 'camera', label: 'Camera' },
  { value: 'study', label: 'Study' },
  { value: 'pet', label: 'Pet' },
]

const colorOptions = ['#353892', '#20a4f3', '#f97316', '#22c55e', '#e84d8a', '#8b5cf6']
const THEME_KEY = 'habitly-theme-color'
const MAX_REPEAT_DAYS = 365
const emptyFrequency = { type: 'every_day' as FrequencyType, daysOfWeek: [1, 2, 3, 4, 5], daysOfMonth: [1], daysOfYear: [], occurrences: 1, periodDays: 7, intervalDays: 2 }
const emptyForm: HabitForm = { name: '', icon: 'book', color: colorOptions[0], startDate: todayKey, type: 'habit', progressType: 'yes_no', frequency: emptyFrequency, numericTarget: 1, numericUnit: '', checklistItems: [''], checklistSuccess: 'all', checklistSuccessCount: 1, timerMinutes: 5, hasEndDate: false, endDate: '', priority: 1 }
const frequencyOptions: { value: FrequencyType; label: string }[] = [
  { value: 'every_day', label: 'Every day' },
  { value: 'days_of_week', label: 'Specific days of the week' },
  { value: 'days_of_month', label: 'Specific days of the month' },
  { value: 'days_of_year', label: 'Specific days of the year' },
  { value: 'flexible_interval', label: 'Repeat' },
]
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthDays = Array.from({ length: 31 }, (_, index) => index + 1)
const months = Array.from({ length: 12 }, (_, index) => format(new Date(2024, index, 1), 'MMMM'))
const progressOptions: { value: ProgressType; label: string; icon: React.ReactNode }[] = [
  { value: 'yes_no', label: 'Yes or no', icon: <CheckCircle2 size={18} /> },
  { value: 'numeric', label: 'Numeric value', icon: <Hash size={18} /> },
  { value: 'checklist', label: 'Checklist', icon: <ListChecks size={18} /> },
  { value: 'timer', label: 'Timer', icon: <Timer size={18} /> },
]

function formatDateForDisplay(value?: string) {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  return year && month && day ? `${day}/${month}/${year}` : ''
}

function parseDisplayDate(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return ''
  const [, day, month, year] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return ''
  return `${year}-${month}-${day}`
}

function DateField({ value, onChange, allowEmpty = false, showPicker = true }: { value?: string; onChange: (value: string) => void; allowEmpty?: boolean; showPicker?: boolean }) {
  const [displayValue, setDisplayValue] = useState(formatDateForDisplay(value))
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    setDisplayValue(formatDateForDisplay(value))
  }, [value])

  function handleChange(nextValue: string) {
    const digits = nextValue.replace(/\D/g, '').slice(0, 8)
    const formatted = digits.length > 4 ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}` : digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
    setDisplayValue(formatted)
    if (allowEmpty && !formatted) onChange('')
    else {
      const parsed = parseDisplayDate(formatted)
      if (parsed) onChange(parsed)
    }
  }

  function handleBlur() {
    if (!displayValue || parseDisplayDate(displayValue)) return
    setDisplayValue(formatDateForDisplay(value))
  }

  return <><div className="flex items-center gap-2"><input inputMode="numeric" placeholder="dd/mm/yyyy" value={displayValue} onChange={(event) => handleChange(event.target.value)} onBlur={handleBlur} className="input" aria-label="Date in day month year format" />{showPicker && <button type="button" onClick={() => setPickerOpen(true)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-[var(--accent)] hover:accent-text" aria-label="Open date picker"><CalendarDays size={18} /></button>}</div>{showPicker && pickerOpen && <DatePickerModal dateKey={value ?? ''} onClose={() => setPickerOpen(false)} onSelect={(dateKey) => { onChange(dateKey); setPickerOpen(false) }} />}</>
}

function loadHabits(): Habit[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) as Habit[] : initialHabits
  } catch {
    return initialHabits
  }
}

function App() {
  const [habits, setHabits] = useState<Habit[]>(loadHabits)
  const [selectedId, setSelectedId] = useState('read')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [modalStep, setModalStep] = useState<1 | 2 | 3 | 4>(1)
  const [nameError, setNameError] = useState('')
  const [frequencyError, setFrequencyError] = useState('')
  const [detailsError, setDetailsError] = useState('')
  const [priorityError, setPriorityError] = useState('')
  const [checklistEditorOpen, setChecklistEditorOpen] = useState(false)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [checklistProgress, setChecklistProgress] = useState<{ habitId: string; dateKey: string } | null>(null)
  const [valueProgress, setValueProgress] = useState<{ habitId: string; dateKey: string } | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)
  const [form, setForm] = useState<HabitForm>(emptyForm)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem(THEME_KEY) ?? colorOptions[0])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dateWindowStart, setDateWindowStart] = useState(subDays(new Date(), 6))
  const [dateDragOffset, setDateDragOffset] = useState(0)
  const [isDraggingDates, setIsDraggingDates] = useState(false)
  const dateStripRef = useRef<HTMLDivElement>(null)
  const dateDragRef = useRef({ startX: 0, moved: false, initialStart: dateWindowStart, dayShift: 0, pressedDate: '' })
  const nameAlertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedHabit = habits.find((habit) => habit.id === selectedId) ?? habits[0]
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd')
  const visibleHabits = habits.filter((habit) => isHabitScheduledForDate(habit, selectedDateKey)).sort((a, b) => (a.priority ?? 1) - (b.priority ?? 1))
  const completedOnSelectedDate = visibleHabits.filter((habit) => habit.completedDates.includes(selectedDateKey)).length
  const dateBlocks = Array.from({ length: 14 }, (_, index) => addDays(dateWindowStart, index))
  const weeklyDates = Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), index))
  const appStyle = { '--accent': themeColor, '--accent-dark': themeColor } as CSSProperties

  useEffect(() => () => {
    if (nameAlertTimerRef.current) clearTimeout(nameAlertTimerRef.current)
  }, [])

  function persist(next: Habit[]) {
    setHabits(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function changeThemeColor(color: string) {
    setThemeColor(color)
    localStorage.setItem(THEME_KEY, color)
  }

  function showNameError() {
    setNameError('Please enter a name for your habit')
    if (nameAlertTimerRef.current) clearTimeout(nameAlertTimerRef.current)
    nameAlertTimerRef.current = setTimeout(() => {
      setNameError('')
      nameAlertTimerRef.current = null
    }, 1000)
  }

  function startDateDrag(event: React.PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement
    const dateButton = target.closest<HTMLButtonElement>('[data-date]')
    dateDragRef.current = {
      startX: event.clientX,
      moved: false,
      initialStart: dateWindowStart,
      dayShift: 0,
      pressedDate: dateButton?.dataset.date ?? '',
    }
    setIsDraggingDates(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDateDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingDates) return
    const delta = event.clientX - dateDragRef.current.startX
    if (Math.abs(delta) > 5) dateDragRef.current.moved = true
    const cellWidth = (dateStripRef.current?.clientWidth ?? 700) / 14
    const dayShift = Math.round(-delta / cellWidth)
    dateDragRef.current.dayShift = dayShift
    setDateWindowStart(addDays(dateDragRef.current.initialStart, dayShift))
    setDateDragOffset(delta + dayShift * cellWidth)
  }

  function endDateDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingDates) return
    const delta = event.clientX - dateDragRef.current.startX
    const cellWidth = (dateStripRef.current?.clientWidth ?? 700) / 14
    const dayShift = Math.round(-delta / cellWidth)
    setDateWindowStart(addDays(dateDragRef.current.initialStart, dayShift))
    setDateDragOffset(0)
    setIsDraggingDates(false)
    if (!dateDragRef.current.moved && dateDragRef.current.pressedDate) {
      setSelectedDate(new Date(`${dateDragRef.current.pressedDate}T00:00:00`))
    }
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  function toggleDate(id: string, date: Date) {
    if (isDateInFuture(date)) return
    const key = format(date, 'yyyy-MM-dd')
    persist(habits.map((habit) => habit.id === id
      ? { ...habit, completedDates: habit.completedDates.includes(key) ? habit.completedDates.filter((value) => value !== key) : [...habit.completedDates, key] }
      : habit))
  }

  function toggleChecklistItem(habitId: string, dateKey: string, item: string) {
    persist(habits.map((habit) => {
      if (habit.id !== habitId) return habit
      const current = habit.checklistCompleted?.[dateKey] ?? []
      const nextItems = current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
      return { ...habit, checklistCompleted: { ...habit.checklistCompleted, [dateKey]: nextItems }, completedDates: isHabitCompleteOnDate({ ...habit, checklistCompleted: { ...habit.checklistCompleted, [dateKey]: nextItems } }, dateKey) ? [...new Set([...habit.completedDates, dateKey])] : habit.completedDates.filter((value) => value !== dateKey) }
    }))
  }

  function saveValueProgress(habitId: string, dateKey: string, value: number) {
    persist(habits.map((habit) => {
      if (habit.id !== habitId) return habit
      const nextHabit = habit.progressType === 'numeric'
        ? { ...habit, numericCompleted: { ...habit.numericCompleted, [dateKey]: value } }
        : { ...habit, timerCompleted: { ...habit.timerCompleted, [dateKey]: value } }
      const complete = isHabitCompleteOnDate(nextHabit, dateKey)
      return { ...nextHabit, completedDates: complete ? [...new Set([...habit.completedDates, dateKey])] : habit.completedDates.filter((entry) => entry !== dateKey) }
    }))
    setValueProgress(null)
  }

  function openAdd() {
    setForm({ ...emptyForm, startDate: selectedDateKey })
    setNameError('')
    setFrequencyError('')
    setDetailsError('')
    setPriorityError('')
    setModalStep(1)
    setModal('add')
  }

  function openEdit(habit: Habit) {
    setSelectedId(habit.id)
    setForm({ ...emptyForm, name: habit.name, icon: habit.icon, color: habit.color, startDate: habit.startDate ?? habit.createdAt, type: habit.type ?? 'habit', progressType: habit.progressType ?? 'yes_no', frequency: habit.frequency ?? emptyFrequency, ...habit.progressConfig, hasEndDate: habit.hasEndDate ?? Boolean(habit.endDate), endDate: habit.endDate ?? '', priority: habit.priority ?? 1 })
    setNameError('')
    setFrequencyError('')
    setDetailsError('')
    setPriorityError('')
    setModalStep(1)
    setModal('edit')
  }

  function saveHabit(event: React.FormEvent, startDate = form.startDate) {
    event.preventDefault()
    if (!form.name.trim()) return
    const progressConfig = {
      numericTarget: form.numericTarget,
      numericUnit: form.numericUnit,
      checklistItems: form.checklistItems?.map((item) => item.trim()).filter(Boolean),
      checklistSuccess: form.checklistSuccess,
      checklistSuccessCount: form.checklistSuccessCount,
      timerMinutes: form.timerMinutes,
    }
    const hasChecklist = Boolean(progressConfig.checklistItems?.length)
    const progressType = form.type === 'single_task' && hasChecklist ? 'checklist' as ProgressType : form.progressType
    const habitDetails = { ...form, progressType, frequency: form.type === 'single_task' ? undefined : form.frequency, progressConfig, endDate: form.hasEndDate ? form.endDate : undefined, priority: Math.min(10, Math.max(1, form.priority || 1)) }
    if (modal === 'edit' && selectedHabit) {
      persist(habits.map((habit) => habit.id === selectedHabit.id ? { ...habit, ...habitDetails, startDate, scheduledDate: startDate, name: form.name.trim() } : habit))
    } else {
      const newHabit: Habit = { id: crypto.randomUUID(), ...habitDetails, name: form.name.trim(), completedDates: [], createdAt: todayKey, startDate, scheduledDate: startDate }
      persist([...habits, newHabit])
      setSelectedId(newHabit.id)
    }
    setModal(null)
  }

  function requestDeleteHabit(habitId: string) {
    const habit = habits.find((item) => item.id === habitId)
    if (!habit) return
    setDeleteConfirmation(habitId)
  }

  function deleteHabit(habitId: string) {
    const habit = habits.find((item) => item.id === habitId)
    if (!habit) return
    const next = habits.filter((item) => item.id !== habitId)
    persist(next)
    if (selectedId === habitId) setSelectedId(next[0]?.id ?? '')
    setDeleteConfirmation(null)
    setModal(null)
  }

  function renderHabitModal() {
    if (!modal) return null
    const slideTitles = form.type === 'single_task' ? ['Create a single task'] : ['Choose progress type', 'Progress details', 'Set frequency', 'Set details']
    const updateForm = (changes: Partial<HabitForm>) => setForm((current) => ({ ...current, ...changes }))
    const updateFrequency = (changes: Partial<HabitForm['frequency']>) => updateForm({ frequency: { ...form.frequency, ...changes } })
    const progressLabels: Record<ProgressType, string> = { yes_no: 'With yes or no', numeric: 'With numeric value', timer: 'With a timer', checklist: 'With checklist' }
    const taskShortcutOptions = (() => {
      const fixedOptions = iconOptions.slice(0, 4)
      const selectedOption = iconOptions.find((option) => option.value === form.icon)
      if (selectedOption && !fixedOptions.some((option) => option.value === selectedOption.value)) return [...fixedOptions, selectedOption]
      return [...fixedOptions, iconOptions[4]]
    })()
    const nextSlide = () => {
      if (modalStep === 2 && !form.name.trim()) {
        showNameError()
        return
      }
      if (form.type === 'single_task') return
      if (modalStep === 2 && form.progressType === 'numeric' && (!form.numericTarget || form.numericTarget < 1)) return
      if (modalStep === 2 && form.progressType === 'timer' && (!form.timerMinutes || form.timerMinutes < 1)) return
      if (modalStep === 2 && form.progressType === 'checklist' && !(form.checklistItems ?? []).some((item) => item.trim())) return
      if (modalStep === 3 && form.frequency.type === 'flexible_interval' && (!form.frequency.intervalDays || form.frequency.intervalDays < 1 || form.frequency.intervalDays > MAX_REPEAT_DAYS)) {
        setFrequencyError('Enter a repeat interval from 1 to 365 days')
        return
      }
      setFrequencyError('')
      setModalStep((current) => Math.min(4, current + 1) as 1 | 2 | 3 | 4)
    }
    const submit = (event: React.FormEvent) => {
      event.preventDefault()
      if (form.type === 'single_task') {
        if (!form.name.trim()) {
          showNameError()
          return
        }
        if (!form.priority || form.priority < 1 || form.priority > 10) {
          setPriorityError('Enter a priority from 1 to 10')
          return
        }
        setPriorityError('')
        saveHabit(event, form.startDate)
        return
      }
      if (modalStep < 4) {
        nextSlide()
        return
      }
      if (form.hasEndDate && (!form.endDate || form.endDate < form.startDate)) {
        setDetailsError('Choose an end date on or after the start date')
        return
      }
      if (!form.priority || form.priority < 1 || form.priority > 10) {
        setPriorityError('Enter a priority from 1 to 10')
        return
      }
      setDetailsError('')
      setPriorityError('')
      saveHabit(event, form.startDate)
    }
    return <>
      <Modal title={slideTitles[modalStep - 1]} onClose={() => setModal(null)}>
        <form onSubmit={submit}>
        <div className={modalStep === 1 ? '' : 'hidden'}>
          <fieldset>
            <legend className="label">What are you creating?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['habit', 'single_task'] as HabitType[]).map((type) => <button type="button" key={type} onClick={() => { updateForm({ type }); if (type === 'single_task' && modalStep > 2) setModalStep(2) }} className={`rounded-xl border p-3 text-sm font-bold ${form.type === type ? 'accent-border accent-text bg-[#f4f3ff]' : 'border-slate-100 text-muted'}`}>{type === 'habit' ? 'Habit' : 'Single task'}</button>)}
            </div>
          </fieldset>
          {form.type === 'habit' && <fieldset className="mt-5">
            <legend className="label">How will you track progress?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['yes_no', 'numeric', 'timer', 'checklist'] as ProgressType[]).map((type) => <button type="button" key={type} onClick={() => updateForm({ progressType: type })} className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-bold ${form.progressType === type ? 'accent-border accent-text bg-[#f4f3ff]' : 'border-slate-100 text-muted'}`}>{progressOptions.find((option) => option.value === type)?.icon}<span>{progressLabels[type]}</span></button>)}
            </div>
          </fieldset>}
          <fieldset className="mt-5">
            <legend className="label">Choose an icon</legend>
            <div className="mt-2 grid grid-cols-6 gap-2">{(form.type === 'single_task' ? taskShortcutOptions : iconOptions).map(({ value, label }) => { const Icon = iconMap[value]; return <button type="button" key={value} onClick={() => updateForm({ icon: value })} className={`flex items-center justify-center rounded-xl border p-3 ${form.icon === value ? 'accent-border accent-text bg-[#f4f3ff]' : 'border-slate-100 text-muted'}`} aria-label={label}><Icon size={19} /></button> })}{form.type === 'single_task' && <button type="button" onClick={() => setIconPickerOpen(true)} className="flex items-center justify-center rounded-xl border border-slate-100 p-3 text-lg font-extrabold text-muted transition hover:border-[var(--accent)] hover:accent-text" aria-label="Show more icons">...</button>}</div>
          </fieldset>
          {form.type === 'single_task' && <div className="mt-5 grid gap-4">
            <label className="label">Task name
              <input autoFocus value={form.name} onChange={(event) => { updateForm({ name: event.target.value }); if (event.target.value.trim()) setNameError('') }} placeholder="e.g. Submit the report" className={`input ${nameError ? 'name-input-error' : ''}`} aria-invalid={Boolean(nameError)} />
            </label>
            <label className="label">Date<DateField value={form.startDate} onChange={(startDate) => updateForm({ startDate })} /></label>
            <button type="button" onClick={() => { updateForm({ progressType: 'checklist' }); setChecklistEditorOpen(true) }} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 text-left transition hover:border-[var(--accent)] hover:bg-[#fbfaff]"><span><span className="block text-sm font-bold">Checklist <span className="font-normal text-muted">(optional)</span></span><span className="mt-1 block text-xs text-muted">{(form.checklistItems ?? []).filter((item) => item.trim()).length ? `${(form.checklistItems ?? []).filter((item) => item.trim()).length} item(s) configured` : 'Add checklist items'}</span></span><span className="text-sm font-bold accent-text">Edit</span></button>
            <label className="label">Priority (1–10)<input type="number" min="1" max="10" value={form.priority ?? ''} onChange={(event) => { const rawValue = event.target.value; const priority = rawValue === '' ? undefined : Math.min(10, Math.max(1, Number(rawValue))); updateForm({ priority }); if (priority) setPriorityError('') }} className="input" aria-invalid={Boolean(priorityError)} />{priorityError && <span className="mt-1 block text-xs font-semibold text-rose-500">{priorityError}</span>}</label>
          </div>}
        </div>
        <div className={modalStep === 2 ? '' : 'hidden'}>
          <label className="label">Habit name
            <input autoFocus value={form.name} onChange={(event) => { updateForm({ name: event.target.value }); if (event.target.value.trim()) setNameError('') }} placeholder="e.g. Read for 15 minutes" className={`input ${nameError ? 'name-input-error' : ''}`} aria-invalid={Boolean(nameError)} />
          </label>
          {form.type === 'habit' && form.progressType === 'numeric' && <label className="label mt-5">Target value<input type="number" min="1" value={form.numericTarget ?? ''} onChange={(event) => updateForm({ numericTarget: event.target.value ? Number(event.target.value) : undefined })} className="input" placeholder="e.g. 8" /><input value={form.numericUnit ?? ''} onChange={(event) => updateForm({ numericUnit: event.target.value })} className="input" placeholder="Unit (optional, e.g. pages)" /></label>}
          {form.type === 'habit' && form.progressType === 'timer' && <label className="label mt-5">Timer duration (minutes)<input type="number" min="1" value={form.timerMinutes ?? ''} onChange={(event) => updateForm({ timerMinutes: event.target.value ? Number(event.target.value) : undefined })} className="input" placeholder="e.g. 20" /></label>}
          {form.type === 'habit' && form.progressType === 'checklist' && <button type="button" onClick={() => setChecklistEditorOpen(true)} className="mt-5 flex w-full items-center justify-between rounded-2xl border border-slate-100 p-4 text-left transition hover:border-[var(--accent)] hover:bg-[#fbfaff]"><span><span className="block text-sm font-bold">Checklist items</span><span className="mt-1 block text-xs text-muted">{(form.checklistItems ?? []).filter((item) => item.trim()).length ? `${(form.checklistItems ?? []).filter((item) => item.trim()).length} item(s) configured` : 'Add checklist items'}</span></span><span className="text-sm font-bold accent-text">Edit</span></button>}
        </div>
        <fieldset className={modalStep === 3 ? 'frequency-fieldset mt-5' : 'hidden'}>
          <legend className="label">How often do you want to do it?</legend>
          <div className="frequency-options mt-2 grid gap-2">{frequencyOptions.map((option) => <button type="button" key={option.value} onClick={() => updateFrequency({ type: option.value })} className={`rounded-xl border p-3 text-left text-xs font-bold ${form.frequency.type === option.value ? 'accent-border accent-text bg-[#f4f3ff]' : 'border-slate-100 text-muted'}`}>{option.label}</button>)}</div>
          {form.frequency.type === 'days_of_week' && <div className="mt-3 grid grid-cols-4 gap-2">{weekDays.map((day, index) => <button type="button" key={day} onClick={() => updateFrequency({ daysOfWeek: form.frequency.daysOfWeek?.includes(index) ? form.frequency.daysOfWeek.filter((value) => value !== index) : [...(form.frequency.daysOfWeek ?? []), index] })} className={`rounded-lg border px-2 py-2 text-xs font-bold ${form.frequency.daysOfWeek?.includes(index) ? 'accent-border accent-text bg-[#f4f3ff]' : 'border-slate-100 text-muted'}`}>{day}</button>)}</div>}
          {form.frequency.type === 'days_of_month' && <div className="mt-3 grid grid-cols-7 gap-2">{monthDays.map((day) => <button type="button" key={day} onClick={() => updateFrequency({ daysOfMonth: form.frequency.daysOfMonth?.includes(day) ? form.frequency.daysOfMonth.filter((value) => value !== day) : [...(form.frequency.daysOfMonth ?? []), day] })} className={`rounded-lg border px-1 py-2 text-xs font-bold ${form.frequency.daysOfMonth?.includes(day) ? 'accent-border accent-text bg-[#f4f3ff]' : 'border-slate-100 text-muted'}`}>{day}</button>)}</div>}
          {form.frequency.type === 'days_of_year' && <YearDatePicker values={form.frequency.daysOfYear ?? []} onChange={(daysOfYear) => updateFrequency({ daysOfYear })} />}
          {form.frequency.type === 'flexible_interval' && <label className="label mt-3">Repeat every (days)<input type="number" min="0" max="365" value={form.frequency.intervalDays ?? ''} onChange={(event) => updateFrequency({ intervalDays: event.target.value ? Math.min(MAX_REPEAT_DAYS, Math.max(0, Number(event.target.value))) : undefined })} className="input" />{frequencyError && <span className="mt-1 block text-xs font-semibold text-rose-500">{frequencyError}</span>}</label>}
        </fieldset>
        <div className={modalStep === 4 ? '' : 'hidden'}>
          <div className="grid gap-4">
            <label className="label">Start date<DateField value={form.startDate} onChange={(startDate) => updateForm({ startDate })} /></label>
            <div><div className="flex items-center justify-between"><span className="label">End date</span><button type="button" role="switch" aria-checked={form.hasEndDate} onClick={() => { updateForm({ hasEndDate: !form.hasEndDate }); setDetailsError('') }} className={`relative h-6 w-11 rounded-full transition ${form.hasEndDate ? 'accent-bg' : 'bg-slate-200'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${form.hasEndDate ? 'left-6' : 'left-1'}`} /></button></div>{form.hasEndDate && <DateField value={form.endDate} allowEmpty onChange={(endDate) => { updateForm({ endDate }); setDetailsError('') }} />}{detailsError && <span className="mt-1 block text-xs font-semibold text-rose-500">{detailsError}</span>}</div>
            <label className="label">Priority (1–10)<input type="number" min="1" max="10" value={form.priority ?? ''} onChange={(event) => { const rawValue = event.target.value; const priority = rawValue === '' ? undefined : Math.min(10, Math.max(1, Number(rawValue))); updateForm({ priority }); if (priority && priority >= 1 && priority <= 10) setPriorityError('') }} className="input" aria-invalid={Boolean(priorityError)} />{priorityError && <span className="mt-1 block text-xs font-semibold text-rose-500">{priorityError}</span>}<span className="mt-1 block text-xs font-normal text-muted">1 is shown first in your habit list.</span></label>
          </div>
        </div>
        {modal === 'edit' && selectedHabit && <button type="button" onClick={() => requestDeleteHabit(selectedHabit.id)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-100 px-4 py-3 text-sm font-bold text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"><Trash2 size={16} /> Delete habit</button>}
        <div className="modal-actions flex items-center justify-between">{modalStep > 1 ? <button type="button" onClick={() => setModalStep((current) => Math.max(1, current - 1) as 1 | 2 | 3 | 4)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-muted hover:bg-slate-50">Back</button> : <span />}
          <button type="submit" className="rounded-xl accent-bg px-5 py-3 text-sm font-bold text-white accent-shadow">{form.type === 'single_task' || modalStep === 4 ? modal === 'edit' ? 'Save changes' : 'Create' : 'Next'}</button>
        </div>
      </form>
      </Modal>
      {checklistEditorOpen && <ChecklistEditorModal items={form.checklistItems ?? ['']} success={form.checklistSuccess ?? 'all'} successCount={form.checklistSuccessCount ?? 1} allowPartial={form.type === 'habit'} onClose={() => setChecklistEditorOpen(false)} onSave={(checklistItems, checklistSuccess, checklistSuccessCount) => { updateForm({ checklistItems, checklistSuccess, checklistSuccessCount }); setChecklistEditorOpen(false) }} />}
      {iconPickerOpen && <IconPickerModal selected={form.icon} onClose={() => setIconPickerOpen(false)} onSelect={(icon) => { updateForm({ icon }); setIconPickerOpen(false) }} />}
    </>
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-ink" style={appStyle}>
      {nameError && <div className="validation-toast" role="alert"><AlertCircle size={18} aria-hidden="true" /><div><strong>Habit name needed</strong><span>{nameError}</span></div></div>}
      <header className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 lg:hidden">
        <Logo />
        <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-50" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu"><Menu size={21} /></button>
      </header>
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-100 bg-white px-5 py-7 transition-transform lg:translate-x-0`}>
        <div className="hidden lg:block"><Logo /></div>
        <nav className="mt-12 space-y-2">
          <NavItem icon={<LayoutDashboard size={18} />} label="Habits" active />
        </nav>
        <div className="mt-auto border-t border-slate-100 pt-7">
          <NavItem icon={<Settings size={18} />} label="Setting" active={false} />
          <div className="mt-4 px-3">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Accent color</p>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((color) => <button key={color} type="button" onClick={() => changeThemeColor(color)} style={{ backgroundColor: color }} className={`h-7 w-7 rounded-full transition ${themeColor === color ? 'ring-2 ring-offset-2 ring-violet' : ''}`} aria-label={`Use ${color} theme`} />)}
              <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-slate-200 bg-[conic-gradient(#f97316,#22c55e,#20a4f3,#8b5cf6,#f97316)]" aria-label="Choose a custom theme color">
                <input type="color" value={themeColor} onChange={(event) => changeThemeColor(event.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
              </label>
            </div>
          </div>
        </div>
      </aside>
      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
          <>
          <section className="mb-7 relative overflow-hidden rounded-3xl p-6 text-white shadow-soft sm:p-8" style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}>
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-7">
              <div><p className="mb-2 text-sm font-semibold text-indigo-100">Daily streak</p><div className="flex items-end gap-3"><span className="text-7xl font-extrabold tracking-tighter">{getDailyStreak(habits)}</span><span className="mb-3 text-lg font-semibold text-indigo-100">days</span></div><p className="mt-2 text-sm text-indigo-100">Complete every habit to grow your streak.</p></div>
              <div className="flex gap-1">{weeklyDates.map((date) => { const complete = isHabitListComplete(habits, date); const active = isSameDay(date, selectedDate); const today = isSameDay(date, new Date()); const future = isDateInFuture(date); return <button type="button" key={date.toISOString()} onClick={() => setSelectedDate(date)} className={`flex h-11 w-11 flex-col items-center justify-center rounded-xl text-[10px] font-bold transition ${active ? 'bg-white text-[var(--accent)]' : complete ? 'bg-white/20 text-white' : 'bg-white/10 text-indigo-200'} ${future ? 'opacity-60' : 'hover:bg-white/25'}`} aria-label={`Select ${format(date, 'EEEE, MMMM d')}`}><span>{format(date, 'EEEEE')}</span>{complete ? <Flame size={14} fill="currentColor" /> : <span className={`mt-1 h-1.5 w-1.5 rounded-full ${today ? 'bg-slate-400' : 'bg-white/40'}`} />}</button> })}</div>
            </div>
            <Flame className="absolute -bottom-8 -right-2 h-48 w-48 rotate-12 text-white/10" fill="currentColor" />
          </section>
          <div className="mb-4 h-[84px] px-1">
            <div ref={dateStripRef} className={`date-strip relative h-full overflow-hidden select-none ${isDraggingDates ? 'cursor-grabbing' : 'cursor-grab'}`} onPointerDown={startDateDrag} onPointerMove={moveDateDrag} onPointerUp={endDateDrag} onPointerCancel={endDateDrag}>
            <div className="absolute inset-0 grid grid-cols-7 gap-2 sm:grid-cols-[repeat(14,minmax(0,1fr))]" style={{ transform: `translateX(${dateDragOffset}px)`, transition: isDraggingDates ? 'none' : 'transform 280ms ease-out' }}>
              {dateBlocks.map((date) => {
                const active = isSameDay(date, selectedDate)
                const dateKey = format(date, 'yyyy-MM-dd')
                const completed = isHabitListComplete(habits, date)
                return <button key={date.toISOString()} data-date={dateKey} className={`flex min-h-[68px] min-w-0 flex-col items-center justify-center rounded-xl border py-2 transition ${active ? 'accent-border accent-bg text-white accent-shadow' : completed ? 'accent-complete' : 'border-slate-100 bg-white text-ink hover:border-[#c9c5ff]'}`}><span className="text-[10px] font-bold uppercase opacity-70">{format(date, 'EEE')}</span><span className="mt-1 text-lg font-extrabold">{format(date, 'd')}</span>{isSameDay(date, new Date()) && <span className={`mt-1 h-1 w-1 rounded-full ${active ? 'bg-white' : completed ? 'accent-dot' : 'accent-bg'}`} />}</button>
              })}
            </div>
            </div>
          </div>
          <section className="relative min-h-[480px] rounded-3xl border border-slate-100 bg-white p-5 shadow-card sm:p-8">
              <div className="mb-6 flex items-start justify-between"><div><h2 className="text-lg font-extrabold">{format(selectedDate, 'dd/MM/yyyy')}</h2><p className="mt-1 text-sm text-muted">{completedOnSelectedDate} of {visibleHabits.length} completed</p></div><button onClick={openAdd} className="rounded-lg p-2 accent-text transition hover:bg-[#f4f3ff]" aria-label="Add habit"><Plus size={19} /></button></div>
              <div className="space-y-3">{visibleHabits.map((habit) => <HabitRow key={habit.id} habit={habit} dateKey={selectedDateKey} selected={selectedId === habit.id} onSelect={() => setSelectedId(habit.id)} onToggle={() => toggleDate(habit.id, selectedDate)} onChecklist={() => setChecklistProgress({ habitId: habit.id, dateKey: selectedDateKey })} onValueProgress={() => setValueProgress({ habitId: habit.id, dateKey: selectedDateKey })} onEdit={() => openEdit(habit)} onDelete={() => requestDeleteHabit(habit.id)} />)}</div>
              {visibleHabits.length === 0 && <div className="flex min-h-64 items-center justify-center text-center text-sm text-muted">Ready to build a new habit?</div>}
          <button onClick={openAdd} className="absolute bottom-7 right-7 z-20 flex h-14 w-14 items-center justify-center rounded-full accent-bg text-white accent-shadow transition hover:-translate-y-1" aria-label="Add new habit"><Plus size={24} /></button>
          </section>
          </>
        </div>
      </main>
      {renderHabitModal()}
      {checklistProgress && (() => {
        const progressHabit = habits.find((habit) => habit.id === checklistProgress.habitId)
        if (!progressHabit) return null
        return <ChecklistProgressModal habit={progressHabit} dateKey={checklistProgress.dateKey} onClose={() => setChecklistProgress(null)} onToggle={toggleChecklistItem} />
      })()}
      {valueProgress && (() => {
        const progressHabit = habits.find((habit) => habit.id === valueProgress.habitId)
        if (!progressHabit) return null
        return <ValueProgressModal habit={progressHabit} dateKey={valueProgress.dateKey} onClose={() => setValueProgress(null)} onSave={saveValueProgress} />
      })()}
      {deleteConfirmation && (() => {
        const habit = habits.find((item) => item.id === deleteConfirmation)
        if (!habit) return null
        return <DeleteHabitModal habitName={habit.name} onCancel={() => setDeleteConfirmation(null)} onConfirm={() => deleteHabit(habit.id)} />
      })()}
    </div>
  )
}

function Logo() { return <div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl accent-bg text-white accent-shadow"><Flame size={19} fill="currentColor" /></div><span className="text-xl font-extrabold tracking-tight">habit<span className="accent-text">ly</span></span></div> }
function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) { return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? 'accent-nav' : 'text-muted hover:bg-slate-50 hover:text-ink'}`}>{icon}<span>{label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full accent-bg" />}</button> }
function DatePickerModal({ dateKey, onClose, onSelect }: { dateKey: string; onClose: () => void; onSelect: (dateKey: string) => void }) {
  const [selectedDateKey, setSelectedDateKey] = useState(dateKey)
  const initialDate = dateKey ? parseISO(dateKey) : new Date()
  const [visibleMonth, setVisibleMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1))
  const monthStart = startOfMonth(visibleMonth)
  const calendarStart = subDays(monthStart, getDay(monthStart))
  const calendarDays = Array.from({ length: 42 }, (_, index) => addDays(calendarStart, index))
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#172033]/35 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div role="dialog" aria-modal="true" aria-labelledby="date-picker-title" className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
      <div className="mb-6 flex items-start justify-between"><div><h2 id="date-picker-title" className="text-xl font-extrabold">Choose a date</h2><p className="mt-1 text-xs text-muted">Jump directly to any day.</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50" aria-label="Close date picker"><X size={18} /></button></div>
      <div className="mb-4 flex items-center justify-between"><button type="button" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-lg px-3 py-2 text-lg font-bold text-muted hover:bg-slate-50" aria-label="Previous month">‹</button><span className="text-sm font-extrabold">{format(visibleMonth, 'MMMM yyyy')}</span><button type="button" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-lg px-3 py-2 text-lg font-bold text-muted hover:bg-slate-50" aria-label="Next month">›</button></div>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-slate-400">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="grid grid-cols-7 gap-1">{calendarDays.map((date) => { const key = format(date, 'yyyy-MM-dd'); const inMonth = date.getMonth() === visibleMonth.getMonth(); const selected = key === selectedDateKey; const today = key === todayKey; return <button type="button" key={key} onClick={() => setSelectedDateKey(key)} className={`h-9 rounded-lg text-xs font-bold transition ${selected ? 'accent-bg text-white accent-shadow' : today ? 'accent-border accent-text border' : inMonth ? 'text-ink hover:bg-[#f4f3ff] accent-hover-text' : 'text-slate-300'}`} aria-label={`Select ${format(date, 'dd/MM/yyyy')}`}>{format(date, 'd')}</button> })}</div>
      <label className="label">Date<DateField value={selectedDateKey} onChange={setSelectedDateKey} showPicker={false} /></label>
      <button type="button" onClick={() => setSelectedDateKey(todayKey)} className="mt-3 text-xs font-bold accent-text hover:underline">Use today</button>
      <div className="mt-7 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-muted transition hover:bg-slate-50">Cancel</button><button type="button" onClick={() => onSelect(selectedDateKey)} disabled={!selectedDateKey} className="rounded-xl accent-bg px-5 py-3 text-sm font-bold text-white accent-shadow disabled:cursor-not-allowed disabled:opacity-50">Select date</button></div>
    </div>
  </div>
}
function IconPickerModal({ selected, onClose, onSelect }: { selected: HabitIcon; onClose: () => void; onSelect: (icon: HabitIcon) => void }) {
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#172033]/35 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div role="dialog" aria-modal="true" aria-labelledby="icon-picker-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
      <div className="mb-6 flex items-start justify-between"><div><h2 id="icon-picker-title" className="text-xl font-extrabold">Choose an icon</h2><p className="mt-1 text-xs text-muted">Pick an icon for your task.</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50" aria-label="Close icon picker"><X size={18} /></button></div>
      <div className="grid grid-cols-4 gap-3">{iconOptions.map(({ value, label }) => { const Icon = iconMap[value]; return <button type="button" key={value} onClick={() => onSelect(value)} className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-xs font-bold transition ${selected === value ? 'accent-border accent-text bg-[#f4f3ff]' : 'border-slate-100 text-muted hover:border-[var(--accent)] hover:accent-text'}`} aria-label={label}><Icon size={21} /><span>{label}</span></button> })}</div>
      <button type="button" onClick={onClose} className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-muted hover:bg-slate-50">Cancel</button>
    </div>
  </div>
}
function DeleteHabitModal({ habitName, onCancel, onConfirm }: { habitName: string; onCancel: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#172033]/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}>
    <div role="dialog" aria-modal="true" aria-labelledby="delete-habit-title" className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500"><Trash2 size={22} /></div>
      <h2 id="delete-habit-title" className="mt-5 text-xl font-extrabold">Delete</h2>
      <p className="mt-2 text-sm leading-6 text-muted">This action cannot be undone.</p>
      <div className="mt-7 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-muted transition hover:bg-slate-50">Cancel</button>
        <button type="button" onClick={onConfirm} className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-600"><Trash2 size={16} /> Delete</button>
      </div>
    </div>
  </div>
}
function HabitRow({ habit, dateKey, selected, onSelect, onToggle, onChecklist, onValueProgress, onEdit, onDelete }: { habit: Habit; dateKey: string; selected: boolean; onSelect: () => void; onToggle: () => void; onChecklist: () => void; onValueProgress: () => void; onEdit: () => void; onDelete: () => void }) { const Icon = iconMap[habit.icon]; const done = isHabitCompleteOnDate(habit, dateKey); const hasChecklist = (habit.progressConfig?.checklistItems?.filter(Boolean).length ?? 0) > 0; const requiresValue = habit.progressType === 'numeric' || habit.progressType === 'timer'; return <div onClick={onSelect} className={`group flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${selected ? 'border-[#dfdcff] bg-[#fbfaff]' : 'border-transparent hover:border-slate-100 hover:bg-slate-50'}`}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: habit.color }}><Icon size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{habit.name}</p><div className="mt-1 flex items-center gap-1 text-xs text-muted"><Flame size={12} className="text-flame" fill="currentColor" /> {getStreak(habit, parseISO(dateKey))}</div></div><button onClick={(event) => { event.stopPropagation(); onEdit() }} className="rounded-lg p-2 text-slate-300 opacity-0 transition hover:bg-white accent-hover-text group-hover:opacity-100" aria-label={`Edit ${habit.name}`}><Pencil size={15} /></button><button onClick={(event) => { event.stopPropagation(); onDelete() }} className="rounded-lg p-2 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100" aria-label={`Delete ${habit.name}`}><Trash2 size={15} /></button><button onClick={(event) => { event.stopPropagation(); hasChecklist ? onChecklist() : requiresValue ? onValueProgress() : onToggle() }} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 transition ${done ? 'accent-border accent-bg text-white accent-shadow' : 'border-slate-200 text-transparent hover:border-[var(--accent)]'}`} aria-label={hasChecklist ? `Edit checklist progress for ${habit.name}` : requiresValue ? `Enter progress for ${habit.name}` : `Mark ${habit.name} complete on ${dateKey}`}>{done && <Check size={17} strokeWidth={3} />}</button></div> }

function ValueProgressModal({ habit, dateKey, onClose, onSave }: { habit: Habit; dateKey: string; onClose: () => void; onSave: (habitId: string, dateKey: string, value: number) => void }) {
  const isTimer = habit.progressType === 'timer'
  const target = isTimer ? habit.progressConfig?.timerMinutes ?? 1 : habit.progressConfig?.numericTarget ?? 1
  const unit = isTimer ? 'minutes' : habit.progressConfig?.numericUnit || 'units'
  const currentValue = isTimer ? habit.timerCompleted?.[dateKey] : habit.numericCompleted?.[dateKey]
  const [value, setValue] = useState(currentValue?.toString() ?? '')
  const [error, setError] = useState('')

  function submit() {
    const parsed = Number(value)
    if (!value || !Number.isFinite(parsed) || parsed < 0) {
      setError(`Enter a valid amount of ${unit}`)
      return
    }
    onSave(habit.id, dateKey, parsed)
  }

  function adjustValue(delta: number) {
    const current = Number(value) || 0
    setValue(String(Math.max(0, current + delta)))
    setError('')
  }

  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#172033]/30 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">{isTimer ? 'Log timer' : 'Log numeric progress'}</h2></div><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50" aria-label="Close progress dialog"><X size={18} /></button></div><p className="mb-6 rounded-2xl bg-[#f4f3ff] px-4 py-3 text-center text-base font-extrabold accent-text">Target: {target} {unit}</p><label className="label">Completed {unit}<div className="mt-2 flex items-center gap-2"><button type="button" onClick={() => adjustValue(-1)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-xl font-bold text-muted transition hover:border-[var(--accent)] hover:accent-text" aria-label={`Decrease ${unit}`}><span aria-hidden="true">−</span></button><input autoFocus type="number" min="0" step="any" value={value} onChange={(event) => { setValue(event.target.value); setError('') }} className="input mt-0 text-center text-lg font-bold" placeholder="0" /><button type="button" onClick={() => adjustValue(1)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-xl font-bold text-muted transition hover:border-[var(--accent)] hover:accent-text" aria-label={`Increase ${unit}`}><span aria-hidden="true">+</span></button></div></label>{error && <span className="mt-2 block text-xs font-semibold text-rose-500">{error}</span>}<div className="mt-8 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-muted hover:bg-slate-50">Cancel</button><button type="button" onClick={submit} className="rounded-xl accent-bg px-5 py-3 text-sm font-bold text-white accent-shadow">Save progress</button></div></div></div>
}
function ChecklistProgressModal({ habit, dateKey, onClose, onToggle }: { habit: Habit; dateKey: string; onClose: () => void; onToggle: (habitId: string, dateKey: string, item: string) => void }) {
  const items = habit.progressConfig?.checklistItems?.filter(Boolean) ?? []
  const completed = new Set(habit.checklistCompleted?.[dateKey] ?? [])
  const success = habit.type === 'single_task' || habit.progressConfig?.checklistSuccess === 'all' ? `Complete all ${items.length} items` : habit.progressConfig?.checklistSuccess === 'any' ? 'Complete at least one item' : `Complete at least ${habit.progressConfig?.checklistSuccessCount ?? 1} items`
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#172033]/30 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">Complete checklist</h2><p className="mt-1 text-xs text-muted">{success}</p></div><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50" aria-label="Close checklist progress"><X size={18} /></button></div><div className="space-y-2">{items.map((item) => <button type="button" key={item} onClick={() => onToggle(habit.id, dateKey, item)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm font-semibold ${completed.has(item) ? 'accent-complete' : 'border-slate-100'}`}><span className={`flex h-5 w-5 items-center justify-center rounded-md border ${completed.has(item) ? 'accent-bg border-transparent text-white' : 'border-slate-300'}`}>{completed.has(item) && <Check size={14} />}</span>{item}</button>)}</div><button type="button" onClick={onClose} className="mt-6 w-full rounded-xl accent-bg px-5 py-3 text-sm font-bold text-white accent-shadow">Done</button></div></div>
}
function ChecklistEditorModal({ items, success, successCount, allowPartial, onClose, onSave }: { items: string[]; success: 'all' | 'custom' | 'any' | 'minimum'; successCount: number; allowPartial: boolean; onClose: () => void; onSave: (items: string[], success: 'all' | 'custom', successCount: number) => void }) {
  const [draftItems, setDraftItems] = useState(items.length ? items : [''])
  const [draftSuccess, setDraftSuccess] = useState(success)
  const [draftSuccessCount, setDraftSuccessCount] = useState(successCount)
  const [successError, setSuccessError] = useState('')
  const itemCount = draftItems.filter((item) => item.trim()).length
  const normalizedSuccess = draftSuccess === 'any' || draftSuccess === 'minimum' ? 'custom' : draftSuccess
  const maxSuccessCount = Math.max(1, itemCount)

  function saveChecklist() {
    if (normalizedSuccess === 'custom' && (!draftSuccessCount || draftSuccessCount < 1 || draftSuccessCount > itemCount)) {
      setSuccessError(`Enter a number from 1 to ${itemCount || 1}`)
      return
    }
    setSuccessError('')
    onSave(draftItems, normalizedSuccess, draftSuccessCount)
  }

  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#172033]/30 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
      <div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">Edit checklist</h2><p className="mt-1 text-xs text-muted">Add the steps you want to track.</p></div><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50" aria-label="Close checklist editor"><X size={18} /></button></div>
      <div className="space-y-3">{draftItems.map((item, index) => <div className="flex gap-2" key={index}><input autoFocus={index === 0} value={item} onChange={(event) => setDraftItems((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} className="input mt-0" placeholder={`Item ${index + 1}`} />{draftItems.length > 1 && <button type="button" onClick={() => setDraftItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xl px-3 text-rose-500" aria-label={`Remove checklist item ${index + 1}`}><X size={16} /></button>}</div>)}</div>
      <button type="button" onClick={() => setDraftItems((current) => [...current, ''])} className="mt-4 text-xs font-bold accent-text">+ Add checklist item</button>
      {allowPartial && <label className="label mt-6">Success condition<select value={normalizedSuccess} onChange={(event) => { setDraftSuccess(event.target.value as 'all' | 'custom'); setSuccessError('') }} className="input"><option value="all">All items</option><option value="custom">Custom</option></select>{normalizedSuccess === 'custom' && <><span className="mt-2 block text-xs font-normal text-muted">How many checklist items must be completed?</span><input type="number" min="1" max={maxSuccessCount} value={draftSuccessCount || ''} onChange={(event) => { const rawValue = event.target.value; setDraftSuccessCount(rawValue === '' ? 0 : Number(rawValue)); setSuccessError('') }} className="input" placeholder={`1-${itemCount || 1}`} />{successError && <span className="mt-1 block text-xs font-semibold text-rose-500">{successError}</span>}</>}</label>}
      <div className="mt-8 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-muted hover:bg-slate-50">Cancel</button><button type="button" onClick={saveChecklist} className="rounded-xl accent-bg px-5 py-3 text-sm font-bold text-white accent-shadow">Done</button></div>
    </div>
  </div>
}
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/30 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="modal-panel min-h-[640px] w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-extrabold">{title}</h2><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50" aria-label="Close dialog"><X size={18} /></button></div>{children}</div></div> }
function YearDatePicker({ values, onChange }: { values: string[]; onChange: (values: string[]) => void }) {
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const currentValue = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const daysInSelectedMonth = new Date(2024, month, 0).getDate()

  function addDate() {
    if (!values.includes(currentValue)) onChange([...values, currentValue])
  }

  return <div className="frequency-detail mt-3">
    <div className="flex items-center gap-2">
      <select value={month} onChange={(event) => setMonth(Number(event.target.value))} className="input min-w-0" style={{ flex: '1 1 0%', width: 'auto', minWidth: '9rem', marginTop: 0 }}>
        {months.map((label, index) => <option key={label} value={index + 1}>{label}</option>)}
      </select>
      <select value={Math.min(day, daysInSelectedMonth)} onChange={(event) => setDay(Number(event.target.value))} className="input shrink-0" style={{ width: '4.5rem', marginTop: 0 }}>
        {monthDays.slice(0, daysInSelectedMonth).map((value) => <option key={value} value={value}>{String(value).padStart(2, '0')}</option>)}
      </select>
      <button type="button" onClick={addDate} className="accent-bg flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-xl text-xl font-bold text-white" style={{ marginTop: 0 }} aria-label="Add yearly date"><Plus size={19} /></button>
    </div>
    <div className="mt-3 space-y-2">
      {values.map((value) => {
        const [selectedMonth, selectedDay] = value.split('-').map(Number)
        return <div key={value} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm font-bold text-ink"><span>{String(selectedDay).padStart(2, '0')} {months[selectedMonth - 1]}</span><button type="button" onClick={() => onChange(values.filter((item) => item !== value))} className="text-slate-400 hover:text-rose-500" aria-label={`Remove ${value}`}><X size={15} /></button></div>
      })}
    </div>
  </div>
}

export default App
