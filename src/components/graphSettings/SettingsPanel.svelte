<script lang="ts">
	import SettingsSlider from './SettingsSlider.svelte';
	import SettingsColor from './SettingsColor.svelte';
	import SettingsSelect from './SettingsSelect.svelte';
	import {
		nodeSize,
		nodeStrokeThickness,
		nodeFill,
		nodeStrokeColor,
		edgeThickness,
		edgeColor,
		edgeType,
		partialEdgeStart,
		partialEdgeEnd
	} from '../../stores/stores';
	import EdgePreview from './EdgePreview.svelte';
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
	<EdgePreview />
	<SettingsSelect name="Edge Type" selectSetting={edgeType} />
	<SettingsSlider name="Thickness" numericalSetting={edgeThickness} />
	<SettingsSlider name="Partial edge start" numericalSetting={partialEdgeStart} />
	<SettingsSlider name="Partial edge end" numericalSetting={partialEdgeEnd} />

	<div class="flex p-2">
		<SettingsColor color={edgeColor} label="color" />
	</div>
</div>
