# Commit Conventions

We strictly adhere to [Conventional Commits](https://www.conventionalcommits.org/). This allows us to auto-generate changelogs and enforce semantic versioning.

## 1. Format
`<type>(<optional scope>): <description>`

## 2. Allowed Types
*   **feat:** A new feature (correlates with MINOR in semantic versioning).
*   **fix:** A bug fix (correlates with PATCH in semantic versioning).
*   **docs:** Documentation only changes.
*   **style:** Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
*   **refactor:** A code change that neither fixes a bug nor adds a feature.
*   **perf:** A code change that improves performance.
*   **test:** Adding missing tests or correcting existing tests.
*   **build:** Changes that affect the build system or external dependencies (e.g., Maven, npm).
*   **ci:** Changes to our CI configuration files and scripts (e.g., GitHub Actions).
*   **chore:** Other changes that don't modify src or test files.

## 3. Examples
*   `feat(auth): add JWT refresh token flow`
*   `fix(order): resolve incorrect total calculation for empty cart`
*   `docs(api): update swagger for product search endpoint`
*   `refactor(payment): extract stripe client logic to dedicated class`

## 4. Breaking Changes
If a commit introduces a breaking API or ABI change, append a `!` after the type/scope, or include `BREAKING CHANGE:` in the footer.
*   *Example:* `feat(api)!: remove v1 endpoints entirely`
