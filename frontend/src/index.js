import axios from 'axios';

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

	// ALSO set axios global baseURL so files that use raw axios (not the api instance)
	// resolve to the backend instead of the frontend origin.
	try {
		const runtimeBase = (typeof window !== 'undefined' && window.__API_URL) ? window.__API_URL : (process.env.REACT_APP_API_URL || '');
		if (runtimeBase) {
			axios.defaults.baseURL = String(runtimeBase).replace(/\/+$/, '');
			// eslint-disable-next-line no-console
			console.log('[runtime-config] axios.defaults.baseURL set to', axios.defaults.baseURL);
		}
	} catch (e) {
		// ignore
	}

	// Now load the actual app entrypoint
	await import('./app/index');
})();


