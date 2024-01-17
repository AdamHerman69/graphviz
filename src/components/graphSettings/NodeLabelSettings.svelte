<script lang="ts">
	import type { NodeLabel } from '../../utils/graphSettings';
	import ColorPicker from '$lib/colorPicker/components/ColorPicker.svelte';
	import { availableAttributes } from '../../utils/graph';
	import { nodePropertyGetters } from '../../utils/rules';
	import { onMount } from 'svelte';
	import lottie, { type AnimationItem } from 'lottie-web';
	import plusAnimation from '../../lib/icons/plus.json';
	import { slide } from 'svelte/transition';
	import ColorPickerWrapper from '$lib/myRangeSlider/ColorPickerWrapper.svelte';

	export let nodeLabels: NodeLabel[];
	let colors: RgbaColor[] = nodeLabels.map((label) => ({ r: 255, g: 255, b: 255, a: 1 }));
	let colorPickers: boolean[] = nodeLabels.map(() => false);

	const positions: string[] = ['below', 'above', 'center', 'left', 'right'];

	let plusButton: HTMLButtonElement;
	let plusAnimationInstance: AnimationItem;

	onMount(() => {
		plusAnimationInstance = lottie.loadAnimation({
			container: plusButton,
			loop: false,
			autoplay: false,
			animationData: plusAnimation
		});
	});

	$: {
		nodeLabels.forEach((label, i) => {
			label.color = `rgba(${colors[i].r}, ${colors[i].g}, ${colors[i].b}, ${colors[i].a})`;
		});
		nodeLabels = nodeLabels;
	}

	function addLabel() {
		nodeLabels.push({
			text: 'label',
			size: 4,
			position: 'below',
			color: 'rgba(255, 255, 255, 1)'
		});
		colors.push({ r: 255, g: 255, b: 255, a: 1 });
		nodeLabels = nodeLabels;
		colors = colors;
	}
</script>

<div class="text-m uppercase">
	Labels
	<!-- {numSettings.source} -->
</div>

{#each nodeLabels as label, index}
	<div class="flex items-center">
		<select class="bg-transparent" bind:value={label.attributeName}>
			<optgroup label="node properties">
				{#each nodePropertyGetters as [name, getter]}
					<option>{name}</option>
				{/each}
			</optgroup>
			<optgroup label="node attributes">
				{#each $availableAttributes.node.range as attribute}
					<option>{attribute.name}</option>
				{/each}
				{#each $availableAttributes.node.string as attribute}
					<option>{attribute.name}</option>
				{/each}
			</optgroup>
		</select>

		<select class="bg-transparent" bind:value={label.position}>
			<option value="below">below</option>
			<option value="above">above</option>
			<option value="center">center</option>
			<option value="left">left</option>
			<option value="right">right</option>
		</select>

		<button
			on:click={() => (colorPickers[index] = !colorPickers[index])}
			class="rounded w-5 h-4 mx-1"
			style="background-color: {`rgba(${colors[index].r}, ${colors[index].g}, ${colors[index].b}, ${colors[index].a})`};"
		/>
		<!-- Size -->
		<div class="flex-col items-center">
			<button on:click={() => (label.size = label.size + 0.5)}>+</button>
			<button on:click={() => (label.size = label.size - 0.5)}>-</button>
		</div>

		<button
			id={index.toString()}
			class="mx-2"
			on:click={(event) => {
				nodeLabels.splice(parseInt(event.currentTarget.id), 1);
				colors.splice(parseInt(event.currentTarget.id), 1);
				nodeLabels = nodeLabels;
			}}
		>
			-
		</button>
	</div>
	<div class={colorPickers[index] ? '' : 'hidden'} transition:slide>
		<ColorPicker
			bind:rgb={colors[index]}
			label="tadyy"
			isDialog={false}
			components={{ wrapper: ColorPickerWrapper }}
			closeFunction={() => (colorPickers[index] = false)}
		/>
	</div>
{/each}

<button
	class="h-10"
	bind:this={plusButton}
	on:click={addLabel}
	on:mouseenter={() => plusAnimationInstance.play()}
	on:mouseleave={() => plusAnimationInstance.stop()}
/>
