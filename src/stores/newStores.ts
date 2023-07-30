import type { Color } from 'd3';
import { writable, type Writable } from 'svelte/store';

export type NodeStyle = {
	size: number;
	color: string;
	strokeWidth: number;
	strokeColor: string;
};

export type EdgeStyle = {
	type: EdgeType;
	thickness: number;
	color: string;
	partialStart: number;
	partialEnd: number;
};

type AtomicRule = {};

type Rule = {
	type: 'NODE' | 'EDGE';
	operator: 'AND' | 'OR';
	rules: (Rule | AtomicRule)[];
};

export type Attribute = {
	name: string;
};

export type RangeAttribute = Attribute & {
	range: [number, number];
};

export type DiscreteAttribute = Attribute & {
	values: [domain: string | number, value: string | number];
};

export type Setting = {
	name: string;
	value: any;
	attribute?: RangeAttribute | DiscreteAttribute;
};

export type SelectSetting<T> = Setting & {
	readonly values: T[];
	value: T;
};

export type NumericalSetting = Setting & {
	value: number;
	min: number;
	max: number;
	increment?: number;
};

// todo gradient
export type ColorSetting = Setting & {
	value: string;
};

export type NodeSettings = {
	priority: number;
	rule: Rule;
	size?: NumericalSetting;
	color?: ColorSetting;
	strokeWidth?: NumericalSetting;
	strokeColor?: ColorSetting;
	// todo shape?
};

const edgeTypes = ['straight', 'arrow', 'conical'] as const;
export type EdgeType = (typeof edgeTypes)[number];

// todo layout specific settings in a layout object. swich layouts based on this object, not other
const layoutTypes = ['force-graph', 'tree'] as const;
type LayoutType = (typeof layoutTypes)[number];

export type EdgeSettings = {
	priority: number;
	rule: Rule;
	type?: SelectSetting<EdgeType>;
	width?: NumericalSetting;
	color?: ColorSetting;
	partialStart?: NumericalSetting;
	partialEnd?: NumericalSetting;
};

export type GraphSettings = {
	layout: LayoutType;
	nodeSettings: NodeSettings[];
	edgeSettings: EdgeSettings[];
};

export const graphSettings: Writable<GraphSettings> = writable({
	layout: 'force-graph',
	nodeSettings: [
		{
			priority: 0,
			rule: { type: 'NODE', operator: 'AND', rules: [] },
			size: {
				name: 'size',
				value: 5,
				min: 1,
				max: 10,
				attribute: {
					name: 'volume',
					range: [10, 100]
				}
			},
			strokeWidth: { name: 'strokeWidth', value: 1, min: 0, max: 10 },
			color: { name: 'color', value: 'pink' },
			strokeColor: { name: 'strokeColor', value: 'purple' }
		}
	],
	edgeSettings: [
		{
			priority: 0,
			rule: { type: 'EDGE', operator: 'AND', rules: [] },
			type: { name: 'type', values: Array.from(edgeTypes), value: 'straight' },
			width: { name: 'width', value: 1, min: 0, max: 5, increment: 0.5 },
			color: { name: 'color', value: 'white' },
			partialStart: { name: 'partialStart', value: 0, min: 0, max: 0.5, increment: 0.05 },
			partialEnd: { name: 'partialEnd', value: 1, min: 0.5, max: 1, increment: 0.05 }
		}
	]
});
