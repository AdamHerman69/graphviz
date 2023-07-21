<script lang="ts">
	import type { SelectSetting } from '../stores/stores';
	import type { Writable } from 'svelte/store';

	export let name: String;
	export let selectSetting: Writable<SelectSetting>;
</script>

<label class="label">
	<span>{name}</span>
	<select bind:value={$selectSetting.selected} class="select">
		{#each $selectSetting.values as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
</label>
