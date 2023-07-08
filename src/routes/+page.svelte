<script>
	import NodeLink from '../components/NodeLink.svelte';
	import Graph from 'graphology';

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
</script>

<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<h1 class="h1">Let's get cracking bones!</h1>
		<p>Start by exploring:</p>
		<ul>
			<li>
				<code class="code">/src/routes/+layout.svelte</code> - barebones layout, the CSS import order
				is critical!
			</li>
			<li>
				<code class="code">/src/app.postcss</code> - minimal css to make the page full screen, may not
				be relevant for your project
			</li>
			<li>
				<code class="code">/src/routes/+page.svelte</code> - this page, you can replace the contents
			</li>
		</ul>
		<NodeLink {graph} />
	</div>
</div>
