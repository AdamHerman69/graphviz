<script lang="ts">
	import { edgeThickness, edgeColor } from '../stores/stores';
	import type { ZoomTransform } from 'd3';
	export let sourceX: number;
	export let sourceY: number;
	export let targetX: number;
	export let targetY: number;
	export let transform: ZoomTransform;
</script>

<g
	stroke="rgb({$edgeColor.r}, {$edgeColor.g}, {$edgeColor.b})"
	stroke-width={$edgeThickness.value}
	stroke-opacity={$edgeColor.a}
>
	<line
		x1={sourceX}
		y1={sourceY}
		x2={targetX}
		y2={targetY}
		transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
	/>
</g>
