# Repository Guidelines

## Project Structure & Module Organization
- `src/`: App entry (`src/app.js`) and modular code under `src/modules/` (`App.js`, `ApiClient.js`, `CardParser.js`, `PriceService.js`, `UIManager.js`).
- `tests/`: Jest test suite (`*.test.js`) and setup (`tests/setup.js`).
- Root: `index.html`, `styles.css`, `package.json`, `babel.config.js`, optional `cors-proxy.js` for local CORS.

## Build, Test, and Development Commands
- `npm test`: Run Jest test suite (jsdom env).
- `npm run test:watch`: Re-run tests on change.
- `npm run test:coverage`: Generate coverage reports (`coverage/`).
- `npm run lint` | `npm run lint:fix`: Lint JS (ESLint) and optionally fix.
- `npm start` (or `npm run serve`): Serve static site at `http://localhost:8000` (requires Python 3).
- `npm run proxy`: Start local CORS proxy at `http://localhost:3001` for development.

## Coding Style & Naming Conventions
- JavaScript, 4-space indentation; single quotes; semicolons; prefer `const`/`let`.
- Classes in PascalCase; methods/variables in camelCase.
- One class per file; filenames in `src/modules/` use PascalCase (e.g., `UIManager.js`).
- Tests use kebab-case: `feature-area-detail.test.js`.
- Use ESLint via `npm run lint`; add/adjust rules in project config if needed.

## Testing Guidelines
- Framework: Jest with `jsdom`; setup in `tests/setup.js`.
- Place tests under `tests/` and name `*.test.js` mirroring module behavior.
- Coverage thresholds (global): branches 65%, functions 80%, lines 80%, statements 80%.
- Examples:
  - Run all: `npm test`
  - Watch: `npm run test:watch`
  - Coverage: `npm run test:coverage`

## Commit & Pull Request Guidelines
- Commit messages: short imperative summaries (observed in history). Prefer Conventional Commits for clarity: `feat:`, `fix:`, `refactor:`, `test:`.
- PRs should include: purpose and scope, linked issues, test coverage notes, and screenshots/GIFs for UI changes.
- Require green CI (tests + lint) before merge.

## Security & Configuration Tips
- Do not commit secrets or API keys.
- The included CORS proxy is for local use only; do not rely on it in production or GitHub Pages.
- Network features depend on external APIs; handle rate limits and CORS gracefully.

