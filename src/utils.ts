import * as fs from 'fs';
import * as path from 'path';

export interface FailedTest {
  name: string;
  file: string;
  error: string;
  duration?: number;
}

export function readFailedTests(reportPath: string): FailedTest[] {
  try {
    const data = fs.readFileSync(reportPath, 'utf-8');
    const report = JSON.parse(data);
    
    // Filter failed tests from the report
    const failedTests: FailedTest[] = [];
    
    if (report.tests) {
      report.tests.forEach((test: any) => {
        if (test.outcome === 'failed') {
          failedTests.push({
            name: test.nodeid,
            file: test.file || 'unknown',
            error: test.call?.longrepr || test.error || 'Unknown error',
            duration: test.duration
          });
        }
      });
    }
    
    return failedTests;
  } catch (error) {
    console.error('Error reading report:', error);
    return [];
  }
}