<script lang="ts">
	import { RangeSlider } from '@skeletonlabs/skeleton';
	import type { NumericalSetting } from '../../utils/graphSettings';
	import type { RangeAttribute } from '../../utils/graph';
	import { scaleLinear } from 'd3';

	export let name: string;
	export let numSettings: NumericalSetting;

	export let availableAttributes: RangeAttribute[];
	console.log('available attrs:', availableAttributes);

	let boundAttribute: RangeAttribute;
	let selectedAttribute: RangeAttribute;
	let selectedLow = numSettings.min;
	let selectedHigh = numSettings.max;

	let bindSettingsOpen = false;

	function bindAttributeHandle() {
		if (!bindSettingsOpen) {
			bindSettingsOpen = true;
			return;
		}

		bindSettingsOpen = false;
		selectedAttribute.scale = scaleLinear()
			.domain([selectedAttribute.range[0], selectedAttribute.range[1]])
			.range([selectedLow, selectedHigh]);
		boundAttribute = selectedAttribute;
		numSettings['attribute'] = selectedAttribute;
		console.log(numSettings);
	}
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
		<div class="text-s">
			{name}
		</div>
		<button class="btn btn-sm variant-ghost" on:click={bindAttributeHandle}>
			{#if boundAttribute === undefined && !bindSettingsOpen}
				bind settings
			{:else if boundAttribute === undefined && bindSettingsOpen}
				bind!
			{:else if bindSettingsOpen}
				update binding
			{:else}
				bound: {boundAttribute.name}
			{/if}
		</button>
		{#if bindSettingsOpen}
			<button class="btn btn-sm variant-ghost-warning" on:click={() => (bindSettingsOpen = false)}
				>x</button
			>
		{/if}
		<div class="text-xs">{numSettings.value}</div>
	</div>
</RangeSlider>
{#if bindSettingsOpen}
	<div class="my-2">
		<select bind:value={selectedAttribute} class="select w-full">
			{#each availableAttributes as attribute}
				<option value={attribute}
					>{attribute.name} [{attribute.range[0]}, {attribute.range[1]}]</option
				>
			{/each}
		</select>
		<div class="flex items-center mt-1">
			<p>range:</p>
			<input
				type="number"
				class="input ml-2 p-1 rounded-lg"
				bind:value={selectedLow}
				min={numSettings.min}
				max={Math.min(selectedHigh, numSettings.max)}
			/>
			<input
				type="number"
				class="input ml-2 p-1 rounded-lg"
				bind:value={selectedHigh}
				min={Math.max(selectedLow, numSettings.min)}
				max={numSettings.max}
			/>
		</div>
	</div>
{/if}
