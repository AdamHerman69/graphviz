import { writable, type Writable } from 'svelte/store';
import type Graph from 'graphology';

export const GraphStore: Writable<Graph> = writable();

export type NumericalSetting = {
	value: number;
	min: number;
	max: number;
	increment?: number;
};

export type Color = string; // TODO check for valid colors

// TODO bind graph attributes, gradient fills, fill styles..

// node settings stores
export const nodeSize: Writable<NumericalSetting> = writable();
export const nodeFill: Writable<Color> = writable();
export const nodeOpacity: Writable<NumericalSetting> = writable();
export const nodeStrokeThickness: Writable<NumericalSetting> = writable();
export const nodeStrokeColor: Writable<Color> = writable();

// TOOD edge styles

// edge settings stores
export const edgeThickness: Writable<NumericalSetting> = writable();
export const edgeOpacity: Writable<NumericalSetting> = writable();
export const edgeColor: Writable<Color> = writable();
