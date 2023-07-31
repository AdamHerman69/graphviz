<script lang="ts">
	import SettingsSlider from './SettingsSlider.svelte';
	import SettingsColor from './SettingsColor.svelte';
	import SettingsSelect from './SettingsSelect.svelte';
	import { graphSettings, type EdgeType } from '../../stores/newStores';
	import EdgePreview from './EdgePreview.svelte';
</script>

<div class="card h-full p-4 variant-ghost">
	<b>Node Settings</b>
	<SettingsSlider name="Size" bind:numSettings={$graphSettings.nodeSettings[0].size} />
	<SettingsSlider
		name="Stroke Thickness"
		bind:numSettings={$graphSettings.nodeSettings[0].strokeWidth}
	/>
	<!-- <div class="flex p-2">
		<SettingsColor bind:colorSetting={$graphSettings.nodeSettings[0].color} label="fill" />
		<SettingsColor bind:colorSetting={$graphSettings.nodeSettings[0].strokeColor} label="stroke" />
	</div> -->
	<b>Edge Settings</b>
	<!-- <EdgePreview /> -->
	<SettingsSelect name="Edge Type" bind:selectSetting={$graphSettings.edgeSettings[0].type} />
	<SettingsSlider name="Thickness" bind:numSettings={$graphSettings.edgeSettings[0].width} />
	<SettingsSlider
		name="Partial edge start"
		bind:numSettings={$graphSettings.edgeSettings[0].partialStart}
	/>
	<SettingsSlider
		name="Partial edge end"
		bind:numSettings={$graphSettings.edgeSettings[0].partialEnd}
	/>

	<!-- <div class="flex p-2">
		<SettingsColor bind:colorSetting={$graphSettings.edgeSettings[0].color} label="color" />
	</div> -->
</div>
