<script lang="ts">
	import { EdgeSettings } from '../stores/stores';

	export let sourceX: number;
	export let sourceY: number;
	export let targetX: number;
	export let targetY: number;
	export let transform;
</script>

<g
	stroke={$EdgeSettings.color}
	stroke-width={$EdgeSettings.thickness.value}
	stroke-opacity={$EdgeSettings.opacity.value}
>
	<line
		x1={sourceX}
		y1={sourceY}
		x2={targetX}
		y2={targetY}
		transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
	/>
</g>
