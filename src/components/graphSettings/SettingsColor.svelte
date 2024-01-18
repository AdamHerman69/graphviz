<script lang="ts">
	import type { RgbaColor } from 'colord';
	import ColorPicker from '$lib/colorPicker/components/ColorPicker.svelte';
	import type { ColorSetting } from '../../utils/graphSettings';
	import { computePropertyRange } from '../../utils/rules';
	import { color, scaleLinear, rgb } from 'd3';
	import { graphStore } from '../../utils/graph';
	import { onMount } from 'svelte';
	import ColorPickerWrapper from '$lib/myRangeSlider/ColorPickerWrapper.svelte';
	import { slide } from 'svelte/transition';

	import lottie, { type AnimationItem } from 'lottie-web';
	import bindAnimation from '../../lib/icons/unlink.json';
	import boundAnimation from '../../lib/icons/link.json';
	import PropertyPicker from './PropertyPicker.svelte';
	import GradientPicker from './GradientPicker.svelte';

	export let name: string;
	export let colorSetting: ColorSetting;
	export let attributes: RangeAttribute[];
	export let propertyGetters: Map<string, GraphPropertyGetter>;

	let selectedAttribute: RangeAttribute | GraphPropertyGetter;
	let bindButton: HTMLButtonElement;
	let bindAnimationInstance: AnimationItem;
	let singlePickerOpen: boolean = false;

	onMount(() => {
		bindAnimationInstance = lottie.loadAnimation({
			container: bindButton,
			loop: false,
			autoplay: false,
			animationData: bindAnimation
		});
	});

	// todo init with graph settings value, might use a different picker as well idk
	let rgbaColor: RgbaColor =
		typeof colorSetting.value === 'string' ? parseColor(colorSetting.value) : undefined;

	$: if (!colorSetting.attribute && typeof colorSetting.value === 'string') {
		if (rgbaColor) {
			colorSetting.value = `rgba(${rgbaColor.r}, ${rgbaColor.g}, ${rgbaColor.b}, ${rgbaColor.a})`;
		}
		console.log('zkurvilooo');
	}

	$: if (selectedAttribute) {
		applyAttributeBinding(selectedAttribute);
	}

	function applyAttributeBinding(attribute: RangeAttribute | GraphPropertyGetter) {
		let range: [number, number] = attribute.range
			? attribute.range
			: computePropertyRange($graphStore, attribute);
		colorSetting.scale = scaleLinear().domain(range).range([0, 1]);
		colorSetting.attribute = attribute;
		changeToGradient();
	}

	function changeToGradient() {
		if (typeof colorSetting.value === 'string') {
			colorSetting.value = [
				[colorSetting.value, 0],
				[colorSetting.value, 1]
			];
		}
		console.log(colorSetting.value);
	}

	function parseColor(colorString: string): RgbaColor {
		let rgba = rgb(colorString);
		return { r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.opacity };
	}

	function bindAttributeHandler() {
		if (colorSetting.attribute) {
			colorSetting.attribute = undefined;
			if (Array.isArray(colorSetting.value)) {
				console.log('setting color setting value to ', colorSetting.value);
				colorSetting.value = colorSetting.value[0][0];
				console.log('setting color setting value to ', colorSetting.value);
			}

			bindAnimationInstance.destroy();
			bindAnimationInstance = lottie.loadAnimation({
				container: bindButton,
				loop: false,
				autoplay: false,
				animationData: bindAnimation
			});
			return;
		}

		if (!selectedAttribute) selectedAttribute = attributes[0];
		applyAttributeBinding(selectedAttribute);

		bindAnimationInstance.destroy();
		bindAnimationInstance = lottie.loadAnimation({
			container: bindButton,
			loop: false,
			autoplay: false,
			animationData: boundAnimation
		});

		// todo refactor animation
	}
</script>

<div class="flex justify-between items-center">
	<div class="text-m uppercase">
		{name}
		<!-- {colorSettings.source} -->
	</div>
	<div class="flex justify-end items-center">
		{#if colorSetting.attribute}
			<PropertyPicker bind:property={selectedAttribute} {attributes} {propertyGetters} />
		{/if}
		{#if typeof colorSetting.value === 'string'}
			<button on:click={changeToGradient} class="mx-2">+</button>
			<button
				on:click={() => (singlePickerOpen = !singlePickerOpen)}
				class="rounded-full w-6 h-6"
				style="background-color: {colorSetting.value}; box-shadow: inset 0px 0px 10px 0px rgba(0, 0, 0, 0.5);"
			/>
		{/if}
		<button
			class="h-6"
			bind:this={bindButton}
			on:click={bindAttributeHandler}
			on:mouseenter={() => bindAnimationInstance.play()}
			on:mouseleave={() => bindAnimationInstance.stop()}
		/>
	</div>
</div>

{#if typeof colorSetting.value === 'string'}
	<div class={singlePickerOpen ? '' : 'hidden'} transition:slide>
		<ColorPicker
			bind:rgb={rgbaColor}
			label="tadyy"
			isDialog={false}
			components={{ wrapper: ColorPickerWrapper }}
			closeFunction={() => (singlePickerOpen = false)}
		/>
	</div>
{/if}

{#if Array.isArray(colorSetting.value)}
	<div transition:slide>
		<GradientPicker bind:colorSetting bind:rgbaColor />
	</div>
{/if}
