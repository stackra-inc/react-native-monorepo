---
inclusion: fileMatch
fileMatchPattern: "packages/ui/**/*"
---

# @repo/ui — Component Library Standards

## Source Structure

```
packages/ui/src/
├── components/          # HeroUI components (from source) + custom components
├── helpers/             # External hooks/utils + internal utilities
├── providers/           # HeroUINativeProvider, ThemeProvider, UIProvider
├── primitives/          # Low-level primitives (slot, portal, etc.)
├── styles/              # CSS design tokens (variables.css, theme.css, utilities.css)
├── optional/            # Optional dependency wrappers
├── contexts/            # React contexts (theme.context.ts)
├── services/            # DI services (theme.service.ts)
├── registries/          # DI registries (theme.registry.ts)
├── facades/             # DI facades (theme.facade.ts)
├── hooks/               # Custom hooks (use-app-theme.hook.ts)
├── constants/           # DI tokens (tokens.constant.ts)
├── types/               # TypeScript types
├── ui.module.ts         # DI module definition
└── index.tsx            # Barrel export — single public API
```

## Import Rules

- Apps import ONLY from `@repo/ui` — never from subdirectories.
- Never import from `heroui-native` — it's been removed.
- The barrel `index.tsx` is the single public API.

```tsx
// ✅ Correct
import { Button, Card, useAppTheme, UIProvider } from "@repo/ui";

// ❌ Wrong — never import from heroui-native
import { Button } from "heroui-native";

// ❌ Wrong — never import from subdirectories
import { Button } from "@repo/ui/src/components/button";
```

## Adding New Components

1. Create in `packages/ui/src/components/my-component/`
2. Use `tailwind-variants` (`tv()`) for styling
3. Export from `packages/ui/src/index.tsx`
4. Add JSDoc docblocks following docblocks-and-comments.md

## CSS / Styling

- Components use `className` prop with Tailwind CSS classes
- Theme colors: `bg-accent`, `text-foreground`, `bg-surface`, etc.
- Design tokens defined in `packages/ui/src/styles/variables.css`
- The native app's `global.css` imports styles from
  `@import "../../../../packages/ui/src/styles/index.css"`
- `@source "../../../../packages/ui/src"` in global.css scans all component
  classes

## HeroUI Component Patterns

Components use compound patterns:

```tsx
<Button variant="primary">
  <Button.Label>Click me</Button.Label>
</Button>

<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

## Theme System

- 4 themes: default, lavender, mint, sky (each with light/dark variants)
- Theme switching via `ThemeFacade.setTheme()` or `useAppTheme().setTheme()`
- Themes registered in `apps/native/src/app.module.ts` via
  `UIModule.forFeature()`
- CSS theme variants defined in `apps/native/src/styles/themes/`
