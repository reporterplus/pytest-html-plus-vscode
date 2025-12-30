// src/reportReader.ts
import * as fs from 'fs';

export type FailedTest = {
  nodeid: string;
  file: string;
  line: number;
};

export function readFailedTests(reportPath: string): FailedTest[] {
  if (!fs.existsSync(reportPath)) {
    throw new Error('Report file not found');
  }

  const raw = fs.readFileSync(reportPath, 'utf-8');
  const json = JSON.parse(raw);

  if (!Array.isArray(json.results)) {
    throw new Error('Invalid report schema: results missing');
  }

  return json.results
    .filter((t: any) => t.status === 'failed')
    .map((t: any) => ({
      nodeid: t.nodeid,
      file: t.file,
      line: t.line
    }));
}
