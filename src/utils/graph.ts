import type Graph from 'graphology';
import { type Writable, writable } from 'svelte/store';
import { type ScaleLinear, scaleLinear } from 'd3';

export type Attribute = {
	name: string;
	type: 'number' | 'string';
};

type ScaleFunction = (n: number) => number;

let scale: ScaleLinear<number, number, never> = scaleLinear().domain([10, 100]).range([1, 10]);

export type RangeAttribute = Attribute & {
	range: [number, number];
	scale?: ScaleFunction;
};

// do with rules instead
export type StringAttribute = Attribute & {
	values: string[];
};

export const graphStore: Writable<Graph> = writable();

export function findAllNodeAttributes(graph: Graph): (RangeAttribute | StringAttribute)[] {
	let foundNodeAttributes: Map<string, any[]> = new Map<string, any[]>();
	graph.forEachNode((id, attributes) => {
		for (const [key, value] of Object.entries(attributes)) {
			if (!foundNodeAttributes.get(key)?.push(value)) {
				foundNodeAttributes.set(key, [value]);
			}
		}
	});
	return classifyAttributes(foundNodeAttributes);
}

export function findAllEdgeAttributes(graph: Graph): (RangeAttribute | StringAttribute)[] {
	let foundEdgeAttributes: Map<string, any[]> = new Map<string, any[]>();
	graph.forEachEdge((id, attributes) => {
		for (const [key, value] of Object.entries(attributes)) {
			if (!foundEdgeAttributes.get(key)?.push(value)) {
				foundEdgeAttributes.set(key, [value]);
			}
		}
	});
	return classifyAttributes(foundEdgeAttributes);
}

function classifyAttribute(name: string, values: any[]): RangeAttribute | StringAttribute {
	const minValue = Math.min(...values);
	if (isNaN(minValue)) {
		return { name: name, values: values, type: 'string' };
	} else {
		const maxValue = Math.max(...values);
		return { name: name, range: [minValue, maxValue], type: 'number' };
	}
}

function classifyAttributes(
	attributeMap: Map<string, any[]>
): (RangeAttribute | StringAttribute)[] {
	let attributes: (RangeAttribute | StringAttribute)[] = [];
	attributeMap.forEach((values, name) => {
		attributes.push(classifyAttribute(name, values));
	});
	return attributes;
}

export function getAttributeType(attribute: RangeAttribute | StringAttribute): 'number' | 'string' {
	if (attribute.hasOwnProperty('range')) return 'number';
	else return 'string';
}
