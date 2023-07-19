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

// TODO bind graph attributes, gradient fills, fill styles..

// node settings stores
export const nodeSize: Writable<NumericalSetting> = writable();
export const nodeFill: Writable<RgbaColor> = writable();
export const nodeStrokeThickness: Writable<NumericalSetting> = writable();
export const nodeStrokeColor: Writable<RgbaColor> = writable();

// TOOD edge styles

// edge settings stores
export const edgeThickness: Writable<NumericalSetting> = writable();
export const edgeColor: Writable<RgbaColor> = writable();
