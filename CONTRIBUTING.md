# Contributing Guidelines

First off, thank you for considering contributing to the E-Commerce Platform! 

## Development Process
1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests (JUnit/Testcontainers).
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes (`mvn clean test`).
5. Run formatting and linting tools.

## Commit Messages
We follow [Conventional Commits](https://www.conventionalcommits.org/).
* `feat:` A new feature
* `fix:` A bug fix
* `docs:` Documentation only changes
* `style:` Changes that do not affect the meaning of the code
* `refactor:` A code change that neither fixes a bug nor adds a feature
* `test:` Adding missing tests or correcting existing tests
* `chore:` Changes to the build process or auxiliary tools

## Pull Request Process
1. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
2. The PR will be merged once you have the sign-off of at least one core reviewer.
