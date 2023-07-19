<script lang="ts">
	import SettingsSlider from './SettingsSlider.svelte';
	import SettingsColor from './SettingsColor.svelte';
	import {
		nodeSize,
		nodeStrokeThickness,
		nodeFill,
		nodeStrokeColor,
		edgeThickness,
		edgeColor
	} from '../stores/stores';
	import { color } from 'd3';
</script>

<div class="card h-full p-4 variant-ghost">
	<b>Node Settings</b>
	<SettingsSlider name="Size" numericalSetting={nodeSize} />
	<SettingsSlider name="Stroke Thickness" numericalSetting={nodeStrokeThickness} />
	<div class="flex p-2">
		<SettingsColor color={nodeFill} label="fill" />
		<SettingsColor color={nodeStrokeColor} label="stroke" />
	</div>
	<b>Edge Settings</b>
	<SettingsSlider name="Thickness" numericalSetting={edgeThickness} />
	<div class="flex p-2">
		<SettingsColor color={edgeColor} label="color" />
	</div>
</div>
