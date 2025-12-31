/**
 * Sidebar provider for displaying pytest test results
 */
import * as vscode from 'vscode';
import { ReportData, SidebarState } from '../types';
import { HtmlRenderer } from '../renderers/htmlRenderer';
import { ReportService } from '../services/reportService';

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'reporterplus.sidebar';

  private view?: vscode.WebviewView;
  private reportData?: ReportData;
  private reportService: ReportService;
  private isLoading = false;

  private _onDidRefresh = new vscode.EventEmitter<void>();
  public readonly onDidRefresh = this._onDidRefresh.event;

  constructor(private readonly extensionUri: vscode.Uri) {
    this.reportService = new ReportService();
  }

  resolveWebviewView(
    view: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.view = view;

    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    // Handle messages from webview
    view.webview.onDidReceiveMessage(this.handleMessage.bind(this));

    // Initial load
    this.loadReport();

    // Watch for configuration changes
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('reporterplus.reportJsonPath')) {
        this.loadReport();
      }
    });

    // Clean up when view is disposed
    view.onDidDispose(() => {
      this.reportService.stopWatching();
    });
  }

  private async handleMessage(msg: any) {
    switch (msg.command) {
      case 'configure':
        vscode.commands.executeCommand('reporterplus.configureReportPath');
        break;
      case 'refresh':
        await this.refresh();
        break;
      case 'jump':
        this.jumpToTest(msg.index);
        break;
      case 'copyError':
        this.copyError(msg.index);
        break;
    }
  }

  private jumpToTest(index: number) {
    if (!this.reportData) {
      return;
    }

    if (
      typeof index !== 'number' ||
      index < 0 ||
      index >= this.reportData.tests.length
    ) {
      return;
    }

    // Index refers to the position in the full tests array
    const test = this.reportData.tests[index];
    if (!test) {
      // Fallback: try failedTests for backward compatibility
      const failedTest = this.reportData.failedTests[index];
      if (failedTest) {
        vscode.commands.executeCommand(
          'reporterplus.jumpToTest',
          failedTest.file,
          failedTest.line
        );
      }
      return;
    }

    vscode.commands.executeCommand(
      'reporterplus.jumpToTest',
      test.file,
      test.line
    );
  }

  private copyError(index: number) {
    if (!this.reportData) return;
    const test = this.reportData.failedTests[index];
    if (!test?.errorMessage) return;

    vscode.env.clipboard.writeText(test.errorMessage);
    vscode.window.showInformationMessage('Error message copied to clipboard');
  }

  /**
   * Load or reload the report
   */
  async loadReport() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const reportPath = await this.reportService.resolveReportPath();

      if (!reportPath) {
        this.renderState('no-config');
        return;
      }

      // Set up file watcher for live updates
      this.reportService.setupFileWatcher(reportPath, () => {
        this.refresh();
      });

      // Load the report
      try {
        this.reportData = await this.reportService.loadReport(reportPath);

        if (
          this.reportData.failedTests.length === 0 &&
          this.reportData.summary.total === 0
        ) {
          this.renderState('empty');
        } else if (this.reportData.failedTests.length === 0) {
          this.renderState('all-passed');
        } else {
          this.renderState('results');
        }
      } catch (err: any) {
        this.renderState('error', err.message);
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Public refresh method
   */
  async refresh() {
    this._onDidRefresh.fire();
    await this.loadReport();
  }

  /**
   * Render different states
   */
  private renderState(state: SidebarState, message?: string) {
    if (!this.view) return;

    switch (state) {
      case 'loading':
        this.view.webview.html = HtmlRenderer.renderLoading();
        break;
      case 'no-config':
        this.view.webview.html = HtmlRenderer.renderNoConfig();
        break;
      case 'empty':
        this.view.webview.html = HtmlRenderer.renderEmpty();
        break;
      case 'all-passed':
        this.view.webview.html = HtmlRenderer.renderAllPassed(
          this.reportData?.summary
        );
        break;
      case 'results':
        if (this.reportData) {
          this.view.webview.html = HtmlRenderer.renderResults(this.reportData);
        } else {
          this.view.webview.html = HtmlRenderer.renderEmpty();
        }
        break;
      case 'error':
        this.view.webview.html = HtmlRenderer.renderError(
          message || 'Unknown error'
        );
        break;
    }
  }

  dispose() {
    this.reportService.dispose();
    this._onDidRefresh.dispose();
  }
}
