<script>
	import GraphImport from '../components/GraphImport.svelte';
	import NodeLink from '../components/NodeLink.svelte';
	import Graph from 'graphology';
	import { GraphStore } from '../stores/stores';

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

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="h-full flex flex-col">
		<h1 class="h1 flex-none m-10">node-link vizualization demo</h1>
		<div class="grow flex">
			<NodeLink />
		</div>
		<div class="flex-none m-10">
			<GraphImport />
		</div>
	</div>
</div>
