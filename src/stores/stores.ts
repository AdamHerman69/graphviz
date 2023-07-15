import { writable, type Writable } from 'svelte/store';
import type Graph from 'graphology';

export const GraphStore: Writable<Graph> = writable();
export const NodeSettings: Writable<NodeSettings> = writable();
export const EdgeSettings: Writable<EdgeSettings> = writable();

export type NodeSettings = {
	attribute: null | {
		name: string;
		// TODO bind map range of attribute to viz range
	};
	size: number; // TODO describe values
	fill: string; // todo gradient
	fillOpacity: number;
	strokeColor: null | string;
	strokeThickness: null | number;
};

export type EdgeSettings = {
	attribute: null | {
		name: string;
	};
	style: string;
	color: string;
	opacity: number;
	thickness: number;
};
