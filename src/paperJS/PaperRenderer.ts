import { PNode } from './node';
import type { IPNode } from './node';
import { PEdge } from './edge';
import type { IPEdge } from './edge';

type NodePositionDatum = {
	id: string;
	x: number;
	y: number;
};

type EdgeDatum = {
	id: string;
	source: string;
	target: string;
};

interface Renderer {
	updatePositions(positions: NodePositionDatum[]): void;
	updateNodeStyle(): void;
	updateEdgeStyle(): void;
}

class PaperRenderer implements Renderer {
	nodes: Map<string, IPNode>;
	edges: Map<string, IPEdge>;
	paperScope: paper.PaperScope;

	constructor(canvas: HTMLCanvasElement, inputNodes: NodePositionDatum[], inputEdges: EdgeDatum[]) {
		this.paperScope = new paper.PaperScope();
		this.paperScope.setup(canvas);
		this.nodes = new Map<string, IPNode>();
		this.edges = new Map<string, PEdge>();

		inputNodes.forEach((node) => {
			const paperNode = new PNode(node.x, node.y);
			this.nodes.set(node.id, paperNode);
		});

		inputEdges.forEach((edge) => {
			const source = this.nodes.get(edge.source);
			const target = this.nodes.get(edge.target);

			if (source && target) {
				const paperEdge = new PEdge(source, target);
				this.edges.set(edge.id, paperEdge);
			}
		});

		// todo call update styles methods
	}

	updatePositions(positions: NodePositionDatum[]) {
		positions.forEach((pos) => {
			this.nodes.get(pos.id)?.updatePosition(pos.x, pos.y);
		});
		this.edges.forEach((edge) => edge.updatePosition());
	}

	updateNodeStyle() {}

	updateEdgeStyle() {}
}
