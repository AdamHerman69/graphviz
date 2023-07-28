import * as Paper from 'paper';
import type { IPNode } from './Node';
import type { EdgeStyle, EdgeType } from '../stores/stores';
import {
	type Decorator,
	createIsoscelesTriangle,
	getIsoscelesTrianglePoints,
	createIsoscelesTriangleEdge,
	getIsoscelesTrianglePointsEdge
} from './Triangle';

interface EdgeShape {
	updatePosition(source: paper.Point, target: paper.Point): void;
	updateStyle(style: paper.Style): void;
	delete(): void;
}

class LineShape implements EdgeShape {
	line: paper.Path;

	constructor(source: paper.Point, target: paper.Point) {
		this.line = new Paper.Path.Line(source, target);
	}

	updatePosition(source: paper.Point, target: paper.Point): void {
		this.line.firstSegment.point = source;
		this.line.lastSegment.point = target;
	}

	updateStyle(style: paper.Style) {
		this.line.style = style;
	}

	delete(): void {
		this.line.remove();
	}
}

class TriangleShape implements EdgeShape {
	triangle: paper.Path;
	width: number;

	constructor(source: paper.Point, target: paper.Point) {
		this.width = 3; // todo compute from nodeSize, store in global stores
		this.triangle = createIsoscelesTriangleEdge(target, source, this.width);
	}

	updatePosition(source: paper.Point, target: paper.Point): void {
		[
			this.triangle.segments[0].point,
			this.triangle.segments[1].point,
			this.triangle.segments[2].point
		] = getIsoscelesTrianglePointsEdge(target, source, this.width);
	}

	updateStyle(style: paper.Style) {
		this.triangle.style.fillColor = style.strokeColor;
	}

	delete(): void {
		this.triangle.remove();
	}
}

export interface IPEdge {
	source: IPNode;
	target: IPNode;
	lineShape: EdgeShape;

	updatePosition(): void;
	updateStyle(style: EdgeStyle): void;
}

export class PEdge {
	source: IPNode;
	target: IPNode;
	decorators: [Decorator, number][]; // number is a relative position on edge 0 - start, 1 - end
	lineShape: EdgeShape;
	partialStart: number;
	partialEnd: number;
	type: EdgeType;

	constructor(
		source: IPNode,
		target: IPNode,
		style: EdgeStyle,
		decorators?: [Decorator, number][]
	) {
		this.source = source;
		this.target = target;
		// line
		// vvvvv doesn't work but doesn't really matter
		const [sourceConnection, targetConnection] = this.getConnectionPoints();

		this.type = style.type;
		if (this.type == 'conical') {
			this.lineShape = new TriangleShape(sourceConnection, targetConnection);
		} else {
			this.lineShape = new LineShape(sourceConnection, targetConnection);
		}

		this.decorators = decorators ?? [];
		this.partialStart = 0;
		this.partialEnd = 1;

		// doesn't work too, the points are NaN
		this.updateDecorators(sourceConnection, targetConnection);
	}

	getConnectionPoints() {
		const direction = this.target.position.subtract(this.source.position).normalize();
		let sourceConnectionPoint = this.source.position.add(
			direction.multiply(this.source.getFinalRadius())
		);
		let targetConnectionPoint = this.target.position.subtract(
			direction.multiply(this.target.getFinalRadius())
		);

		// partial edge
		const sourcePartial = getRelativeEdgePoint(
			sourceConnectionPoint,
			targetConnectionPoint,
			this.partialStart
		);
		const targetPartial = getRelativeEdgePoint(
			sourceConnectionPoint,
			targetConnectionPoint,
			this.partialEnd
		);

		return [sourcePartial, targetPartial];
	}

	updatePosition() {
		const [sourceConnection, targetConnection] = this.getConnectionPoints();
		this.lineShape.updatePosition(sourceConnection, targetConnection);

		this.updateDecorators(sourceConnection, targetConnection);
	}

	updateDecorators(sourceConnection: paper.Point, targetConnection: paper.Point) {
		this.decorators?.forEach((decTuple) => {
			decTuple[0].update(
				getRelativeEdgePoint(sourceConnection, targetConnection, decTuple[1]),
				this.getDirection()
			);
		});
	}

	updateStyle(style: EdgeStyle) {
		// edge type change
		if (style.type != this.type) {
			this.type = style.type;
			this.lineShape.delete();

			let sourceConnection, targetConnection;
			[sourceConnection, targetConnection] = this.getConnectionPoints();

			if (style.type == 'conical') {
				this.lineShape = new TriangleShape(sourceConnection, targetConnection);
			} else {
				this.lineShape = new LineShape(sourceConnection, targetConnection);
			}
		}

		// style update
		const paperStyle = {
			strokeWidth: style.thickness,
			strokeColor: new Paper.Color(style.color)
		};
		this.lineShape.updateStyle(paperStyle);

		// partial edge change
		if (this.partialStart != style.partialStart || this.partialEnd != style.partialEnd) {
			this.partialStart = style.partialStart;
			this.partialEnd = style.partialEnd;

			this.updatePosition();
		}
	}

	getDirection() {
		return this.target.position.subtract(this.source.position);
	}
}

function getRelativeEdgePoint(start: paper.Point, end: paper.Point, relativePosition: number) {
	return start.multiply(1 - relativePosition).add(end.multiply(relativePosition));
}
