import { useEffect, useMemo, useState } from 'react'

function pad(n: number) { return String(n).padStart(2, '0') }

function parsePickerValue(value: string) {
  if (!value) return null
  const [datePart, timePart = '00:00'] = value.replace('T', ' ').split(' ')
  const dateBits = datePart.split('-').map(Number)
  const timeBits = timePart.split(':').map(Number)
  if (dateBits.length !== 3 || dateBits.some(Number.isNaN)) return null
  const date = new Date(dateBits[0], dateBits[1] - 1, dateBits[2], timeBits[0] || 0, timeBits[1] || 0)
  return Number.isNaN(date.getTime()) ? null : date
}

function pickerValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatPickerValue(value: string) {
  const date = parsePickerValue(value)
  if (!date) return 'SELECT DATE & TIME'
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

export default function CustomDateTime({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const initial = parsePickerValue(value) || new Date()
  const [draft, setDraft] = useState(initial)
  const [month, setMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1))

  useEffect(() => {
    if (!open) return
    const current = parsePickerValue(value) || new Date()
    setDraft(current)
    setMonth(new Date(current.getFullYear(), current.getMonth(), 1))
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', key)
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', key) }
  }, [open, value])

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const start = new Date(month.getFullYear(), month.getMonth(), 1 - first.getDay())
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  }, [month])

  const chooseDay = (day: Date) => {
    const next = new Date(draft)
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
    setDraft(next)
  }
  const changeTime = (part: 'hour' | 'minute', raw: string) => {
    const next = new Date(draft)
    const n = Math.max(0, Math.min(part === 'hour' ? 23 : 59, Number(raw) || 0))
    if (part === 'hour') next.setHours(n)
    else next.setMinutes(n)
    setDraft(next)
  }
  const shiftMonth = (amount: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1))
  const today = new Date()

  return <>
    <label className="custom-date">
      <span>{label}</span>
      <button type="button" className={`custom-date-trigger ${open ? 'is-open' : ''}`} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        <span className={value ? '' : 'placeholder'}>{formatPickerValue(value)}</span><b aria-hidden="true">▣</b>
      </button>
      <small>LOCAL TIME · 24 HOUR · CUSTOM PICKER</small>
    </label>
    {open && <div className="custom-picker-backdrop" role="presentation" onMouseDown={e => { if (e.currentTarget === e.target) setOpen(false) }}>
      <section className="custom-picker" role="dialog" aria-modal="true" aria-labelledby={`${label.replaceAll(' ', '-')}-picker-title`}>
        <div className="custom-picker-head"><div><span className="kicker">{label.toUpperCase()} // 01</span><h2 id={`${label.replaceAll(' ', '-')}-picker-title`}>Set date & time</h2></div><button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close date picker">×</button></div>
        <div className="custom-picker-body">
          <div className="calendar-block">
            <div className="calendar-nav"><button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">←</button><strong>{month.toLocaleDateString([], { month: 'long', year: 'numeric' })}</strong><button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">→</button></div>
            <div className="calendar-weekdays">{['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => <span key={d}>{d}</span>)}</div>
            <div className="calendar-grid">{days.map(day => { const same = day.toDateString() === draft.toDateString(); const outside = day.getMonth() !== month.getMonth(); const isToday = day.toDateString() === today.toDateString(); return <button type="button" key={day.toISOString()} className={`calendar-day ${same ? 'selected' : ''} ${outside ? 'outside' : ''} ${isToday ? 'today' : ''}`} onClick={() => chooseDay(day)} aria-label={day.toDateString()}>{day.getDate()}</button> })}</div>
            <button type="button" className="calendar-today" onClick={() => { const now = new Date(); setDraft(now); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)) }}>TODAY ↗</button>
          </div>
          <div className="time-block">
            <span className="time-label">TIME / 24 HOUR</span>
            <div className="time-readout"><strong>{pad(draft.getHours())}</strong><span>:</span><strong>{pad(draft.getMinutes())}</strong></div>
            <div className="time-control"><div><button type="button" onClick={() => changeTime('hour', String((draft.getHours() + 1) % 24))}>+</button><input value={pad(draft.getHours())} inputMode="numeric" aria-label="Hour" onChange={e => changeTime('hour', e.target.value)} /><button type="button" onClick={() => changeTime('hour', String((draft.getHours() + 23) % 24))}>−</button></div><span>:</span><div><button type="button" onClick={() => changeTime('minute', String((draft.getMinutes() + 5) % 60))}>+</button><input value={pad(draft.getMinutes())} inputMode="numeric" aria-label="Minute" onChange={e => changeTime('minute', e.target.value)} /><button type="button" onClick={() => changeTime('minute', String((draft.getMinutes() + 55) % 60))}>−</button></div></div>
            <div className="picker-summary"><span>SELECTED</span><strong>{draft.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</strong><strong>{pad(draft.getHours())}:{pad(draft.getMinutes())}</strong></div>
          </div>
        </div>
        <div className="custom-picker-actions"><button type="button" className="picker-clear" onClick={() => { onChange(''); setOpen(false) }}>CLEAR</button><button type="button" className="picker-cancel" onClick={() => setOpen(false)}>CANCEL</button><button type="button" className="picker-set" onClick={() => { onChange(pickerValue(draft)); setOpen(false) }}>SET DATE →</button></div>
      </section>
    </div>}
  </>
}
