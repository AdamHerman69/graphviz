<script lang="ts">
	import ColorPicker, { type RgbaColor } from 'svelte-awesome-color-picker';
	import type { ColorSetting } from '../../utils/graphSettings';

	export let label: string;
	export let colorSetting: ColorSetting;

	// todo init with graph settings value, might use a different picker as well idk
	let rgbaColor: RgbaColor = { r: 255, g: 255, b: 255, a: 1 };

	$: {
		colorSetting.value = `rgba(${rgbaColor.r}, ${rgbaColor.g}, ${rgbaColor.b}, ${rgbaColor.a})`;
	}
</script>

<ColorPicker bind:rgb={rgbaColor} {label} />
