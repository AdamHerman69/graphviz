import * as Paper from 'paper';
import type { NodeStyle } from '../utils/graphSettings';
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
			point: new Paper.Point(this.position.x - this.style.size, this.position.y - this.style.size),
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
		this.label.point = new Paper.Point(
			this.position.x - this.style.size / 2,
			this.position.y + this.style.size / 2
		);
	}

	// todo support different shapes and stuff
	updateStyle(style: NodeStyle) {
		let color: paper.Color;
		if (typeof style.color === 'string') color = new Paper.Color(style.color);
		else {
			// gradient
			color = new Paper.Color({
				gradient: {
					stops: style.color,
					radial: true
				},
				origin: this.position,
				destination: this.shape.bounds.rightCenter
			});
		}

		this.shape.style = {
			fillColor: color,
			strokeColor: new Paper.Color(style.strokeColor),
			strokeWidth: style.strokeWidth
		};

		this.shape.radius = style.size;
	}
}
