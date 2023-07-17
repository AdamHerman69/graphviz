<script lang="ts">
	import { NodeSettings } from '../stores/stores';

	export let x: number;
	export let y: number;
	export let transform;
</script>

<circle
	class="node"
	r={$NodeSettings.size.value}
	fill={$NodeSettings.fill}
	opacity={$NodeSettings.fillOpacity.value}
	stroke={$NodeSettings.strokeColor}
	stroke-width={$NodeSettings.strokeThickness?.value}
	cx={x}
	cy={y}
	transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
/>
