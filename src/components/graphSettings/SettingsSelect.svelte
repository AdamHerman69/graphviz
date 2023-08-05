<script lang="ts">
	import type { Writable } from 'svelte/store';
	import type { SelectSetting } from '../../utils/graphSettings';

	export let name: String;
	export let selectSetting: SelectSetting;
</script>

<label class="label">
	<span>{name}</span>
	<select bind:value={selectSetting.value} class="select">
		{#each selectSetting.values as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
</label>
