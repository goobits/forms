<h1 align="center">@goobits/forms</h1>

<p align="center"><strong>Accessible form workflows for Svelte 5 and SvelteKit.</strong></p>
<p align="center">Compose validation, submission state, errors, announcements, contact handlers, upload UI, and server adapters while Goo owns the controls.</p>

<p align="center">
  <a href="#why-forms">Why Forms</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#public-surface">Public surface</a> ·
  <a href="#ownership-boundary">Boundaries</a>
</p>

---

## Why Forms

`@goobits/forms` owns a form's interaction and submission lifecycle without
claiming the surrounding product workflow. It provides reusable Svelte UI,
framework-neutral validation results, SvelteKit adapters, contact handling,
upload UI, messages, and accessibility-focused status presentation.

Generic buttons, inputs, selects, textareas, checkboxes, sliders, dialogs,
menus, tooltips, spinners, and focus behavior come from `@goobits/goo`.

## Quick start

Use Node.js 22 and a Svelte 5 application for the maintained source graph.
Forms' own manifest declares Node.js 18 or newer, but its source-only Logger
dependency requires Node.js 22.

This revision is workspace-first, not a verified registry-only install. Check
out Forms, Goo, Logger, and Security in one pnpm workspace and declare them with
`workspace:*`; the host supplies SvelteKit 2 and Svelte 5. Logger explicitly has
no npm-publish flow, so a standalone `pnpm add @goobits/forms` path is not
supported by the maintained source graph.

```ts
import {
  createFormSubmission,
  invalidFormData,
  validFormData,
} from '@goobits/forms/core'

type NewsletterInput = { email?: string }
type NewsletterData = { email: string }

export function createNewsletterSubmission(
  subscribe: (email: string) => Promise<void>,
) {
  return createFormSubmission<NewsletterInput, NewsletterData, void>({
    validate: (input) => {
      const email = input.email?.trim()
      return email
        ? validFormData({ email })
        : invalidFormData({ email: 'Email is required' })
    },
    submit: async ({ email }) => await subscribe(email),
  })
}
```

### Contact workflow

The contact form uses the package's handler and an application-owned CSRF
endpoint. Declare Security as a direct workspace dependency of the application
that owns that route.

The built-in `ContactForm` first requests a token from `GET /api/csrf`; the host
must provide that route with `@goobits/security/csrf/sveltekit`, and its
32-byte-or-longer secret must match the POST handler. Configure that GET route
with `cookieName: 'csrf_token'` and `headerName: 'X-CSRF-Token'` to match the
handler rather than relying on Security's different default cookie name. Return
`json({ csrfToken: await csrf.getOrCreate(event) })`; `ContactForm` reads the
`csrfToken` property. The handler accepts a host-owned `sendEmail` function; a
configured `@goobits/email` service is the repository-recommended transport,
not a runtime requirement. See [Configuration](docs/configuration.md) for the
maintained package options.

## Public surface

| Import | Responsibility |
| --- | --- |
| `@goobits/forms` | Non-UI config, validation, services, handlers, core, and utilities aggregate |
| `@goobits/forms/core` | Validation results and submission lifecycle |
| `@goobits/forms/ui` | Contact, field, status, error, date, and upload UI |
| `@goobits/forms/ui/form-errors`, `@goobits/forms/ui/form-status` | Direct error-summary and form-status components |
| `@goobits/forms/ui/index.css` | Shared component CSS |
| `@goobits/forms/sveltekit` | Generic form-action adapter |
| `@goobits/forms/handlers` | Contact API handler |
| `@goobits/forms/handlers/contactFormHandler` | Direct contact-handler entry point |
| `@goobits/forms/config` | Contact configuration |
| `@goobits/forms/validation` | Zod-backed schemas and helpers |
| `@goobits/forms/services` | Form, reCAPTCHA, hydration, and storage services |
| `@goobits/forms/i18n` | Translation hooks |
| `@goobits/forms/utils` | Focused public utilities |

Import the shared component CSS once.

## Ownership boundary

Newsletter providers, authentication, authorization, CRUD, moderation, and the
meaning of submitted data stay in the consuming application. Email transports
stay outside Forms; the handler accepts the host's configured send function.
Applications own deployment secrets, persistence, and final abuse policy. The
built-in contact handler applies a configurable in-memory rate limiter;
multi-instance or application-wide rate limiting remains host-owned.

Contact configuration is a package-level process singleton. Initialize it once
at application startup; it is not isolated by tenant or request. Applications
that need request-specific configuration should use the framework-neutral core
or own that composition boundary.

`ContactForm` saves non-empty fields other than attachments in browser
`localStorage` and gives them a 24-hour expiry. It clears the submitted category
after a successful response. Applications handling sensitive contact data or
shared browsers must accept that persistence policy or supply a different UI.

Upload components validate and preview local `File` values; the host owns file
transfer and persistence. Contact-handler success means the request passed the
handler's checks and reached its success branch, not that data was persisted or
email was delivered. The default handler logs a failed or thrown `sendEmail`
result and still returns the form success response; applications that require
delivery confirmation must own that policy.

## Documentation

- [Configuration](docs/configuration.md)
- [API reference](docs/api-reference.md)
- [TypeScript](docs/typescript.md)
- [Testing](docs/testing.md)
- [Accessibility](docs/accessibility-testing.md)
- [Migration](docs/migration.md)
- [Troubleshooting](docs/troubleshooting.md)

The 2.x and older changelog entries describe retired package surfaces. The v4
migration guide and current `package.json` exports define the maintained API.

## Development

The repository's workspace file expects sibling checkouts at `../goo`,
`../logger`, `../security`, and `../email`. From that complete source workspace:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:run
```

## License

[MIT](LICENSE) © 2024 HoneyFarmer.com
