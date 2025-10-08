const API_BASE = window.API_BASE_URL || 'https://beast-team.onrender.com/api';

function toAbsoluteMediaUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return API_BASE.replace(/\/api$/, '') + url;
  return url;
}

// Add this at the very top of your main.js
console.log('🚀 Frontend loaded on page:', window.location.pathname);

// Enhanced init functions with better debugging
async function initTeamPage() {
  console.log('🔍 Checking for team page elements...');
  const mount = document.getElementById('members-grid');
  const menMount = document.getElementById('members-men');
  const womenMount = document.getElementById('members-women');
  
  console.log('Team elements found:', {
    membersGrid: mount,
    menTeam: menMount,
    womenTeam: womenMount
  });
  
  if (!mount && !menMount && !womenMount) {
    console.log('❌ Not on team page - no team elements found');
    return;
  }
  
  console.log('✅ On team page - loading team data...');
  // Rest of your team page code...
}

async function initGalleryPage() {
  console.log('🔍 Checking for gallery page elements...');
  const mount = document.getElementById('gallery-grid');
  console.log('Gallery element found:', mount);
  
  if (!mount) {
    console.log('❌ Not on gallery page - no gallery element found');
    return;
  }
  
  console.log('✅ On gallery page - loading gallery data...');
  // Rest of your gallery page code...
}

// In-memory token only; cleared on refresh by design
let MEMORY_TOKEN = null;
function getToken() { return MEMORY_TOKEN; }
function setToken(token) { MEMORY_TOKEN = token || null; }
function clearToken() { MEMORY_TOKEN = null; }

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const msg = await res.text().catch(() => 'Request failed');
    const err = new Error(msg || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return await res.json();
}

async function apiPost(path, body, isForm = false) {
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: isForm ? body : JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => 'Request failed');
    const err = new Error(msg || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return await res.json();
}

async function apiPut(path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method: 'PUT', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const msg = await res.text().catch(() => 'Request failed');
    const err = new Error(msg || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return await res.json();
}

async function apiDelete(path) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers });
  if (!res.ok) throw new Error('Request failed');
  return await res.json();
}

function initNavbarActive() {
  const links = document.querySelectorAll('.navbar nav a');
  links.forEach((a) => {
    if (location.pathname.endsWith(a.getAttribute('href'))) {
      a.classList.add('active');
    }
  });
}

// Index page
async function initIndexPage() {
  const hero = document.querySelector('.hero');
  const upcoming = document.getElementById('upcoming-section');
  const titleNode = document.getElementById('upcoming-title');
  const descNode = document.getElementById('upcoming-desc');
  const noteNode = document.getElementById('countdown-note');
  const dNode = document.getElementById('cd-days');
  const hNode = document.getElementById('cd-hours');
  const mNode = document.getElementById('cd-mins');
  const sNode = document.getElementById('cd-secs');
  if (hero) {
    try {
      const settings = await apiGet('/settings');
      if (settings && settings.heroImageUrl) {
        hero.style.backgroundImage = `url(${toAbsoluteMediaUrl(settings.heroImageUrl)})`;
      } else {
        hero.style.backgroundImage = 'url(./images/hero.jpg)';
      }
      // Handle upcoming event countdown
      const ev = settings && settings.upcomingEvent;
      if (upcoming && ev && ev.date && ev.time) {
        const title = (ev.title || 'Upcoming Event').toString();
        if (titleNode) titleNode.textContent = title;
        if (descNode) descNode.textContent = (ev.description || 'Countdown to our next big match');
        const target = typeof ev.timestamp === 'number' ? new Date(ev.timestamp) : new Date(`${ev.date}T${ev.time}:00`);
        if (!isNaN(target.getTime())) {
          upcoming.style.display = '';
          const setNums = (days, hours, mins, secs) => {
            if (dNode) dNode.textContent = String(days);
            if (hNode) hNode.textContent = String(hours).padStart(2,'0');
            if (mNode) mNode.textContent = String(mins).padStart(2,'0');
            if (sNode) sNode.textContent = String(secs).padStart(2,'0');
          };
          setNums(0,0,0,0);
          let timer = setInterval(() => {
            const now = new Date();
            const diff = target.getTime() - now.getTime();
            if (diff <= 0) {
              clearInterval(timer); timer = null;
              setNums(0,0,0,0);
              if (noteNode) noteNode.textContent = "🎉 The event is happening now — join the excitement!";
              return;
            }
            const days = Math.floor(diff / (1000*60*60*24));
            const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
            const mins = Math.floor((diff % (1000*60*60)) / (1000*60));
            const secs = Math.floor((diff % (1000*60)) / 1000);
            setNums(days, hours, mins, secs);
          }, 1000);
        } else {
          if (upcoming) upcoming.style.display = 'none';
        }
      } else if (upcoming) {
        upcoming.style.display = 'none';
      }
    } catch (_) {
      hero.style.backgroundImage = 'url(./images/hero.jpg)';
      if (upcoming) upcoming.style.display = 'none';
    }
  }
}

// Team page
async function initTeamPage() {
  const mount = document.getElementById('members-grid');
  const menMount = document.getElementById('members-men');
  const womenMount = document.getElementById('members-women');
  const storyNode = document.getElementById('teams-story');
  if (!mount && !menMount && !womenMount) return;
  try {
    const [members, settings] = await Promise.all([apiGet('/members'), apiGet('/settings').catch(() => ({}))]);
    const card = (m) => `
      <article class="team-card col-3 reveal" data-team="${(m.team || 'men').toString().toLowerCase()}">
        <span class="glow"></span>
        <img class="media" src="${toAbsoluteMediaUrl(m.photoUrl) || '../images/placeholder-player.jpg'}" alt="${m.name}" loading="lazy">
        <div class="content">
          <div class="name">${m.name}</div>
          <div class="role">${m.position}</div>
        </div>
      </article>`;
    if (menMount || womenMount) {
      const men = members.filter((m) => (m.team || 'men').toString().toLowerCase() === 'men');
      const women = members.filter((m) => (m.team || '').toString().toLowerCase() === 'women');
      if (menMount) menMount.innerHTML = men.map(card).join('');
      if (womenMount) womenMount.innerHTML = women.map(card).join('');
    }
    // Team tabs simply scroll to sections
    const teamTabs = document.querySelectorAll('.team-filters .filter-tab');
    teamTabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        teamTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.team === 'women' ? womenMount : menMount;
        if (target && typeof target.scrollIntoView === 'function') target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    if (storyNode && settings && settings.teamsStory) {
      storyNode.textContent = settings.teamsStory;
    } else if (storyNode) {
      storyNode.textContent = '';
    }
  } catch (e) {
    if (menMount) menMount.innerHTML = '<p>Failed to load members.</p>';
    if (womenMount) womenMount.innerHTML = '';
    if (storyNode) storyNode.textContent = '';
  }
}

// Gallery page
async function initGalleryPage() {
  const mount = document.getElementById('gallery-grid');
  if (!mount) return;
  try {
    const items = await apiGet('/gallery');
    // Render uniform square grid with lazy loading, no captions/labels
    const spans = ['span-3','span-3','span-3','span-3'];
    mount.innerHTML = items.map((it, idx) => {
      const span = spans[idx % spans.length];
      const src = toAbsoluteMediaUrl(it.fileUrl);
      const thumb = src; // no filenames/captions visible
      if (it.type === 'video') {
        return `
        <article class="gallery-item ${span}" data-type="video" data-src="${src}" tabindex="0">
          <div class="media" style="display:grid;place-items:center;background:linear-gradient(135deg,#111 0%, #1d1d1d 100%);">
            <span class="pill" style="background:rgba(0,0,0,0.6);border:1px solid #262626;">Video</span>
          </div>
          <div class="play"><span>▶</span></div>
        </article>`;
      }
      return `
      <article class="gallery-item ${span}" data-type="image" data-src="${src}" tabindex="0">
        <img class="media" src="${thumb}" alt="Image" loading="lazy" />
      </article>`;
    }).join('');

    // Filters
    const tabs = document.querySelectorAll('.filter-tab');
    function applyFilter(kind) {
      mount.querySelectorAll('.gallery-item').forEach((el) => {
        const t = el.getAttribute('data-type');
        el.style.display = (t === kind) ? '' : 'none';
      });
    }
    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.filter || 'image');
      });
    });
    // default to Photos
    applyFilter('image');

    // Lightbox with navigation
    const lightbox = document.getElementById('lightbox');
    const backdrop = lightbox ? lightbox.querySelector('[data-close]') : null;
    const content = lightbox ? lightbox.querySelector('.lightbox-content') : null;
    const closeBtns = lightbox ? lightbox.querySelectorAll('[data-close]') : [];
    const prevBtn = lightbox ? lightbox.querySelector('[data-prev]') : null;
    const nextBtn = lightbox ? lightbox.querySelector('[data-next]') : null;
    const nodes = Array.from(mount.querySelectorAll('.gallery-item'));
    let current = -1;

    function renderLightbox(index) {
      if (!lightbox || !content) return;
      const node = nodes[index]; if (!node) return;
      content.innerHTML = '';
      const type = node.getAttribute('data-type');
      const src = node.getAttribute('data-src');
      if (type === 'video') {
        const v = document.createElement('video');
        v.src = src; v.controls = true; v.autoplay = true; v.style.maxWidth = '90vw'; v.style.maxHeight = '85vh';
        content.appendChild(v);
      } else {
        const i = document.createElement('img');
        i.src = src; i.style.maxWidth = '90vw'; i.style.maxHeight = '85vh';
        content.appendChild(i);
      }
    }
    function openAt(index) {
      current = index;
      renderLightbox(current);
      if (lightbox) lightbox.classList.remove('hidden');
    }
    function close() { if (lightbox) lightbox.classList.add('hidden'); }
    function next() { openAt((current + 1) % nodes.length); }
    function prev() { openAt((current - 1 + nodes.length) % nodes.length); }

    nodes.forEach((n, idx) => {
      n.addEventListener('click', () => openAt(idx));
      n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(idx); } });
    });
    if (backdrop) backdrop.addEventListener('click', close);
    closeBtns.forEach((b) => b.addEventListener('click', close));
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);
    window.addEventListener('keydown', (e) => {
      if (!lightbox || lightbox.classList.contains('hidden')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    // Swipe navigation (basic)
    let startX = 0;
    function onTouchStart(e){ startX = e.touches[0].clientX; }
    function onTouchEnd(e){ const dx = e.changedTouches[0].clientX - startX; if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); } }
    if (content) {
      content.addEventListener('touchstart', onTouchStart, { passive: true });
      content.addEventListener('touchend', onTouchEnd, { passive: true });
    }
  } catch (e) {
    mount.innerHTML = '<p>Failed to load gallery.</p>';
  }
}

// Admin page
function toggleAdminUI(isAuthed) {
  const loginCard = document.getElementById('admin-login');
  const dash = document.getElementById('admin-dashboard');
  if (loginCard && dash) {
    loginCard.classList.toggle('hidden', isAuthed);
    dash.classList.toggle('hidden', !isAuthed);
  }
}

async function initAdminPage() {
  const onPage = document.getElementById('admin-page-root');
  if (!onPage) return;

  toggleAdminUI(!!getToken());

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const username = formData.get('username');
      const password = formData.get('password');
      try {
        const { token } = await apiPost('/admin/login', { username, password });
        setToken(token); // memory-only session
        toggleAdminUI(true);
        refreshAdminLists();
      } catch (_) {
        alert('Login failed');
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearToken();
      toggleAdminUI(false);
    });
  }

  // Admin transfer UI (modal-less inline flow)
  const memberCard = document.querySelector('#admin-dashboard');
  if (memberCard) {
    // Insert a simple transfer form
    const container = document.createElement('div');
    container.className = 'card';
    container.style.padding = '16px';
    container.innerHTML = `
      <h3>Transfer Admin</h3>
      <form id="transfer-start-form">
        <input type="text" name="currentUsername" placeholder="Current Username" required />
        <input type="password" name="currentPassword" placeholder="Current Password" required />
        <input type="text" name="newUsername" placeholder="New Admin Username" required />
        <input type="password" name="newPassword" placeholder="New Admin Password" required />
        <button type="submit">Start Transfer</button>
      </form>
      <form id="transfer-confirm-form" style="margin-top:10px">
        <input type="text" name="token" placeholder="Paste verification token" required />
        <button type="submit">Confirm Transfer</button>
      </form>
      <small>This demo uses an in-memory token; in production a link is emailed.</small>
    `;
    memberCard.querySelector('.grid')?.appendChild(container);

    const startForm = container.querySelector('#transfer-start-form');
    const confirmForm = container.querySelector('#transfer-confirm-form');
    startForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(startForm);
      const payload = Object.fromEntries(fd.entries());
      try {
        const { transferToken } = await apiPost('/admin/transfer/start', payload);
        confirmForm.querySelector('input[name="token"]').value = transferToken;
        alert('Verification token generated. Check your email in production.');
      } catch (_) { alert('Failed to start transfer'); }
    });
    confirmForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(confirmForm);
      const token = fd.get('token');
      try {
        await apiPost('/admin/transfer/confirm', { token });
        // Force logout everywhere by rotating tokenVersion
        try { await apiPost('/admin/rotate', {}); } catch (_) {}
        clearToken();
        toggleAdminUI(false);
        alert('Admin transferred. All sessions logged out.');
      } catch (_) { alert('Failed to confirm transfer'); }
    });
  }

  const memberForm = document.getElementById('member-form');
  if (memberForm) {
    memberForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(memberForm);
      // Ensure team is always present and normalized
      const rawTeam = (fd.get('team') || 'men').toString().trim().toLowerCase();
      const normTeam = rawTeam === 'women' ? 'women' : 'men';
      fd.set('team', normTeam);
      try {
        await apiPost('/members', fd, true);
        memberForm.reset();
        refreshMembersTable();
      } catch (_) { alert('Failed to add member'); }
    });
  }
  const settingsForm = document.getElementById('settings-form');
  const eventForm = document.getElementById('event-form');
  const teamsStoryForm = document.getElementById('teams-story-form');
  async function loadSettings() {
    try {
      const s = await apiGet('/settings');
      if (!settingsForm) return;
      settingsForm.heroImageUrl.value = s.heroImageUrl || '';
      const nm = s.nextMatch || {};
      settingsForm.opponent.value = nm.opponent || '';
      settingsForm.venue.value = nm.venue || '';
      settingsForm.date.value = nm.date || '';
      settingsForm.time.value = nm.time || '';
      const soc = s.social || {};
      settingsForm.instagram.value = soc.instagram || '';
      settingsForm.facebook.value = soc.facebook || '';
      settingsForm.tiktok.value = soc.tiktok || '';
      settingsForm.whatsapp.value = soc.whatsapp || '';
      if (eventForm) {
        const ev = s.upcomingEvent || {};
        eventForm.title.value = ev.title || '';
        eventForm.date.value = ev.date || '';
        eventForm.time.value = ev.time || '';
      }
      if (teamsStoryForm) {
        teamsStoryForm.story.value = s.teamsStory || '';
      }
    } catch (_) {}
  }
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        heroImageUrl: settingsForm.heroImageUrl.value || undefined,
        nextMatch: {
          opponent: settingsForm.opponent.value || undefined,
          venue: settingsForm.venue.value || undefined,
          date: settingsForm.date.value || undefined,
          time: settingsForm.time.value || undefined,
        },
        social: {
          instagram: settingsForm.instagram.value || undefined,
          facebook: settingsForm.facebook.value || undefined,
          tiktok: settingsForm.tiktok.value || undefined,
          whatsapp: settingsForm.whatsapp.value || undefined,
        }
      };
      try { await apiPut('/settings', payload); alert('Saved'); } catch (err) { console.error(err); alert(`Failed to save: ${err.status || ''} ${err.message || ''}`); }
    });
    loadSettings();
  }
  if (eventForm) {
    eventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const date = eventForm.date.value || undefined;
      const time = eventForm.time.value || undefined;
      let timestamp = undefined;
      if (date && time) {
        const local = new Date(`${date}T${time}:00`);
        if (!isNaN(local.getTime())) timestamp = local.getTime();
      }
      const payload = { upcomingEvent: {
        title: eventForm.title.value || undefined,
        date,
        time,
        description: eventForm.description ? (eventForm.description.value || undefined) : undefined,
        timestamp,
      }};
      try { await apiPut('/settings', payload); alert('Event saved'); } catch (err) { console.error(err); alert(`Failed to save: ${err.status || ''} ${err.message || ''}`); }
    });
  }
  if (teamsStoryForm) {
    teamsStoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = { teamsStory: teamsStoryForm.story.value || '' };
      try { await apiPut('/settings', payload); alert('Story saved'); } catch (err) { console.error(err); alert(`Failed to save: ${err.status || ''} ${err.message || ''}`); }
    });
  }

  const heroFile = document.getElementById('hero-file');
  const heroUpload = document.getElementById('hero-upload');
  const heroDelete = document.getElementById('hero-delete');
  const heroPreview = document.getElementById('hero-preview');
  async function refreshHeroPreview() {
    try {
      const s = await apiGet('/settings');
      if (heroPreview) {
        const url = s.heroImageUrl ? toAbsoluteMediaUrl(s.heroImageUrl) : '';
        heroPreview.src = url || '';
        heroPreview.style.display = url ? 'block' : 'none';
      }
      if (settingsForm && s.heroImageUrl) settingsForm.heroImageUrl.value = s.heroImageUrl;
    } catch (_) {}
  }
  if (heroUpload) {
    heroUpload.addEventListener('click', async () => {
      if (!heroFile || !heroFile.files || !heroFile.files[0]) { alert('Choose an image first'); return; }
      const fd = new FormData();
      fd.append('hero', heroFile.files[0]);
      try {
        await apiPost('/settings/hero', fd, true);
        await refreshHeroPreview();
        alert('Hero image updated');
      } catch (err) { console.error(err); alert(`Failed to upload hero: ${err.status || ''} ${err.message || ''}`); }
    });
  }
  if (heroDelete) {
    heroDelete.addEventListener('click', async () => {
      if (!confirm('Delete current hero image?')) return;
      try {
        const headers = {};
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/settings/hero`, { method: 'DELETE', headers });
        if (!res.ok) throw new Error('Delete failed');
        await refreshHeroPreview();
        alert('Hero image deleted');
      } catch (err) { console.error(err); alert(`Failed to delete hero: ${err.status || ''} ${err.message || ''}`); }
    });
  }
  if (heroPreview) refreshHeroPreview();

  const newsForm = document.getElementById('news-form');
  async function refreshNewsTable() {
    const tbody = document.querySelector('#news-table tbody');
    if (!tbody) return;
    try {
      const s = await apiGet('/settings');
      const news = Array.isArray(s.news) ? s.news : [];
      tbody.innerHTML = news.map((n, idx) => `
        <tr>
          <td>${n.title}</td>
          <td>${n.imageUrl ? `<a href="${toAbsoluteMediaUrl(n.imageUrl)}" target="_blank">image</a>` : '-'}</td>
          <td><button class="ghost" data-del-news="${idx}">Delete</button></td>
        </tr>`).join('');
      tbody.querySelectorAll('button[data-del-news]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this news item?')) return;
          try {
            const s2 = await apiGet('/settings');
            const arr = Array.isArray(s2.news) ? s2.news : [];
            const i = parseInt(btn.dataset.delNews, 10);
            arr.splice(i, 1);
            await apiPut('/settings', { news: arr });
            refreshNewsTable();
          } catch (_) { alert('Failed to delete'); }
        });
      });
    } catch (_) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="3">Failed to load news</td></tr>';
    }
  }
  if (newsForm) {
    newsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(newsForm);
      const title = fd.get('title');
      const body = fd.get('body');
      const imageUrl = fd.get('imageUrl') || undefined;
      try {
        const s = await apiGet('/settings');
        const news = Array.isArray(s.news) ? s.news : [];
        news.unshift({ title, body, imageUrl });
        await apiPut('/settings', { news });
        newsForm.reset();
        refreshNewsTable();
      } catch (err) { console.error(err); alert(`Failed to add news: ${err.status || ''} ${err.message || ''}`); }
    });
    refreshNewsTable();
  }

  const galleryForm = document.getElementById('gallery-form');
  if (galleryForm) {
    const input = document.getElementById('media-input');
    const selectBtn = document.getElementById('select-files');
    const uploadArea = document.getElementById('upload-area');
    const previewGrid = document.getElementById('preview-grid');
    const MAX_FILES = 10;
    const MAX_TOTAL_BYTES = 50 * 1024 * 1024; // 50MB
    let filesQueue = [];

    function renderPreviews() {
      previewGrid.innerHTML = filesQueue.map((file, idx) => {
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video/');
        return `
        <div class="preview-card" data-i="${idx}">
          ${isVideo ? `<video class="thumb" src="${url}" muted></video>` : `<img class="thumb" src="${url}" alt="${file.name}">`}
          <div class="meta">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80%">${file.name}</span>
            <button type="button" class="remove" data-remove="${idx}">Remove</button>
          </div>
          <div class="progress" data-progress="${idx}"></div>
        </div>`;
      }).join('');
      // Bind remove
      previewGrid.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = parseInt(btn.getAttribute('data-remove'), 10);
          filesQueue.splice(i, 1);
          renderPreviews();
        });
      });
    }

    function acceptFiles(list) {
      const incoming = Array.from(list || []);
      let all = filesQueue.concat(incoming);
      // Enforce max count
      if (all.length > MAX_FILES) all = all.slice(0, MAX_FILES);
      // Enforce total size
      let total = all.reduce((s, f) => s + f.size, 0);
      while (total > MAX_TOTAL_BYTES && all.length > 0) {
        all.pop();
        total = all.reduce((s, f) => s + f.size, 0);
      }
      filesQueue = all;
      renderPreviews();
    }

    if (selectBtn && input) selectBtn.addEventListener('click', () => input.click());
    if (input) input.addEventListener('change', () => acceptFiles(input.files));
    if (uploadArea) {
      ;['dragenter','dragover'].forEach(ev => uploadArea.addEventListener(ev, (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); }));
      ;['dragleave','drop'].forEach(ev => uploadArea.addEventListener(ev, (e) => { e.preventDefault(); uploadArea.classList.remove('dragover'); }));
      uploadArea.addEventListener('drop', (e) => {
        acceptFiles(e.dataTransfer.files);
      });
    }

    galleryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (filesQueue.length === 0) { alert('Select files first'); return; }
      // Upload sequentially to simplify progress per-file
      for (let i = 0; i < filesQueue.length; i++) {
        const file = filesQueue[i];
        const fd = new FormData();
        fd.append('media', file);
        try {
          // Use XMLHttpRequest to track upload progress
          await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_BASE}/gallery`);
            const token = getToken();
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.upload.onprogress = (evt) => {
              if (!evt.lengthComputable) return;
              const pct = Math.round((evt.loaded / evt.total) * 100);
              const bar = document.querySelector(`.progress[data-progress="${i}"]`);
              if (bar) bar.style.width = pct + '%';
            };
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) resolve(); else reject(new Error(xhr.responseText || 'Upload failed'));
            };
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send(fd);
          });
        } catch (err) {
          const card = document.querySelector(`.preview-card[data-i="${i}"] .meta`);
          if (card) card.insertAdjacentHTML('beforeend', `<span style="color:#dc143c">${(err && err.message) || 'Failed'}</span>`);
        }
      }
      filesQueue = [];
      renderPreviews();
      refreshGalleryTable();
    });
  }

  async function refreshMembersTable() {
    const tbody = document.querySelector('#members-table tbody');
    if (!tbody) return;
    try {
      const members = await apiGet('/members');
      tbody.innerHTML = members.map((m) => `
        <tr>
          <td><img src="${toAbsoluteMediaUrl(m.photoUrl) || '../images/placeholder-player.jpg'}" alt="${m.name}" style="height:40px;width:40px;object-fit:cover;border-radius:6px"/></td>
          <td>${m.name}</td>
          <td>${m.position}</td>
          <td>${m.team || 'men'}</td>
          <td><button class="ghost" data-del-member="${m._id}">Delete</button></td>
        </tr>`).join('');
      tbody.querySelectorAll('button[data-del-member]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this member?')) return;
          try { await apiDelete(`/members/${btn.dataset.delMember}`); refreshMembersTable(); } catch(_) { alert('Failed to delete'); }
        });
      });
    } catch (_) {
      tbody.innerHTML = '<tr><td colspan="4">Failed to load members</td></tr>';
    }
  }

  async function refreshGalleryTable() {
    const tbody = document.querySelector('#gallery-table tbody');
    if (!tbody) return;
    try {
      const items = await apiGet('/gallery');
      tbody.innerHTML = items.map((it) => `
        <tr>
          <td>${it.type}</td>
          <td><a href="${toAbsoluteMediaUrl(it.fileUrl)}" target="_blank">${it.originalName || 'file'}</a></td>
          <td><button class="ghost" data-del-item="${it._id}">Delete</button></td>
        </tr>`).join('');
      tbody.querySelectorAll('button[data-del-item]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this item?')) return;
          try { await apiDelete(`/gallery/${btn.dataset.delItem}`); refreshGalleryTable(); } catch(_) { alert('Failed to delete'); }
        });
      });
    } catch (_) {
      tbody.innerHTML = '<tr><td colspan="3">Failed to load gallery</td></tr>';
    }
  }

  async function refreshAdminLists() {
    await Promise.all([refreshMembersTable(), refreshGalleryTable()]);
  }

  if (getToken()) {
    refreshAdminLists();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbarActive();
  initIndexPage();
  initTeamPage();
  initGalleryPage();
  initAdminPage();
  // Contact form -> WhatsApp
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(contactForm);
      const name = (fd.get('name') || '').toString().trim();
      const email = (fd.get('email') || '').toString().trim();
      const message = (fd.get('message') || '').toString().trim();
      const lines = [
        name ? `Name: ${name}` : '',
        email ? `Email: ${email}` : '',
        message ? `Message: ${message}` : '',
      ].filter(Boolean);
      const text = encodeURIComponent(lines.join('\n'));
      const url = `https://wa.me/254741222877?text=${text}`;
      window.open(url, '_blank', 'noopener');
      const note = document.createElement('p');
      note.textContent = 'WhatsApp opened with your message. You can send it there.';
      note.style.color = '#ccc';
      contactForm.insertAdjacentElement('afterend', note);
    });
  }
  // Social icons -> open in new tab with configured URLs if present
  const socialBar = document.querySelector('.social-icons');
  if (socialBar) {
    const map = {
      instagram: socialBar.querySelector('[aria-label="Instagram"]'),
      facebook: socialBar.querySelector('[aria-label="Facebook"]'),
      twitter: socialBar.querySelector('[aria-label="Twitter"], [aria-label="X/Twitter"], [aria-label="X"]'),
      youtube: socialBar.querySelector('[aria-label="YouTube"], [aria-label="Youtube"]'),
      whatsapp: socialBar.querySelector('[aria-label="WhatsApp"]'),
      tiktok: socialBar.querySelector('[aria-label="TikTok"]'),
    };
    (async () => {
      try {
        const s = await apiGet('/settings');
        const soc = (s && s.social) || {};
        if (map.instagram && soc.instagram) map.instagram.setAttribute('href', soc.instagram);
        if (map.facebook && soc.facebook) map.facebook.setAttribute('href', soc.facebook);
        if (map.tiktok && soc.tiktok) map.tiktok.setAttribute('href', soc.tiktok);
        if (map.whatsapp) map.whatsapp.setAttribute('href', 'https://wa.me/254741222877');
        // Optional placeholders for twitter/youtube if you add to settings later
        if (map.twitter) map.twitter.setAttribute('href', soc.twitter || '#');
        if (map.youtube) map.youtube.setAttribute('href', soc.youtube || '#');
        // Ensure target
        socialBar.querySelectorAll('a').forEach(a => { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); });
      } catch (_) {}
    })();
  }
  (async function initContact(){
    const mount = document.getElementById('social-grid');
    if (!mount) return;
    try {
      const s = await apiGet('/settings');
      const soc = (s && s.social) || {};
      const items = [
        { label: 'Instagram', key: 'instagram' },
        { label: 'Facebook', key: 'facebook' },
        { label: 'TikTok', key: 'tiktok' },
        { label: 'WhatsApp', key: 'whatsapp' },
      ].filter(x => soc[x.key]);
      if (items.length === 0) { mount.innerHTML = '<p>No social links configured yet.</p>'; return; }
      mount.innerHTML = items.map(x => `
        <div class="social-card">
          <span class="pill">${x.label}</span>
          <a href="${soc[x.key]}" target="_blank" rel="noopener">Open</a>
        </div>`).join('');
    } catch (_) {
      mount.innerHTML = '<p>Failed to load social links.</p>';
    }
  })();
});


