---
inclusion: fileMatch
fileMatchPattern: "**/*.test.ts,**/*.test.tsx,**/jest.config.*"
---

# Testing Standards

## Test Runner

- **Jest** for unit and integration tests
- **jest-expo** preset for React Native compatibility
- **@testing-library/react-native** for component tests

## Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Single package
npx turbo run test --filter=@repo/ui
```

## File Naming

- Test files: `*.test.ts` or `*.test.tsx`
- Co-located with source: `button.test.tsx` next to `button.tsx`
- Or in `__tests__/` directory

## Test Structure

```typescript
describe("ThemeService", () => {
  let service: ThemeService;

  beforeEach(() => {
    service = new ThemeService(mockRegistry);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with light theme by default", async () => {
    await service.initialize();
    expect(service.currentTheme).toBe("light");
  });
});
```

## Mocking DI Services

```typescript
import { clearMetadata } from "@vivtel/metadata";

afterEach(() => {
  clearMetadata(undefined, TestService);
  Facade.clearResolvedInstances();
});
```
