import type { ScaleLinear } from 'd3';
import { get, writable, type Writable } from 'svelte/store';
import { scaleLinear } from 'd3';
import type { FRule } from '../utils/rules';
import type { RangeAttribute, Attribute } from './graph';
import type { Node } from 'dagre';
import type { Guideline } from '../guidelines/guideline';

export type NodeStyle = {
	size: number;
	color: string | Gradient;
	strokeWidth: number;
	strokeColor: string;
	labels: NodeLabel[];
};

export type EdgeStyle = {
	type: EdgeType;
	width: number;
	color: string | Gradient;
	partialStart: number;
	partialEnd: number;
	decorators: DecoratorData[];
	labels: EdgeLabel[];
};

type LabelStyle = {
	text: string;
	color: string;
	size: number;
	attributeName?: string;
};

export type NodeLabel = LabelStyle & {
	position: 'below' | 'above' | 'left' | 'right' | 'center';
};

export type EdgeLabel = LabelStyle & {
	relativePosition: number;
	position: 'below' | 'above' | 'center';
	rotate: boolean;
};

const decoratorTypes = ['triangle', 'circle', 'square'] as const;
export type DecoratorType = (typeof decoratorTypes)[number];

export type Setting<T> = {
	name: string;
	value: any;
	attribute?: RangeAttribute;
	source: null | Guideline;
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

export type NodeProperties = {
	size?: NumericalSetting;
	color?: ColorSetting;
	strokeWidth?: NumericalSetting;
	strokeColor?: ColorSetting;
	labels?: NodeLabel[];
	// todo shape?
};

type RuleSettings = {
	priority: number;
	frule: FRule;
	source: null | Guideline;
};

export type NodeSettings = NodeProperties & RuleSettings;
export type EdgeSettings = EdgeProperties & RuleSettings;

export function cloneNodeSettings(nodeSettings: NodeSettings): NodeSettings {
	let newNS: NodeSettings = {
		priority: nodeSettings.priority,
		frule: nodeSettings.frule,
		source: nodeSettings.source
	};
	if (nodeSettings.size) newNS.size = structuredClone(nodeSettings.size);
	if (nodeSettings.color) newNS.color = structuredClone(nodeSettings.color);
	if (nodeSettings.strokeWidth) newNS.strokeWidth = structuredClone(nodeSettings.strokeWidth);
	if (nodeSettings.strokeColor) newNS.strokeColor = structuredClone(nodeSettings.strokeColor);
	if (nodeSettings.labels) newNS.labels = structuredClone(nodeSettings.labels);
	return newNS;
}

export function cloneEdgeSettings(edgeSettings: EdgeSettings): EdgeSettings {
	let newES: EdgeSettings = {
		priority: edgeSettings.priority,
		frule: edgeSettings.frule,
		source: edgeSettings.source
	};
	if (edgeSettings.type) newES.type = structuredClone(edgeSettings.type);
	if (edgeSettings.width) newES.width = structuredClone(edgeSettings.width);
	if (edgeSettings.color) newES.color = structuredClone(edgeSettings.color);
	if (edgeSettings.partialStart) newES.partialStart = structuredClone(edgeSettings.partialStart);
	if (edgeSettings.partialEnd) newES.partialEnd = structuredClone(edgeSettings.partialEnd);
	if (edgeSettings.decorators) newES.decorators = structuredClone(edgeSettings.decorators);
	if (edgeSettings.labels) newES.labels = structuredClone(edgeSettings.labels);
	return newES;
}

const edgeTypes = ['straight', 'arrow', 'conical'] as const;
export type EdgeType = (typeof edgeTypes)[number];

// todo layout specific settings in a layout object. swich layouts based on this object, not other
const layoutTypes = ['force-graph', 'tree'] as const;
type LayoutType = (typeof layoutTypes)[number];

export type EdgeProperties = {
	type?: SelectSetting<EdgeType>;
	width?: NumericalSetting;
	color?: ColorSetting;
	partialStart?: NumericalSetting;
	partialEnd?: NumericalSetting;
	decorators?: DecoratorSetting;
	labels?: EdgeLabel[];
};

export const layout: Writable<SelectSetting<LayoutType>> = writable({
	name: 'layout',
	values: Array.from(layoutTypes),
	value: 'force-graph'
});

export const nodeSettings: Writable<[NodeSettings[]]> = writable([
	{
		priority: 0,
		frule: (graph, id) => true,
		size: {
			name: 'size',
			value: 5,
			min: 1,
			max: 10
		},
		strokeWidth: { name: 'strokeWidth', value: 1, min: 0, max: 10 },
		color: {
			name: 'color',
			value: [
				['yellow', 0],
				['purple', 1]
			]
		},
		strokeColor: { name: 'strokeColor', value: 'purple' },
		labels: [
			{ position: 'left', text: 'left', color: 'pink', size: 4 },
			{ position: 'above', text: 'above', color: 'skyBlue', size: 5 },
			{ position: 'left', text: 'left', color: 'skyBlue', size: 3 },
			{ position: 'center', text: 'center', color: 'purple', size: 3 }
		]
	},
	{
		priority: 1,
		frule: (graph, id) => {
			return false;
		}
	}
]);

export const edgeSettings: Writable<EdgeSettings[]> = writable([
	{
		priority: 0,
		frule: (graph, id) => true,
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
		partialStart: { name: 'partialStart', value: 0, min: 0, max: 1, increment: 0.05 },
		partialEnd: { name: 'partialEnd', value: 1, min: 0, max: 1, increment: 0.05 },
		decorators: { types: Array.from(decoratorTypes), name: 'decorators', value: [] },
		labels: [
			{
				text: 'mid',
				color: 'pink',
				size: 3,
				relativePosition: 0.5,
				position: 'below',
				rotate: false
			},
			{
				text: 'third',
				color: 'skyBlue',
				size: 3,
				relativePosition: 0.3,
				position: 'below',
				rotate: false
			}
		]
	}
]);

export type GraphSettings = {
	layout: SelectSetting<LayoutType>;
	nodeSettings: NodeSettings[];
	edgeSettings: EdgeSettings[]; // todo update Edge settings to require first element as well
};

export let pauseStateSaving: Writable<boolean> = writable(false);
export let currentStateIndex: Writable<number> = writable(-1);
export let history: Writable<GraphSettings[]> = writable([]);

export function saveState() {
	if (get(pauseStateSaving)) {
		console.log('skipped save');
		return;
	}

	console.log('history before save state: ', get(history));

	let currentState: GraphSettings = {
		layout: structuredClone(get(layout)),
		nodeSettings: get(nodeSettings).map((ns) => cloneNodeSettings(ns)),
		edgeSettings: get(edgeSettings).map((es) => cloneEdgeSettings(es))
	};
	history.update((history) => [...history.slice(0, get(currentStateIndex) + 1), currentState]);
	currentStateIndex.update((index) => index + 1);

	console.log('history after save state: ', get(history), 'index:', get(currentStateIndex));
}

export function restoreState(index: number) {
	console.log('restoring state');
	console.log(get(history));
	console.log(index);
	console.log(get(history)[index]);

	let newState: GraphSettings = {
		layout: structuredClone(get(history)[index].layout),
		nodeSettings: get(history)[index].nodeSettings.map((ns) => cloneNodeSettings(ns)),
		edgeSettings: get(history)[index].edgeSettings.map((es) => cloneEdgeSettings(es))
	};

	layout.set(newState.layout);
	nodeSettings.set(newState.nodeSettings);
	edgeSettings.set(newState.edgeSettings);
}

export function undo() {
	// todo message no more states
	if (get(currentStateIndex) == 0) {
		console.log('no more states');
		return;
	}
	console.log('undo');
	console.log('history:', get(history));
	console.log('index before update:', get(currentStateIndex));
	currentStateIndex.update((index) => index - 1);
	console.log('index after update:', get(currentStateIndex));
	restoreState(get(currentStateIndex));
}

export function redo() {
	// todo message no more states
	if (get(currentStateIndex) == get(history).length - 1) {
		console.log('no more states');
		return;
	}

	console.log('redo');
	console.log(get(history));
	currentStateIndex.update((index) => index + 1);
	restoreState(get(currentStateIndex));
	// todo bug when redoing after undoing twice, index is negative
}
