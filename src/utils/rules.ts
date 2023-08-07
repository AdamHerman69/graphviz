import type Graph from 'graphology';

export type FRule = (graph: Graph, id: string) => boolean;
export type graphPropertyGetter = {
	function: (graph: Graph, id: string) => number | string;
	type: 'string' | 'number';
};

export type attributeGetter = {
	function: (graph: Graph, id: string, attribute: string) => number | string;
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

let degree: graphPropertyGetter = {
	function: (graph, id) => graph.degree(id),
	type: 'number'
};

export let nodePropertyGetters = new Map<string, graphPropertyGetter>([
	['degree', degree],
	['inDegree', inDegree],
	['outDegree', outDegree]
]);

// todo is directed

export let edgePropertyGetters = new Map<string, graphPropertyGetter>([]);
