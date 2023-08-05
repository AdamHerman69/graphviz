import type Graph from 'graphology';

export type FRule = (graph: Graph, id: string) => boolean;
export type graphPropertyGetter = {
	function: (graph: Graph, id: string) => number | string;
	type: 'string' | 'number';
};

type RuleOperator = 'AND' | 'OR';

let inDegree: graphPropertyGetter = {
	function: (graph, id) => graph.inDegree(id),
	type: 'number'
};

let outDegree: graphPropertyGetter = {
	function: (graph, id) => graph.outDegree(id),
	type: 'number'
};

export let graphPropertyGetters = new Map<string, graphPropertyGetter>([
	['inDegree', inDegree],
	['outDegree', outDegree]
]);

// todo add attribute getters