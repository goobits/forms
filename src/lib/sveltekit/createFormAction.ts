import { fail } from '@sveltejs/kit'

import type { FormValidator } from '../core/formValidation.js'

export interface FormActionOptions<Data, Result> {
	validate: FormValidator<Data>
	submit: (data: Data, event: FormActionEvent) => Promise<Result>
	invalidStatus?: number
}

export interface FormActionEvent {
	request: Request
	locals: Record<string, unknown>
	url: URL
}

export function createFormAction<Data, Result>(options: FormActionOptions<Data, Result>) {
	return async (event: FormActionEvent): Promise<Result | ReturnType<typeof fail>> => {
		const formData = await event.request.formData()
		const input = Object.fromEntries(formData)
		const validation = await options.validate(input)
		if (!validation.valid || validation.data === undefined) {
			return fail(options.invalidStatus ?? 400, { errors: validation.errors })
		}

		return await options.submit(validation.data, event)
	}
}
