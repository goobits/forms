<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { GooButton } from '@goobits/goo/button';
	import { GooInput } from '@goobits/goo/input';
	import { GooRadioGroup } from '@goobits/goo/radio';
	import { GooSpinner } from '@goobits/goo/spinner';
	import { GooTextarea } from '@goobits/goo/textarea';
	import { onMount, untrack } from 'svelte';
	import { z } from 'zod';

	type ContactSubmission = Record<string, unknown>;

	// Import shared form service functions
	import {
		createFormSubmitHandler,
		handleFieldInput,
		handleFieldTouch,
		initializeForm,
		initializeFormState,
		type RecaptchaInstance
	} from '../services/formService.js';

	// Import logger utility
	import { createLogger } from '@goobits/logger';

	const logger = createLogger('FeedbackForm');

	// Props - must be declared at top level with $props()
	const {
		feedbackType: _propsType,
		userComment: _propsComment,
		userName: _propsName,
		userEmail: _propsEmail,
		messages: _messages = {},
		isFormVisible: initialFormVisible = false,
		isThankYouVisible: initialThankYouVisible = false,
		submitContactForm = async (data: ContactSubmission) => {
			// Fetch CSRF token from the server
			const csrfResponse = await fetch('/api/csrf', {
				method: 'GET',
				credentials: 'include'
			});
			if (!csrfResponse.ok) {
				throw new Error('Failed to fetch CSRF token');
			}
			const { csrfToken } = await csrfResponse.json();

			// Submit form with CSRF token in header
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': csrfToken
				},
				credentials: 'include',
				body: JSON.stringify(data)
			});
			if (!response.ok) throw new Error('Form submission failed');
			return response.json();
		}
	}: {
		feedbackType?: string;
		userComment?: string;
		userName?: string;
		userEmail?: string;
		messages?: Record<string, string>;
		isFormVisible?: boolean;
		isThankYouVisible?: boolean;
		submitContactForm?: (data: ContactSubmission) => Promise<unknown>;
	} = $props();

	const defaultProps: {
		feedbackType: string;
		userComment: string;
		userName: string;
		userEmail: string;
		messages: Record<string, string>;
	} = {
		feedbackType: '',
		userComment: '',
		userName: '',
		userEmail: '',
		messages: {}
	};

	// Define validation schema using zod
	const feedbackSchema = z.object({
		feedbackType: z.string().min(1, 'Please select whether the page was helpful or not.'),
		userComment: z.string().min(1, 'Please share your thoughts about this page.'),
		userEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
		userName: z.string().optional()
	});

	// Initialize form state using shared service
	const formState = initializeFormState({
		touched: {}
	});

	// UI State
	let currentPagePath: string = $state('');
	let isFormVisible: boolean = $state(untrack(() => initialFormVisible));
	let isThankYouVisible: boolean = $state(untrack(() => initialThankYouVisible));
	let recaptcha: RecaptchaInstance | null = $state(formState.recaptcha);
	let submissionError: Error | null = $state(formState.submissionError);
	let submitting: boolean = $state(false);
	let touched: Record<string, boolean> = $state(formState.touched);
	let thankYouRef: HTMLElement | null = $state(null);
	let csrfToken: string = $state('');

	// Define the submit handler using shared function
	const handleSubmit = async (submittedData: ContactSubmission): Promise<void> => {
		const submitHandler = createFormSubmitHandler({
			validateForm: () => !Object.values($errors).some((v) => v),
			recaptcha,
			prepareFormData: async (formData, recaptchaToken) => {
				const currentPage = $page?.url?.pathname || 'Unknown page';

				return {
					name: formData.userName || 'Page Visitor',
					email: formData.userEmail || 'no-reply@example.com',
					category: 'product-feedback',
					message: formData.userComment,
					recaptchaToken,
					featureArea: 'Page Feedback',
					coppa: true,
					page: currentPage,
					helpful: formData.feedbackType === 'yes' ? 'Yes ✓' : 'No ✗'
				};
			},
			submitForm: async (formDataToSubmit) => {
				submitting = true;
				return await submitContactForm(formDataToSubmit);
			},
			onSuccess: () => {
				resetForm();
				isFormVisible = false;
				isThankYouVisible = true;

				// Focus the thank you message when it appears
				if (browser && thankYouRef) {
					const thankYouElement = thankYouRef;
					setTimeout(() => {
						thankYouElement.focus();
					}, 100);
				}
			},
			onError: (error) => {
				submissionError = error;
			}
		});

		await submitHandler(submittedData);
	};

	// Initialize form with shared service
	const form = initializeForm({
		initialData: defaultProps,
		schema: feedbackSchema,
		onSubmitHandler: handleSubmit,
		extraOptions: {
			onError: ({ result }: { result?: { error?: unknown } }) => {
				// Handle validation errors from server
				if (result?.error) {
					submissionError =
						result.error instanceof Error ? result.error : new Error(String(result.error));
				}
			}
		}
	});

	const { form: formData, errors, enhance, validate } = form;

	// Effect to reset form on page change
	$effect(() => {
		if ($page && $page.url && $page.url.pathname !== currentPagePath) {
			currentPagePath = $page.url.pathname;
			resetForm();
		}
	});

	// Initialize on mount with shared lifecycle setup
	onMount(async () => {
		resetForm();

		if ($page && $page.url) {
			currentPagePath = $page.url.pathname;
		}

		// Fetch CSRF token for progressive enhancement
		if (browser) {
			try {
				const response = await fetch('/api/csrf', {
					method: 'GET',
					credentials: 'include'
				});
				if (response.ok) {
					const data = await response.json();
					csrfToken = data.csrfToken || '';
				}
			} catch (error) {
				logger.error('Failed to fetch CSRF token:', error);
			}
		}

		// ReCAPTCHA setup would go here if needed
	});

	// Private functions

	/**
	 * Show the feedback form
	 */
	function showFeedbackForm(): void {
		isFormVisible = true;
	}

	/**
	 * Reset the form to its initial state
	 */
	function resetForm(): void {
		isFormVisible = false;
		isThankYouVisible = false;

		formData.set(defaultProps);
		submissionError = null;
		touched = {};
		submitting = false;
	}

	/**
	 * Handle field blur event using shared function
	 * @param {string} fieldName
	 */
	function handleBlur(fieldName: string): void {
		touched = handleFieldTouch(touched, fieldName);
	}

	/**
	 * Handle field input event using shared function
	 * @param {string} fieldName
	 */
	function handleInput(fieldName: string): void {
		handleFieldInput(touched, fieldName, validate);
	}
</script>

<div class="feedback">
	{#if isThankYouVisible}
		<div
			class="feedback__thank-you"
			role="status"
			aria-live="polite"
			tabindex="-1"
			bind:this={thankYouRef}
		>
			<strong>Thank you for your feedback!</strong>
			<div class="feedback__actions feedback__actions--thank-you">
				<GooButton class="feedback__btn feedback__btn--secondary" onclick={resetForm}
					>Close</GooButton
				>
			</div>
		</div>
	{:else}
		<div class="feedback__content">
			{#if !isFormVisible}
				<p class="feedback__prompt">
					<i>Was this help page useful?</i>
					<GooButton class="feedback__trigger" variant="link" onclick={showFeedbackForm}>
						<span>Send feedback</span>
					</GooButton>
				</p>
			{:else}
				<form class="feedback__form" method="POST" use:enhance onreset={resetForm} name="feedback">
					<!-- Hidden CSRF token for progressive enhancement -->
					{#if csrfToken}
						<input type="hidden" name="csrf" value={csrfToken} />
					{/if}

					<h3 class="feedback__title">Was this help page useful?</h3>

					{#if submissionError}
						<div class="feedback__error" role="alert">
							<div class="feedback__error-message">{submissionError.message}</div>
						</div>
					{/if}

					<div class="feedback__choices">
						<div class="feedback__field">
							<GooRadioGroup
								class="feedback__radio-group"
								name="feedbackType"
								options={{ yes: 'Yes', no: 'No' }}
								required
								value={String($formData.feedbackType ?? '')}
								onchange={(value) => {
									$formData.feedbackType = value;
									handleInput('feedbackType');
									handleBlur('feedbackType');
								}}
							/>
							{#if $errors.feedbackType && touched.feedbackType}
								<div class="feedback__field-error" data-fs-field-error="feedbackType">
									{$errors.feedbackType}
								</div>
							{/if}
						</div>
					</div>

					<label class="feedback__field">
						<span class="feedback__label">Your Name (Optional)</span>
						<GooInput
							value={String($formData.userName ?? '')}
							class="feedback__input"
							name="userName"
							onblur={() => handleBlur('userName')}
							oninput={(value) => {
								$formData.userName = value;
								handleInput('userName');
							}}
							type="text"
						/>
					</label>

					<label class="feedback__field">
						<span class="feedback__label">Your Thoughts</span>
						<GooTextarea
							value={String($formData.userComment ?? '')}
							class="feedback__textarea {$errors.userComment && touched.userComment
								? 'feedback__textarea--error'
								: ''}"
							data-fs-field-errors={$errors.userComment ? 'userComment' : ''}
							name="userComment"
							onblur={() => handleBlur('userComment')}
							oninput={(value) => {
								$formData.userComment = value;
								handleInput('userComment');
							}}
						/>
						{#if $errors.userComment && touched.userComment}
							<div class="feedback__field-error" data-fs-field-error="userComment">
								{$errors.userComment}
							</div>
						{/if}
					</label>

					<label class="feedback__field">
						<span class="feedback__label">Email (If you'd like a reply)</span>
						<GooInput
							value={String($formData.userEmail ?? '')}
							class="feedback__input"
							data-fs-field-errors={$errors.userEmail ? 'userEmail' : ''}
							name="userEmail"
							onblur={() => handleBlur('userEmail')}
							oninput={(value) => {
								$formData.userEmail = value;
								handleInput('userEmail');
							}}
							type="email"
						/>
						{#if $errors.userEmail && touched.userEmail}
							<div class="feedback__field-error" data-fs-field-error="userEmail">
								{$errors.userEmail}
							</div>
						{/if}
					</label>

					<p class="feedback__note">Your input helps us improve our website for everyone.</p>

					<div class="feedback__actions">
						{#if !submitting}
							<GooButton type="reset" class="feedback__btn feedback__btn--secondary"
								>Cancel</GooButton
							>
						{/if}
						<GooButton
							type="submit"
							class="feedback__btn feedback__btn--primary"
							disabled={submitting}
						>
							{#if submitting}
								<GooSpinner size={18} label="Sending feedback" />
								<span>Sending...</span>
							{:else}
								<span>Send feedback</span>
							{/if}
						</GooButton>
					</div>
				</form>
			{/if}
		</div>
	{/if}
</div>

<style>
	@import './FeedbackForm.css';
</style>
