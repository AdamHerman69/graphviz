<script lang="ts">
	import ColorPicker, { type RgbaColor } from 'svelte-awesome-color-picker';
	import type { ColorSetting } from '../../utils/graphSettings';
	import { color, rgb } from 'd3';
	import RangeSlider from 'svelte-range-slider-pips';

	export let colorSetting: ColorSetting;
	let colorPositions: number[] = [0, 1];
	let styleString: string;
	let colors: [RgbaColor, number][] =
		typeof colorSetting.value === 'string'
			? [[{ r: 255, g: 255, b: 255, a: 1 }, 0]]
			: colorSetting.value.map((colorTuple) => [parseColor(colorTuple[0]), colorTuple[1]]);

	function addColor() {
		colors.push([{ r: 255, g: 255, b: 255, a: 1 }, 1]);
		colorPositions.push(1);
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

	function cssGradient() {
		let sortedColors = [...colors].sort((a, b) => a[1] - b[1]);
		return `linear-gradient(to right, ${sortedColors
			.map((colorTuple) => `${toString(colorTuple[0])} ${colorTuple[1] * 100}%`)
			.join(', ')})`;
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
		let cssGradientString = cssGradient();

		// build css style string
		styleString = '--gradient: ' + cssGradientString + ';';
		colors.forEach((colorTuple, i) => {
			styleString += `--${i + 1}: ${toString(colorTuple[0])};`;
		});
	}

	$: {
		colorPositions.forEach((position, i) => {
			colors[i][1] = position;
		});
	}

	let blue = 'blue';
</script>

<div style={styleString}>
	<RangeSlider bind:values={colorPositions} max={1} min={0} step={0.05} float />
</div>
<div class="relative flex items-center mx-4">
	{#each colors as colorTuple}
		<div class="absolute" style="left: {colorTuple[1] * 100}%; transform: translateX(-50%);">
			<ColorPicker bind:rgb={colorTuple[0]} label="" />
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

<style>
	:global(.rangeSlider) {
		background: var(--gradient);
	}

	:global(.rangeSlider > .rangeHandle:nth-child(1) > .rangeNub) {
		background: var(--1);
	}

	:global(.rangeSlider > .rangeHandle:nth-child(2) > .rangeNub) {
		background: var(--2);
	}

	:global(.rangeSlider > .rangeHandle:nth-child(3) > .rangeNub) {
		background: var(--3);
	}

	:global(.rangeSlider > .rangeHandle:nth-child(4) > .rangeNub) {
		background: var(--4);
	}

	:global(.rangeSlider > .rangeHandle:nth-child(5) > .rangeNub) {
		background: var(--5);
	}
</style>
