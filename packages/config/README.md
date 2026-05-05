# @lentil/config

Shared ESLint and TypeScript configurations for the Lentil monorepo.

## Exports

### ESLint

| Export | Description |
|--------|-------------|
| `./eslint-config/base` | Base ESLint config for general projects |
| `./eslint-config/react-internal` | ESLint config for React component libraries |

### TypeScript

| Export | Description |
|--------|-------------|
| `./typescript-config/base` | Base TypeScript config |
| `./typescript-config/react-library` | TypeScript config for React libraries |

## Usage

### ESLint

```javascript
// eslint.config.mjs (for base config)
import { config as baseConfig } from '@lentil/config/eslint-config/base'

export default [...baseConfig]
```

```javascript
// eslint.config.mjs (for react-internal)
import { config as reactInternalConfig } from '@lentil/config/eslint-config/react-internal'

export default [...reactInternalConfig]
```

### TypeScript

```json
// tsconfig.json
{
  "extends": "@lentil/config/typescript-config/base"
}
```

## Notes

- React internal config extends base config with React-specific rules
- Prettier integration is included in both ESLint configs
- Turbo ESLint plugin is configured for monorepo awareness