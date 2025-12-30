import * as vscode from 'vscode';
import { SidebarProvider } from './sidebarProvider';

export function activate(context: vscode.ExtensionContext) {

  const sidebarProvider = new SidebarProvider();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'reporterplus.sidebar',
      sidebarProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'reporterplus.configureReportPath',
      async () => {
        const input = await vscode.window.showInputBox({
          prompt: 'Enter folder or full path to final_report.json'
        });
        if (!input) return;

        const workspace = vscode.workspace.workspaceFolders?.[0];
        if (!workspace) {
          vscode.window.showErrorMessage('No workspace open');
          return;
        }

        let resolved = input;
        if (!input.endsWith('final_report.json')) {
          resolved = `${input}/final_report.json`;
        }

        await vscode.workspace
          .getConfiguration('reporterplus')
          .update(
            'reportJsonPath',
            resolved,
            vscode.ConfigurationTarget.Workspace
          );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'reporterplus.jumpToTest',
      async (file: string, line: number) => {

        const workspace = vscode.workspace.workspaceFolders?.[0];
        if (!workspace) {
          vscode.window.showErrorMessage('No workspace folder open');
          return;
        }

        try {
          // Resolve file relative to workspace root
          const uri = vscode.Uri.joinPath(workspace.uri, file);

          const document = await vscode.workspace.openTextDocument(uri);
          const editor = await vscode.window.showTextDocument(document);

          const position = new vscode.Position(line - 1, 0);
          editor.selection = new vscode.Selection(position, position);
          editor.revealRange(
            new vscode.Range(position, position),
            vscode.TextEditorRevealType.InCenter
          );
        } catch (err) {
          vscode.window.showErrorMessage(
            `Failed to open file: ${file}`
          );
        }
      }
    )
  );
}

export function deactivate() {}
