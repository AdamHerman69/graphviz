import { writable, type Writable } from 'svelte/store';
import type Graph from 'graphology';

export const GraphStore: Writable<Graph> = writable();
export const NodeSettings: Writable<NodeSettingsType> = writable();
export const EdgeSettings: Writable<EdgeSettingsType> = writable();

export type NumericalSetting = {
	value: number;
	min: number;
	max: number;
	increment?: number;
};

export type NodeSettingsType = {
	attribute?: {
		name: string;
		// TODO bind map range of attribute to viz range
	};
	size: NumericalSetting; // TODO describe values
	fill: string; // todo gradient
	fillOpacity: NumericalSetting;
	strokeColor?: string;
	strokeThickness?: NumericalSetting;
};

export type EdgeSettingsType = {
	attribute?: {
		name: string;
	};
	style: string;
	color: string;
	opacity: NumericalSetting;
	thickness: NumericalSetting;
};
