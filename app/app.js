// Leonida Trophy Guide — offline tracker for the 55 GTA VI trophies.
// Progress lives in localStorage; export/import moves it between browsers.
// Spoiler mode hides hidden trophies until they are earned. All data is local:
// trophies.json (official names, descriptions, grades + our own guides) and
// roadmap.json (the 6-stage roadmap and the 100% checklist). No network use.
const KEY = 'gta6-trophy-guide-earned-v1';
const $ = (id) => document.getElementById(id);
const rowsEl = $('rows');
const searchEl = $('search');
const gradeEl = $('grade');
const spoilersEl = $('spoilers');
const hideEarnedEl = $('hideEarned');

const trophiesDoc = await (await fetch('data/trophies.json')).json();
const roadmapDoc = await (await fetch('data/roadmap.json')).json();
const trophies = trophiesDoc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
earned = new Set([...earned].filter((id) => byId.has(id)));
let kind = 'all';
let openId = null;

// Deep-link: filter/search state lives in the URL so a filtered view can be shared.
function readUrl() {
  const p = new URLSearchParams(location.search);
  const q = p.get('q');
  if (q) searchEl.value = q;
  const g = p.get('grade');
  if (g && ['all', 'platinum', 'gold', 'silver', 'bronze'].includes(g)) gradeEl.value = g;
  const k = p.get('kind');
  if (k && ['all', 'story', 'missable', 'collectibles', 'activities', 'online'].includes(k)) kind = k;
  if (p.get('spoilers') === '0') spoilersEl.checked = false;
  if (p.get('hideEarned') === '1') hideEarnedEl.checked = true;
}
function syncUrl() {
  const p = new URLSearchParams();
  if (searchEl.value.trim()) p.set('q', searchEl.value.trim());
  if (gradeEl.value !== 'all') p.set('grade', gradeEl.value);
  if (kind !== 'all') p.set('kind', kind);
  if (!spoilersEl.checked) p.set('spoilers', '0');
  if (hideEarnedEl.checked) p.set('hideEarned', '1');
  const qs = p.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}
function syncPills() {
  document.querySelectorAll('#kindPills .pill').forEach((x) => {
    const on = x.dataset.kind === kind;
    x.classList.toggle('active', on);
    x.setAttribute('aria-pressed', String(on));
  });
}
readUrl();

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

function gradeLabel(g) {
  return { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' }[g] ?? g;
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length;
  $('earnedCount').textContent = n;
  $('earnedPct').textContent = `${Math.round((n / total) * 100)}%`;
  $('progressFill').style.width = `${(n / total) * 100}%`;
  $('progressBar').setAttribute('aria-valuenow', String(n));
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const id of earned) counts[byId.get(id).grade]++;
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) totals[t.grade]++;
  $('gradeCounts').innerHTML = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => {
      const color = { platinum: '#7cc4ff', gold: '#e9a800', silver: '#9aa3b2', bronze: '#c47b4a' }[g];
      return `<li><span class="dot" style="background:${color}"></span>${gradeLabel(g)} <b>${counts[g]}/${totals[g]}</b></li>`;
    })
    .join('');
}

function renderRoadmap() {
  $('stages').innerHTML = roadmapDoc.stages
    .map((s) => `<li><span class="num">${s.n}</span><h3>${s.name}</h3><span class="tcount">${s.trophies}</span><p>${s.detail}</p>${s.warning ? `<p class="warn">⚠ ${s.warning}</p>` : ''}</li>`)
    .join('');
  $('checklistNote').textContent = roadmapDoc.checklist100.note;
  $('checklistGroups').innerHTML = roadmapDoc.checklist100.groups
    .map((g) => `<div><h3>${g.name} · ${g.count}</h3><ul>${g.items.map((i) => `<li>${i}</li>`).join('')}</ul></div>`)
    .join('');
  $('checklistSources').innerHTML = `Sources: ${roadmapDoc.checklist100.sources.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join(' · ')}`;
}

function isHidden(t) {
  return t.hidden && !spoilersEl.checked && !earned.has(t.id);
}

function matches(t) {
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earned.has(t.id)) return false;
  if (kind === 'story' && t.kind !== 'story') return false;
  if (kind === 'missable' && !t.missable) return false;
  if (kind === 'collectibles' && t.kind !== 'collectibles') return false;
  if (kind === 'activities' && t.kind !== 'activities') return false;
  if (kind === 'online') return false; // GTA VI has no online trophies.
  const q = searchEl.value.trim().toLowerCase();
  if (q && !`${t.name} ${t.description} ${t.guide}`.toLowerCase().includes(q)) return false;
  return true;
}

function badge(t) {
  const out = [];
  if (t.missable) out.push('<span class="badge missable">⚠ Possibly missable</span>');
  if (t.hidden) out.push('<span class="badge hidden">Hidden on PS5</span>');
  if (t.kind !== 'milestone') out.push(`<span class="badge kind">${t.kind}</span>`);
  if (t.count != null) out.push(`<span class="badge count">${typeof t.count === 'number' && t.count > 1000 ? '$' + new Intl.NumberFormat(navigator.language).format(t.count) : t.count}</span>`);
  return out.join('');
}

function rowEl(t) {
  const li = document.createElement('li');
  li.className = `row${earned.has(t.id) ? ' earned' : ''}`;
  li.dataset.id = t.id;
  const hidden = isHidden(t);
  const head = document.createElement('div');
  head.className = 'row-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.name = 'earned';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${hidden ? 'hidden trophy' : t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    render();
  });
  const main = document.createElement('div');
  main.className = 'row-main';
  const title = document.createElement('div');
  title.className = 'row-title';
  const chip = document.createElement('span');
  chip.className = `grade-chip grade-${t.grade}`;
  chip.textContent = gradeLabel(t.grade);
  title.append(chip);
  if (hidden) {
    const mask = document.createElement('span');
    mask.className = 'spoiler-mask';
    mask.textContent = '🔒 Hidden trophy — earn it or turn spoilers on';
    title.append(mask);
  } else {
    const h = document.createElement('h3');
    h.textContent = t.name;
    title.append(h);
    const desc = document.createElement('span');
    desc.className = 'official';
    desc.textContent = t.description;
    title.append(desc);
  }
  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.innerHTML = badge(t);
  main.append(title, badges);
  head.append(box, main);
  head.setAttribute('role', 'button');
  head.setAttribute('tabindex', '0');
  head.setAttribute('aria-expanded', String(openId === t.id));
  head.setAttribute('aria-controls', `guide-${t.id}`);
  const toggleGuide = () => {
    openId = openId === t.id ? null : t.id;
    render();
  };
  head.addEventListener('click', (e) => {
    if (e.target === box) return;
    toggleGuide();
  });
  head.addEventListener('keydown', (e) => {
    if (e.target !== head) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleGuide();
    }
  });
  li.append(head);
  if (openId === t.id && !hidden) {
    const guide = document.createElement('div');
    guide.className = 'row-guide';
    guide.id = `guide-${t.id}`;
    const p = document.createElement('p');
    p.textContent = t.guide;
    const sources = document.createElement('p');
    sources.className = 'sources';
    sources.innerHTML = `Sources: ${t.sources.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join(' · ')}`;
    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.innerHTML = `Roadmap stage <b>${t.stage}</b> · ${t.hidden ? 'Hidden on PlayStation until earned' : 'Visible from the start'} · ${t.missable ? '<b>Possibly missable — see the warning above.</b>' : 'Not missable'}`;
    guide.append(p, sources, meta);
    li.append(guide);
  }
  return li;
}

function render() {
  renderProgress();
  syncUrl();
  // Re-rendering rebuilds the rows, which would drop keyboard focus to <body>.
  // Remember which row had focus and restore it to the rebuilt head.
  const focusedId = document.activeElement?.closest?.('.row')?.dataset.id;
  const shown = trophies.filter(matches);
  rowsEl.replaceChildren(...shown.map(rowEl));
  if (focusedId) {
    const head = rowsEl.querySelector(`.row[data-id="${focusedId}"] .row-head`);
    if (head) head.focus();
  }
  $('emptyState').hidden = shown.length > 0;
  const kindCount = kind === 'online' ? 0 : shown.length;
  $('countLine').textContent =
    kind === 'online'
      ? 'GTA VI has no online trophies — all 55 unlock in single player.'
      : `Showing ${shown.length} of ${trophies.length} trophies · ${earned.size} earned`;
  void kindCount;
}

document.querySelectorAll('#kindPills .pill').forEach((b) => {
  b.addEventListener('click', () => {
    kind = b.dataset.kind;
    syncPills();
    render();
  });
});
syncPills();
let searchTimer = 0;
searchEl.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(render, 150);
});
gradeEl.addEventListener('change', render);
spoilersEl.addEventListener('change', render);
hideEarnedEl.addEventListener('change', render);

$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((x, y) => x - y) }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned ?? [];
    const valid = ids.filter((id) => byId.has(id));
    if (!valid.length) throw new Error('no valid trophy ids');
    earned = new Set(valid);
    save();
    $('importError').hidden = true;
    render();
  } catch {
    const err = $('importError');
    err.textContent = 'That file is not a trophy-progress export from this guide. Export your progress first, then import that file.';
    err.hidden = false;
  }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    save();
    render();
  }
});

renderRoadmap();
render();
