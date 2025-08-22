// Attempt to load runtime configuration from /runtime-config.json.
// If present, it can set window.__API_URL to point the bundle at a backend
// without rebuilding. Fallback to existing REACT_APP_API_URL or relative calls.
(async function bootstrap() {
	try {
		const res = await fetch('/runtime-config.json');
		if (res.ok) {
			const cfg = await res.json();
			if (cfg && cfg.API_URL) {
				// normalize and set global runtime API base
				window.__API_URL = cfg.API_URL.replace(/\/+$/, '');
				// eslint-disable-next-line no-console
				console.log('[runtime-config] API_URL set to', window.__API_URL);
			}
		}
	} catch (e) {
		// ignore; runtime-config is optional
	}

	// Now load the actual app entrypoint
	await import('./app/index');
})();


