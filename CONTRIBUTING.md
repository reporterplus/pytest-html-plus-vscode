# Contributing to Pytest HTML Plus for VS Code

Thank you for your interest in contributing! 🎉

This project aims to provide a **clean, fast, and native VS Code experience for viewing pytest-html-plus reports**. Contributions that improve usability, performance, and reliability are always welcome.

---

# Ways to Contribute

You can contribute in several ways:

- Reporting bugs
- Suggesting new features
- Improving documentation
- Fixing issues
- Writing tests
- Improving performance

Before starting major work, please **open an issue first** to discuss the change.

---

# Development Setup

### Prerequisites

- Node.js 18+
- VS Code 1.80+

---

### Clone the repository

```bash
git clone https://github.com/reporterplus/pytest-html-plus-vscode
cd pytest-html-plus-vscode
```

---

### Install dependencies

```bash
npm install
```

---

### Build the extension

```bash
npm run build
```

---

### Run in development mode

1. Open the project in VS Code
2. Press **F5**
3. This launches an **Extension Development Host**

You can now test the extension with `sample_report.json`.

---

# Running Tests

This project uses **Jest** for unit testing.

Run tests with:

```bash
npm test
```

Tests should pass before submitting a pull request.

---

# Code Guidelines

Please follow these conventions:

### TypeScript

- Use strict typing where possible
- Avoid `any` unless necessary
- Keep functions small and readable

---

# Release Branching

To keep development organized, all contributions should be based on the **next release version**.

### Rule

Branch from the **next unreleased version tag**.

Example:

Current released version:

```
v0.2.2
```

Next release branch:

```
v0.2.3
```

Contributors should create feature branches from this version.

Example:

```
v0.2.3 → feature/multiple-report-support
v0.2.3 → fix/report-autodetection
```

---

### If the Next Version Does Not Exist

If the next version branch has not been created yet:

1. Open a GitHub issue requesting the next release branch.

Example:

```
Request to create release branch v0.2.3
```

2. Wait for maintainers to create the branch before starting work.

---

### Why This Rule Exists

This helps ensure:

- Pull requests target the correct upcoming release
- Stable released versions remain unchanged
- Multiple contributors work against the same baseline

### Structure

Keep logic separated by responsibility:

```
src/
  services/
  providers/
  utils/
  extension.ts
```

---

### UI Guidelines

The extension follows **VS Code's native UI philosophy**:

- Minimal UI
- Fast rendering
- Use VS Code theme variables
- Avoid unnecessary popups or notifications

---

# Pull Request Guidelines

When submitting a PR:

1. Create a feature branch
2. Write or update tests if needed
3. Ensure tests pass
4. Keep PRs focused and small
5. Provide a clear description of the change

Example:

```
feat: support multiple report files
fix: handle missing report paths
docs: improve README instructions
```

---

# Reporting Bugs

Please include:

- VS Code version
- Extension version
- Steps to reproduce
- Sample report JSON (if possible)

---

# Feature Requests

When suggesting features, please describe:

- The problem you're solving
- Example workflows
- Expected behavior

---

# Code of Conduct

Please be respectful and constructive in discussions and reviews.

---

Thank you for helping improve **Pytest HTML Plus for VS Code** 🚀