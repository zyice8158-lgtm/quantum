# Project Structure

## Monorepo Layout

```
quantum-h5/
├── apps/                    # Application packages
│   ├── Pod1/               # Main AI assistant app
│   ├── DevUI/              # Component dev environment
│   ├── quantum-electron-screenshot/  # Electron screenshot tool
│   ├── Pod0, Pod9, Pod12/  # Other Pod applications
│   ├── halo, loading/      # Utility apps
│   └── Tester/             # Testing application
│
├── packages/               # Shared libraries
│   ├── QuantumUI/         # Core UI component library (@libs/p-comps)
│   ├── Service/           # API services (@libs/service)
│   ├── theme/             # Theming utilities (@libs/theme)
│   ├── icons/             # Icon library (@quantum/icons)
│   ├── use/               # Vue composables (@quantum/use)
│   ├── mock/              # Mock data (@libs/q-mock)
│   └── Type/              # Shared TypeScript types (public-type)
│
└── pnpm-workspace.yaml    # Workspace configuration
```

## QuantumUI Component Library Structure

```
packages/QuantumUI/
├── volt/                  # Volt design system components
├── ChatBaseComponent/     # Chat UI base components
├── ChatView/              # Chat view implementations
├── AnswerCard/            # AI response card components
├── QuestionCard/          # User question card components
├── Button/, Input/, Select/  # Basic form components
├── Icons/, SvgIcon/       # Icon components
├── hooks/                 # Shared composables
├── utils/                 # Utility functions
└── index.ts               # Main exports
```

## App Structure Pattern (Pod1 example)

```
apps/Pod1/src/
├── views/                 # Page components
├── components/            # App-specific components
├── routers/               # Vue Router configuration
├── services/              # API service calls
├── store/                 # State management
├── hooks/                 # App composables
├── i18n/                  # Translations
├── utils/                 # Utilities
├── style/                 # Global styles
├── types/                 # TypeScript types
├── directives/            # Vue directives
└── main.ts                # App entry point
```

## Workspace Package References
- Use `workspace:*` for internal package dependencies
- Use `catalog:` for shared version management via pnpm catalog
- Package aliases: `@libs/p-comps`, `@libs/service`, `@libs/theme`, `@quantum/icons`, `@quantum/use`

## Path Aliases
- `@/` → `src/` (within each app)
- Import shared packages by their workspace names
