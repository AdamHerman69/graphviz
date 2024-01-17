<script lang="ts">
	import SettingsSlider from './SettingsSlider.svelte';
	import SettingsSelect from './SettingsSelect.svelte';
	import SettingsColor from './SettingsColor.svelte';
	import EdgeLabelSettings from './EdgeLabelSettings.svelte';
	import { edgePropertyGetters } from '../../utils/rules';
	import { availableAttributes } from '../../utils/graph';
	import { edgeSettings } from '../../utils/graphSettings';
	import DecoratorSettings from './DecoratorSettings.svelte';
</script>

<div>
	<!-- <EdgePreview /> -->
	<SettingsSelect name="Edge Type" bind:selectSetting={$edgeSettings[0].type} />
	<SettingsSlider
		name="Thickness"
		availableAttributes={$availableAttributes.edge.range}
		bind:numSettings={$edgeSettings[0].width}
		propertyGetters={edgePropertyGetters}
	/>
	<SettingsSlider
		name="Partial edge"
		availableAttributes={$availableAttributes.edge.range}
		bind:numSettings={$edgeSettings[0].partialStart}
		bind:secondNumSettings={$edgeSettings[0].partialEnd}
		propertyGetters={edgePropertyGetters}
	/>

	<SettingsColor bind:colorSetting={$edgeSettings[0].color} name="Color" />
	<DecoratorSettings bind:decoratorSetting={$edgeSettings[0].decorators} />
	<EdgeLabelSettings bind:edgeLabels={$edgeSettings[0].labels} />
</div>
