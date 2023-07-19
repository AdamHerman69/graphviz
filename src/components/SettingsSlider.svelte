<script lang="ts">
	import { RangeSlider } from '@skeletonlabs/skeleton';
	import type { NumericalSetting } from '../stores/stores';
	import type { Writable } from 'svelte/store';

	export let name: string;
	export let numericalSetting: Writable<NumericalSetting>;
</script>

<RangeSlider
	{name}
	bind:value={$numericalSetting.value}
	label={name}
	max={$numericalSetting.max}
	min={$numericalSetting.min}
	step={$numericalSetting.increment || 1}
>
	<div class="flex justify-between items-center">
		<div>{name}</div>
		<div class="text-xs">{$numericalSetting.value}</div>
	</div>
</RangeSlider>
