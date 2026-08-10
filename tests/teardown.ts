import { stopPreview } from './server';

export default function globalTeardown() {
	stopPreview();
}
