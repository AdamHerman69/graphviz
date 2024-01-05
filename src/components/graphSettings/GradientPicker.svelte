<script lang="ts">
	import ColorPicker, { type RgbaColor } from 'svelte-awesome-color-picker';
	import type { ColorSetting } from '../../utils/graphSettings';
	import { rgb } from 'd3';

	export let colorSetting: ColorSetting;
	let colors: [RgbaColor, number][] =
		typeof colorSetting.value === 'string'
			? [[{ r: 255, g: 255, b: 255, a: 1 }, 0]]
			: colorSetting.value.map((colorTuple) => [parseColor(colorTuple[0]), colorTuple[1]]);

	function addColor() {
		colors.push([{ r: 255, g: 255, b: 255, a: 1 }, 1]);
		colors = colors;
	}

	function removeLastColor() {
		colors.pop();
		colors = colors;
	}

	// todo refactor elsewhere, probably have it on the color type available
	function toString(rgba: RgbaColor) {
		return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
	}

	function parseColor(colorString: string): RgbaColor {
		let rgba = rgb(colorString);
		return { r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.opacity };
	}

	$: {
		// todo this runs twice on adding new color, probably because of the binding in component re-render. Probably doesn't matter

		if (colors.length == 1) {
			colorSetting.value = toString(colors[0][0]);
		} else {
			colorSetting.value = colors.map((colorTuple) => [toString(colorTuple[0]), colorTuple[1]]);
		}
	}
</script>

<div class="flex items-center py-1 space-x-1">
	{#each colors as colorTuple}
		<div>
			<ColorPicker bind:rgb={colorTuple[0]} label="" />
			{#if colors.length > 1}
				<input
					type="number"
					min="0"
					max="1"
					step="0.1"
					bind:value={colorTuple[1]}
					class="w-10 mt-3 bg-transparent text-right"
				/>
			{/if}
		</div>
	{/each}

	<!-- + and - buttons -->
	{#if colors.length <= 1}
		<button class="h-8 w-8 rounded-full border-dashed border-2 border-white" on:click={addColor}
			>+</button
		>
	{:else}
		<div class="h-full flex-col">
			<button
				class="h-8 w-8 rounded-full border-dashed border-2 border-white"
				on:click={removeLastColor}>-</button
			>
			<button class="h-8 w-8 rounded-full border-dashed border-2 border-white" on:click={addColor}
				>+</button
			>
		</div>
	{/if}
</div>
