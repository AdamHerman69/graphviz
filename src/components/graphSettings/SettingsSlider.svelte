<script lang="ts">
	import type { NumericalSetting } from '../../utils/graphSettings';
	import type { RangeAttribute } from '../../utils/graph';
	import { scaleLinear } from 'd3';
	import lottie, { type AnimationItem } from 'lottie-web';
	import { onMount } from 'svelte';
	import RangeSlider from 'svelte-range-slider-pips';

	import bindAnimation from '../../lib/icons/unlink.json';
	import boundAnimation from '../../lib/icons/link.json';

	export let name: string;
	export let numSettings: NumericalSetting;
	export let secondNumSettings: NumericalSetting;

	let values: number[] = secondNumSettings
		? [numSettings.value, secondNumSettings.value]
		: [numSettings.value];

	$: {
		numSettings.value = values[0];
		if (secondNumSettings) secondNumSettings.value = values[1];
	}

	$: if (selectedAttribute) {
		console.log('ran: ', selectedAttribute);
		applyAttributeBinding(selectedAttribute, selectedRange);
	}

	export let availableAttributes: RangeAttribute[];
	console.log('available attrs:', availableAttributes);

	let boundAttribute: RangeAttribute;
	let selectedAttribute: RangeAttribute;
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

	function applyAttributeBinding(attribute: RangeAttribute, selectedRange: number[]) {
		console.log('applying binding: ', attribute, selectedRange);
		boundAttribute = attribute;
		boundAttribute.scale = scaleLinear()
			.domain([boundAttribute.range[0], boundAttribute.range[1]])
			.range(selectedRange);
		numSettings['attribute'] = boundAttribute;
	}

	function bindAttributeHandle() {
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
		//applyAttributeBinding(selectedAttribute, selectedRange);

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
	<div class="text-s">
		{name}
		<!-- {numSettings.source} -->
	</div>
	<div class="flex justify-end items-center">
		{#if numSettings.attribute}
			<select bind:value={selectedAttribute} class="bg-transparent">
				{#each availableAttributes as attribute}
					<option value={attribute}
						>{attribute.name} [{attribute.range[0]}, {attribute.range[1]}]</option
					>
				{/each}
			</select>
		{/if}
		<button
			class="h-6"
			bind:this={bindButton}
			on:click={bindAttributeHandle}
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
		pips
	/>
{/if}
