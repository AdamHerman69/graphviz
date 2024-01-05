<script lang="ts">
	import ColorPicker, { type RgbaColor } from 'svelte-awesome-color-picker';
	import type { ColorSetting } from '../../utils/graphSettings';
	import { computePropertyRange } from '../../utils/rules';
	import { scaleLinear } from 'd3';
	import { graphStore } from '../../utils/graph';

	import bindAnimation from '../../lib/icons/unlink.json';
	import boundAnimation from '../../lib/icons/link.json';
	import PropertyPicker from './PropertyPicker.svelte';
	import GradientPicker from './GradientPicker.svelte';

	export let label: string;
	export let colorSetting: ColorSetting;
	export let attributes: RangeAttribute[];
	export let propertyGetters: Map<string, GraphPropertyGetter>;

	let bindButton: HTMLButtonElement;
	let selectedAttribute: RangeAttribute | GraphPropertyGetter;

	// todo init with graph settings value, might use a different picker as well idk
	let rgbaColor: RgbaColor = { r: 255, g: 255, b: 255, a: 1 };

	$: if (!colorSetting.attribute) {
		colorSetting.value = `rgba(${rgbaColor.r}, ${rgbaColor.g}, ${rgbaColor.b}, ${rgbaColor.a})`;
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
		colorSetting.value = [
			[colorSetting.value, 0],
			[colorSetting.value, 1]
		];
		console.log(colorSetting);
	}

	function bindAttributeHandler() {
		if (colorSetting.attribute) {
			colorSetting.attribute = undefined;
			return;
		}

		if (!selectedAttribute) selectedAttribute = attributes[0];

		// todo animation
	}
</script>

{#if selectedAttribute}
	<PropertyPicker bind:property={selectedAttribute} {attributes} {propertyGetters} />
	<GradientPicker bind:colorSetting />
{:else}
	<ColorPicker bind:rgb={rgbaColor} {label} />
{/if}
<button class="w-8 h-8" bind:this={bindButton} on:click={bindAttributeHandler}>Bind</button>
