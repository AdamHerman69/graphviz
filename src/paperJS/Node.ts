import * as Paper from 'paper';
import { nodeSize, nodeStrokeThickness } from '../stores/stores';
// TODO don't import stores but just types for the values, that the update styles method is going to consume

export interface IPNode {
	position: paper.Point;
	getFinalRadius(): number;
	updatePosition(newX: number, newY: number): void;
}

export class PNode implements IPNode {
	position: paper.Point;
	shape: paper.Shape;

	constructor(x: number, y: number, radius: number = 4, strokeWith: number = 1) {
		this.position = new paper.Point(x, y);
		this.shape = new paper.Shape.Circle(this.position, radius);
	}

	getFinalRadius(): number {
		// TODO
		return 4;
	}

	updatePosition(newX: number, newY: number) {
		this.position.x = newX;
		this.position.y = newY;
	}

	updateStyle() {}
}
