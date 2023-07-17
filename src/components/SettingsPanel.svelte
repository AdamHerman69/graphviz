<script lang="ts">
	import SettingsSlider from './SettingsSlider.svelte';
</script>

<div class="card h-full p-4 variant-ghost">
	<b>Node Settings</b>
	<SettingsSlider name="Size" nodeSetting="size" />
	<SettingsSlider name="Stroke Thickness" nodeSetting="strokeThickness" />
	<SettingsSlider name="Opacity" nodeSetting="fillOpacity" />
</div>
