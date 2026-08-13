# Accessibility

Forms owns labels, validation messages, live submission status, error summaries, required state, and contact workflow announcements. Goo owns keyboard containment, focus behavior, and primitive control semantics.

Run `pnpm test:a11y` for retained component checks and `pnpm test:e2e` for browser-level contact-flow checks. Manual review should include keyboard-only submission, screen-reader error recovery, reduced motion, zoom, and high contrast.
