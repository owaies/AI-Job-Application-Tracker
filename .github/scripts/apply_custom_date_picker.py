from pathlib import Path

app = Path('frontend/src/App.tsx')
css = Path('frontend/src/styles.css')
text = app.read_text()

if "from './CustomDateTime'" not in text:
    marker = "import { api, ApplicationAnalytics, JobApplication, SmartAction, User } from './api'"
    text = text.replace(marker, marker + "\nimport CustomDateTime from './CustomDateTime'")

start = text.index('function CustomDateTime(')
end = text.index('\n\nfunction ConfirmModal', start)
text = text[:start] + text[end + 2:]
app.write_text(text)

style = r'''

/* CUSTOM DATE/TIME PICKER */
.custom-date { position: relative; }
.custom-date-trigger { width: 100%; min-height: 58px; border: 3px solid var(--ink); padding: 11px 12px; background: var(--white); color: var(--ink); display: flex; align-items: center; justify-content: space-between; text-align: left; font-weight: 700; }
.custom-date-trigger:hover, .custom-date-trigger.is-open { background: var(--lime); }
.custom-date-trigger .placeholder { color: var(--muted); }
.custom-date-trigger b { font-size: 1rem; }
.custom-date small { display: block; margin-top: 6px; }
.custom-picker-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 20px; background: rgba(17,19,26,.72); }
.custom-picker { width: min(760px, 100%); max-height: min(850px, calc(100vh - 40px)); overflow: auto; border: 4px solid var(--ink); background: var(--paper); box-shadow: 12px 12px 0 var(--pink); }
.custom-picker-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 20px; border-bottom: 3px solid var(--ink); background: var(--white); }
.custom-picker-head h2 { margin: 10px 0 0; }
.custom-picker-body { display: grid; grid-template-columns: 1.35fr .65fr; gap: 0; }
.calendar-block { padding: 20px; border-right: 3px dashed var(--ink); }
.calendar-nav { display: grid; grid-template-columns: 44px 1fr 44px; align-items: center; gap: 8px; margin-bottom: 18px; }
.calendar-nav button, .time-control button { min-height: 42px; border: 3px solid var(--ink); background: var(--yellow); font-weight: 900; font-size: 1.1rem; }
.calendar-nav strong { text-align: center; font-size: 1.15rem; text-transform: uppercase; }
.calendar-weekdays, .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.calendar-weekdays { margin-bottom: 6px; }
.calendar-weekdays span { text-align: center; font: 700 .58rem 'Space Mono', monospace; color: var(--muted); }
.calendar-day { aspect-ratio: 1; border: 2px solid transparent; background: transparent; color: var(--ink); font-weight: 700; }
.calendar-day:hover { border-color: var(--ink); background: var(--cyan); }
.calendar-day.outside { color: #aaa; }
.calendar-day.today { border-color: var(--pink); }
.calendar-day.selected { background: var(--pink); border-color: var(--ink); box-shadow: 3px 3px 0 var(--ink); }
.calendar-today { margin-top: 14px; border: 2px solid var(--ink); background: var(--lime); padding: 8px 12px; font: 700 .62rem 'Space Mono', monospace; }
.time-block { padding: 20px; background: var(--yellow); display: flex; flex-direction: column; }
.time-label { font: 700 .65rem 'Space Mono', monospace; }
.time-readout { margin: 18px 0; padding: 12px; border: 3px solid var(--ink); background: var(--white); display: flex; justify-content: center; gap: 8px; font: 700 2.7rem 'Space Mono', monospace; }
.time-control { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 7px; }
.time-control > div { display: grid; gap: 6px; }
.time-control input { min-width: 0; text-align: center; border-width: 3px; padding: 9px 4px; font: 700 1.25rem 'Space Mono', monospace; }
.time-control > span { font-weight: 900; }
.picker-summary { margin-top: auto; padding: 14px; border: 3px dashed var(--ink); display: grid; gap: 5px; }
.picker-summary span { font: 700 .58rem 'Space Mono', monospace; }
.picker-summary strong { font-size: .9rem; }
.custom-picker-actions { display: flex; justify-content: flex-end; gap: 10px; padding: 15px 20px; border-top: 3px solid var(--ink); background: var(--ink); }
.custom-picker-actions button { min-height: 44px; padding: 9px 14px; border: 3px solid var(--white); font-weight: 800; }
.picker-clear { margin-right: auto; background: transparent; color: white; border-color: transparent !important; }
.picker-cancel { background: var(--white); color: var(--ink); }
.picker-set { background: var(--pink); color: var(--ink); border-color: var(--ink) !important; box-shadow: 4px 4px 0 var(--yellow); }
@media (max-width: 640px) {
  .custom-picker-backdrop { padding: 0; align-items: end; }
  .custom-picker { width: 100%; max-height: 94vh; border-width: 3px 3px 0; box-shadow: 7px 0 0 var(--pink); }
  .custom-picker-head { padding: 16px; }
  .custom-picker-body { grid-template-columns: 1fr; }
  .calendar-block { border-right: 0; border-bottom: 3px dashed var(--ink); padding: 14px; }
  .calendar-day { min-height: 38px; }
  .time-block { padding: 14px; }
  .time-readout { margin: 10px 0; font-size: 2rem; }
  .picker-summary { margin-top: 12px; }
  .custom-picker-actions { padding: 12px; }
}
'''
css_text = css.read_text()
if '/* CUSTOM DATE/TIME PICKER */' not in css_text:
    css.write_text(css_text + style)
