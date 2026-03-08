/**
 * Service for managing report loading and file watching
 */
import * as fs from 'fs';
import * as vscode from 'vscode';
import { readReportAsync, findReportFile } from '../utils/reportReader';
import { ReportData } from '../types';

export class ReportService {
  private fileWatcher?: fs.FSWatcher;
  private debounceTimer?: NodeJS.Timeout;
  private currentReportPath?: string;
  private activeReportPath?: string;
  private onChangeCallback?: () => void;

  // Get all configured reports
 getAllReportPaths(): string[] {
  const config = vscode.workspace.getConfiguration('reporterplus');
  return config.get<string[]>('reportJsonPaths') || [];
}

  // Set active report
  setActiveReport(path: string) {
    this.activeReportPath = path;
  }

  // Resolve the report path from config or auto-detect
async resolveReportPath(): Promise<string | null> {
  const reports = this.getAllReportPaths();

  if (reports.length > 0) {
    if (!this.activeReportPath || !reports.includes(this.activeReportPath)) {
      this.activeReportPath = reports[0];
    }

    let reportPath = this.activeReportPath;

    if (!reportPath.startsWith('/') && !/^[A-Za-z]:/.test(reportPath)) {
      const workspace = vscode.workspace.workspaceFolders?.[0];
      if (workspace) {
        reportPath = vscode.Uri.joinPath(workspace.uri, reportPath).fsPath;
      }
    }

    return reportPath;
  }

  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (workspace) {
    return await findReportFile(workspace.uri);
  }

  return null;
}

  // Load report from file
  async loadReport(reportPath: string): Promise<ReportData> {
    this.currentReportPath = reportPath;
    return await readReportAsync(reportPath);
  }

  // Set up file watcher for live updates
  setupFileWatcher(reportPath: string, onChange: () => void): void {
    this.stopWatching();
    this.onChangeCallback = onChange;

    try {
      this.fileWatcher = fs.watch(reportPath, (eventType) => {
        if (eventType === 'change') {
          if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
          }

          this.debounceTimer = setTimeout(() => {
            this.onChangeCallback?.();
          }, 300);
        }
      });

      this.fileWatcher.on('error', () => {
        this.stopWatching();
      });
    } catch {
      // File watching not supported
    }
  }

  // Stop watching for file changes
  stopWatching(): void {
    if (this.fileWatcher) {
      this.fileWatcher.close();
      this.fileWatcher = undefined;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }

    this.onChangeCallback = undefined;
  }

  // Get current report path
  getCurrentReportPath(): string | undefined {
    return this.currentReportPath;
  }

  // Dispose resources
  dispose(): void {
    this.stopWatching();
  }
}