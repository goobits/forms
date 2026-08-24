import { dev } from '$app/environment';
import { createEmailService, createMockProvider } from '@goobits/email';
import { createContactApiHandler } from '@goobits/forms/handlers/contactFormHandler';

const csrfSecret =
	process.env.FORMS_DEMO_CSRF_SECRET ??
	(dev ? 'forms-demo-contact-csrf-local-development-only' : undefined);
if (!csrfSecret) {
	throw new Error('FORMS_DEMO_CSRF_SECRET is required outside development');
}

const email = createEmailService({
	provider: createMockProvider(),
	from: 'noreply@demo.com'
});

export const POST = createContactApiHandler({
	csrfSecret,
	adminEmail: 'demo@example.com',
	sendEmail: email.send,
	rateLimitMaxRequests: 10,
	rateLimitWindowMs: 60000
});
