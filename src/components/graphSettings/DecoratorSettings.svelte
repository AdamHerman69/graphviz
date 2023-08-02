<script lang="ts">
	import SettingsSlider from './SettingsSlider.svelte';
	import type { DecoratorData, DecoratorSetting } from '../../stores/newStores';

	export let decoratorSetting: DecoratorSetting;
	console.log('decorator settting::', decoratorSetting);

	function addDecorator() {
		decoratorSetting.value.push({
			type: 'triangle',
			position: 1
		});
		decoratorSetting = decoratorSetting;
	}

	function removeDecorator() {
		decoratorSetting.value.pop();
		decoratorSetting = decoratorSetting;
	}
</script>

<div>
	<div>Decorators</div>

	{#each decoratorSetting.value as decorator, index}
		<div class="flex">
			<select bind:value={decorator.type} class="select">
				{#each decoratorSetting.types as decoratorType}
					<option value={decoratorType}>{decoratorType}</option>
				{/each}
			</select>

			<input
				type="number"
				min="0"
				max="1"
				step="0.1"
				bind:value={decorator.position}
				class="w-10 mt-3 bg-transparent text-right"
			/>
		</div>
	{/each}

	<button class="h-8 w-8 rounded-full border-dashed border-2 border-white" on:click={addDecorator}
		>+</button
	>
	{#if decoratorSetting.value.length > 0}
		<button
			class="h-8 w-8 rounded-full border-dashed border-2 border-white"
			on:click={removeDecorator}>-</button
		>
	{/if}
</div>
