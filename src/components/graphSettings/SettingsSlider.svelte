<script lang="ts">
	import type { NumericalSetting } from '../../utils/graphSettings';
	import type { RangeAttribute } from '../../utils/graph';
	import { scaleLinear } from 'd3';
	import lottie, { type AnimationItem } from 'lottie-web';
	import { onMount } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';
	import {
		nodePropertyGetters,
		type GraphPropertyGetter,
		computePropertyRange
	} from '../../utils/rules';
	import { graphStore } from '../../utils/graph';

	import bindAnimation from '../../lib/icons/unlink.json';
	import boundAnimation from '../../lib/icons/link.json';
	import PropertyPicker from './PropertyPicker.svelte';

	export let name: string;
	export let numSettings: NumericalSetting;
	export let secondNumSettings: NumericalSetting;
	export let availableAttributes: RangeAttribute[];
	export let propertyGetters: Map<string, GraphPropertyGetter>;

	let values: number[] = secondNumSettings
		? [numSettings.value, secondNumSettings.value]
		: [numSettings.value];

	$: {
		numSettings.value = values[0];
		if (secondNumSettings) secondNumSettings.value = values[1];
	}

	$: if (selectedAttribute) {
		applyAttributeBinding(selectedAttribute, selectedRange);
	}

	let selectedAttribute: RangeAttribute | GraphPropertyGetter;
	let selectedRange: number[] = [numSettings.min, numSettings.max];

	let bindButton: HTMLButtonElement;
	let bindAnimationInstance: AnimationItem;

	onMount(() => {
		bindAnimationInstance = lottie.loadAnimation({
			container: bindButton,
			loop: false,
			autoplay: false,
			animationData: bindAnimation
		});
	});

	function applyAttributeBinding(
		attribute: RangeAttribute | GraphPropertyGetter,
		selectedRange: number[]
	) {
		console.log('applying binding: ', attribute, selectedRange);
		let range: [number, number] = attribute.range
			? attribute.range
			: computePropertyRange($graphStore, attribute);
		numSettings.scale = scaleLinear().domain(range).range(selectedRange);
		numSettings['attribute'] = attribute;
	}

	function bindAttributeHandler() {
		if (numSettings.attribute) {
			numSettings['attribute'] = undefined;

			bindAnimationInstance.destroy();
			bindAnimationInstance = lottie.loadAnimation({
				container: bindButton,
				loop: false,
				autoplay: false,
				animationData: bindAnimation
			});

			return;
		}
		if (!selectedAttribute) selectedAttribute = availableAttributes[0];
		applyAttributeBinding(selectedAttribute, selectedRange);

		// todo refactor animation to a separate function

		bindAnimationInstance.destroy();
		bindAnimationInstance = lottie.loadAnimation({
			container: bindButton,
			loop: false,
			autoplay: false,
			animationData: boundAnimation
		});
	}
</script>

<div class="flex justify-between items-center">
	<div class="text-m uppercase">
		{name}
		<!-- {numSettings.source} -->
	</div>
	<div class="flex justify-end items-center">
		{#if numSettings.attribute}
			<PropertyPicker
				bind:property={selectedAttribute}
				attributes={availableAttributes}
				{propertyGetters}
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

{#if numSettings.attribute}
	<RangeSlider
		bind:values={selectedRange}
		max={numSettings.max}
		min={numSettings.min}
		step={numSettings.increment || 1}
		range={true}
		float
	/>
{:else}
	<RangeSlider
		bind:values
		max={numSettings.max}
		min={numSettings.min}
		step={numSettings.increment || 1}
		range={secondNumSettings !== undefined}
		float
	/>
{/if}
