// src/extension.ts
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SidebarProvider } from './sidebarProvider';

export function activate(context: vscode.ExtensionContext) {

  // Sidebar
  const sidebarProvider = new SidebarProvider();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'reporterplus.sidebar',
      sidebarProvider
    )
  );

  // Configure report path
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'reporterplus.configureReportPath',
      async () => {
        const input = await vscode.window.showInputBox({
          prompt: 'Enter folder or full path to final-report.json',
          placeHolder: '.'
        });

        if (!input) return;

        const workspace = vscode.workspace.workspaceFolders?.[0];
        if (!workspace) {
          vscode.window.showErrorMessage('No workspace open');
          return;
        }

        let resolved = path.isAbsolute(input)
          ? input
          : path.join(workspace.uri.fsPath, input);

        if (!resolved.endsWith('final-report.json')) {
          resolved = path.join(resolved, 'final-report.json');
        }

        if (!fs.existsSync(resolved)) {
          vscode.window.showErrorMessage(
            `final-report.json not found at ${resolved}`
          );
          return;
        }

        await vscode.workspace
          .getConfiguration('reporterplus')
          .update(
            'reportJsonPath',
            resolved,
            vscode.ConfigurationTarget.Workspace
          );

        vscode.window.showInformationMessage(
          'ReporterPlus report path configured'
        );
      }
    )
  );

  // Jump to test
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'reporterplus.jumpToTest',
      async (file: string, line: number) => {
        const doc = await vscode.workspace.openTextDocument(file);
        const editor = await vscode.window.showTextDocument(doc);
        const pos = new vscode.Position(line - 1, 0);
        editor.revealRange(new vscode.Range(pos, pos));
      }
    )
  );
  context.subscriptions.push(
  vscode.commands.registerCommand(
    'reporterplus.refresh',
    () => sidebarProvider.refresh()
  )
);

}

export function deactivate() {}
