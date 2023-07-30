<script lang="ts">
	import { RangeSlider } from '@skeletonlabs/skeleton';
	import type { NumericalSetting } from '../../stores/stores';
	import type { Writable } from 'svelte/store';

	export let name: string;
	export let numSettings: NumericalSetting;
</script>

<RangeSlider
	{name}
	bind:value={numSettings.value}
	label={name}
	max={numSettings.max}
	min={numSettings.min}
	step={numSettings.increment || 1}
>
	<div class="flex justify-between items-center">
		<div>{name}</div>
		<div class="text-xs">{numSettings.value}</div>
	</div>
</RangeSlider>
