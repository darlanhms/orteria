---
description: Coding patterns
version: 1.0.0
---

# Shadcn instructions

Use the latest version of Shadcn to install new components, like this command to add a button component:

```bash
pnpm dlx shadcn@latest add button
```

Try to be as consistent as possible between one screen and another and not create a lot of variants of the same component

If a component is not found at shadcn, use https://coss.com/origin to find a more suitable component.

## Commit Conventions

- `chore:` Maintenance (16 commits)
- `feat:` New features (9 commits)
- `refactor:` Refactors (2 commits)
- `docs:` Documentation (1 commits)
- `fix:` Bug fixes (1 commits)

## Testing Patterns

- Test directories: `__tests__/`, `test/`, `tests/`
- Test files: suffixes `.test.ts[x]` / `.spec.ts[x]`

## About language
- All user readable text should be written in Brazilian Portuguese
