# `@goobits/forms`

Accessible form workflows for Svelte 5 and SvelteKit. Goo owns the controls; Forms owns validation, submission state, errors, announcements, contact workflows, uploads, and server adapters.

## Install

```bash
pnpm add @goobits/forms @goobits/goo zod
```

## Contact Form

```ts
// src/hooks.server.ts
import { initContactFormConfig } from '@goobits/forms/config';

initContactFormConfig({
	appName: 'My app',
	categories: {
		general: { label: 'General inquiry', fields: ['name', 'email', 'message'] }
	}
});
```

```ts
// src/routes/api/contact/+server.ts
import { createContactApiHandler } from '@goobits/forms/handlers';

export const POST = createContactApiHandler({
	csrfSecret: process.env.CONTACT_CSRF_SECRET,
	adminEmail: process.env.ADMIN_EMAIL,
	fromEmail: process.env.FROM_EMAIL,
	emailServiceConfig: { provider: 'mock' }
});
```

```svelte
<script>
	import { ContactForm } from '@goobits/forms/ui';
	import '@goobits/forms/ui/index.css';
</script>

<ContactForm apiEndpoint="/api/contact" />
```

## Generic Submission

```ts
import { createFormSubmission, invalidFormData, validFormData } from '@goobits/forms/core';

const newsletter = createFormSubmission({
	validate: (input) =>
		input.email
			? validFormData({ email: input.email.trim() })
			: invalidFormData({ email: 'Email is required' }),
	submit: (data) => newsletterProvider.subscribe(data.email)
});
```

Newsletter providers, authentication, authorization, CRUD, and moderation stay in the consuming app. Forms manages the interaction and submission lifecycle only.

## Public API

| Import                      | Contents                                                   |
| --------------------------- | ---------------------------------------------------------- |
| `@goobits/forms/core`       | Validation results and submission lifecycle                |
| `@goobits/forms/ui`         | Contact forms, field/status/error UI, date fields, uploads |
| `@goobits/forms/sveltekit`  | Generic form action adapter                                |
| `@goobits/forms/handlers`   | Contact API handler                                        |
| `@goobits/forms/config`     | Contact configuration                                      |
| `@goobits/forms/validation` | Zod-backed form schemas and helpers                        |
| `@goobits/forms/services`   | Form, email, reCAPTCHA, hydration, and storage services    |
| `@goobits/forms/i18n`       | Translation hooks                                          |

Generic buttons, inputs, selects, textareas, checkboxes, sliders, dialogs, menus, tooltips, spinners, and focus behavior come from `@goobits/goo`.

## Documentation

- [Getting started](./docs/getting-started.md)
- [Configuration](./docs/configuration.md)
- [TypeScript](./docs/typescript.md)
- [API reference](./docs/api-reference.md)
- [Testing](./docs/testing.md)
- [Migration](./docs/migration.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Accessibility](./docs/accessibility-testing.md)
