/**
 * Main extension entry point
 */
import * as vscode from 'vscode';
import { SidebarProvider } from './providers/sidebarProvider';
import { configureReportPath } from './commands/configureReportPath';
import { jumpToTest } from './commands/jumpToTest';

let sidebarProvider: SidebarProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
  sidebarProvider = new SidebarProvider(context.extensionUri);

  // Register the webview provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('reporterplus.configureReportPath', () =>
      configureReportPath(sidebarProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('reporterplus.refresh', () => {
      sidebarProvider?.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'reporterplus.jumpToTest',
      (file: string, line: number) => jumpToTest(file, line)
    )
  );

  // Watch for workspace folder changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      sidebarProvider?.refresh();
    })
  );

  // Add status bar item for quick access
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = 'reporterplus.refresh';
  statusBarItem.tooltip = 'Click to refresh test results';
  context.subscriptions.push(statusBarItem);
}

export function deactivate() {
  sidebarProvider?.dispose();
}
