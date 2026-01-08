document.addEventListener('DOMContentLoaded', async () => {
  try {
    const navRes = await fetch('nav.html');
    const navHtml = await navRes.text();
    document.getElementById('nav-placeholder').innerHTML = navHtml;
    const footerRes = await fetch('footer.html');
    const footerHtml = await footerRes.text();
    document.getElementById('footer-placeholder').innerHTML = footerHtml;
  } catch (e) {}

  function toParagraphsHTML(text) {
    return String(text).split(/\n\s*\n/).map(s => s.trim()).filter(Boolean).map(p => `<p>${p}</p>`).join('');
  }

  async function fetchFirstOk(candidates) {
    let lastStatus = null, lastUrl = null;
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        lastUrl = url;
        if (res.ok) return { url, text: await res.text(), status: res.status };
        lastStatus = res.status;
      } catch (e) { lastStatus = e.message || 'network error'; lastUrl = url; }
    }
    return { error: true, lastStatus, lastUrl, tried: candidates };
  }

  async function getDescriptionHTML(project, projId) {
    if (Array.isArray(project.description)) {
      return project.description.map(p => `<p>${p}</p>`).join('');
    }
    if (typeof project.description === 'string') {
      return String(project.description)
        .split(/\n\s*\n/).map(s => s.trim()).filter(Boolean).map(p => `<p>${p}</p>`).join('');
    }
    const candidates = [];
    if (project.contentFile) candidates.push(project.contentFile);
    else if (projId) candidates.push(`writing/${projId}.md`, `writing/${projId}.html`);
    if (!candidates.length) return '';
    const result = await (async () => {
      let lastStatus = null, lastUrl = null;
      for (const url of candidates) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          lastUrl = url;
          if (res.ok) return { url, text: await res.text(), status: res.status };
          lastStatus = res.status;
        } catch (e) { lastStatus = e.message || 'network error'; lastUrl = url; }
      }
      return { error: true, lastStatus, lastUrl, tried: candidates };
    })();
    if (result.error) {
      const triedList = result.tried.map(p => `<code>${p}</code>`).join(', ');
      return `<pre style="white-space:pre-wrap;line-height:1.45;padding:12px;border:1px dashed var(--med);border-radius:6px;">Could not load content for "${projId}". Tried: ${triedList}. Last: ${result.lastUrl} → ${result.lastStatus}</pre>`;
    }
    if (result.url.endsWith('.html')) return result.text;
    if (window.marked && typeof window.marked.parse === 'function') return window.marked.parse(result.text);
    const basic = result.text
      .replace(/(^|\s)\*\*(.+?)\*\*(?=\s|$)/g, '$1<strong>$2</strong>')
      .replace(/(^|\s)\*(.+?)\*(?=\s|$)/g, '$1<em>$2</em>');
    return String(basic).split(/\n\s*\n/).map(s => s.trim()).filter(Boolean).map(p => `<p>${p}</p>`).join('');
  }

  const params = new URLSearchParams(window.location.search);
  const rawId = params.get('id');
  const projId = (rawId || '').trim().toLowerCase();

  const mount = document.getElementById('project-content');
  if (!mount) return;
  if (!projId) { mount.innerHTML = `<p>Project not found.</p>`; return; }

  try {
    const res = await fetch('projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`projects.json HTTP ${res.status}`);
    const rawText = await res.text();
    let projects;
    try {
      projects = JSON.parse(rawText);
    } catch (e) {
      mount.innerHTML = `<pre style="white-space:pre-wrap;line-height:1.45;padding:12px;border:1px dashed var(--med);border-radius:6px;">projects.json parse error: ${e.message}</pre>`;
      return;
    }

    const project = projects.find(p => String(p.id || '').trim().toLowerCase() === projId);
    if (!project) { mount.innerHTML = `<p>Project not found.</p>`; return; }

    const descriptionHTML = await getDescriptionHTML(project, projId);

    const images = Array.isArray(project.images) ? project.images : [];
    const galleryHTML = images.map(img => {
      const src = typeof img === 'string' ? img : img?.src || '';
      const caption = typeof img === 'object' ? (img.caption || '') : '';
      if (!src) return '';
      return `
        <div class="item">
          <img src="${src}" alt="${project.title ? `${project.title} image` : ''}">
          ${caption ? `<div class="caption">${caption}</div>` : ''}
        </div>
      `;
    }).join('');

    mount.innerHTML = `
      <div class="project-header">
        <a href="projects.html" class="back-btn" aria-label="Back to projects">← back</a>
        <h1 class="page-title">${project.title ?? ''}</h1>
        ${project.date ? `<div class="project-date">${project.date}</div>` : ''}
      </div>
      <div class="project-description">${descriptionHTML}</div>
      ${galleryHTML ? `<div class="gallery">${galleryHTML}</div>` : ''}
    `;

    if (window.feather && typeof window.feather.replace === 'function') { try { window.feather.replace(); } catch (_) {} }
  } catch (err) {
    const msg = (err && err.message) ? err.message : String(err);
    mount.innerHTML = `<pre style="white-space:pre-wrap;line-height:1.45;padding:12px;border:1px dashed var(--med);border-radius:6px;">Error loading project data: ${msg}</pre>`;
  }
});