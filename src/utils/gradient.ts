import { color } from 'd3';
import type { Gradient } from './graphSettings';

export function getGradientColor(gradient: [string, number][], position: number): string {
	// Sort the gradient colors based on their positions
	gradient.sort((a, b) => a[1] - b[1]);

	// Find the two colors that surround the given position
	let color1: [number, number, number, number] = [0, 0, 0, 1];
	let color2: [number, number, number, number] = [255, 255, 255, 1];

	// If the gradient doesn't end at 1, add the last color at 1
	if (gradient[gradient.length - 1][1] < 1) {
		gradient.push([gradient[gradient.length - 1][0], 1]);
	}

	let color1position, color2position;
	for (let i = 0; i < gradient.length; i++) {
		const [color, pos] = gradient[i];
		if (pos <= position) {
			color1 = parseColor(color);
			color1position = pos;
		} else {
			color2 = parseColor(color);
			color2position = pos;
			break;
		}
	}
	if (color2position === undefined) {
		color2position = 1;
	}

	if (color1position === color2position) {
		return `rgba(${color1[0]}, ${color1[1]}, ${color1[2]}, ${color1[3]})`;
	}

	const t = (position - color1position) / (color2position - color1position);

	// Interpolate between the two colors based on the position
	const r = interpolate(color1[0], color2[0], t);
	const g = interpolate(color1[1], color2[1], t);
	const b = interpolate(color1[2], color2[2], t);
	const a = interpolate(color1[3], color2[3], t);

	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function parseColor(color: string): [number, number, number, number] {
	const [r, g, b, a] = color.match(/\d+/g)?.map(Number) || [0, 0, 0, 1];
	return [r, g, b, a];
}

function interpolate(start: number, end: number, t: number): number {
	return start + (end - start) * t;
}
