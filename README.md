# Pytest HTML Plus for VS Code

A **VS Code extension for pytest-html-plus** that brings your test results directly into the editor.

Instead of opening HTML reports in the browser, you can **view failures, inspect errors, and jump to test code instantly** from a dedicated VS Code sidebar.

[![Docs](https://img.shields.io/badge/docs-online-blue)](https://pytest-html-plus.readthedocs.io/en/main/extensions/vscode/usage.html)

<img width="1840" height="1728" alt="image" src="https://github.com/user-attachments/assets/6e86c016-cf17-4a77-8822-aa72efd607b6" />

---

# Features

## Test Summary

Quick overview of your test suite:

- Total tests
- Passed
- Failed
- Skipped

Displayed with a **visual progress bar** for fast status checks.

---

## View All Test Results

Tests are organized into collapsible groups:

- Failed
- Passed
- Skipped

This helps you **focus on failures first** while still being able to explore the full run.

---

## Expandable Error Messages

Failure messages include:

- A **2-line preview**
- A **"Show more"** option for full traceback

This keeps the UI clean while still allowing deep debugging.

---

## One-Click Navigation

Click any test to **jump directly to the source code location**.

The extension automatically opens the file and highlights the test line.

---

## Auto-Detection of Reports

The extension automatically discovers report files such as:

```
final_report.json
```

in common project locations.

No configuration required for most projects.

---

## Multiple Report Support

ReporterPlus automatically loads **multiple report files** when present.

This is especially useful for projects that generate:

```
unit_report.json
integration_report.json
e2e_report.json
```

All reports are **merged and displayed in a single unified view**.

---

## Live Updates

Test results update automatically when report files change.

When CI or local runs generate new reports, the sidebar **refreshes instantly**.

---

# Quick Start

## 1 Install pytest-html-plus

```bash
pip install pytest-html-plus
```

or

```bash
poetry add pytest-html-plus
```

---

## 2 Run your tests

```bash
pytest
```

or

```bash
pytest -n auto
```

---

## 3 Open the ReporterPlus sidebar

Click the **test flask icon** in the VS Code Activity Bar.

Your test results will appear automatically.

---

# Configuration

## Automatic Report Detection (Recommended)

By default the extension automatically searches for report files in the workspace.

No configuration is required.

---

## Manual Configuration

If your report is stored in a custom location:

1. Open Command Palette

```
Cmd + Shift + P
```

or

```
Ctrl + Shift + P
```

2 Run:

```
Pytest HTML Plus: Configure Report Path
```

3 Choose one of:

- Browse for report file
- Enter path manually
- Re-enable auto-detect

---

# Settings

| Setting | Description | Default |
|------|------|------|
| `reporterplus.reportJsonPath` | Path to report file(s). Leave empty for auto-detect. | `""` |
| `reporterplus.autoRefresh` | Refresh results when report changes | `true` |
| `reporterplus.showErrorSnippets` | Show short error previews | `true` |
| `reporterplus.maxErrorLength` | Maximum error preview length | `150` |

---

# Commands

| Command | Description |
|------|------|
| `Pytest HTML Plus: Configure Report Path` | Configure report location |
| `Pytest HTML Plus: Refresh Test Results` | Manually refresh sidebar |

---

# Development

## Prerequisites

- Node.js **18+**
- VS Code **1.80+**

---

## Setup

```bash
git clone https://github.com/reporterplus/pytest-html-plus-vscode
cd pytest-html-plus-vscode

npm install
npm run build
```

---

## Run in Debug Mode

1 Open the project in VS Code

2 Press:

```
F5
```

This launches the **Extension Development Host**.

3 Test using the included:

```
sample_report.json
```

---

## Build Extension Package

```bash
npm install -g @vscode/vsce
vsce package
```

This produces a `.vsix` file for installation or distribution.

---

# Design Philosophy

ReporterPlus follows **VS Code’s native design principles**.

## Minimal UI

No clutter or unnecessary panels.

## Native Styling

Uses VS Code theme variables for seamless integration.

## Semantic Colors

| Status | Color |
|------|------|
| Passed | Green |
| Failed | Red |
| Skipped | Yellow |

## Fast Rendering

UI updates typically complete in **under 100ms**, even for large reports.

## Graceful Errors

Invalid reports or missing files fail silently without interrupting workflow.

---

# Troubleshooting

## Extension shows no tests

Check:

- Report file exists
- JSON is valid
- Correct report path configured

You can also try:

```
Pytest HTML Plus: Refresh Test Results
```

---

## Navigation not working

Ensure report paths are either:

- Relative to workspace root

or

- Absolute paths

---

# License

MIT License

See [LICENSE](LICENSE) for details.