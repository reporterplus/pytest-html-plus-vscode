/**
 * Command handler for configuring the report path
 */
import * as vscode from 'vscode';
import { findReportFile } from '../utils/reportReader';

export async function configureReportPath(sidebarProvider: any): Promise<void> {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  const choice = await vscode.window.showQuickPick(
    [
      {
        label: '$(folder-opened) Browse for file...',
        description: 'Select the report file using file picker',
        action: 'browse',
      },
      {
        label: '$(edit) Enter path manually',
        description: 'Type the path to the report file',
        action: 'manual',
      },
      {
        label: '$(search) Auto-detect',
        description: 'Search for report files in the workspace',
        action: 'auto',
      },
    ],
    {
      placeHolder: 'How would you like to configure the report path?',
    }
  );

  if (!choice) return;

  let resolvedPath: string | undefined;

  if (choice.action === 'browse') {
    const fileUri = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: 'Select Report File',
      filters: {
        'JSON files': ['json'],
        'All files': ['*'],
      },
      defaultUri: workspace.uri,
    });

    if (!fileUri || fileUri.length === 0) return;
    resolvedPath = fileUri[0].fsPath;
  } else if (choice.action === 'manual') {
    const input = await vscode.window.showInputBox({
      prompt: 'Enter path to the report JSON file',
      placeHolder: 'reports/final_report.json or /absolute/path/report.json',
      validateInput: (value) => {
        if (!value.trim()) return 'Path cannot be empty';
        return null;
      },
    });

    if (!input) return;

    let pathToResolve = input.trim();
    if (!pathToResolve.endsWith('.json')) {
      pathToResolve = pathToResolve.replace(/\/?$/, '/final_report.json');
    }

    if (pathToResolve.startsWith('/') || /^[A-Za-z]:/.test(pathToResolve)) {
      resolvedPath = pathToResolve;
    } else {
      resolvedPath = vscode.Uri.joinPath(workspace.uri, pathToResolve).fsPath;
    }
  } else if (choice.action === 'auto') {
    const detected = await findReportFile(workspace.uri);

    if (detected) {
      const useDetected = await vscode.window.showInformationMessage(
        `Found report at: ${detected}`,
        'Use this file',
        'Cancel'
      );

      if (useDetected === 'Use this file') {
        resolvedPath = detected;
      }
    } else {
      vscode.window.showWarningMessage(
        'No pytest report files found in the workspace. Please configure manually.'
      );
      return;
    }
  }

  if (!resolvedPath) return;

  await vscode.workspace
    .getConfiguration('reporterplus')
    .update(
      'reportJsonPath',
      resolvedPath,
      vscode.ConfigurationTarget.Workspace
    );

  vscode.window.showInformationMessage(
    `Report path configured: ${resolvedPath}`
  );

  sidebarProvider?.refresh();
}
