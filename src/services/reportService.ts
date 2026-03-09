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
  let reports = this.getAllReportPaths();

  if (reports.length === 0) {
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (workspace) {
      return await findReportFile(workspace.uri);
    }
    return null;
  }

  // Remove stale paths that no longer exist
  const validReports = reports.filter((p) => fs.existsSync(p));

  if (validReports.length !== reports.length) {
    const config = vscode.workspace.getConfiguration("reporterplus");
    await config.update(
      "reportJsonPaths",
      validReports,
      vscode.ConfigurationTarget.Workspace
    );

    reports = validReports;
  }

  if (reports.length === 0) {
    return null;
  }

    return validReports.includes(this.activeReportPath || '') ? this.activeReportPath! : validReports[0];
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