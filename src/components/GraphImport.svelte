<script lang="ts">
	import Graph from 'graphology';
	import { parse } from 'graphology-graphml';
	import { FileDropzone } from '@skeletonlabs/skeleton';
	//import { FileReader } from 'file-api';

	let files: FileList;
	let graphmlString: string;

	//let fileReader = new FileReader();
	// const graph = parse(Graph, graphmlString);
	let graph: Graph;

	async function onChangeHandler(e: Event): void {
		const file = e.target.files[0];
		const graphmlString = await file.text();

		graph = parse(Graph, graphmlString);
		console.log(graph);
	}
</script>

<FileDropzone name="fileInput" bind:files on:change={onChangeHandler} />
