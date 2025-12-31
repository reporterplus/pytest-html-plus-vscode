/**
 * Type definitions for extension
 */

export interface TestResult {
  nodeid: string;
  name: string;
  file: string;
  line: number;
  status: 'passed' | 'failed' | 'skipped' | 'error' | 'xfailed' | 'xpassed';
  duration?: number;
  errorMessage?: string;
  errorSnippet?: string;
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  error: number;
  duration?: number;
}

export interface ReportData {
  summary: TestSummary;
  tests: TestResult[];
  failedTests: TestResult[];
  timestamp?: string;
}

export type SidebarState =
  | 'no-config'
  | 'empty'
  | 'all-passed'
  | 'results'
  | 'error'
  | 'loading';

export type TestStatus = 'failed' | 'passed' | 'skipped';
