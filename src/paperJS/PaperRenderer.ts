import { PNode } from './Node';
import type { IPNode } from './Node';
import { PEdge } from './Edge';
import type { IPEdge } from './Edge';
import * as d3 from 'd3';
import * as Paper from 'paper';
import type { NodeStyle, EdgeStyle } from '../stores/stores';

export type NodePositionDatum = {
	id: string;
	x: number;
	y: number;
};

export type EdgeDatum = {
	id: string;
	source: string;
	target: string;
};

export interface Renderer {
	updatePositions(positions: NodePositionDatum[]): void;
	updateNodeStyle(style: NodeStyle): void;
	updateEdgeStyle(style: EdgeStyle): void;
	restart(inputNodes: NodePositionDatum[], inputEdges: EdgeDatum[]): void;
	zoomed(zoomEvent: d3.ZoomBehavior<HTMLCanvasElement, any>): d3.ZoomTransform;
	exportSVG(): string;
}

export class PaperRenderer implements Renderer {
	nodes: Map<string, IPNode>;
	edges: Map<string, IPEdge>;
	paperScope: paper.PaperScope;
	transform: d3.ZoomTransform;

	constructor(canvas: HTMLCanvasElement, inputNodes: NodePositionDatum[], inputEdges: EdgeDatum[]) {
		this.paperScope = new Paper.PaperScope();
		this.paperScope.setup(canvas);
		this.nodes = new Map<string, IPNode>();
		this.edges = new Map<string, PEdge>();
		this.transform = d3.zoomIdentity;

		this.initGraph(inputNodes, inputEdges);

		// todo call update styles methods
	}

	updatePositions(positions: NodePositionDatum[]) {
		positions.forEach((pos) => {
			this.nodes.get(pos.id)?.updatePosition(pos.x, pos.y);
		});
		this.edges.forEach((edge) => edge.updatePosition());
	}

	updateNodeStyle(style: NodeStyle) {
		// todo here we'll handle the different groups in the future
		this.nodes.forEach((node) => node.updateStyle(style));

		// if node changes size
		this.edges.forEach((edge) => edge.updatePosition());
	}

	updateEdgeStyle(style: EdgeStyle) {
		// todo here we'll handle the different groups in the future
		this.edges.forEach((edge) => edge.updateStyle(style));
	}

	restart(inputNodes: NodePositionDatum[], inputEdges: EdgeDatum[]) {
		this.paperScope.project.clear();
		this.initGraph(inputNodes, inputEdges);
	}

	initGraph(inputNodes: NodePositionDatum[], inputEdges: EdgeDatum[]): void {
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
	}

	zoomed(zoomEvent: d3.ZoomBehavior<HTMLCanvasElement, any>): d3.ZoomTransform {
		let transform = zoomEvent.transform as any;
		const { x, y, k } = transform;

		const canvasCenter = new Paper.Point(
			this.paperScope.view.bounds.width / 2,
			this.paperScope.view.bounds.height / 2
		);
		const newCenter = new Paper.Point(canvasCenter.x - x / k, canvasCenter.y - y / k);
		this.paperScope.view.center = newCenter;
		this.paperScope.view.zoom = k;

		return transform;
	}

	exportSVG() {
		return this.paperScope.project.exportSVG({ asString: true }) as string;
	}
}
