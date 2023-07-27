import * as Paper from 'paper';
import { Color } from 'paper/dist/paper-core';

function createIsoscelesTriangle(
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
	triangle.add(a, topPoint, c);
	triangle.closed = true;

	// Style the triangle
	triangle.fillColor = color;

	return triangle;
}

function getIsoscelesTrianglePoints(
	topPoint: paper.Point,
	baseLength: number,
	height: number,
	direction: paper.Point
) {
	const baseCenter = topPoint.subtract(direction.normalize(height));
	const a = baseCenter.add(new Paper.Point(-direction.y, direction.x).normalize(baseLength / 2));
	const c = baseCenter.subtract(
		new Paper.Point(-direction.y, direction.x).normalize(baseLength / 2)
	);
	return [a, topPoint, c];
}

export interface Decorator {
	update(newPosition: paper.Point, direction: paper.Point): void;
}

export class TriangleDecorator implements Decorator {
	triangle: paper.Path;
	width: number;
	length: number;

	constructor(lenght: number, width: number) {
		this.triangle = createIsoscelesTriangle(
			new Paper.Point(1, 1),
			width,
			lenght,
			new Paper.Point(2, 2),
			new Paper.Color('white')
		); // init with ranom place

		this.width = width;
		this.length = lenght;
	}

	// todo only update the path -> much better performance!
	// todo triangles stay there on graph change??
	update(newPosition: paper.Point, direction: paper.Point): void {
		[
			this.triangle.segments[0].point,
			this.triangle.segments[1].point,
			this.triangle.segments[2].point
		] = getIsoscelesTrianglePoints(newPosition, this.width, this.length, direction);
	}
}
