<script lang="ts">
	import ColorPicker from '$lib/colorPicker/components/ColorPicker.svelte';
	import type { RgbaColor } from 'colord';
	import type { ColorSetting } from '../../utils/graphSettings';
	import { rgb } from 'd3';
	import RangeSliderGradient from '$lib/myRangeSlider/RangeSliderGradient.svelte';

	export let colorSetting: ColorSetting;
	export let rgbaColor: RgbaColor;
	let colorPositions: number[] =
		typeof colorSetting.value === 'string'
			? [0]
			: colorSetting.value.map((colorTuple) => colorTuple[1]);

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
		colorPositions.pop();
		colors = colors;
		colorPositions = colorPositions;
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
			rgbaColor = colors[0][0];
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
	<RangeSliderGradient
		id="gradientSlider"
		bind:colors
		bind:values={colorPositions}
		max={1}
		min={0}
		step={0.05}
		float
	/>
</div>

<!-- supporting max 5 color stops -->
<style>
	:global(.rangeSlider) {
		/* height: 1em !important; */
		margin: 0.5em 0 0.5em !important;
		box-shadow: inset 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
		font-size: 19px;
	}

	:global(.rangeSlider > .rangeHandle > .rangeNub) {
		box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.7);
		/* top: 1px;
		height: 1.8em;
		width: 1.8em; */
	}

	:global(.rangeSlider#gradientSlider) {
		background: var(--gradient);

		/* filter: drop-shadow(0px 0px 10px); */
	}

	:global(.rangeSlider#gradientSlider > .rangeHandle > .rangeNub) {
		box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.7);
		/* top: 1px;
		height: 1.8em;
		width: 1.8em; */
	}

	:global(.rangeSlider#gradientSlider > .rangeHandle:nth-child(1) > .rangeNub) {
		background: var(--1);
	}

	:global(.rangeSlider#gradientSlider > .rangeHandle:nth-child(2) > .rangeNub) {
		background: var(--2);
	}

	:global(.rangeSlider#gradientSlider > .rangeHandle:nth-child(3) > .rangeNub) {
		background: var(--3);
	}

	:global(.rangeSlider#gradientSlider > .rangeHandle:nth-child(4) > .rangeNub) {
		background: var(--4);
	}

	:global(.rangeSlider#gradientSlider > .rangeHandle:nth-child(5) > .rangeNub) {
		background: var(--5);
	}
</style>
