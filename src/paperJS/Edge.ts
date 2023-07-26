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

	constructor(source: IPNode, target: IPNode, decorators?: EdgeDecorator[]) {
		this.source = source;
		this.target = target;
		// line
		const [sourceConnection, targetConnection] = this.getConnectionPoints();
		this.line = new Paper.Path.Line(sourceConnection, targetConnection);
		this.decorators = decorators ?? [];
	}

	getConnectionPoints() {
		const direction = this.target.position.subtract(this.source.position).normalize();
		const sourceConnectionPoint = this.source.position.add(
			direction.multiply(this.source.getFinalRadius())
		);
		const targetConnectionPoint = this.target.position.subtract(
			direction.multiply(this.target.getFinalRadius())
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
	}
}
