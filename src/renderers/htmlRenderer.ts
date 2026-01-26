/**
 * HTML rendering for the sidebar webview
 */
import { TestResult, TestSummary, ReportData, TestStatus } from '../types';
import { escapeHtml, formatDuration } from '../utils/formatters';
import { getStyles } from './styles';

export class HtmlRenderer {
  // Wrap content in full HTML document structure
  static wrapHtml(content: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <style>${getStyles()}</style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
  <script>
    const vscode = acquireVsCodeApi();

    function configure() {
      vscode.postMessage({ command: 'configure' });
    }

    function refresh() {
      vscode.postMessage({ command: 'refresh' });
    }

    function jump(index) {
      if (typeof index === 'number' && index >= 0) {
        vscode.postMessage({ command: 'jump', index });
      }
    }

    function copyError(index) {
      vscode.postMessage({ command: 'copyError', index });
    }

    function toggleSection(sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        section.classList.toggle('collapsed');
      }
    }

    function toggleError(index, event) {
      event.stopPropagation();
      const errorEl = document.getElementById('error-' + index);
      const toggleEl = document.getElementById('toggle-' + index);
      if (!errorEl || !toggleEl) return;

      const isExpanded = errorEl.classList.contains('expanded');
      const fullText = toggleEl.getAttribute('data-full') || '';
      const shortText = toggleEl.getAttribute('data-short') || '';

      if (isExpanded) {
        errorEl.classList.remove('expanded');
        errorEl.textContent = shortText + '...';
        toggleEl.querySelector('.toggle-text').textContent = 'Show more';
        toggleEl.querySelector('.toggle-icon').style.transform = 'rotate(0deg)';
      } else {
        errorEl.classList.add('expanded');
        errorEl.textContent = fullText;
        toggleEl.querySelector('.toggle-text').textContent = 'Show less';
        toggleEl.querySelector('.toggle-icon').style.transform = 'rotate(180deg)';
      }
    }
  </script>
</body>
</html>`;
  }

  // Render loading state
  static renderLoading(): string {
    return this.wrapHtml(`
      <div class="center-content">
        <div class="loading-spinner"></div>
        <p class="text-muted">Loading test results...</p>
      </div>
    `);
  }

  // Render no configuration state
  static renderNoConfig(): string {
    return this.wrapHtml(`
      <div class="center-content">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 12h6M9 16h6"/>
          </svg>
        </div>
        <h3 class="empty-title">No Report Configured</h3>
        <p class="text-muted">Configure a pytest-html-plus report to see test results</p>
        <button class="btn btn-primary" onclick="configure()">
          Configure Report Path
        </button>
      </div>
    `);
  }

  // Render empty state
  static renderEmpty(): string {
    return this.wrapHtml(`
      <div class="center-content">
        <div class="empty-icon text-muted">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 12h8"/>
          </svg>
        </div>
        <h3 class="empty-title">No Test Results</h3>
        <p class="text-muted">Run pytest to generate test results</p>
        <button class="btn btn-secondary" onclick="refresh()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Refresh
        </button>
      </div>
    `);
  }

  // Render all passed state
  static renderAllPassed(summary?: TestSummary): string {
    return this.wrapHtml(`
      ${this.renderSummarySection(summary)}
      <div class="center-content" style="padding-top: 32px;">
        <div class="success-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--vscode-testing-iconPassed)" stroke-width="2"/>
            <path d="M8 12l2.5 2.5L16 9" stroke="var(--vscode-testing-iconPassed)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="success-title">All Tests Passed</h3>
        <p class="text-muted">${summary?.total || 0} tests completed successfully</p>
      </div>
    `);
  }

  // Render results with all test sections
  static renderResults(reportData: ReportData): string {
    const { summary, tests, failedTests } = reportData;

    const passedTests = tests.filter((t) => t.status === 'passed');
    const failedTestsOnly = tests.filter((t) => t.status === 'failed');
    const errorTests = tests.filter((t) => t.status === 'error');
    const skippedTests = tests.filter(
      (t) =>
        t.status === 'skipped' ||
        t.status === 'xfailed' ||
        t.status === 'xpassed'
    );

    const errorSection =
      summary.error > 0
        ? this.renderTestSection(
            'Error Tests',
            errorTests,
            tests,
            'error',
            false
          )
        : '';
    const failedSection =
      summary.failed > 0
        ? this.renderTestSection(
            'Failed Tests',
            failedTestsOnly,
            tests,
            'failed',
            false
          )
        : '';
    const passedSection =
      summary.passed > 0
        ? this.renderTestSection(
            'Passed Tests',
            passedTests,
            tests,
            'passed',
            true
          )
        : '';
    const skippedSection =
      summary.skipped > 0
        ? this.renderTestSection(
            'Skipped Tests',
            skippedTests,
            tests,
            'skipped',
            true
          )
        : '';

    return this.wrapHtml(`
      ${this.renderSummarySection(summary)}
      ${failedSection}
      ${errorSection}
      ${passedSection}
      ${skippedSection}
    `);
  }

  // Render error state
  static renderError(message: string): string {
    return this.wrapHtml(`
      <div class="center-content">
        <div class="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--vscode-errorForeground)" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3 class="error-title">Unable to Load Report</h3>
        <p class="text-muted">${escapeHtml(message)}</p>
        <div class="error-actions">
          <button class="btn btn-secondary" onclick="refresh()">
            Try Again
          </button>
          <button class="btn btn-primary" onclick="configure()">
            Configure Path
          </button>
        </div>
      </div>
    `);
  }

  // Render summary section
  static renderSummarySection(summary?: TestSummary): string {
    if (!summary) {
      summary = { total: 0, passed: 0, failed: 0, skipped: 0, error: 0 };
    }

    const passRate =
      summary.total > 0
        ? Math.round((summary.passed / summary.total) * 100)
        : 0;
    const failRate =
      summary.total > 0
        ? Math.round((summary.failed / summary.total) * 100)
        : 0;
    const errorRate =
      summary.total > 0
        ? Math.round((summary.error / summary.total) * 100)
        : 0;
    const skippedRate =
      summary.total > 0
        ? Math.round((summary.skipped / summary.total) * 100)
        : 0;

    return `
      <div class="summary-section">
        <div class="summary-header">
          <span class="summary-label">Test Summary</span>
          <button class="icon-btn" onclick="refresh()" title="Refresh">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        </div>
        <div class="summary-total">
          <span class="total-value">${summary.total}</span>
          <span class="total-label">Total Tests</span>
        </div>
        <div class="summary-stats">
          <div class="stat-item stat-passed">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="stat-value">${summary.passed}</span>
            <span class="stat-label">Passed</span>
          </div>
          <div class="stat-item stat-failed">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="stat-value">${summary.failed}</span>
            <span class="stat-label">Failed</span>
          </div>
          <div class="stat-item stat-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="stat-value">${summary.error}</span>
            <span class="stat-label">Error</span>
          </div>
          <div class="stat-item stat-skipped">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="stat-value">${summary.skipped}</span>
            <span class="stat-label">Skipped</span>
          </div>
        </div>
        ${
          summary.total > 0
            ? `
          <div class="progress-bar">
            <div class="progress-passed" style="width: ${passRate}%"></div>
            <div class="progress-failed" style="width: ${failRate}%"></div>
            <div class="progress-error" style="width: ${errorRate}%"></div>
            <div class="progress-skipped" style="width: ${skippedRate}%"></div>
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  // Render a test section (Failed, Passed, Skipped, Error)
  static renderTestSection(
    title: string,
    sectionTests: TestResult[],
    allTests: TestResult[],
    status: TestStatus,
    collapsedByDefault: boolean
  ): string {
    if (sectionTests.length === 0) return '';

    // Create index map
    const testIndexMap = new Map<string, number>();
    allTests.forEach((test, index) => {
      const key = `${test.nodeid}::${test.file}::${test.line}`;
      testIndexMap.set(key, index);
    });

    // Group tests by file
    const testsByFile = new Map<
      string,
      { tests: TestResult[]; indices: number[] }
    >();

    sectionTests.forEach((test) => {
      const file = test.file || 'Unknown';
      const key = `${test.nodeid}::${test.file}::${test.line}`;
      const originalIndex = testIndexMap.get(key) ?? 0;

      if (!testsByFile.has(file)) {
        testsByFile.set(file, { tests: [], indices: [] });
      }
      testsByFile.get(file)!.tests.push(test);
      testsByFile.get(file)!.indices.push(originalIndex);
    });

    const fileGroups = Array.from(testsByFile.entries())
      .map(([file, data]) =>
        this.renderFileGroup(file, data.tests, data.indices, status)
      )
      .join('');

    const sectionId = `section-${status}`;
    const collapsedClass = collapsedByDefault ? 'collapsed' : '';

    // Get color for section count badge
    let countColor = 'var(--vscode-testing-iconFailed, #f14c4c)';
    if (status === 'passed') {
      countColor = 'var(--vscode-testing-iconPassed, #4ec9b0)';
    } else if (status === 'skipped') {
      countColor = 'var(--vscode-testing-iconSkipped, #cca700)';
    } else if (status === 'error') {
      countColor = 'var(--vscode-testing-iconError, #f59e0b)';
    }

    return `
      <div class="test-section ${collapsedClass}" id="${sectionId}">
        <div class="section-header clickable" onclick="toggleSection('${sectionId}')">
          <div class="section-header-left">
            <svg class="section-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            <span class="section-title">${title}</span>
          </div>
          <span class="section-count" style="background: ${countColor}">${sectionTests.length}</span>
        </div>
        <div class="test-list">
          ${fileGroups}
        </div>
      </div>
    `;
  }

  // Render file group with tests
  static renderFileGroup(
    file: string,
    tests: TestResult[],
    indices: number[],
    status: TestStatus
  ): string {
    const fileName = file.split('/').pop() || file;
    const testItems = tests
      .map((test, i) => this.renderTestItem(test, indices[i], status))
      .join('');

    return `
      <div class="file-group">
        <div class="file-header" onclick="this.parentElement.classList.toggle('collapsed')">
          <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <svg class="file-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span class="file-name" title="${escapeHtml(file)}">${escapeHtml(fileName)}</span>
          <span class="file-count">${tests.length}</span>
        </div>
        <div class="file-tests">
          ${testItems}
        </div>
      </div>
    `;
  }

  // Render individual test item
  static renderTestItem(
    test: TestResult,
    index: number,
    status: TestStatus
  ): string {
    const hasError = Boolean(test.errorSnippet);

    // Get icon and color based on status
    let iconSvg = '';
    let iconColor = '';

    if (status === 'failed') {
      iconColor = 'var(--vscode-testing-iconFailed, #f14c4c)';
      iconSvg = `
        <circle cx="12" cy="12" r="10" stroke="${iconColor}" stroke-width="2"/>
        <path d="M15 9l-6 6M9 9l6 6" stroke="${iconColor}" stroke-width="2" stroke-linecap="round"/>
      `;
    } else if (status === 'error') {
      iconColor = 'var(--vscode-testing-iconError, #f59e0b)';
      iconSvg = `
        <circle cx="12" cy="12" r="10" stroke="${iconColor}" stroke-width="2"/>
        <path d="M12 8v4M12 16h.01" stroke="${iconColor}" stroke-width="2" stroke-linecap="round"/>
      `;
    } else if (status === 'passed') {
      iconColor = 'var(--vscode-testing-iconPassed, #4ec9b0)';
      iconSvg = `
        <circle cx="12" cy="12" r="10" stroke="${iconColor}" stroke-width="2"/>
        <path d="M8 12l2.5 2.5L16 9" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    } else {
      iconColor = 'var(--vscode-testing-iconSkipped, #cca700)';
      iconSvg = `
        <circle cx="12" cy="12" r="10" stroke="${iconColor}" stroke-width="2"/>
        <path d="M8 12h8" stroke="${iconColor}" stroke-width="2" stroke-linecap="round"/>
      `;
    }

    // Check if error message is long enough to need expansion
    const fullError = test.errorMessage || test.errorSnippet || '';
    // Use errorSnippet if available (already truncated), otherwise truncate fullError
    const displayError = test.errorSnippet || fullError;
    const needsExpansion = fullError.length > 200 && fullError !== displayError;

    return `
      <div class="test-item" onclick="jump(${index})" title="Click to jump to test">
        <div class="test-main">
          <svg class="test-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
            ${iconSvg}
          </svg>
          <span class="test-name">${escapeHtml(test.name)}</span>
          ${
            test.duration !== undefined
              ? `<span class="test-duration">${formatDuration(test.duration)}</span>`
              : ''
          }
        </div>
        ${
          hasError
            ? `
          <div class="test-error-container">
            <div class="test-error" id="error-${index}">
              ${escapeHtml(displayError)}${needsExpansion ? '...' : ''}
            </div>
            ${
              needsExpansion
                ? `
              <button class="test-error-toggle" onclick="toggleError(${index}, event)" id="toggle-${index}" data-full="${escapeHtml(fullError)}" data-short="${escapeHtml(displayError)}">
                <span class="toggle-text">Show more</span>
                <svg class="toggle-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            `
                : ''
            }
          </div>
        `
            : ''
        }
      </div>
    `;
  }
}
