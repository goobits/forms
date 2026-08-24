# Troubleshooting

- Missing controls: install `@goobits/goo`; Forms no longer publishes primitive UI.
- Invalid contact submissions: confirm server config and category schemas are initialized before the handler runs.
- CSRF errors: provide a stable secret of at least 32 random bytes and use the documented cookie/form-field contract.
- Email failures: verify the selected provider's host-owned credentials and sender addresses.
- Missing styles: import `@goobits/forms/ui/index.css`; Goo controls load their own component CSS.
