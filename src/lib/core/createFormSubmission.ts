import type { FormFieldErrors, FormValidationResult } from './formValidation.js';

export type FormSubmissionStatus = 'idle' | 'validating' | 'submitting' | 'success' | 'error';

export interface FormSubmissionState<Result = unknown> {
	status: FormSubmissionStatus;
	errors: FormFieldErrors;
	message: string;
	result?: Result;
}

export interface FormSubmissionOptions<Input, Data, Result> {
	validate: (input: Input) => FormValidationResult<Data> | Promise<FormValidationResult<Data>>;
	submit: (data: Data) => Promise<Result>;
	onStateChange?: (state: FormSubmissionState<Result>) => void;
	successMessage?: string;
	errorMessage?: string;
}

export interface FormSubmission<Input, Result> {
	getState(): FormSubmissionState<Result>;
	reset(): void;
	submit(input: Input): Promise<FormSubmissionState<Result>>;
}

export function createFormSubmission<Input, Data, Result>(
	options: FormSubmissionOptions<Input, Data, Result>
): FormSubmission<Input, Result> {
	let state: FormSubmissionState<Result> = { status: 'idle', errors: {}, message: '' };

	const update = (nextState: FormSubmissionState<Result>): FormSubmissionState<Result> => {
		state = nextState;
		options.onStateChange?.(state);
		return state;
	};

	return {
		getState: () => state,
		reset: (): void => {
			update({ status: 'idle', errors: {}, message: '' });
		},
		submit: async (input): Promise<FormSubmissionState<Result>> => {
			update({ status: 'validating', errors: {}, message: '' });
			const validation = await options.validate(input);
			if (!validation.valid || validation.data === undefined) {
				return update({
					status: 'error',
					errors: validation.errors,
					message: options.errorMessage ?? ''
				});
			}

			update({ status: 'submitting', errors: {}, message: '' });
			try {
				const result = await options.submit(validation.data);
				return update({
					status: 'success',
					errors: {},
					message: options.successMessage ?? '',
					result
				});
			} catch (error) {
				const message =
					error instanceof Error ? error.message : (options.errorMessage ?? 'Submission failed');
				return update({ status: 'error', errors: {}, message });
			}
		}
	};
}
