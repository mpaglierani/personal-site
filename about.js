// about.js

(async function () {
	const DATA_URL = 'about-data.json';
	const PIN_SRC  = 'img/pin.png';

	let data = null;
	async function loadData() {
      try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.statusText);
      return await res.json();
    } catch (e) {
      const inline = document.getElementById('about-data');
      if (inline) {
        try { return JSON.parse(inline.textContent); } catch (_) {}
      }
      console.warn('about-data.json not loaded; using empty data.', e);
      return { bubbles: [], movies: [], colors: [], socials: [], pokemon: [] };
    }
  }
  data = await loadData();

  let board = document.querySelector('.bubble-board');
  if (!board) {
    const aside =
      document.querySelector('.about-right') ||
      document.querySelector('aside.right') ||
      document.querySelector('aside');

    board = document.createElement('div');
    board.className = 'bubble-board';
    (aside || document.body).appendChild(board);
  }

  if (Array.isArray(data.bubbles) && data.bubbles.length) {
    board.innerHTML = data.bubbles.map(b => `
      <button class="bubble" data-panel="${b.key}">
        <img class="pin" src="${PIN_SRC}" alt="" aria-hidden="true" />
        ${b.label}
      </button>`).join('');
  }

  let overlay = document.getElementById('overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
  }
  let modal = document.getElementById('modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title" id="modal-title">&nbsp;</div>
        <button class="modal-close" id="modal-close" aria-label="Close">✖</button>
      </div>
      <div class="modal-body" id="modal-body"></div>`;
    document.body.appendChild(modal);
  } else {
    const btn = modal.querySelector('.modal-close');
    if (btn) { btn.textContent = '✖'; btn.setAttribute('aria-label', 'Close'); }
  }
  const modalTitle = modal.querySelector('#modal-title');
  const modalBody  = modal.querySelector('#modal-body');
  const closeBtn   = modal.querySelector('#modal-close');

  const openModal = (title, html) => {
    modalTitle.textContent = title;
    modalBody.innerHTML = html || `<p style="text-align:center; margin:1rem 0;">Couldn’t load data.</p>`;
    overlay.classList.add('open');
    modal.classList.add('open');
  };
  const closeModal = () => { overlay.classList.remove('open'); modal.classList.remove('open'); };

  overlay.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  const renderMovies = list => `
    <div class="covers">
      ${(list||[]).map(m => `
        <div class="cover">
          <img src="${m.src}" alt="${m.title}">
          <div class="caption">${m.title}</div>
        </div>`).join('')}
    </div>`;
  const renderColors = list => `
    <div class="color-stars">
      ${(list||[]).map(c => `
        <div class="color-star">
          <div class="star" style="color:${c.hex}"></div>
          <span class="hex">${c.hex}</span>
        </div>`).join('')}
    </div>`;
	const renderSocials = list => `
	  <div class="social-row">
		${(list || []).map(s => `
		  <a href="${s.href}" target="_blank" rel="noopener" aria-label="${s.icon}">
			<img src="img/${s.icon}" class="social-icon" alt="${s.icon}">
		  </a>`).join('')}
	  </div>`;
	const renderPokemon = list => `
	  <div class="dex">
		${(list||[]).map(p => `
		  <div class="cover">
			<img src="${p.src}" alt="${p.name}">
			<div class="caption">${p.name}</div>
		  </div>`).join('')}
	  </div>`;

  document.querySelectorAll('.bubble-board .bubble').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-panel');
      if      (key === 'movies')  openModal('movies',  renderMovies(data.movies));
      else if (key === 'colors')  openModal('colors',  renderColors(data.colors));
      else if (key === 'socials') openModal('socials', renderSocials(data.socials));
      else if (key === 'pokemon') openModal('pokémon', renderPokemon(data.pokemon));
      else openModal('details', '<p style="text-align:center;">No data for this bubble yet.</p>');
    });
  });
})();