<script lang="ts">
	import { Toast } from '@skeletonlabs/skeleton';
	import GraphImport from '../components/GraphImport.svelte';
	import SettingsPanel from '../components/graphSettings/SettingsPanel.svelte';
	import Graph from 'graphology';
	import { hasCycle } from 'graphology-dag';
	// import {
	// 	GraphStore,
	// 	nodeSize,
	// 	nodeFill,
	// 	nodeStrokeThickness,
	// 	nodeStrokeColor,
	// 	edgeThickness,
	// 	edgeColor,
	// 	layout
	// } from '../stores/stores';
	import { graphStore, graphSettings } from '../stores/newStores';
	import NodeLinkCanvas from '../components/NodeLinkCanvas.svelte';

	// example graph init
	const graph = new Graph();
	graph.addNode('a', { volume: 40 });
	graph.addNode('b', { volume: 25 });
	graph.addNode('c', { volume: 80 });
	graph.addNode('d', { volume: 35 });
	graph.addNode('e', { volume: 41 });
	graph.addNode('f', { volume: 40 });
	graph.addNode('g', { volume: 27 });
	graph.addNode('h', { volume: 65 });
	graph.addNode('i', { volume: 58 });
	graph.addNode('j', { volume: 32 });
	graph.addEdge('a', 'b', { speed: 1010 });
	graph.addEdge('a', 'c', { speed: 250 });
	graph.addEdge('a', 'd', { speed: 555 });
	graph.addEdge('a', 'e', { speed: 666 });
	graph.addEdge('b', 'c', { speed: 100 });
	graph.addEdge('g', 'c', { speed: 889 });
	graph.addEdge('f', 'd', { speed: 1000 });
	graph.addEdge('d', 'c', { speed: 666 });
	graph.addEdge('e', 'f', { speed: 370 });
	graph.addEdge('e', 'g', { speed: 552 });
	graph.addEdge('h', 'c', { speed: 345 });
	graph.addEdge('i', 'd', { speed: 958 });
	graph.addEdge('j', 'c', { speed: 399 });
	graph.addEdge('h', 'i', { speed: 1005 });
	graph.addEdge('j', 'i', { speed: 396 });

	graphStore.set(graph);

	function switchLayout() {
		if ($graphSettings.layout.value == 'force-graph') $graphSettings.layout.value = 'tree';
		else $graphSettings.layout.value = 'force-graph';
	}
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
			{#if !hasCycle($graphStore)}
				<button
					type="button"
					on:click={switchLayout}
					class="btn variant-filled absolute top-5 right-5"
				>
					switch layout</button
				>
			{/if}
			<GraphImport />
		</div>
	</div>
</div>
<Toast />
