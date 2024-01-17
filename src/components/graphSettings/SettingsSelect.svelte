<script lang="ts">
	import type { Writable } from 'svelte/store';
	import type { SelectSetting } from '../../utils/graphSettings';

	export let name: String;
	export let selectSetting: SelectSetting;
</script>

<div class="flex justify-between">
	<div class="text-m uppercase">
		{name}
		<!-- {numSettings.source} -->
	</div>
	<select bind:value={selectSetting.value} class="bg-transparent">
		{#each selectSetting.values as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
</div>
