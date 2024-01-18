<script lang="ts">
	import SettingsSlider from './SettingsSlider.svelte';
	import SettingsColor from './SettingsColor.svelte';
	import NodeLabelSettings from './NodeLabelSettings.svelte';
	import { nodePropertyGetters } from '../../utils/rules';
	import { availableAttributes } from '../../utils/graph';
	import { nodeSettings } from '../../utils/graphSettings';
</script>

<div class="mx-4 my-2">
	<SettingsSlider
		name="Size"
		availableAttributes={$availableAttributes.node.range}
		bind:numSettings={$nodeSettings[0].size}
		propertyGetters={nodePropertyGetters}
	/>
	<SettingsColor
		bind:colorSetting={$nodeSettings[0].color}
		name="Fill Color"
		attributes={$availableAttributes.node.range}
		propertyGetters={nodePropertyGetters}
	/>
	<SettingsSlider
		name="Stroke"
		availableAttributes={$availableAttributes.node.range}
		bind:numSettings={$nodeSettings[0].strokeWidth}
		propertyGetters={nodePropertyGetters}
	/>
	<SettingsColor
		bind:colorSetting={$nodeSettings[0].strokeColor}
		name="Stroke Color"
		attributes={$availableAttributes.node.range}
		propertyGetters={nodePropertyGetters}
	/>
</div>
<div>
	<NodeLabelSettings bind:nodeLabels={$nodeSettings[0].labels} />
</div>
