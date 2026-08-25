<script lang="ts">
	import { CheckCircle, AlertCircle } from '@lucide/svelte';
	import { GooCheckbox } from '@goobits/goo/checkbox';
	import { GooInput } from '@goobits/goo/input';
	import { GooSelect } from '@goobits/goo/select';
	import { GooTextarea } from '@goobits/goo/textarea';

	/**
	 * Props for the FormField component
	 */
	let {
		fieldName,
		fieldConfig,
		value = $bindable(),
		errors,
		touched,
		getFieldClasses,
		handleBlur,
		handleInput,
		props
	}: {
		/** The name of the field */
		fieldName: string;
		/** Configuration object for the field */
		fieldConfig: {
			type?: string;
			label: string;
			placeholder?: string;
			required?: boolean;
			rows?: number;
			tabindex?: number;
			options?: Array<{ value: string; label: string } | string>;
		};
		/** The current value of the field */
		value: unknown;
		/** Object containing field errors */
		errors: Record<string, string>;
		/** Object tracking which fields have been touched */
		touched: Record<string, boolean>;
		/** Function to get CSS classes for field validation state */
		getFieldClasses: (fieldName: string) => string;
		/** Function called when field loses focus */
		handleBlur: (fieldName: string) => void;
		/** Function called when field value changes */
		handleInput: (fieldName: string) => void;
		/** Additional props to pass to the field */
		props: Record<string, unknown>;
	} = $props();

	// Track focus state for enhanced keyboard navigation
	let hasFocus: boolean = $state(false);

	// Handle focus event
	function handleFocus(): void {
		hasFocus = true;
	}

	// Handle blur with additional focus tracking
	function handleFieldBlur(): void {
		hasFocus = false;
		handleBlur(fieldName);
	}

	const ariaInvalid = $derived(touched[fieldName] && errors?.[fieldName] ? 'true' : 'false');
	const ariaDescribedby = $derived(
		touched[fieldName] && errors?.[fieldName] ? `${fieldName}-error` : undefined
	);
	const textValue = $derived(
		typeof value === 'string' || typeof value === 'number' ? String(value) : ''
	);
	const checkedValue = $derived(value === true);

	// Classes for styling and validation states
	const baseClasses = $derived(getFieldClasses(fieldName));

	const validationClasses = $derived(
		[
			touched[fieldName] && errors?.[fieldName] ? 'contact-form__field--error' : '',
			!errors?.[fieldName] && touched[fieldName] && value ? 'contact-form__field--valid' : ''
		]
			.filter(Boolean)
			.join(' ')
	);

	// Complete classes for different field types
	const selectClasses = $derived(`contact-form__select ${baseClasses} ${validationClasses}`);
	const textareaClasses = $derived(`contact-form__textarea ${baseClasses} ${validationClasses}`);
	const inputClasses = $derived(`contact-form__input ${baseClasses} ${validationClasses}`);
	const focusClass = $derived(hasFocus ? ' contact-form__field--focused' : '');

	function updateValue(nextValue: string | boolean): void {
		value = nextValue;
		handleInput(fieldName);
	}
</script>

<!-- Common wrapper for fields with validation icon -->
{#if fieldConfig.type !== 'checkbox'}
	<div
		class="contact-form__validation-container"
		data-field-name={fieldName}
		data-field-type={fieldConfig.type}
	>
		{#if fieldConfig.type === 'select'}
			<GooSelect
				{...props}
				inputId={fieldName}
				name={fieldName}
				value={textValue}
				options={(fieldConfig.options ?? []).map((option) =>
					typeof option === 'object'
						? { id: option.value, label: option.label }
						: { id: option, label: option }
				)}
				placeholder="Select {fieldConfig.label.replace('(optional)', '')}"
				required={fieldConfig.required}
				aria-invalid={ariaInvalid}
				aria-describedby={ariaDescribedby}
				class={selectClasses}
				onchange={(nextValue) => updateValue(nextValue)}
			/>
		{:else if fieldConfig.type === 'textarea'}
			<GooTextarea
				{...props}
				inputId={fieldName}
				name={fieldName}
				value={textValue}
				class="{textareaClasses}{focusClass}"
				aria-invalid={ariaInvalid}
				aria-describedby={ariaDescribedby}
				onblur={handleFieldBlur}
				oninput={(nextValue) => updateValue(nextValue)}
				onfocus={handleFocus}
				placeholder={fieldConfig.placeholder}
				required={fieldConfig.required}
				rows={fieldConfig.rows || 4}
			/>
		{:else}
			<GooInput
				{...props}
				inputId={fieldName}
				name={fieldName}
				value={textValue}
				class="{inputClasses}{focusClass}"
				aria-invalid={ariaInvalid}
				aria-describedby={ariaDescribedby}
				onblur={handleFieldBlur}
				oninput={(nextValue) => updateValue(nextValue)}
				onfocus={handleFocus}
				placeholder={fieldConfig.placeholder}
				required={fieldConfig.required}
				type={fieldConfig.type}
			/>
		{/if}

		<!-- Validation icon -->
		<span class="contact-form__validation-icon" aria-hidden="true">
			{#if !errors?.[fieldName] && touched[fieldName] && value}
				<CheckCircle size={16} class="contact-form__validation-icon--state-valid" />
			{:else if errors?.[fieldName] && touched[fieldName] && value}
				<AlertCircle size={16} class="contact-form__validation-icon--state-invalid" />
			{/if}
		</span>
	</div>
{:else}
	<!-- Special case for checkbox - no container needed -->
	<GooCheckbox
		{...props}
		checked={checkedValue}
		id={fieldName}
		name={fieldName}
		ariaLabel={fieldConfig.label.replace(/<[^>]*>/g, '').replace('(optional)', '').trim()}
		class="contact-form__checkbox {validationClasses}{focusClass}"
		aria-invalid={ariaInvalid}
		aria-describedby={ariaDescribedby}
		required={fieldConfig.required}
		onblur={handleFieldBlur}
		onfocus={handleFocus}
		onchange={(nextValue) => updateValue(nextValue)}
	/>
{/if}

<style>
	/* Enhanced focus styles for keyboard navigation */
	:global(.contact-form__field--focused) {
		outline: 2px solid var(--color-primary-500) !important;
		outline-offset: 2px !important;
		box-shadow: 0 0 0 3px var(--color-primary-100) !important;
		transition:
			outline 0.2s ease,
			box-shadow 0.2s ease;
	}

	/* High contrast focus style for Windows High Contrast Mode */
	@media (forced-colors: active) {
		:global(.contact-form__field--focused) {
			outline: 3px solid CanvasText !important;
			outline-offset: 2px !important;
		}
	}
</style>
