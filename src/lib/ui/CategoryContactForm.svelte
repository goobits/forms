<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { GooButton } from '@goobits/goo/button';
	import { GooCheckbox } from '@goobits/goo/checkbox';
	import { GooInput } from '@goobits/goo/input';
	import { GooSelect } from '@goobits/goo/select';
	import { GooTextarea } from '@goobits/goo/textarea';
	import { getValidationClasses } from '../validation/index.js';
	import FormErrors from './FormErrors.svelte';

	interface Props {
		/**
		 * CSRF token for form security (generated server-side)
		 */
		csrfToken: string;
		/**
		 * Configuration object containing categories, field configurations, and UI settings
		 */
		config?: {
			categories?: Record<string, { fields: string[] }>;
			fieldConfigs?: Record<
				string,
				{
					type?: string;
					label: string;
					placeholder?: string;
					required?: boolean;
					rows?: number;
					maxlength?: number;
					min?: string | number;
					max?: string | number;
					pattern?: string;
					accept?: string;
					multiple?: boolean;
					options?: Array<{ value: string; label: string }>;
				}
			>;
			ui?: {
				submitButtonText?: string;
				submittingButtonText?: string;
			};
		};
		/**
		 * The category slug to determine which fields to display
		 */
		categorySlug?: string;
		/**
		 * Form state object containing data, errors, and submission status
		 */
		form?: {
			data: Record<string, unknown>;
			errors: Record<string, string | string[]>;
			isSubmitted: boolean;
		};
		/**
		 * Localization messages for form labels and validation
		 */
		messages?: Record<string, string>;
		/**
		 * Whether to show the required fields label
		 */
		showRequiredLabel?: boolean;
		/**
		 * Custom text for the submit button
		 */
		submitButtonText?: string | undefined;
		/**
		 * Custom text for the submit button when submitting
		 */
		submittingButtonText?: string | undefined;
		/**
		 * Whether to reset form after successful submission
		 */
		resetAfterSubmit?: boolean;
		/**
		 * Whether to hide field labels
		 */
		hideLabels?: boolean;
	}

	let {
		csrfToken,
		config = {},
		categorySlug = 'general',
		form = { data: {}, errors: {}, isSubmitted: false },
		messages = {},
		showRequiredLabel = true,
		submitButtonText = undefined,
		submittingButtonText = undefined,
		resetAfterSubmit: _resetAfterSubmit = true,
		hideLabels = false
	}: Props = $props();

	// Extract form configuration
	const categories = $derived(config.categories ?? {});
	const fieldConfigs = $derived(config.fieldConfigs ?? {});
	const ui = $derived(config.ui ?? {});

	// Get the selected category configuration or fallback to default
	const categoryConfig = $derived(
		categories[categorySlug] ?? categories.general ?? { fields: ['name', 'email', 'message'] }
	);

	// Use configuration or props for button text
	const resolvedSubmitButtonText = $derived(
		submitButtonText || ui.submitButtonText || 'Send Message'
	);
	const resolvedSubmittingButtonText = $derived(
		submittingButtonText || ui.submittingButtonText || 'Sending...'
	);

	// Track form submission state
	let isSubmitting: boolean = $state(false);

	// Track form field touched state
	let touchedFields: Record<string, boolean> = $state({});
	function markAsTouched(fieldName: string): void {
		touchedFields[fieldName] = true;
	}

	// Form submission handler
	const dispatch = createEventDispatcher();

	function handleSubmit(event: SubmitEvent): void {
		// Mark all fields as touched on submit
		if (categoryConfig.fields) {
			categoryConfig.fields.forEach((field) => {
				touchedFields[field] = true;
			});
		}

		// Set submitting state
		isSubmitting = true;

		// Dispatch event
		dispatch('submit', {
			form: event.target,
			categorySlug
		});

		// Don't prevent default to allow normal form submission
	}

	function getMessage(key: string, defaultMsg: string): string {
		return messages[key] || defaultMsg;
	}
</script>

<div class="contact-form-container">
	{#if Object.keys(form.errors).length > 0 && form.errors._form}
		<FormErrors
			errors={{
				_errors: Array.isArray(form.errors._form) ? form.errors._form : [form.errors._form]
			}}
		/>
	{/if}

	<form method="post" class="contact-form" onsubmit={handleSubmit} enctype="multipart/form-data">
		<!-- Add CSRF token -->
		<input type="hidden" name="csrf" value={csrfToken} />
		<input type="hidden" name="category" value={categorySlug} />

		{#if showRequiredLabel}
			<div class="required-fields-notice">
				{getMessage('requiredFieldsLabel', 'Required fields are marked with *')}
			</div>
		{/if}

		{#each categoryConfig.fields as fieldName (fieldName)}
			{#if fieldConfigs[fieldName]}
				{@const fieldConfig = fieldConfigs[fieldName]}
				{@const isRequired = fieldConfig.required || false}
				{@const fieldValue = form.data[fieldName] || ''}
				{@const fieldText = typeof fieldValue === 'string' || typeof fieldValue === 'number' ? String(fieldValue) : ''}
				{@const rawFieldError = form.errors[fieldName] || ''}
				{@const fieldError = Array.isArray(rawFieldError) ? rawFieldError[0] || '' : rawFieldError}
				{@const isTouched = touchedFields[fieldName] || false}
				{@const validationClass = getValidationClasses(!!fieldError, isTouched, fieldValue)}

				<div class="form-field {fieldConfig.type === 'checkbox' ? 'checkbox-field' : ''}">
					{#if fieldConfig.type === 'checkbox'}
						<GooCheckbox
							checked={fieldValue === true || fieldValue === 'on' || fieldValue === '1'}
							id={fieldName}
								name={fieldName}
								ariaLabel={getMessage(`field_${fieldName}`, fieldConfig.label)}
								required={isRequired}
								class={validationClass}
								onblur={() => markAsTouched(fieldName)}
								onchange={() => markAsTouched(fieldName)}
							>
							<span class="label-text">
								{getMessage(`field_${fieldName}`, fieldConfig.label)}
								{#if isRequired}<span class="required-indicator">*</span>{/if}
							</span>
						</GooCheckbox>
					{:else}
						{#if !hideLabels}
							<label for={fieldName}>
								{getMessage(`field_${fieldName}`, fieldConfig.label)}
								{#if isRequired}<span class="required-indicator">*</span>{/if}
							</label>
						{/if}

						{#if fieldConfig.type === 'textarea'}
							<GooTextarea
								inputId={fieldName}
								name={fieldName}
								placeholder={fieldConfig.placeholder || ''}
								rows={fieldConfig.rows || 5}
								required={isRequired}
								maxLength={fieldConfig.maxlength}
								class={validationClass}
								value={fieldText}
								onblur={() => markAsTouched(fieldName)}
							/>
						{:else if fieldConfig.type === 'select'}
							<GooSelect
								inputId={fieldName}
								name={fieldName}
								required={isRequired}
								class={validationClass}
								value={fieldText}
								options={(fieldConfig.options ?? []).map((option) => ({
									id: option.value,
									label: option.label
								}))}
								placeholder={fieldConfig.placeholder || getMessage('selectOption', 'Select an option')}
								onchange={() => markAsTouched(fieldName)}
							/>
						{:else if fieldConfig.type === 'file'}
							<input
								type="file"
								id={fieldName}
								name={fieldName}
								accept={fieldConfig.accept || ''}
								multiple={fieldConfig.multiple || false}
								required={isRequired}
								class={validationClass}
								onblur={() => markAsTouched(fieldName)}
							/>
						{:else}
							<GooInput
								type={fieldConfig.type || 'text'}
								inputId={fieldName}
								name={fieldName}
								placeholder={fieldConfig.placeholder || ''}
								value={fieldText}
								required={isRequired}
								maxLength={fieldConfig.maxlength}
								min={fieldConfig.min}
								max={fieldConfig.max}
								pattern={fieldConfig.pattern}
								class={validationClass}
								onblur={() => markAsTouched(fieldName)}
							/>
						{/if}
					{/if}

					{#if fieldError && isTouched}
						<div class="field-error">{fieldError}</div>
					{/if}
				</div>
			{/if}
		{/each}

		<div class="form-actions">
			<GooButton type="submit" class="submit-button" disabled={isSubmitting}>
				{isSubmitting ? resolvedSubmittingButtonText : resolvedSubmitButtonText}
			</GooButton>
		</div>
	</form>
</div>

<style>
	.contact-form-container {
		width: 100%;
		max-width: 100%;
	}

	.contact-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		width: 100%;
	}

	.required-fields-notice {
		font-size: 0.875rem;
		margin-bottom: 1rem;
		color: var(--color-text-secondary);
	}

	.form-field {
		display: flex;
		flex-direction: column;
	}

	.form-field label {
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.form-field input {
		padding: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 1rem;
		width: 100%;
	}

	.form-field input:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
	}

	.form-field input.is-invalid {
		border-color: var(--color-error-500);
		background-color: rgba(220, 53, 69, 0.05);
	}

	.form-field input.is-valid {
		border-color: var(--color-success-500);
		background-color: rgba(40, 167, 69, 0.05);
	}

	.checkbox-field {
		flex-direction: row;
		align-items: flex-start;
	}

	.field-error {
		color: var(--color-error-500);
		font-size: 0.875rem;
		margin-top: 0.25rem;
	}

	.required-indicator {
		color: var(--color-error-500);
		margin-left: 0.25rem;
	}

	.form-actions {
		margin-top: 1rem;
	}

	.submit-button {
		padding: 0.75rem 1.5rem;
		background-color: var(--color-primary-500);
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.submit-button:hover {
		background-color: var(--color-primary-600);
	}

	.submit-button:disabled {
		background-color: var(--color-text-disabled);
		cursor: not-allowed;
	}
</style>
