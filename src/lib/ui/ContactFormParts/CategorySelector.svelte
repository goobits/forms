<script>
	import { GooSelect } from '@goobits/goo/select';

	/**
	 * CategorySelector - Contact form category selection dropdown
	 *
	 * @component
	 * Part of ContactForm - extracted for maintainability
	 *
	 * @prop {string} value - Selected category (bindable)
	 * @prop {Object} categories - Categories object with label/value pairs
	 * @prop {Function} onChange - Callback when category changes
	 * @prop {Function} getMessage - Message getter function
	 */

	let { value = $bindable(), categories, onChange, getMessage } = $props();

	const options = $derived.by(() =>
		Object.entries(categories).map(([val, { label }]) => ({
			id: val,
			label
		}))
	);
</script>

<div class="contact-form__field-group">
	<div class="contact-form__label">
		{getMessage('howCanWeHelp', 'How can we help?')}
	</div>
	<GooSelect
		bind:value
		{options}
		ariaLabel={getMessage('selectCategory', 'Select a category')}
		block
		placeholder="Select a category"
		onchange={(nextValue) => onChange(nextValue)}
		class="contact-form__select contact-form__category-select"
	/>
</div>

<style>
	.contact-form__field-group {
		margin-bottom: 1.5rem;
	}

	.contact-form__field-group .contact-form__label {
		display: block;
		margin-bottom: 0.5rem;
	}
</style>
