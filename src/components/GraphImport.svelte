<script lang="ts">
	import Graph from 'graphology';
	import { parse } from 'graphology-graphml';
	import { FileDropzone } from '@skeletonlabs/skeleton';
	import { graphStore } from '../utils/graph';

	import { toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	let files: FileList;

	//let fileReader = new FileReader();
	// const graph = parse(Graph, graphmlString);
	let graph: Graph;

	// TODO: fix flow and error handeling
	async function onChangeHandler(e: Event) {
		const file: File = (e.target! as HTMLInputElement).files![0];
		if (!file) {
			// TODO handle file upload fail
			return;
		}
		try {
			const graphString = await file.text();
			graph = parse(Graph, graphString);
			graphStore.set(graph);
		} catch (error) {
			toastStore.trigger({ message: 'Graph upload failed. Please check the file format.' });
			console.log(error);
		}
	}
</script>

<FileDropzone name="fileInput" bind:files on:change={onChangeHandler} accept=".graphml, .gexf" />
