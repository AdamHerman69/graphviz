<script lang="ts">
	import { Toast } from '@skeletonlabs/skeleton';
	import GraphImport from '../components/GraphImport.svelte';
	import NodeSettingsPanel from '../components/graphSettings/NodeSettingsPanel.svelte';
	import Graph from 'graphology';
	import { hasCycle } from 'graphology-dag';
	import { graphStore } from '../utils/graph';
	import { layout, saveState } from '../utils/graphSettings';
	import NodeLinkCanvas from '../components/NodeLinkCanvas.svelte';
	import EdgeSettingsPanel2 from '../components/graphSettings/EdgeSettingsPanel2.svelte';
	import NodeSettingsPanel2 from '../components/graphSettings/NodeSettingsPanel2.svelte';
	import { onMount } from 'svelte';

	// todo delete
	import { nodeSettings } from '../utils/graphSettings';
	import Guidelines from '../components/guidelines/GuidelinesPanel.svelte';
	import GuidelinesPanel from '../components/guidelines/GuidelinesPanel.svelte';

	// example graph init
	const graph = new Graph();
	graph.addNode('a', { volume: 40, neco: 'nejakej string' });
	graph.addNode('b', { volume: 25 });
	graph.addNode('c', { volume: 80 });
	graph.addNode('d', { volume: 35 });
	graph.addNode('e', { volume: 41, neco: 'random string' });
	graph.addNode('f', { volume: 40, neco: 55 });
	graph.addNode('g', { volume: 27 });
	graph.addNode('h', { volume: 65 });
	graph.addNode('i', { volume: 58, kk: 2 });
	graph.addNode('j', { volume: 32, neco: 3 });
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

	// todo enable once we have custom scroll
	// onMount(() => {
	// 	document.body.style.overflow = 'hidden';
	// });

	function switchLayout() {
		if ($layout.value == 'force-graph') $layout.value = 'tree';
		else $layout.value = 'force-graph';

		saveState();
	}
</script>

<div class="h-full w-full flex justify-center items-center">
	<div class="h-full w-full flex flex-col mx-2">
		<h1 class="h1 flex-none m-10 text-center">node-link vizualization demo</h1>
		<div class="grow flex justify-between">
			<div class="absolute inset-0 z-0"><NodeLinkCanvas /></div>
			<div class="w-1/5 z-10"><GuidelinesPanel /></div>
			<div class="settingsPanel w-1/4 z-10 text-sm">
				<NodeSettingsPanel2 />
				<EdgeSettingsPanel2 />
			</div>
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

<style>
	.settingsPanel {
		width: 326px;
	}
</style>
