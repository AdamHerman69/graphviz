<script lang="ts">
	import SettingsSlider from './SettingsSlider.svelte';
	import SettingsColor from './SettingsColor.svelte';
	import SettingsSelect from './SettingsSelect.svelte';
	import {
		nodeSettings,
		edgeSettings,
		type EdgeType,
		type RangeAttribute,
		graphStore,
		type StringAttribute
	} from '../../stores/newStores';
	import EdgePreview from './EdgePreview.svelte';
	import GradientPicker from './GradientPicker.svelte';
	import type Graph from 'graphology';

	let availableNodeAttributes: (RangeAttribute | StringAttribute)[];
	let availableNodeRangeAttributes: RangeAttribute[];
	let availableEdgeAttributes: (RangeAttribute | StringAttribute)[];
	let availableEdgeRangeAttributes: RangeAttribute[];

	$: {
		availableNodeAttributes = classfifyAttributes(findAllNodeAttributes($graphStore));
		availableEdgeAttributes = classfifyAttributes(findAllEdgeAttributes($graphStore));
		//@ts-ignore
		availableNodeRangeAttributes = availableNodeAttributes.filter((attribute) =>
			attribute.hasOwnProperty('range')
		);
		//@ts-ignore
		availableEdgeRangeAttributes = availableEdgeAttributes.filter((attribute) =>
			attribute.hasOwnProperty('range')
		);

		console.log('nodeattrs: ', availableNodeAttributes);
		console.log('edgeattrs: ', availableEdgeAttributes);
	}

	function findAllNodeAttributes(graph: Graph): Map<string, any[]> {
		let foundNodeAttributes: Map<string, any[]> = new Map<string, any[]>();
		$graphStore.forEachNode((id, attributes) => {
			for (const [key, value] of Object.entries(attributes)) {
				if (!foundNodeAttributes.get(key)?.push(value)) {
					foundNodeAttributes.set(key, [value]);
				}
			}
		});
		return foundNodeAttributes;
	}

	function findAllEdgeAttributes(graph: Graph): Map<string, any[]> {
		let foundEdgeAttributes: Map<string, any[]> = new Map<string, any[]>();
		$graphStore.forEachEdge((id, attributes) => {
			for (const [key, value] of Object.entries(attributes)) {
				if (!foundEdgeAttributes.get(key)?.push(value)) {
					foundEdgeAttributes.set(key, [value]);
				}
			}
		});
		return foundEdgeAttributes;
	}

	function classfifyAttributes(
		attributeMap: Map<string, any[]>
	): (RangeAttribute | StringAttribute)[] {
		let attributes: (RangeAttribute | StringAttribute)[] = [];
		attributeMap.forEach((values, name) => {
			const minValue = Math.min(...values);
			if (isNaN(minValue)) {
				const stringAttribute: StringAttribute = { name: name, values: values };
				attributes.push(stringAttribute);
			} else {
				const maxValue = Math.max(...values);
				const rangeAttribute: RangeAttribute = { name: name, range: [minValue, maxValue] };
				attributes.push(rangeAttribute);
			}
		});
		return attributes;
	}
</script>

<div class="card h-full p-4 variant-ghost">
	<b>Node Settings</b>
	<SettingsSlider
		name="Size"
		availableAttributes={availableNodeRangeAttributes}
		bind:numSettings={$nodeSettings[0].size}
	/>
	<SettingsSlider
		name="Stroke"
		availableAttributes={availableNodeRangeAttributes}
		bind:numSettings={$nodeSettings[0].strokeWidth}
	/>
	<GradientPicker bind:colorSetting={$nodeSettings[0].color} />
	<div class="w-full flex py-1 items-center">
		<SettingsColor bind:colorSetting={$nodeSettings[0].strokeColor} label="" />
		<div>stroke</div>
	</div>

	<b>Edge Settings</b>
	<!-- <EdgePreview /> -->
	<SettingsSelect name="Edge Type" bind:selectSetting={$edgeSettings[0].type} />
	<SettingsSlider
		name="Thickness"
		availableAttributes={availableEdgeRangeAttributes}
		bind:numSettings={$edgeSettings[0].width}
	/>
	<SettingsSlider
		name="Partial edge start"
		availableAttributes={availableEdgeRangeAttributes}
		bind:numSettings={$edgeSettings[0].partialStart}
	/>
	<SettingsSlider
		name="Partial edge end"
		availableAttributes={availableEdgeRangeAttributes}
		bind:numSettings={$edgeSettings[0].partialEnd}
	/>

	<GradientPicker bind:colorSetting={$edgeSettings[0].color} />
</div>
