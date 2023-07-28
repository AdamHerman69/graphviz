import * as Paper from 'paper';
import type { NodeStyle } from '../stores/stores';
// TODO don't import stores but just types for the values, that the update styles method is going to consume

export interface IPNode {
	position: paper.Point;
	getFinalRadius(): number;
	updatePosition(newX: number, newY: number): void;
	updateStyle(style: NodeStyle): void;
}

export class PNode implements IPNode {
	position: paper.Point;
	shape: paper.Shape;
	style: NodeStyle;
	label: paper.PointText;

	constructor(label: string, x: number, y: number, style: NodeStyle) {
		this.style = style;
		this.position = new Paper.Point(x, y);
		this.shape = new Paper.Shape.Circle(this.position, style.size);
		this.label = new Paper.PointText({
			point: this.position,
			content: label
		});

		this.updateStyle(style);
	}

	getFinalRadius(): number {
		return (this.shape.radius as number) + this.shape.strokeWidth / 2;
	}

	updatePosition(newX: number, newY: number) {
		this.position.x = newX;
		this.position.y = newY;
		this.shape.position = this.position;
		this.label.point = this.position;
	}

	// todo support different shapes and stuff
	updateStyle(style: NodeStyle) {
		this.shape.style = {
			fillColor: new Paper.Color(style.fill),
			strokeColor: new Paper.Color(style.strokeColor),
			strokeWidth: style.strokeThickness
		};

		this.shape.radius = style.size;
	}
}
