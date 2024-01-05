<script lang="ts">
	import type { Attribute, RangeAttribute } from '../../utils/graph';
	import type { GraphPropertyGetter } from '../../utils/rules';

	export let property: Attribute | GraphPropertyGetter;
	export let attributes: RangeAttribute[];
	export let propertyGetters: Map<string, GraphPropertyGetter>;
</script>

<select bind:value={property} class="bg-transparent">
	<optgroup label="attributes">
		{#each attributes as attribute}
			<option value={attribute}
				>{attribute.name} [{attribute.range[0]}, {attribute.range[1]}]</option
			>
		{/each}
	</optgroup>
	<optgroup label="properties">
		{#each propertyGetters as [name, getter]}
			<option value={getter}>{name}</option>
		{/each}
	</optgroup>
</select>
