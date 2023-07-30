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
	updateNodeStyles(styles: Map<string, NodeStyle>): void;
	updateEdgeStyles(styles: Map<string, EdgeStyle>): void;
	restart(inputNodes: NodePositionDatum[], inputEdges: EdgeDatum[]): void;
	zoomed(zoomEvent: d3.ZoomBehavior<HTMLCanvasElement, any>): d3.ZoomTransform;
	exportSVG(): string;
}

export class PaperRenderer implements Renderer {
	nodes: Map<string, IPNode>;
	edges: Map<string, IPEdge>;
	paperScope: paper.PaperScope;
	transform: d3.ZoomTransform;
	currentNodeStyles: Map<string, NodeStyle>;
	currentEdgeStyles: Map<string, EdgeStyle>;

	constructor(
		canvas: HTMLCanvasElement,
		inputNodes: NodePositionDatum[],
		inputEdges: EdgeDatum[],
		nodeStyles: Map<string, NodeStyle>,
		edgeStyles: Map<string, EdgeStyle>
	) {
		this.paperScope = new Paper.PaperScope();
		this.paperScope.setup(canvas);
		this.nodes = new Map<string, IPNode>();
		this.edges = new Map<string, PEdge>();
		this.transform = d3.zoomIdentity;

		this.initGraph(inputNodes, inputEdges, nodeStyles, edgeStyles);

		this.currentNodeStyles = nodeStyles;
		this.updateNodeStyles(nodeStyles);

		this.currentEdgeStyles = edgeStyles;
		this.updateEdgeStyles(edgeStyles);
	}

	updatePositions(positions: NodePositionDatum[]) {
		this.paperScope.activate();
		positions.forEach((pos) => {
			this.nodes.get(pos.id)?.updatePosition(pos.x, pos.y);
		});
		this.edges.forEach((edge) => edge.updatePosition());
	}

	updateNodeStyles(styles: Map<string, NodeStyle>) {
		this.paperScope.activate();
		// todo here we'll handle the different groups in the future
		this.nodes.forEach((node, key) => node.updateStyle(styles.get(key)!));

		// if node changes size
		this.edges.forEach((edge) => edge.updatePosition());

		this.currentNodeStyles = styles;
	}

	updateEdgeStyles(styles: Map<string, EdgeStyle>) {
		this.paperScope.activate();
		// todo here we'll handle the different groups in the future
		this.edges.forEach((edge, key) => edge.updateStyle(styles.get(key)!));
		this.currentEdgeStyles = styles;
	}

	restart(inputNodes: NodePositionDatum[], inputEdges: EdgeDatum[]) {
		this.paperScope.activate();
		this.paperScope.project.clear();
		this.initGraph(inputNodes, inputEdges, this.currentNodeStyles, this.currentEdgeStyles);
		if (this.currentNodeStyles && this.currentEdgeStyles) {
			this.updateNodeStyles(this.currentNodeStyles);
			this.updateEdgeStyles(this.currentEdgeStyles);
		}
	}

	initGraph(
		inputNodes: NodePositionDatum[],
		inputEdges: EdgeDatum[],
		nodeStyles: Map<string, NodeStyle>,
		edgeStyles: Map<string, EdgeStyle>
	): void {
		this.paperScope.activate();

		inputNodes.forEach((node, key) => {
			const paperNode = new PNode(node.id, node.x, node.y, nodeStyles.get(node.id)!);
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

				const paperEdge = new PEdge(source, target, edgeStyles.get(edge.id)!, decorators);
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
