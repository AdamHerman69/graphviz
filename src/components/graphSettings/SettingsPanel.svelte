<script lang="ts">
	import {
		nodeSettings,
		edgeSettings,
		type EdgeType,
		type RangeAttribute,
		type StringAttribute
	} from '../../utils/graphSettings';
	import {
		graphStore,
		findAllNodeAttributes,
		findAllEdgeAttributes,
		classifyAttributes
	} from '../../utils/graph';

	import SettingsSlider from './SettingsSlider.svelte';
	import SettingsColor from './SettingsColor.svelte';
	import SettingsSelect from './SettingsSelect.svelte';
	import EdgePreview from './EdgePreview.svelte';
	import GradientPicker from './GradientPicker.svelte';
	import DecoratorSettings from './DecoratorSettings.svelte';
	import RuleSettings from './RuleSettings.svelte';

	let availableNodeAttributes: (RangeAttribute | StringAttribute)[];
	let availableNodeRangeAttributes: RangeAttribute[];
	let availableEdgeAttributes: (RangeAttribute | StringAttribute)[];
	let availableEdgeRangeAttributes: RangeAttribute[];

	$: {
		availableNodeAttributes = classifyAttributes(findAllNodeAttributes($graphStore));
		availableEdgeAttributes = classifyAttributes(findAllEdgeAttributes($graphStore));
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
</script>

<div class="card h-full p-4 variant-ghost">
	<RuleSettings bind:nodeSettings={$nodeSettings[1]} />
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
	<DecoratorSettings bind:decoratorSetting={$edgeSettings[0].decorators} />
</div>
