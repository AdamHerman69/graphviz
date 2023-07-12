<script lang="ts">
	import Graph from 'graphology';
	import { parse } from 'graphology-graphml';
	import { FileDropzone } from '@skeletonlabs/skeleton';
	import { GraphStore } from '../stores/stores';

	let files: FileList;
	let graphmlString: string;

	//let fileReader = new FileReader();
	// const graph = parse(Graph, graphmlString);
	let graph: Graph;

	// TODO: fix flow and error handeling
	async function onChangeHandler(e: Event): void {
		const file: File = e.target.files[0];
		const graphmlString = await file.text();

		graph = parse(Graph, graphmlString);
		GraphStore.set(graph);
	}
</script>

<FileDropzone name="fileInput" bind:files on:change={onChangeHandler} accept=".graphml, .gexf" />
