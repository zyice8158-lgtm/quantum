# Tech Stack

## Core Technologies
- **Vue 3** (3.5.x) with Composition API
- **TypeScript** (5.x)
- **Vite** (7.x) as build tool
- **pnpm** (9.x+) with workspace monorepo

## UI Frameworks & Styling
- **PrimeVue** - Primary UI component library
- **Tailwind CSS** (4.x) - Utility-first CSS
- **Less** - CSS preprocessor for component styles
- **Element Plus** - Additional UI components (Pod1)

## Key Libraries
- **Vue Router** (4.x) - Routing
- **vue-i18n** - Internationalization
- **axios** - HTTP client
- **lodash-es** - Utilities
- **marked / markdown-it** - Markdown rendering
- **lottie-web** - Animations
- **@vueuse/core** - Vue composition utilities
- **dayjs** - Date handling
- **uuid** - ID generation

## Development Tools
- **ESLint** with TypeScript and Vue plugins
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **commitlint** - Commit message linting

## Common Commands

```bash
# Install dependencies
pnpm i

# Development
pnpm dev:pod1      # Start Pod1 dev server
pnpm dev:ui        # Start DevUI dev server
pnpm dev:halo      # Start Halo dev server
pnpm dev:icon      # Start icons preview

# Build
pnpm build:pod1    # Build Pod1
pnpm build:ui      # Build DevUI
pnpm build         # Full build (runs build.sh)

# Preview
pnpm preview:pod1  # Preview Pod1 build

# Type checking
pnpm typescript    # Run typecheck across all packages
```

## Environment Requirements
- Node.js v22.12.0
- pnpm v10.x
