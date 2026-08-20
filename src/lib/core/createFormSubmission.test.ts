import { describe, expect, it, vi } from 'vitest';

import { createFormSubmission } from './createFormSubmission.js';
import { invalidFormData, validFormData } from './formValidation.js';

describe('createFormSubmission', () => {
	it('validates and submits normalized data', async () => {
		const submit = vi.fn(async (data: { email: string }) => ({ id: 'subscriber', ...data }));
		const states: string[] = [];
		const submission = createFormSubmission({
			validate: (input) =>
				validFormData({ email: String((input as { email: unknown }).email).trim() }),
			submit,
			successMessage: 'Subscribed',
			onStateChange: (state) => states.push(state.status)
		});

		await expect(submission.submit({ email: ' me@example.com ' })).resolves.toMatchObject({
			status: 'success',
			message: 'Subscribed',
			result: { id: 'subscriber', email: 'me@example.com' }
		});
		expect(states).toEqual(['validating', 'submitting', 'success']);
	});

	it('does not submit invalid data', async () => {
		const submit = vi.fn();
		const submission = createFormSubmission({
			validate: () => invalidFormData({ email: 'Email is required' }),
			submit
		});

		await expect(submission.submit({})).resolves.toMatchObject({
			status: 'error',
			errors: { email: 'Email is required' }
		});
		expect(submit).not.toHaveBeenCalled();
	});

	it('turns thrown failures into error state and resets', async () => {
		const submission = createFormSubmission({
			validate: (input) => validFormData(input),
			submit: () => Promise.reject(new Error('Provider unavailable'))
		});

		await expect(submission.submit('value')).resolves.toMatchObject({
			status: 'error',
			message: 'Provider unavailable'
		});
		submission.reset();
		expect(submission.getState()).toEqual({ status: 'idle', errors: {}, message: '' });
	});
});
