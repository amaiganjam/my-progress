'use strict';
const TRACKS = ['drinking', 'smoking', 'weed', 'porn'];
const KEY = 'my-progress-v1';
const $ = id => document.getElementById(id);
let state = {selected:'drinking', dates:{smoking:null, drinking:null, weed:null, porn:null}};
let storageOK = true;
try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (saved && typeof saved === 'object') {
    if (TRACKS.includes(saved.selected)) state.selected = saved.selected;
    for (const key of TRACKS) {
      const value = saved.dates?.[key];
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= Date.now()) state.dates[key] = value;
    }
  }
} catch { storageOK = false; }
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); storageOK = true; return true; }
  catch { storageOK = false; $('status').textContent = 'This browser cannot save your progress. Allow website storage to keep dates after closing.'; return false; }
}
const DAY = 86400000;
const icons = {
  porn: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M9 21h6m-3-4v4m-4-7 8-7"/>',
  smoking: '<path d="M3 15h15v4H3zM7 15v4m14-4v4M17 12c0-2 3-2 3-4 0-1-.6-1.8-1.5-2.3M13 12c0-2 3-2 3-4"/>',
  drinking: '<path d="M5 9v11a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9m0 2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2M8 13v5m5-5v5M5 9a2.5 2.5 0 0 1 1.8-4.5 3 3 0 0 1 5.2-.7A2.7 2.7 0 0 1 16 5a2 2 0 0 1 1 4H5Z"/>',
  weed: '<path d="M12 22v-5m0 0c-2-6-2-10 0-15 2 5 2 9 0 15Zm0 0C7 15 5 12 4 7c4 2 7 5 8 10Zm0 0c5-2 7-5 8-10-4 2-7 5-8 10Zm0 0c-4 2-7 1-10-3 4 0 7 1 10 3Zm0 0c4 2 7 1 10-3-4 0-7 1-10 3Z"/>'
};
function progress(start, now = Date.now()) {
  now = Math.max(start, now);
  const first = new Date(start), current = new Date(now);
  const firstMonth = first.getFullYear() * 12 + first.getMonth();
  const currentMonth = current.getFullYear() * 12 + current.getMonth();
  const monthStart = new Date(first.getFullYear(), first.getMonth(), 1).getTime();
  const firstFullMonth = firstMonth + (start > monthStart ? 1 : 0);
  return { days: Math.floor((now-start)/DAY), months: Math.max(0, currentMonth - firstFullMonth) };
}
function calendarProgress(now = new Date()) {
  const monthDays = now.getDate();
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return { monthDays, totalDays, percent: 100 * monthDays / totalDays };
}

let lastTrack, lastMonthCount;
function render() {
  const selected = state.selected;
  document.querySelectorAll('[role=tab]').forEach(tab => {
    const active = tab.dataset.track === selected;
    tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
  });
  $('tracker').setAttribute('aria-labelledby', `tab-${selected}`);
  if (lastTrack !== selected) {
    $('category-icon').innerHTML = `<svg viewBox="0 0 24 24">${icons[selected]}</svg>`;
    lastTrack = selected;
    $('month-detail').hidden = true;

  }
  const date = state.dates[selected];
  const result = date === null ? {days:null, months:0} : progress(date);
  const unit = result.days === 1 ? 'day' : 'days';
  $('days').textContent = result.days === null ? '—' : result.days.toLocaleString();
  $('unit').textContent = unit;
  $('day-description').textContent = result.days === null ? 'Last-use date not set' : `${result.days} ${unit}`;
  const calendar = calendarProgress();
  $('arc').style.width = `${calendar.percent}%`;
  $('month-detail').textContent = `${calendar.monthDays}/${calendar.totalDays} days completed this month`;
  if (result.months !== lastMonthCount) {
    $('months').textContent = result.months;
    lastMonthCount = result.months;
  }
  const action = date === null ? 'Set last-use date' : 'Edit / reset last-use date';
  $('edit').setAttribute('aria-label', action);
  $('edit').title = action;
}
function localValue(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
const tabs = [...document.querySelectorAll('[role=tab]')];
tabs.forEach((tab,i) => {
  tab.addEventListener('click', () => { state.selected = tab.dataset.track; persist(); render(); });
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (i+1)%tabs.length;
    if (event.key === 'ArrowLeft') next = (i+tabs.length-1)%tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); tabs[next].click(); tabs[next].focus(); }
  });
});
$('edit').onclick = () => {
  $('edit-title').textContent = `Last use · ${state.selected}`;
  $('last-input').max = localValue(Date.now());
  $('last-input').value = localValue(state.dates[state.selected] ?? Date.now());
  $('error').textContent = ''; $('editor').showModal();
};
$('cancel').onclick = () => $('editor').close();
$('now').onclick = () => { $('last-input').max = localValue(Date.now()); $('last-input').value = localValue(Date.now()); $('error').textContent = ''; };
$('date-form').onsubmit = event => {
  event.preventDefault();
  const value = new Date($('last-input').value).getTime();
  if (!Number.isFinite(value) || value < 0 || value > Date.now()) { $('error').textContent = 'Choose a valid date and time that is not in the future.'; return; }
  state.dates[state.selected] = value;
  const saved = persist(); render(); $('editor').close();
  if (saved) $('status').textContent = '';
};
const bar = $('gauge');
const reveal = show => { $('month-detail').hidden = !show; };
bar.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  bar.setPointerCapture(event.pointerId);
  reveal(true);
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur']) {
  bar.addEventListener(type, () => reveal(false));
}
bar.addEventListener('contextmenu', event => event.preventDefault());
bar.addEventListener('keydown', event => {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    reveal(true);
  }
  if (event.key === 'Escape') reveal(false);
});
bar.addEventListener('keyup', event => {
  if (event.key === ' ' || event.key === 'Enter') reveal(false);
});
window.addEventListener('blur', () => reveal(false));
document.addEventListener('visibilitychange', () => { if (document.hidden) reveal(false); });
render();
if (!storageOK) persist();
setInterval(render,1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
window.addEventListener('pageshow',render);
window.addEventListener('storage',event => { if (event.key === KEY) location.reload(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => { $('status').textContent = 'Offline setup is unavailable. Open the app over HTTPS or localhost.'; });
