<script lang="ts">
	export let options: string[];
	export let selected: string;

	let fieldset: HTMLFieldSetElement;

	$: length = options.length;

	const cos = (i) => Math.sin(((Math.PI * 2) / length) * i);
	const sin = (i) => Math.cos(((Math.PI * 2) / length) * i);

	function unHover() {
		// set --cos and --sin to zero for the time of the animation
		fieldset.classList.remove('hovered');
		console.log('unhovered');

		fieldset.classList.remove('finishedSpread');
	}

	function setHover() {
		fieldset.classList.add('hovered');
		console.log('hovered', fieldset.classList);

		setTimeout(() => {
			fieldset.classList.add('finishedSpread');
		}, 500);
	}
</script>

<fieldset bind:this={fieldset} on:mouseenter={setHover} on:mouseleave={unHover} style="">
	{#each options as option, i}
		<label class:selected={selected === option} style="--cos:{cos(i)}; --sin:{sin(i)};">
			<input type="radio" on:click={unHover} bind:group={selected} value={option} />
			<div>
				<span>{option}</span>
			</div>
		</label>
	{/each}
</fieldset>

<style>
	fieldset {
		border: 0;
		display: block;
		float: left;
		height: 20px;
		position: relative;
		shape-outside: circle(50%);
		width: 20px;
		z-index: 2;
		margin: 0.25rem;
	}
	label {
		display: inline-block;
		height: 20px;
		left: calc((50% - 10px));
		top: calc((50% - 10px));
		position: absolute;
		transition: top 500ms, left 500ms;
		width: 20px;
		z-index: inherit;
	}

	label:hover > input + div,
	label:focus-within > input + div {
		border-color: #0000ff;
	}

	:global(fieldset.hovered > label) {
		left: calc((50% - 10px) + (20px * var(--sin))) !important;
		top: calc((50% - 10px) + (20px * var(--cos))) !important;
	}

	/* fieldset:not(:hover) > label {
		--cos: 0 !important;
		--sin: 0 !important;
	} */

	fieldset:not(:hover) > label:not(.selected) {
		z-index: -1;
	}

	fieldset:hover > label:hover {
		z-index: 10;
	}

	input {
		clip: rect(1px, 1px, 1px, 1px);
		position: absolute;
		overflow: hidden;
	}

	input + div {
		/* border: 1px solid gray; */
		border-radius: 25%;
		cursor: pointer;
		display: flex;
		background: #e1e1ea;
		height: 20px;
		color: #4d4d4d;
		overflow: hidden;
		position: relative;
		width: 20px;
		transition: box-shadow 0.3s ease-in-out;
	}

	:global(fieldset.finishedSpread:hover > label:hover > input + div) {
		transform: scale(1.3);
		transition: transform 200ms ease-in-out;
	}

	fieldset:hover > label > div {
		box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
	}

	/* :global(fieldset.hovered > label:hover) {
		left: calc((50% - 10px) + (20px * var(--sin))) !important;
		top: calc((50% - 10px) + (20px * var(--cos))) !important;
		transition: left 200ms ease-in-out, top 200ms ease-in-out;
	} */

	input + div > span {
		display: block;
		font-size: 1rem;
		letter-spacing: 1px;
		position: absolute;
		text-align: center;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
