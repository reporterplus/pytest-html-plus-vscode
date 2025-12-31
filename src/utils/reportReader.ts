/**
 * Report reader utilities for parsing pytest-html-plus JSON reports
 */
import * as fs from 'fs';
import * as vscode from 'vscode';
import { TestResult, TestSummary, ReportData } from '../types';

// Async report reader - non-blocking file operations
export async function readReportAsync(reportPath: string): Promise<ReportData> {
  return new Promise((resolve, reject) => {
    fs.readFile(reportPath, 'utf-8', (err, raw) => {
      if (err) {
        if (err.code === 'ENOENT') {
          reject(new Error('Report file not found'));
        } else {
          reject(new Error(`Failed to read report: ${err.message}`));
        }
        return;
      }

      try {
        const json = JSON.parse(raw);
        const data = parseReport(json);
        resolve(data);
      } catch (parseErr: any) {
        reject(new Error(`Invalid report format: ${parseErr.message}`));
      }
    });
  });
}

// Sync report reader - for initial load
export function readReportSync(reportPath: string): ReportData {
  if (!fs.existsSync(reportPath)) {
    throw new Error('Report file not found');
  }

  const raw = fs.readFileSync(reportPath, 'utf-8');
  const json = JSON.parse(raw);
  return parseReport(json);
}

// Parse the pytest-html-plus report format
// Handles multiple possible schemas for flexibility
function parseReport(json: any): ReportData {
  const tests: TestResult[] = [];
  let summary: TestSummary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    error: 0,
  };

  // Format 1: pytest-html-plus with "results" array
  if (Array.isArray(json.results)) {
    json.results.forEach((t: any) => {
      const test = normalizeTest(t);
      if (test) tests.push(test);
    });
  }
  // Format 2: pytest-json with "tests" array
  else if (Array.isArray(json.tests)) {
    json.tests.forEach((t: any) => {
      const test = normalizeTest(t);
      if (test) tests.push(test);
    });
  }
  // Format 3: pytest-json-report format
  else if (json.collectors || json.tests) {
    const testArray = json.tests || [];
    Object.values(testArray).forEach((t: any) => {
      const test = normalizeTest(t);
      if (test) tests.push(test);
    });
  }

  // Calculate summary - pytest-html-plus uses "filters" for summary
  if (json.filters) {
    const total = json.filters.total ?? tests.length;
    const passed = json.filters.passed ?? 0;
    const skipped = json.filters.skipped ?? 0;
    const untracked = json.filters.untracked ?? 0;
    const failed = json.filters.failed ?? total - passed - skipped - untracked;

    summary = {
      total,
      passed,
      failed: Math.max(0, failed),
      skipped,
      error: json.filters.error ?? 0,
    };
  } else if (json.summary) {
    summary = {
      total: json.summary.total ?? json.summary.num_tests ?? tests.length,
      passed: json.summary.passed ?? json.summary.num_passed ?? 0,
      failed: json.summary.failed ?? json.summary.num_failed ?? 0,
      skipped: json.summary.skipped ?? json.summary.num_skipped ?? 0,
      error: json.summary.error ?? json.summary.num_errors ?? 0,
      duration: json.summary.duration,
    };
  } else {
    summary = {
      total: tests.length,
      passed: tests.filter((t) => t.status === 'passed').length,
      failed: tests.filter((t) => t.status === 'failed' || t.status === 'error')
        .length,
      skipped: tests.filter((t) => t.status === 'skipped').length,
      error: tests.filter((t) => t.status === 'error').length,
    };
  }

  const failedTests = tests.filter(
    (t) => t.status === 'failed' || t.status === 'error'
  );

  // Extract timestamp
  let timestamp = json.created || json.timestamp;
  if (!timestamp && tests.length > 0) {
    const firstTest = tests[0];
    if ((firstTest as any).timestamp) {
      timestamp = (firstTest as any).timestamp;
    }
  }

  return {
    summary,
    tests,
    failedTests,
    timestamp,
  };
}

// Normalize a test object from various formats
function normalizeTest(t: any): TestResult | null {
  if (!t) return null;

  // Determine status
  let status: TestResult['status'] = 'passed';
  const rawStatus = (t.status || t.outcome || t.result || '').toLowerCase();

  if (rawStatus === 'failed' || rawStatus === 'failure') {
    status = 'failed';
  } else if (
    rawStatus === 'passed' ||
    rawStatus === 'pass' ||
    rawStatus === 'success'
  ) {
    status = 'passed';
  } else if (rawStatus === 'skipped' || rawStatus === 'skip') {
    status = 'skipped';
  } else if (rawStatus === 'error') {
    status = 'error';
  } else if (rawStatus === 'xfailed') {
    status = 'xfailed';
  } else if (rawStatus === 'xpassed') {
    status = 'xpassed';
  }

  // Extract error message
  let errorMessage = '';
  let errorSnippet = '';

  if (status === 'failed' || status === 'error') {
    errorMessage = extractErrorMessage(t);
    errorSnippet = truncateError(errorMessage, 150);
  }

  // Get test name - pytest-html-plus uses "test" field
  const nodeid = t.nodeid || t.name || t.test_name || '';
  let name = '';

  if (t.test) {
    name = t.test;
  } else {
    name = extractTestName(nodeid);
  }

  // Get file path and line number
  const file = t.file || t.filename || extractFileFromNodeid(nodeid) || '';
  const line = t.line || t.lineno || t.line_number || 1;

  return {
    nodeid,
    name,
    file,
    line: typeof line === 'number' ? line : parseInt(line, 10) || 1,
    status,
    duration: t.duration,
    errorMessage,
    errorSnippet,
  };
}

// Extract error message from various formats
function extractErrorMessage(t: any): string {
  // pytest-html-plus format: error can be null, string, or object
  if (t.error) {
    if (typeof t.error === 'string') {
      return t.error;
    } else if (typeof t.error === 'object') {
      if (t.error.message) return t.error.message;
      if (t.error.type && t.error.value) {
        return `${t.error.type}: ${t.error.value}`;
      }
      return JSON.stringify(t.error);
    }
  }

  // Check stderr first (usually has error info)
  if (t.stderr && t.stderr.trim()) return t.stderr.trim();

  // Then stdout (might have assertion details)
  if (t.stdout && t.stdout.trim()) return t.stdout.trim();

  // Other formats
  if (t.message) return t.message;
  if (t.longrepr) return t.longrepr;
  if (t.call?.longrepr) return t.call.longrepr;
  if (t.traceback) return t.traceback;
  if (t.call?.crash?.message) return t.call.crash.message;

  // For pytest-html-plus format with extras
  if (t.extras) {
    const logExtra = t.extras.find((e: any) => e.name === 'Log');
    if (logExtra?.content) return logExtra.content;
  }

  return '';
}

/**
 * Truncate error message for display
 */
function truncateError(message: string, maxLength: number): string {
  if (!message) return '';

  let cleaned = message
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Find the most relevant part
  const assertionMatch = cleaned.match(/AssertionError:?\s*.*/i);
  if (assertionMatch) {
    cleaned = assertionMatch[0];
  }

  const errorMatch = cleaned.match(/(\w+Error:?\s*.{0,100})/);
  if (errorMatch && cleaned.length > maxLength) {
    cleaned = errorMatch[0];
  }

  if (cleaned.length > maxLength) {
    return cleaned.substring(0, maxLength - 3) + '...';
  }

  return cleaned;
}

/**
 * Extract test function name from nodeid
 */
function extractTestName(nodeid: string): string {
  if (!nodeid) return 'Unknown test';
  const parts = nodeid.split('::');
  return parts[parts.length - 1] || nodeid;
}

/**
 * Extract file path from nodeid
 */
function extractFileFromNodeid(nodeid: string): string {
  if (!nodeid) return '';
  const parts = nodeid.split('::');
  return parts[0] || '';
}

// Find report file in common locations
export async function findReportFile(
  workspaceFolder: vscode.Uri
): Promise<string | null> {
  const commonPaths = [
    'final_report.json',
    'report.json',
    'test-report.json',
    'pytest-report.json',
    'reports/final_report.json',
    'reports/report.json',
    '.reports/final_report.json',
    'test-results/report.json',
    'build/test-results/report.json',
    'output/report.json',
  ];

  for (const relativePath of commonPaths) {
    const fullPath = vscode.Uri.joinPath(workspaceFolder, relativePath).fsPath;
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  // Search for any JSON file that looks like a pytest report
  try {
    const files = await vscode.workspace.findFiles(
      '**/final_report.json',
      '**/node_modules/**',
      1
    );
    if (files.length > 0) {
      return files[0].fsPath;
    }

    const reportFiles = await vscode.workspace.findFiles(
      '**/*report*.json',
      '**/node_modules/**',
      5
    );

    for (const file of reportFiles) {
      try {
        const content = fs.readFileSync(file.fsPath, 'utf-8');
        const json = JSON.parse(content);
        if (json.results || json.tests || json.summary || json.filters) {
          return file.fsPath;
        }
      } catch {
        continue;
      }
    }
  } catch {
    // Ignore search errors
  }

  return null;
}

// Legacy function for backwards compatibility
export type FailedTest = TestResult;

export function readFailedTests(reportPath: string): FailedTest[] {
  const data = readReportSync(reportPath);
  return data.failedTests;
}
