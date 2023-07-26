import * as Paper from 'paper';
import type { IPNode } from './Node';
import type { EdgeStyle } from '../stores/stores';

type EdgeDecorator = {
	shape: paper.Path;
	positions: number[]; // 0-1, 0 = edge start, 1 = edge end
};

export interface IPEdge {
	source: IPNode;
	target: IPNode;
	decorators: EdgeDecorator[];
	line: paper.Path;

	updatePosition(): void;
	updateStyle(style: EdgeStyle): void;
}

export class PEdge {
	source: IPNode;
	target: IPNode;
	decorators: EdgeDecorator[];
	line: paper.Path;
	partialStart: number;
	partialEnd: number;

	constructor(source: IPNode, target: IPNode, decorators?: EdgeDecorator[]) {
		this.source = source;
		this.target = target;
		// line
		const [sourceConnection, targetConnection] = this.getConnectionPoints();
		this.line = new Paper.Path.Line(sourceConnection, targetConnection);
		this.decorators = decorators ?? [];
		this.partialStart = 0;
		this.partialEnd = 1;
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
		[sourceConnectionPoint, targetConnectionPoint] = getPartialPoints(
			sourceConnectionPoint,
			targetConnectionPoint,
			this.partialStart,
			this.partialEnd
		);

		return [sourceConnectionPoint, targetConnectionPoint];
	}

	updatePosition() {
		const [sourceConnection, targetConnection] = this.getConnectionPoints();
		this.line.firstSegment.point = sourceConnection;
		this.line.lastSegment.point = targetConnection;
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
}

// takes two points and computes new points that are
function getPartialPoints(a: paper.Point, b: paper.Point, startOffset: number, endOffset: number) {
	let partialStart = a.multiply(1 - startOffset).add(b.multiply(startOffset));
	let partialEnd = b.multiply(endOffset).add(a.multiply(1 - endOffset));

	return [partialStart, partialEnd];
}
