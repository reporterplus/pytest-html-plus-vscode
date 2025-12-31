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
  private onChangeCallback?: () => void;

  // Resolve the report path from config or auto-detect
  async resolveReportPath(): Promise<string | null> {
    const config = vscode.workspace.getConfiguration('reporterplus');
    let reportPath = config.get<string>('reportJsonPath');

    // If path is configured, use it
    if (reportPath) {
      // Resolve relative paths
      if (!reportPath.startsWith('/') && !/^[A-Za-z]:/.test(reportPath)) {
        const workspace = vscode.workspace.workspaceFolders?.[0];
        if (workspace) {
          reportPath = vscode.Uri.joinPath(workspace.uri, reportPath).fsPath;
        }
      }
      return reportPath;
    }

    // Auto-detect report file
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
          // Debounce rapid changes to prevent multiple updates
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
      // File watching not supported or file doesn't exist
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

  // Dispose resources to free up resources on extension deactivation
  dispose(): void {
    this.stopWatching();
  }
}
