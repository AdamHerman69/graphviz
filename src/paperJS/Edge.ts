import * as Paper from 'paper';
import type { IPNode } from './Node';
import type { EdgeStyle } from '../stores/stores';
import { type Decorator } from './Triangle';

export interface IPEdge {
	source: IPNode;
	target: IPNode;
	line: paper.Path;

	updatePosition(): void;
	updateStyle(style: EdgeStyle): void;
}

export class PEdge {
	source: IPNode;
	target: IPNode;
	decorators: [Decorator, number][]; // number is a relative position on edge 0 - start, 1 - end
	line: paper.Path;
	partialStart: number;
	partialEnd: number;

	constructor(source: IPNode, target: IPNode, decorators?: [Decorator, number][]) {
		this.source = source;
		this.target = target;
		// line
		// vvvvv doesn't work but doesn't really matter
		const [sourceConnection, targetConnection] = this.getConnectionPoints();
		this.line = new Paper.Path.Line(sourceConnection, targetConnection);

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
		this.line.firstSegment.point = sourceConnection;
		this.line.lastSegment.point = targetConnection;

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
		this.line.style = {
			strokeWidth: style.thickness,
			strokeColor: new Paper.Color(style.color)
		};

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
