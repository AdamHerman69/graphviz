import { PNode } from './Node';
import type { IPNode } from './Node';
import { PEdge } from './Edge';
import type { IPEdge } from './Edge';
import * as d3 from 'd3';
import * as Paper from 'paper';
import type { NodeStyle, EdgeStyle } from '../stores/stores';
import { type Decorator, TriangleDecorator } from './Triangle';

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
	currentNodeStyle: NodeStyle;
	currentEdgeStyle: EdgeStyle;

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
		this.paperScope.activate();
		positions.forEach((pos) => {
			this.nodes.get(pos.id)?.updatePosition(pos.x, pos.y);
		});
		this.edges.forEach((edge) => edge.updatePosition());
	}

	updateNodeStyle(style: NodeStyle) {
		this.paperScope.activate();
		// todo here we'll handle the different groups in the future
		this.nodes.forEach((node) => node.updateStyle(style));

		// if node changes size
		this.edges.forEach((edge) => edge.updatePosition());

		this.currentNodeStyle = style;
	}

	updateEdgeStyle(style: EdgeStyle) {
		this.paperScope.activate();
		// todo here we'll handle the different groups in the future
		this.edges.forEach((edge) => edge.updateStyle(style));
		this.currentEdgeStyle = style;
	}

	restart(inputNodes: NodePositionDatum[], inputEdges: EdgeDatum[]) {
		this.paperScope.activate();
		this.paperScope.project.clear();
		this.initGraph(inputNodes, inputEdges);
		if (this.currentNodeStyle && this.currentEdgeStyle) {
			this.updateNodeStyle(this.currentNodeStyle);
			this.updateEdgeStyle(this.currentEdgeStyle);
		}
	}

	initGraph(inputNodes: NodePositionDatum[], inputEdges: EdgeDatum[]): void {
		this.paperScope.activate();
		inputNodes.forEach((node) => {
			const paperNode = new PNode(node.x, node.y);
			this.nodes.set(node.id, paperNode);
		});

		inputEdges.forEach((edge) => {
			const source = this.nodes.get(edge.source);
			const target = this.nodes.get(edge.target);

			if (source && target) {
				// temporarly here create arrow decorator
				const decorators: [Decorator, number][] = [
					//[new TriangleDecorator(5, 3), 0.5],
					[new TriangleDecorator(3, 3), 1]
				];

				const paperEdge = new PEdge(source, target, decorators);
				this.edges.set(edge.id, paperEdge);
			}
		});
	}

	zoomed(zoomEvent: d3.ZoomBehavior<HTMLCanvasElement, any>): d3.ZoomTransform {
		this.paperScope.activate();
		let transform = zoomEvent.transform as any;
		const { x, y, k } = transform;

		const canvasCenter = new Paper.Point(
			this.paperScope.view.bounds.width / 2,
			this.paperScope.view.bounds.height / 2
		);
		const newCenter = new this.paperScope.Point(canvasCenter.x - x / k, canvasCenter.y - y / k);
		this.paperScope.view.center = newCenter;
		this.paperScope.view.zoom = k;

		return transform;
	}

	exportSVG() {
		return this.paperScope.project.exportSVG({ asString: true }) as string;
	}
}
