<script lang="ts">
	import { Toast } from '@skeletonlabs/skeleton';
	import GraphImport from '../components/GraphImport.svelte';
	import NodeLink from '../components/NodeLink.svelte';
	import SettingsPanel from '../components/SettingsPanel.svelte';
	import Graph from 'graphology';
	import { hasCycle } from 'graphology-dag';
	import {
		GraphStore,
		nodeSize,
		nodeFill,
		nodeStrokeThickness,
		nodeStrokeColor,
		edgeThickness,
		edgeColor
	} from '../stores/stores';
	import NodeLinkCanvas from '../components/NodeLinkCanvas.svelte';

	// example graph init
	const graph = new Graph();
	graph.addNode('a');
	graph.addNode('b');
	graph.addNode('c');
	graph.addNode('d');
	graph.addNode('e');
	graph.addNode('f');
	graph.addNode('g');
	graph.addNode('h');
	graph.addNode('i');
	graph.addNode('j');
	graph.addEdge('a', 'b');
	graph.addEdge('a', 'c');
	graph.addEdge('a', 'd');
	graph.addEdge('a', 'e');
	graph.addEdge('b', 'c');
	graph.addEdge('g', 'c');
	graph.addEdge('f', 'd');
	graph.addEdge('d', 'c');
	graph.addEdge('e', 'f');
	graph.addEdge('e', 'g');
	graph.addEdge('h', 'c');
	graph.addEdge('i', 'd');
	graph.addEdge('j', 'c');
	graph.addEdge('h', 'i');
	graph.addEdge('j', 'i');

	GraphStore.set(graph);
</script>

<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->

<div class="h-full w-full flex justify-center items-center">
	<div class="h-full w-full flex flex-col mx-8">
		<h1 class="h1 flex-none m-10 text-center">node-link vizualization demo</h1>
		<div class="grow flex">
			<div class="w-3/4"><NodeLinkCanvas /></div>
			<div class="w-1/4"><SettingsPanel /></div>
		</div>
		<div class="flex-none m-10">
			{#if !hasCycle($GraphStore)}
				<h3 class="text-center">Graph is a Tree!</h3>
			{/if}
			<GraphImport />
		</div>
	</div>
</div>
<Toast />
