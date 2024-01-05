import type Graph from 'graphology';
import { type Writable, writable } from 'svelte/store';

export type Attribute = {
	name: string;
	type: 'number' | 'string';
	owner: 'edge' | 'node';
};

export type RangeAttribute = Attribute & {
	range: [number, number];
	getter: (graph: Graph, id: string) => number;
};

// do with rules instead
export type StringAttribute = Attribute & {
	values: string[];
	getter: (graph: Graph, id: string) => string;
};

export type GraphAttributes = {
	node: { range: RangeAttribute[]; string: StringAttribute[] };
	edge: { range: RangeAttribute[]; string: StringAttribute[] };
};

export const availableAttributes: Writable<GraphAttributes> = writable({
	node: { range: [], string: [] },
	edge: { range: [], string: [] }
});

export function recomputeGraphAttributes(graph: Graph, availableAttributes: GraphAttributes) {
	availableAttributes.node = findAllNodeAttributes(graph);
	availableAttributes.edge = findAllEdgeAttributes(graph);
}

export const graphStore: Writable<Graph> = writable();

function findAllNodeAttributes(graph: Graph): {
	range: RangeAttribute[];
	string: StringAttribute[];
} {
	let foundNodeAttributes: Map<string, any[]> = new Map<string, any[]>();
	graph.forEachNode((id, attributes) => {
		for (const [key, value] of Object.entries(attributes)) {
			if (!foundNodeAttributes.get(key)?.push(value)) {
				foundNodeAttributes.set(key, [value]);
			}
		}
	});
	return classifyAttributes(foundNodeAttributes, 'node');
}

function findAllEdgeAttributes(graph: Graph): {
	range: RangeAttribute[];
	string: StringAttribute[];
} {
	let foundEdgeAttributes: Map<string, any[]> = new Map<string, any[]>();
	graph.forEachEdge((id, attributes) => {
		for (const [key, value] of Object.entries(attributes)) {
			if (!foundEdgeAttributes.get(key)?.push(value)) {
				foundEdgeAttributes.set(key, [value]);
			}
		}
	});
	return classifyAttributes(foundEdgeAttributes, 'edge');
}

function classifyAttribute(
	name: string,
	values: any[],
	owner: 'node' | 'edge'
): RangeAttribute | StringAttribute {
	const minValue = Math.min(...values);

	if (isNaN(minValue)) {
		let getter: (graph: Graph, id: string) => string =
			owner === 'edge'
				? (graph: Graph, id: string) => graph.getEdgeAttribute(id, name)
				: (graph: Graph, id: string) => graph.getNodeAttribute(id, name);
		return {
			name: name,
			values: values,
			type: 'string',
			getter: getter
		} as StringAttribute;
	} else {
		const maxValue = Math.max(...values);
		let getter: (graph: Graph, id: string) => number =
			owner === 'edge'
				? (graph: Graph, id: string) => graph.getEdgeAttribute(id, name)
				: (graph: Graph, id: string) => graph.getNodeAttribute(id, name);
		return {
			name: name,
			range: [minValue, maxValue],
			type: 'number',
			getter: getter
		} as RangeAttribute;
	}
}

function classifyAttributes(
	attributeMap: Map<string, any[]>,
	owner: 'node' | 'edge'
): {
	range: RangeAttribute[];
	string: StringAttribute[];
} {
	let rangeAttributes: RangeAttribute[] = [];
	let stringAttributes: StringAttribute[] = [];
	let attribute: RangeAttribute | StringAttribute;
	attributeMap.forEach((values, name) => {
		attribute = classifyAttribute(name, values, owner);
		if (attribute.type === 'number') rangeAttributes.push(attribute as RangeAttribute);
		else if (attribute.type === 'string') stringAttributes.push(attribute as StringAttribute);
		else console.log('Error classifying an attribute: ', attribute);
	});
	return { range: rangeAttributes, string: stringAttributes };
}

export function getAttributeType(attribute: RangeAttribute | StringAttribute): 'number' | 'string' {
	if (attribute.hasOwnProperty('range')) return 'number';
	else return 'string';
}
