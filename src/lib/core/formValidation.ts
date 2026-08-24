export type FormFieldErrors = Record<string, string>;

export interface FormValidationResult<T> {
	data?: T;
	errors: FormFieldErrors;
	valid: boolean;
}

export type FormValidator<T> = (
	input: unknown
) => FormValidationResult<T> | Promise<FormValidationResult<T>>;

export function validFormData<T>(data: T): FormValidationResult<T> {
	return { data, errors: {}, valid: true };
}

export function invalidFormData(errors: FormFieldErrors): FormValidationResult<never> {
	return { errors, valid: false };
}

export function hasFormErrors(errors: FormFieldErrors): boolean {
	return Object.values(errors).some(Boolean);
}
