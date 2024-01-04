<script lang="ts">
	import type { NodeLabel } from '../../utils/graphSettings';
	import ColorPicker, { type RgbaColor } from 'svelte-awesome-color-picker';
	import { availableAttributes } from '../../utils/graph';
	import { nodePropertyGetters } from '../../utils/rules';
	import { onMount } from 'svelte';
	import lottie, { type AnimationItem } from 'lottie-web';

	import plusAnimation from '../../lib/icons/plus.json';

	export let nodeLabels: NodeLabel[];
	let colors: RgbaColor[] = nodeLabels.map((label) => ({ r: 255, g: 255, b: 255, a: 1 }));

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

<div>Labels</div>

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

		<ColorPicker bind:rgb={colors[index]} label="" />

		<button
			id={index.toString()}
			on:click={(event) => {
				nodeLabels.splice(parseInt(event.currentTarget.id), 1);
				colors.splice(parseInt(event.currentTarget.id), 1);
				nodeLabels = nodeLabels;
			}}
		>
			-
		</button>
	</div>
{/each}

<button
	class="h-10"
	bind:this={plusButton}
	on:click={addLabel}
	on:mouseenter={() => plusAnimationInstance.play()}
	on:mouseleave={() => plusAnimationInstance.stop()}
/>
