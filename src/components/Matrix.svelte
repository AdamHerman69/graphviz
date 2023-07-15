<script lang="ts">
	import Graph from 'graphology';
	import { GraphStore } from '../stores/stores';

	let width: number;
	let height: number;
	let rectSize: number;
	let matrixSize: number;

	$: matrixSize = Math.min(width, height);
	$: rectSize = matrixSize / $GraphStore.order;
</script>

<div class="h-full" bind:clientWidth={width} bind:clientHeight={height}>
	{#if !isNaN(matrixSize)}
		<svg width={matrixSize} height={matrixSize}>
			{#each $GraphStore.nodes() as outsideNode, i}
				{#each $GraphStore.nodes() as insideNode, j}
					<rect
						width={rectSize}
						height={rectSize}
						x={j * rectSize}
						y={i * rectSize}
						stroke="PaleVioletRed"
						fill="pink"
						fill-opacity={$GraphStore.hasEdge(outsideNode, insideNode) ? 1 : 0}
					/>
				{/each}
			{/each}
		</svg>
	{/if}
</div>
