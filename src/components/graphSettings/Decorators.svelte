<script lang="ts">
	import SettingsSlider from './SettingsSlider.svelte';
	//import { type Decorator } from '../../paperJS/Triangle';

	let decorators: Decorator[];
</script>

<div>
	{#each decorators as decorator}
		<!-- <SettingsSlider name="decoratorPosition" numericalSetting= /> -->
	{/each}
	<div />
</div>
