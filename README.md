# Pytest HTML Plus for VS Code

A VS Code extension that integrates with pytest-html-plus to surface test results directly inside VS Code. Get instant visibility into your test health with a clean, intuitive sidebar experience.

<img width="1840" height="1728" alt="image" src="https://github.com/user-attachments/assets/6e86c016-cf17-4a77-8822-aa72efd607b6" />


## Features

- **Test Summary** - Total, passed, failed, and skipped counts with visual progress bar
- **All Test Types** - View failed, passed, and skipped tests (collapsible sections)
- **Expandable Errors** - 2-line preview with "Show more" for full error messages
- **One-Click Navigation** - Jump directly to test source code
- **Live Updates** - Auto-refreshes when report files change
- **Auto-Detection** - Finds report files automatically

## Quick Start

1. Run pytest with pytest-html-plus:
   ```bash
   pytest --json-report --json-report-file=final_report.json
   ```

2. Open the sidebar by clicking the test flask icon in the Activity Bar

3. Click any test to jump to its source code

## Configuration

### Auto-Detection
The extension automatically searches for `final_report.json` in common locations. No configuration needed!

### Manual Configuration
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Run "Pytest HTML Plus: Configure Report Path"
3. Choose: Browse, Enter path, or Auto-detect

### Settings
- `reporterplus.reportJsonPath` - Path to report file (empty for auto-detect)
- `reporterplus.autoRefresh` - Auto-refresh on file changes (default: `true`)
- `reporterplus.showErrorSnippets` - Show error messages (default: `true`)
- `reporterplus.maxErrorLength` - Max characters for error snippets (default: `150`)

## Supported Report Format

The extension supports pytest-html-plus JSON format:

```json
{
  "filters": {
    "total": 45,
    "passed": 42,
    "failed": 3,
    "skipped": 0
  },
  "results": [
    {
      "test": "test_name",
      "nodeid": "tests/test_file.py::test_name",
      "status": "failed",
      "file": "tests/test_file.py",
      "line": 15,
      "error": "AssertionError: ..."
    }
  ]
}
```

## Commands

- `Pytest HTML Plus: Configure Report Path` - Set report file location
- `Pytest HTML Plus: Refresh Test Results` - Manually refresh sidebar

## Development

### Prerequisites
- Node.js 18+
- VS Code 1.80+

### Setup
```bash
git clone https://github.com/reporterplus/pytest-html-plus-vscode
cd pytest-html-plus-vscode
npm install

# Build
npm run build
```

### Run in Debug Mode
1. Open project in VS Code
2. Press `F5` to launch Extension Development Host
3. Test with the included `sample_report.json`

### Build for Distribution
```bash
npm install -g @vscode/vsce
vsce package
```

## Design Philosophy

This extension follows VS Code's native design language:
- **Minimal footprint** - No unnecessary UI elements
- **Native components** - Uses VS Code CSS variables
- **Semantic colors** - Green for passed, red for failed, yellow for skipped
- **Fast rendering** - Optimized for <100ms updates
- **Silent failures** - Graceful error handling without noisy popups

## Troubleshooting

**Extension not showing results?**
- Verify report file exists and is valid JSON
- Check report path in settings
- Try "Auto-detect" command

**Navigation not working?**
- Ensure file paths in report are relative to workspace root
- Or use absolute paths

## License

MIT License - see [LICENSE](LICENSE) for details.
