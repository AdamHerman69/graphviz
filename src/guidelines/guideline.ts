import type Graph from 'graphology';
import {
	type NodeSettings,
	type EdgeSettings,
	nodeSettings,
	edgeSettings,
	cloneNodeSettings,
	cloneEdgeSettings,
	saveState,
	pauseStateSaving
} from '../utils/graphSettings';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

// todo make node/edgeSettings an array so a guideline could have rules
export type Guideline = {
	name: string;
	description: string;
	eval: (graph: Graph) => number;
	score: number;
	nodeSettings?: NodeSettings[];
	edgeSettings?: EdgeSettings[];
	literature: Literature[];
};

export type Literature = {};

function preview(guideline: Guideline) {}

//function updateGlobalNodeSettings(globalNS: NodeSettings) {}

export function apply(guideline: Guideline) {
	console.log(guideline.name, ' applied');
	pauseStateSaving.set(true);

	if (guideline.nodeSettings) {
		let newNS = cloneNodeSettings(guideline.nodeSettings[0]);
		// apply unruled

		let currentNS: NodeSettings[] = [{ priority: 0, frule: () => true, source: null }];
		nodeSettings.subscribe((val) => (currentNS = val));
		let globalNS: NodeSettings = currentNS[0];

		if (newNS.color) globalNS.color = newNS.color;
		if (newNS.size) globalNS.size = newNS.size;
		if (newNS.strokeColor) globalNS.strokeColor = newNS.strokeColor;
		if (newNS.strokeWidth) globalNS.strokeWidth = newNS.strokeWidth;
		if (newNS.labels) globalNS.labels = newNS.labels;

		globalNS.source = guideline;

		// apply rules
		let newNodeRules: NodeSettings[] = [];
		guideline.nodeSettings.forEach((ns, index) => {
			if (index == 0) return;
			console.log('applying rules based', index);
			newNodeRules.push(cloneNodeSettings(ns));
		});

		nodeSettings.update((previousSettings) => [
			globalNS,
			...previousSettings.slice(1),
			...newNodeRules
		]);
	}

	if (guideline.edgeSettings) {
		console.log('updating edge settings:', guideline.edgeSettings);
		let newES = cloneEdgeSettings(guideline.edgeSettings[0]);
		// apply unruled

		let currentES: EdgeSettings[] = [{ priority: 0, frule: () => true, source: null }];
		edgeSettings.subscribe((val) => (currentES = val));
		let globalES: EdgeSettings = currentES[0];

		if (newES.color) globalES.color = newES.color;
		if (newES.type) globalES.type = newES.type;
		if (newES.width) globalES.width = newES.width;
		if (newES.color) globalES.color = newES.color;
		if (newES.partialStart) globalES.partialStart = newES.partialStart;
		if (newES.partialEnd) globalES.partialEnd = newES.partialEnd;
		if (newES.decorators) globalES.decorators = newES.decorators;
		if (newES.labels) globalES.labels = newES.labels;

		globalES.source = guideline;

		// apply rules
		let newEdgeRules: EdgeSettings[] = [];
		guideline.edgeSettings.forEach((es, index) => {
			if (index == 0) return;
			console.log('applying rules based', index);
			newEdgeRules.push(cloneEdgeSettings(es));
		});

		edgeSettings.update((previousSettings) => [
			globalES,
			...previousSettings.slice(1),
			...newEdgeRules
		]);
	}
	console.log('resuming saving');

	// hack to don't save multiple states when updating
	setTimeout(() => {
		pauseStateSaving.set(false);
		saveState();
	}, 20);
}

function evalPartialEdges(graph: Graph): number {
	return 0.7;
}

export const guidelines: Writable<Guideline[]> = writable([
	{
		name: 'Partial Edges',
		description: 'use partial edges when dskja fsdjkl fj sldkfj sdjfi lksd sidjf lk',
		eval: evalPartialEdges,
		score: 0,
		edgeSettings: [
			{
				priority: 1,
				frule: (graph, id) => true,
				partialEnd: { name: 'partialEnd', value: 0.7, min: 0.5, max: 1, increment: 0.05 }
			}
		],
		literature: []
	},
	{
		name: 'Second guideline',
		description: 'use partial edges when dskja fsdjkl fj sldkfj sdjfi lksd sidjf lk',
		eval: evalPartialEdges,
		score: 0,
		edgeSettings: [
			{
				priority: 1,
				frule: (graph, id) => true,
				partialEnd: { name: 'partialEnd', value: 0.7, min: 0.5, max: 1, increment: 0.05 }
			}
		],
		nodeSettings: [
			{
				priority: 1,
				source: null,
				frule: (graph, id) => true,
				size: { source: null, name: 'size', value: 8, min: 1, max: 10 }
			},
			{
				priority: 2,
				source: null,
				frule: (graph, id) => Number(id) > 5,
				strokeColor: { source: null, name: 'strokeColor', value: 'purple' }
			}
		],
		literature: []
	},
	{
		name: 'Guideline 3',
		description: 'use partial edges when dskja fsdjkl fj sldkfj sdjfi lksd sidjf lk',
		eval: evalPartialEdges,
		score: 0,
		edgeSettings: [
			{
				priority: 1,
				frule: (graph, id) => true,
				partialEnd: { name: 'partialEnd', value: 0.7, min: 0.5, max: 1, increment: 0.05 }
			}
		],
		literature: []
	}
]);
