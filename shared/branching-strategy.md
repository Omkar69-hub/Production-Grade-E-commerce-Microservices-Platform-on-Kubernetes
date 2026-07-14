# Branching Strategy (Git Flow)

We use a strict implementation of **Git Flow** to manage concurrent development and release cycles.

## 1. Main Branches
- `main`: Represents the currently deployed production code. Commits here must only come from `release/*` or `hotfix/*` branches. Every commit here is tagged with a version number.
- `develop`: The main integration branch for the next release.

## 2. Supporting Branches
- `feature/*`: Branched from `develop`. Used to develop new features. Must be merged back into `develop` via a Pull Request.
  - *Example:* `feature/cart-calculation`
- `bugfix/*`: Branched from `develop`. Used to fix bugs found during standard development/QA.
  - *Example:* `bugfix/order-status-typo`
- `release/*`: Branched from `develop`. Used for QA, staging deployment, and final bug fixes before going to production. Merged into both `main` and `develop`.
  - *Example:* `release/v1.2.0`
- `hotfix/*`: Branched directly from `main`. Used to fix critical production issues immediately. Merged into both `main` and `develop`.
  - *Example:* `hotfix/payment-gateway-timeout`

## 3. Pull Request Requirements
- Must pass all automated CI tests (JUnit, Checkstyle, SonarQube).
- Must have at least 2 approving reviews from senior developers.
- Squash and Merge is preferred for feature branches to keep the `develop` history clean.
