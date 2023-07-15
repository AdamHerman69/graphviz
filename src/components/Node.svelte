<script lang="ts">
	import { NodeSettings } from '../stores/stores';

	export let x: number;
	export let y: number;
	export let transform;
</script>

<circle
	class="node"
	r={$NodeSettings.size}
	fill={$NodeSettings.fill}
	opacity={$NodeSettings.fillOpacity}
	stroke={$NodeSettings.strokeColor}
	stroke-width={$NodeSettings.strokeThickness}
	cx={x}
	cy={y}
	transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
/>
