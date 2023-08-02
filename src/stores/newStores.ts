import type { Color, ScaleLinear } from 'd3';
import { writable, type Writable } from 'svelte/store';
import { scaleLinear } from 'd3';
import type Graph from 'graphology';

export const graphStore: Writable<Graph> = writable();

export type NodeStyle = {
	size: number;
	color: string | Gradient;
	strokeWidth: number;
	strokeColor: string;
};

export type EdgeStyle = {
	type: EdgeType;
	width: number;
	color: string | Gradient;
	partialStart: number;
	partialEnd: number;
	decorators: DecoratorData[];
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

type ScaleFunction = (n: number) => number;

export type RangeAttribute = Attribute & {
	range: [number, number];
	scale?: ScaleFunction;
};

// do with rules instead
export type StringAttribute = Attribute & {
	values: string[];
};

export type Setting<T> = {
	name: string;
	value: any;
	attribute?: RangeAttribute;
};

export type SelectSetting<T> = Setting<T> & {
	readonly values: T[];
	value: T;
};

export type NumericalSetting = Setting<number> & {
	value: number;
	min: number;
	max: number;
	increment?: number;
};

const decoratorTypes = ['triangle', 'circle', 'square'] as const;
export type DecoratorType = (typeof decoratorTypes)[number];

export type DecoratorData = {
	type: DecoratorType;
	position: number;
};

export type DecoratorSetting = Setting<DecoratorData[]> & {
	types: DecoratorType[];
	value: DecoratorData[];
};

export type Gradient = ['string', number][];
export type ColorSetting = Setting<string | Gradient> & {
	value: string | Gradient;
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
	decorators?: DecoratorSetting;
};

export type GraphSettings = {
	layout: SelectSetting<LayoutType>;
	nodeSettings: NodeSettings[];
	edgeSettings: EdgeSettings[];
};

let scale: ScaleLinear<number, number, never> = scaleLinear().domain([10, 100]).range([1, 10]);

export const layout: Writable<SelectSetting<LayoutType>> = writable({
	name: 'layout',
	values: Array.from(layoutTypes),
	value: 'force-graph'
});

export const nodeSettings: Writable<[NodeSettings, ...NodeSettings[]]> = writable([
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
				range: [10, 100],
				scale: scale
			}
		},
		strokeWidth: { name: 'strokeWidth', value: 1, min: 0, max: 10 },
		color: {
			name: 'color',
			value: [
				['yellow', 0],
				['purple', 1]
			]
		},
		strokeColor: { name: 'strokeColor', value: 'purple' }
	}
]);

export const edgeSettings: Writable<EdgeSettings[]> = writable([
	{
		priority: 0,
		rule: { type: 'EDGE', operator: 'AND', rules: [] },
		type: { name: 'type', values: Array.from(edgeTypes), value: 'straight' },
		width: { name: 'width', value: 1, min: 0, max: 5, increment: 0.5 },
		color: {
			name: 'color',
			value: [
				['green', 0],
				['yellow', 0.5],
				['red', 1]
			]
		},
		partialStart: { name: 'partialStart', value: 0, min: 0, max: 0.5, increment: 0.05 },
		partialEnd: { name: 'partialEnd', value: 1, min: 0.5, max: 1, increment: 0.05 },
		decorators: { types: Array.from(decoratorTypes), name: 'decorators', value: [] }
	}
]);
