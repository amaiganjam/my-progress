'use strict';
const TRACKS = ['smoking', 'drinking', 'weed'];
const KEY = 'my-progress-v1';
const $ = id => document.getElementById(id);
let state = {selected:'smoking', dates:{smoking:null, drinking:null, weed:null}};
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
function elapsed(start, now = Date.now()) {
  const total = Math.max(0, Math.floor((now - start) / 60000));
  return [Math.floor(total / 1440), Math.floor(total / 60) % 24, total % 60];
}
function render() {
  const selected = state.selected;
  document.querySelectorAll('[role=tab]').forEach(tab => {
    const active = tab.dataset.track === selected;
    tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
  });
  $('tracker').setAttribute('aria-labelledby', `tab-${selected}`);
  $('category').textContent = selected.toUpperCase();
  const date = state.dates[selected];
  $('timer-title').textContent = date === null ? 'Your next chapter starts here.' : 'This is time you’ve given yourself.';
  $('timer-caption').textContent = date === null ? 'Set your last-use date to begin tracking.' : 'One moment at a time. It all adds up.';
  const parts = date === null ? ['—','—','—'] : elapsed(date);
  ['days','hours','minutes'].forEach((id,i) => $(id).textContent = typeof parts[i] === 'number' ? String(parts[i]).padStart(2,'0') : parts[i]);
  $('last-used').textContent = date === null ? 'Not set yet' : new Date(date).toLocaleString(undefined,{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',timeZoneName:'short'});
  $('edit').textContent = date === null ? 'Set last-use date ↗' : 'Edit / reset last-use date ↗';
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
    if (event.key === 'ArrowRight') next = (i+1)%3;
    if (event.key === 'ArrowLeft') next = (i+2)%3;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = 2;
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
  if (saved) $('status').textContent = 'Last-use date saved. Your next moment starts here.';
};
render();
if (!storageOK) persist();
setInterval(render,1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
window.addEventListener('pageshow',render);
window.addEventListener('storage',event => { if (event.key === KEY) location.reload(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => { $('status').textContent = 'Offline setup is unavailable. Open the app over HTTPS or localhost.'; });
