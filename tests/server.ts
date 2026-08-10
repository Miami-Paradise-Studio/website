import { execFileSync } from 'node:child_process';

const PORT = 4321;

/** Astro 7 runs `preview` as a background daemon, so Playwright's own webServer
 *  manager sees the foreground process exit and gives up. Starting and stopping
 *  it through the CLI's documented background mode is the supported path. */
export default function globalSetup() {
	execFileSync('npx', ['astro', 'preview', '--background', '--port', String(PORT)], {
		stdio: 'inherit',
	});
}

export function stopPreview() {
	try {
		execFileSync('npx', ['astro', 'preview', 'stop'], { stdio: 'inherit' });
	} catch {
		// Already stopped; nothing to clean up.
	}
}
