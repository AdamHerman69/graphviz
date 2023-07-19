<script lang="ts">
	import ColorPicker, { type RgbaColor } from 'svelte-awesome-color-picker';
	import type { Writable } from 'svelte/store';

	export let color: Writable<RgbaColor>;
	export let label: string;
</script>

<ColorPicker bind:rgb={$color} {label} />
