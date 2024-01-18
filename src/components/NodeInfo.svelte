<script lang="ts">
	import Graph from 'graphology';
	import { graphStore, availableAttributes } from '../utils/graph';
	import { nodePropertyGetters } from '../utils/rules';

	export let nodeID: string;
</script>

<div class="card shadow-2xl variant-glass p-4">
	{nodeID}
	{#each nodePropertyGetters.entries() as [property, getter]}
		<div>{property}: {getter.function($graphStore, nodeID)}</div>
	{/each}
	{#each $availableAttributes.node.range as attribute}
		<div>{attribute.name}: {attribute.getter($graphStore, nodeID)}</div>
	{/each}
	{#each $availableAttributes.node.string as attribute}
		<div>{attribute.name}: {attribute.getter($graphStore, nodeID)}</div>
	{/each}
</div>
