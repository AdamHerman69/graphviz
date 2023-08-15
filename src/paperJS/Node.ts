import * as Paper from 'paper';
import type { NodeLabel, NodeStyle } from '../utils/graphSettings';
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
	labels: {
		above: { offset: paper.Point; pointText?: paper.PointText };
		below: { offset: paper.Point; pointText?: paper.PointText };
		left: { offset: paper.Point; pointText?: paper.PointText };
		right: { offset: paper.Point; pointText?: paper.PointText };
		center: { offset: paper.Point; pointText?: paper.PointText };
	};

	constructor(label: string, x: number, y: number, style: NodeStyle) {
		this.style = style;
		this.position = new Paper.Point(x, y);
		this.shape = new Paper.Shape.Circle(this.position, style.size);
		this.labels = {
			above: { offset: new Paper.Point(0, -5) },
			below: { offset: new Paper.Point(0, 5) },
			left: { offset: new Paper.Point(-5, 0) },
			right: { offset: new Paper.Point(5, 0) },
			center: { offset: new Paper.Point(0, 0) }
		};

		// this.label = new Paper.PointText({
		// 	point: this.position,
		// 	content: label,
		// 	fontSize: 5
		// });
		// this.label.position = this.label.position.add(
		// 	new Paper.Point(-this.label.bounds.width / 2, this.label.bounds.height / 4)
		// );

		// todo updateLabels

		this.updateStyle(style);
		this.updateLabels(style.labels);
	}

	getFinalRadius(): number {
		return (this.shape.radius as number) + this.shape.strokeWidth / 2;
	}

	updatePosition(newX: number, newY: number) {
		this.position.x = newX;
		this.position.y = newY;
		this.shape.position = this.position;
		this.updateLabelPosition(this.position);
		// this.label.point = this.position.add(
		// 	new Paper.Point(-this.label.bounds.width / 2, this.label.bounds.height / 4)
		// );
	}

	updateLabelPosition() {
		for (const [key, label] of Object.entries(this.labels)) {
			if (label.pointText) {
				let offsetScaledToSize = label.offset.add(
					label.offset.normalize().multiply(this.getFinalRadius())
				);
				label.pointText.position = this.position.add(offsetScaledToSize);
			}
		}
	}

	// todo support different shapes and stuff
	updateStyle(style: NodeStyle) {
		// move labels on size change
		// if (this.style.size != style.size || this.style.strokeWidth != style.strokeWidth)
		// 	this.updateLabelPosition();

		this.style = style;

		// handle color
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

		// apply style
		this.shape.style = {
			fillColor: color,
			strokeColor: new Paper.Color(style.strokeColor),
			strokeWidth: style.strokeWidth
		};
		this.shape.radius = style.size;

		// todo optimize, when changing?
		this.updateLabels(style.labels);
		this.updateLabelPosition();
	}

	updateLabels(nodeLabels: NodeLabel[]) {
		let _labels: {
			above: NodeLabel[];
			below: NodeLabel[];
			left: NodeLabel[];
			right: NodeLabel[];
			center: NodeLabel[];
		} = { above: [], below: [], left: [], right: [], center: [] };
		if (!nodeLabels) return;
		nodeLabels.forEach((nodeLabel) => {
			_labels[nodeLabel.position].push(nodeLabel);
		});

		for (const [key, nodeLabels] of Object.entries(_labels)) {
			if (nodeLabels.length === 0) {
				this.labels[key].pointText?.delete();
			} else {
				let text = '';
				nodeLabels.forEach((nodeLabel, index) => {
					text = text + nodeLabel.text;
					if (index < nodeLabels.length - 1) text = text + '\n';
				});

				if (!Object.hasOwn(this.labels[key], 'pointText')) {
					// position map or something
					this.labels[key].pointText = new Paper.PointText({
						content: text,
						fontSize: nodeLabels[0].size,
						fillColor: nodeLabels[0].color
					});
					console.log('creted label: ', this.labels[key]);
				}
				this.labels[key].pointText.content = text;
			}
		}
	}
}
