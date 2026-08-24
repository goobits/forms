# Documentation

Welcome to the @goobits/forms documentation demo. This page demonstrates the docs-engine features.

## TOC

## Callouts

:::note
This is a note callout. Use it for helpful information.
:::

:::warning
This is a warning callout. Use it for important cautions.
:::

:::tip
This is a tip callout. Use it for best practices.
:::

## Code Highlighting

Here's an example with syntax highlighting:

```typescript
import { ContactForm } from '@goobits/forms/ui';
import { createContactApiHandler } from '@goobits/forms/handlers/contactFormHandler';
import { createEmailService, createMockProvider } from '@goobits/email';

const email = createEmailService({
	provider: createMockProvider(),
	from: process.env.FROM_EMAIL
});

export const POST = createContactApiHandler({
	csrfSecret: process.env.CONTACT_CSRF_SECRET,
	adminEmail: process.env.ADMIN_EMAIL,
	sendEmail: email.send
});
```

## Code Tabs

````tabs:forms-api
tab: JavaScript
```javascript
// JavaScript example
const handler = createContactApiHandler({
	csrfSecret: process.env.CONTACT_CSRF_SECRET,
	adminEmail: 'admin@example.com',
	fromEmail: 'noreply@example.com'
});
```

tab: TypeScript
```typescript
// TypeScript example
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = createContactApiHandler({
	csrfSecret: process.env.CONTACT_CSRF_SECRET,
	adminEmail: 'admin@example.com',
	fromEmail: 'noreply@example.com'
});
```
````

## File Tree

```filetree
src/
├── routes/
│   ├── api/
│   │   └── contact/
│   │       └── +server.js
│   └── contact/
│       └── +page.svelte
├── lib/
│   └── contact-config.js
└── hooks.server.js
```

## Mermaid Diagrams

```mermaid
sequenceDiagram
    User->>ContactForm: Fill & Submit
    ContactForm->>CSRF API: Fetch Token
    ContactForm->>API Handler: POST with token
    API Handler->>Validation: Verify Data
    API Handler->>Email Service: Send Email
    Email Service-->>User: Success Response
```

## Math Rendering

Inline math: $E = mc^2$

Display math:

$$
\frac{d}{dx}\left( \int_{0}^{x} f(u)\,du\right)=f(x)
$$

## Links

Read [Getting started](../../../../docs/getting-started.md) for setup and the first form.

Or explore the [API Reference](../../../../docs/api-reference.md) for complete documentation.
