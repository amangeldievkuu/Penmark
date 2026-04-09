# Admin CMS

## Scope

- Admin users can sign in, manage profile content, manage blog posts, and manage changelog entries.
- Editing flows include rich text, image upload, tagging, draft/publish state, and basic feedback toasts.
- The new-post form includes an optional client-side Kyrgyz typing toggle that transliterates Latin input into Kyrgyz Cyrillic for the title, tags, excerpt, and editor body as the admin types.

## Expectations

- All privileged reads and writes must pass through `src/server/functions`.
- Admin authorization is enforced server-side, not only in client route guards.
- Any new admin capability should document its success path, failure path, and authorization requirement here or in a linked plan.
