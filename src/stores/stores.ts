import { writable, type Writable } from 'svelte/store';
import type Graph from 'graphology';
import type { RgbaColor } from 'svelte-awesome-color-picker';

export const GraphStore: Writable<Graph> = writable();

export type NumericalSetting = {
	value: number;
	min: number;
	max: number;
	increment?: number;
};

export type SelectSetting<T> = {
	readonly values: T[];
	selected: T;
};

export type NodeStyle = {
	size: number;
	fill: string;
	strokeThickness: number;
	strokeColor: string;
};

export type EdgeStyle = {
	type: EdgeType;
	thickness: number;
	color: string;
	partialStart: number;
	partialEnd: number;
};

// TODO bind graph attributes, gradient fills, fill styles..

// node settings stores
export const nodeSize: Writable<NumericalSetting> = writable({ value: 5, min: 1, max: 10 });
export const nodeFill: Writable<RgbaColor> = writable({ r: 195, g: 118, b: 199, a: 1 });
export const nodeStrokeThickness: Writable<NumericalSetting> = writable({
	value: 1,
	min: 0,
	max: 10
});
export const nodeStrokeColor: Writable<RgbaColor> = writable({ r: 68, g: 50, b: 156, a: 1 });

// edge settings stores

export const edgeTypes = ['straight', 'arrow', 'conical'] as const;
export type EdgeType = (typeof edgeTypes)[number];

export const edgeType: Writable<SelectSetting<EdgeType>> = writable({
	values: Array.from(edgeTypes),
	selected: 'straight'
});
export const edgeThickness: Writable<NumericalSetting> = writable({
	value: 1,
	min: 0,
	max: 5,
	increment: 0.5
});
export const edgeColor: Writable<RgbaColor> = writable({ r: 255, g: 255, b: 255, a: 0.65 });
export const edgeCompleteness: Writable<NumericalSetting> = writable({
	value: 0.65,
	min: 0,
	max: 1,
	increment: 0.05
});

export const partialEdgeStart: Writable<NumericalSetting> = writable({
	value: 0,
	min: 0,
	max: 0.5,
	increment: 0.05
});

export const partialEdgeEnd: Writable<NumericalSetting> = writable({
	value: 1,
	min: 0.5,
	max: 1,
	increment: 0.05
});

/// TODO Redesign stores to support groups, decorators and edge types
