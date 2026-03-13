# deps-report

TRIGGER when: the user asks to check, audit, or report on dependencies.

## Job

Analyze the project dependencies and produce a structured report covering outdated packages, vulnerabilities, and unused dependencies.

## Steps

### 1. Read package.json
Read `package.json` to get the full list of `dependencies` and `devDependencies`.

### 2. Check for outdated packages
Run:
```bash
npm outdated --json
```
This returns a JSON map of packages with `current`, `wanted`, and `latest` versions. Parse it to classify each outdated package as:
- **Patch** — `current` and `latest` differ only in patch (safe to update)
- **Minor** — minor version differs (usually safe)
- **Major** — major version differs (breaking changes possible)

### 3. Check for vulnerabilities
Run:
```bash
npm audit --json
```
Parse the output and classify findings by severity: `critical`, `high`, `moderate`, `low`.

### 4. Check for unused dependencies
Use Grep to search for import usage of each dependency across the source:
```
pattern: from ['"](package-name)
path: src/
```
Flag any package listed in `dependencies` or `devDependencies` that has zero matches in `src/`.
Exclude from this check: PostCSS plugins, ESLint configs, Tailwind, and type packages (`@types/*`) as they are used implicitly by config files or the compiler.

### 5. Produce the report
Output a structured markdown report with these sections:

#### Vulnerabilities
Table with columns: Package | Severity | Description | Fix

#### Outdated packages
Two tables — `dependencies` and `devDependencies` — with columns: Package | Current | Wanted | Latest | Change (Patch/Minor/Major)

#### Unused dependencies (candidates for removal)
List of packages with no detected imports in `src/`. Note that this is a heuristic — confirm before removing.

#### Summary
Single line counts: e.g. `2 critical · 1 high · 4 outdated (1 major) · 1 unused`

## Rules

- Never run `npm update` or `npm install` automatically — only report, let the user decide
- If `npm audit --json` or `npm outdated --json` returns a non-zero exit code, still parse the output (npm uses non-zero exit for found issues, not errors)
- Mark the report with the date it was generated
