// src/sidebarProvider.ts
import * as vscode from 'vscode';
import { readFailedTests } from './reportReader';

export class SidebarProvider implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;
  private failedTests: any[] = [];

  resolveWebviewView(view: vscode.WebviewView) {
    this.view = view; // ✅ THIS WAS MISSING


    // ✅ REQUIRED
    view.webview.options = {
      enableScripts: true
    };
    

    // ✅ REGISTER HANDLER ONCE
    view.webview.onDidReceiveMessage(msg => {
      if (msg.command === 'configure') {
        vscode.commands.executeCommand(
          'reporterplus.configureReportPath'
        );
      }
      if (msg.command === 'refresh') {
  this.refresh();
}

      if (msg.command === 'jump') {
        const t = this.failedTests[msg.index];
        if (!t) return;

        vscode.commands.executeCommand(
          'reporterplus.jumpToTest',
          t.file,
          t.line
        );
      }
    });

    const config = vscode.workspace.getConfiguration('reporterplus');
    const reportPath = config.get<string>('reportJsonPath');

    // State: no path configured
    if (!reportPath) {
      view.webview.html = this.renderMessage(
        'No report configured.',
        true
      );
      return;
    }

    try {
      this.failedTests = readFailedTests(reportPath);
    } catch (err: any) {
      view.webview.html = this.renderMessage(
        `⚠️ ${err.message}`
      );
      return;
    }

    // State: no failures
    if (this.failedTests.length === 0) {
      view.webview.html = this.renderMessage(
        '✅ No failed tests'
      );
      return;
    }

    // State: failures exist
    view.webview.html = this.renderFailures(this.failedTests);
  }

private renderMessage(message: string, showConfig = false): string {
  return `
    <html>
      <body>
        <h3>ReporterPlus</h3>
        <p>${message}</p>

        ${
          showConfig
            ? `<button onclick="configure()">Configure report path</button>`
            : ''
        }

        <button onclick="refresh()">Refresh</button>

        <script>
          const vscode = acquireVsCodeApi();

          function configure() {
            vscode.postMessage({ command: 'configure' });
          }

          function refresh() {
            vscode.postMessage({ command: 'refresh' });
          }
        </script>
      </body>
    </html>
  `;
}


private renderFailures(failedTests: any[]): string {
  const items = failedTests
    .map(
      (t, i) =>
        `<li onclick="jump(${i})" style="cursor:pointer;color:#c00">
          ${t.nodeid}
         </li>`
    )
    .join('');

  return `
    <html>
      <body>
        <h3>ReporterPlus</h3>
        <p>❌ ${failedTests.length} Failed tests</p>

        <button onclick="refresh()">Refresh</button>

        <ul>${items}</ul>

        <script>
          const vscode = acquireVsCodeApi();

          function jump(index) {
            vscode.postMessage({ command: 'jump', index });
          }

          function refresh() {
            vscode.postMessage({ command: 'refresh' });
          }
        </script>
      </body>
    </html>
  `;
}


  refresh() {
  if (!this.view) return;

  const config = vscode.workspace.getConfiguration('reporterplus');
  const reportPath = config.get<string>('reportJsonPath');

  if (!reportPath) {
    this.view.webview.html = this.renderMessage(
      'No report configured.',
      true
    );
    return;
  }

  try {
    this.failedTests = readFailedTests(reportPath);
  } catch (err: any) {
    this.view.webview.html = this.renderMessage(
      `⚠️ ${err.message}`
    );
    return;
  }

  if (this.failedTests.length === 0) {
    this.view.webview.html = this.renderMessage(
      '✅ No failed tests'
    );
    return;
  }

  this.view.webview.html = this.renderFailures(this.failedTests);
}

}
