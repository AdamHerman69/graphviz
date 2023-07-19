<script lang="ts">
	import SettingsSlider from './SettingsSlider.svelte';
	import {
		nodeSize,
		nodeOpacity,
		nodeStrokeThickness,
		edgeThickness,
		edgeOpacity
	} from '../stores/stores';
</script>

<div class="card h-full p-4 variant-ghost">
	<b>Node Settings</b>
	<SettingsSlider name="Size" numericalSetting={nodeSize} />
	<SettingsSlider name="Stroke Thickness" numericalSetting={nodeStrokeThickness} />
	<SettingsSlider name="Opacity" numericalSetting={nodeOpacity} />
	<b>Edge Settings</b>
	<SettingsSlider name="Thickness" numericalSetting={edgeThickness} />
	<SettingsSlider name="Opacity" numericalSetting={edgeOpacity} />
</div>
