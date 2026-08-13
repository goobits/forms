# Forms 4 Migration

Version 4 returns this package to its original form-workflow boundary. The package is renamed from `@goobits/ui` to `@goobits/forms`; generic UI moves to Goo.

## Package Imports

```diff
- import { ContactForm } from '@goobits/ui/ui'
+ import { ContactForm } from '@goobits/forms/ui'

- import { createContactApiHandler } from '@goobits/ui/handlers'
+ import { createContactApiHandler } from '@goobits/forms/handlers'
```

Replace `@goobits/ui` with `@goobits/forms` for config, validation, services, handlers, i18n, utilities, and retained form components.

## UI Ownership

| Removed Forms export | Replacement |
|---|---|
| `Button` | `GooButton` from `@goobits/goo/button` |
| `Input` | `GooInput` from `@goobits/goo/input` |
| `Textarea` | `GooTextarea` from `@goobits/goo/textarea` |
| `SelectMenu` | `GooSelect` from `@goobits/goo/select` |
| `Checkbox` | `GooCheckbox` from `@goobits/goo/checkbox` |
| `Radio` | `GooRadio` from `@goobits/goo/radio` |
| `Slider` | `GooSlider` from `@goobits/goo/slider` |
| Modal components | Goo Dialog from `@goobits/goo/dialog` |
| Menu components | Goo Select or Context Menu |
| Tooltip components | `@goobits/goo/tooltip` |
| Toast components | App notification composition using Goo primitives |
| Card and Badge | App presentation or an existing Goo surface |

DatePicker, DateRangePicker, ContactForm, CategoryContactForm, FeedbackForm, FormField, FormErrors, FormStatus, ThankYou, and UploadImage remain in Forms because they are form workflows rather than primitive controls.

## Keyboard

The removed `@goobits/keyboard` workspace dependency is now the supported `@goobits/goo/keyboard` facade.

## Security

Continue importing general CSRF and rate-limit primitives from `@goobits/security`. Forms only exposes its contact workflow handler.
