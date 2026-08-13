<script>
	import { GooButton } from '@goobits/goo/button'
	import { GooSpinner } from '@goobits/goo/spinner'

	/**
	 * SubmitButton - Contact form submit button with loading state
	 *
	 * @component
	 * Part of ContactForm - extracted for maintainability
	 *
	 * @prop {boolean} submitting - Whether form is currently submitting
	 * @prop {Function} getMessage - Message getter function
	 */

	let { submitting, getMessage } = $props()
</script>

<div class="contact-form__button-container">
	<GooButton type="submit" class="contact-form__submit-button" disabled={submitting} aria-busy={submitting}>
		{#if submitting}
			<GooSpinner size={18} label={getMessage('sending', 'Sending...')} />
			<span>{getMessage('sending', 'Sending...')}</span>
		{:else}
			<span>{getMessage('sendMessage', 'Send Message')}</span>
			<i class="fa fa-paper-plane contact-form__icon"></i>
		{/if}
	</GooButton>
</div>
