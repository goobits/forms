<script lang="ts">
	import type { FormSubmissionStatus } from '../core/createFormSubmission.js'

	interface Props {
		status?: FormSubmissionStatus
		message?: string
		class?: string
	}

	let {
		status = 'idle',
		message = '',
		class: className = ''
	}: Props = $props()

	const live = $derived(status === 'error' ? 'assertive' : 'polite')
</script>

{#if status !== 'idle' && message}
	<p
		class={['forms-status', `forms-status--${ status }`, className].filter(Boolean).join(' ')}
		role={status === 'error' ? 'alert' : 'status'}
		aria-live={live}
	>
		{message}
	</p>
{/if}
