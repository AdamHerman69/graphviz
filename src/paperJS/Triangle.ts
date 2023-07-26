import * as Paper from 'paper';
import { Color } from 'paper/dist/paper-core';

export function createIsoscelesTriangle(
	topPoint: paper.Point,
	baseLength: number,
	height: number,
	direction: paper.Point,
	color: paper.Color
): paper.Path {
	const baseCenter = topPoint.subtract(direction.normalize(height));
	const a = baseCenter.add(new Paper.Point(-direction.y, direction.x).normalize(baseLength / 2));
	const c = baseCenter.subtract(
		new Paper.Point(-direction.y, direction.x).normalize(baseLength / 2)
	);

	// Create the triangle path
	const triangle = new Paper.Path();
	triangle.add(a, topPoint, c, a);

	// Style the triangle
	triangle.fillColor = color;

	return triangle;
}

export interface Decorator {
	update(newPosition: paper.Point, direction: paper.Point): void;
}

export class TriangleDecorator implements Decorator {
	triangle: paper.Path;
	width: number;
	length: number;

	constructor(lenght: number, width: number) {
		this.triangle = new Paper.Path();
		this.width = width;
		this.length = lenght;
	}

	// todo only update the path -> much better performance!
	update(newPosition: paper.Point, direction: paper.Point): void {
		this.triangle.remove();
		this.triangle = createIsoscelesTriangle(
			newPosition,
			this.width,
			this.length,
			direction,
			new Paper.Color('white')
		);
	}
}
