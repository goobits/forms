# API Reference

## Core

- `createFormSubmission`: validates, submits, and reports idle/validating/submitting/success/error state.
- `validFormData` and `invalidFormData`: construct typed validation results.
- `hasFormErrors`: checks a field-error record.

## UI

- `ContactForm`, `ContactFormPage`, `CategoryContactForm`, `FeedbackForm`
- `FormField`, `FormLabel`, `FormErrors`, `FormStatus`, `ThankYou`
- `DatePicker`, `DateRangePicker`, `UploadImage`

## SvelteKit

- `createFormAction`: parses `FormData`, validates it, returns a SvelteKit failure for invalid data, and calls the host submit function for valid data.
- `createContactApiHandler`: contact-specific POST handler with the package's security and email workflow.

See package exports in `package.json` for config, validation, service, handler, i18n, and utility entry points.
