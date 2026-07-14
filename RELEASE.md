# Release Workflow

We use Semantic Versioning (`MAJOR.MINOR.PATCH`).

## Cutting a Release
1. Update `CHANGELOG.md` with the new version number and date.
2. Update versions in Helm charts (`Chart.yaml` `appVersion`).
3. Commit the changes: `git commit -m "chore: release v1.0.0"`
4. Tag the commit: `git tag -a v1.0.0 -m "Release v1.0.0"`
5. Push the tag: `git push origin v1.0.0`
6. GitHub Actions will automatically build the final images and create a GitHub Release.
