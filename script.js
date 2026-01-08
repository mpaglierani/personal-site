// script.js

function loadScript(src) {
	return new Promise((resolve, reject) => {
		const s = document.createElement('script');
		s.src = src;
		s.defer = true;
		s.onload = resolve;
		s.onerror = reject;
		document.head.appendChild(s);
	});
}

function loadInclude(id, url) {
	fetch(url)
		.then(res => res.text())
		.then(html => {
			const container = document.getElementById(id);
			container.innerHTML = html;

			const yearEl = container.querySelector('#year');
			if (yearEl) {
				yearEl.textContent = new Date().getFullYear();
			}
		});
}

document.addEventListener('DOMContentLoaded', async () => {
	loadInclude('nav-placeholder',    'nav.html');
	loadInclude('footer-placeholder', 'footer.html');


	try {
		await loadScript('https://unpkg.com/feather-icons');
		feather.replace();
	} catch (err) {
		console.error('Failed to load Feather Icons:', err);
	}
	
	const observer = new MutationObserver(() => {
		feather.replace();
	});
	observer.observe(document.getElementById('footer-placeholder'), { childList: true });

		// circle text
	const phrases = [
		"my favorite movie is videodrome",
		"lover of purple, napping, & iced coffee ~",
		"my current hair color is purple & pink",
		"i've watched shrek 2 over 500 times",
		"collector of sonny angels, pins, & smiskis", 
		"my go to coffee is iced with butterpecan",
		"my favorite pokemon is oddish"
	];

	const el = document.getElementById('circle-text');
	if (el) {
		el.textContent = phrases[
			Math.floor(Math.random() * phrases.length)
		];
	}
	
	document.addEventListener('contextmenu', (e) => {
		if (e.target.tagName === 'IMG') {
			e.preventDefault()
		}
	});
	
	document.querySelectorAll('img').forEach(img => {
		img.setAttribute('draggable', 'false');
	});
});