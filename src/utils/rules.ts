import type Graph from 'graphology';
import type { Attribute, RangeAttribute, StringAttribute } from './graph';

export type FRule = (graph: Graph, id: string) => boolean;
export type GraphPropertyGetter = {
	function: (graph: Graph, id: string) => number | string;
	type: 'string' | 'number';
};

export type AttributeGetter = {
	function: (graph: Graph, id: string, attribute: string) => number | string;
	type: 'string' | 'number';
};

type RuleOperator = 'AND' | 'OR';

let inDegree: GraphPropertyGetter = {
	function: (graph, id) => graph.inDegree(id),
	type: 'number'
};

let outDegree: GraphPropertyGetter = {
	function: (graph, id) => graph.outDegree(id),
	type: 'number'
};

let degree: GraphPropertyGetter = {
	function: (graph, id) => graph.degree(id),
	type: 'number'
};

export let nodePropertyGetters = new Map<string, GraphPropertyGetter>([
	['degree', degree],
	['inDegree', inDegree],
	['outDegree', outDegree]
]);

// todo is directed

// used when we need a property getter on a source or target for a given edge
export function createNodePropertyGetter(
	property: string,
	targetNode: 'source' | 'target'
): GraphPropertyGetter | undefined {
	let nodePropertyGetter = nodePropertyGetters.get(property);
	if (nodePropertyGetter)
		if (targetNode === 'source')
			return {
				type: nodePropertyGetter?.type,
				function: (graph: Graph, edgeID: string) => {
					let sourceID = graph.source(edgeID);
					return nodePropertyGetter!.function(graph, sourceID);
				}
			};
		else if (targetNode === 'target')
			return {
				type: nodePropertyGetter?.type,
				function: (graph: Graph, edgeID: string) => {
					let sourceID = graph.target(edgeID);
					return nodePropertyGetter!.function(graph, sourceID);
				}
			};
}

export function createNodeAttributeGetter(
	attribute: RangeAttribute | StringAttribute,
	targetNode: 'source' | 'target'
): GraphPropertyGetter | undefined {
	if (targetNode === 'source')
		return {
			type: attribute.type,
			function: (graph: Graph, edgeID: string) => {
				let sourceID = graph.source(edgeID);
				console.log('sourceID:', sourceID, 'attr name:', attribute.name);
				return graph.getNodeAttribute(sourceID, attribute.name);
			}
		};
	else if (targetNode === 'target')
		return {
			type: attribute.type,
			function: (graph: Graph, edgeID: string) => {
				let sourceID = graph.target(edgeID);
				return graph.getNodeAttribute(sourceID, attribute.name);
			}
		};
}

export let edgePropertyGetters = new Map<string, GraphPropertyGetter>([]);

edgePropertyGetters.set('test', {
	type: 'number',
	function: (graph, id) => {
		return 4;
	}
});
