<script lang="ts">
	import { RangeSlider } from '@skeletonlabs/skeleton';
	import { NodeSettings } from '../stores/stores';
	import type { NumericalSetting, NodeSettingsType } from '../stores/stores';

	type KeysOfType<T, V> = keyof {
		[P in keyof T as T[P] extends V ? P : never]: any;
	};

	export let name: string;
	export let nodeSetting: KeysOfType<NodeSettingsType, NumericalSetting>;
</script>

<RangeSlider
	{name}
	bind:value={$NodeSettings[nodeSetting].value}
	label={name}
	max={$NodeSettings[nodeSetting].max}
	min={$NodeSettings[nodeSetting].min}
	step={$NodeSettings[nodeSetting].increment || 1}
>
	<div class="flex justify-between items-center">
		<div>{name}</div>
		<div class="text-xs">{$NodeSettings[nodeSetting].value}</div>
	</div>
</RangeSlider>
