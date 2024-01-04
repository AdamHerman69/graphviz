<script lang="ts">
	import type { EdgeLabel } from '../../utils/graphSettings';
	import RangeSlider from 'svelte-range-slider-pips';
	import ColorPicker, { type RgbaColor } from 'svelte-awesome-color-picker';
	import { SlideToggle } from '@skeletonlabs/skeleton';

	import { edgePropertyGetters } from '../../utils/rules';
	import { availableAttributes } from '../../utils/graph';
	import { color } from 'd3';

	export let edgeLabels: EdgeLabel[];

	let relativePositions: number[] = edgeLabels.map((label) => label.relativePosition);
	let colors: RgbaColor[] = edgeLabels.map((label) => ({ r: 255, g: 255, b: 255, a: 1 }));

	$: {
		edgeLabels.forEach((label, i) => {
			label.relativePosition = relativePositions[i];
			label.color = `rgba(${colors[i].r}, ${colors[i].g}, ${colors[i].b}, ${colors[i].a})`;
		});
		edgeLabels = edgeLabels;
	}
</script>

<div>
	<span>Labels</span>
	<RangeSlider bind:values={relativePositions} min={0} max={1} step={0.01} float />
	{#each edgeLabels as label, index}
		<div class="flex items-center">
			<!-- TODO Size -->

			<select class="bg-transparent" bind:value={label.attributeName}>
				<optgroup label="edge properties">
					{#each edgePropertyGetters as [name, getter]}
						<option>{name}</option>
					{/each}
				</optgroup>
				<optgroup label="edge attributes">
					{#each $availableAttributes.edge.range as attribute}
						<option>{attribute.name}</option>
					{/each}
					{#each $availableAttributes.edge.string as attribute}
						<option>{attribute.name}</option>
					{/each}
				</optgroup>
			</select>

			<select bind:value={label.position} class="bg-transparent">
				<option value="above">above</option>
				<option value="below">below</option>
				<option value="center">center</option>
			</select>

			<SlideToggle name="rotate" bind:checked={label.rotate} size="sm" />
			<ColorPicker bind:rgb={colors[index]} label="" />
			<button
				id={index.toString()}
				on:click={(event) => {
					edgeLabels.splice(parseInt(event.currentTarget.id), 1);
					colors.splice(parseInt(event.currentTarget.id), 1);
					relativePositions.splice(parseInt(event.currentTarget.id), 1);
					edgeLabels = edgeLabels;
				}}
			>
				-
			</button>
		</div>
	{/each}
	<button
		on:click={() => {
			edgeLabels.push({
				text: 'mid',
				color: 'rgba(255, 255, 255, 1)',
				size: 3,
				relativePosition: 0.5,
				position: 'below',
				rotate: true
			});
			colors.push({ r: 255, g: 255, b: 255, a: 1 });
			relativePositions.push(0.5);

			edgeLabels = edgeLabels;
			relativePositions = relativePositions;
			colors = colors;
		}}
	>
		+
	</button>
</div>
