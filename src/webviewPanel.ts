import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function openReportWebview(extensionUri: vscode.Uri, reportPath: string) {
  const panel = vscode.window.createWebviewPanel(
    'reporterplusReport',
    'ReporterPlus Report',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'static'), vscode.workspace.workspaceFolders?.[0].uri || extensionUri]
    }
  );

  // Read the report HTML from disk and serve via webview
  try {
    const html = fs.readFileSync(reportPath, 'utf8');
    panel.webview.html = html;
  } catch (err) {
    panel.webview.html = `<html><body><h3>Could not open report</h3><pre>${err}</pre></body></html>`;
  }

  panel.webview.onDidReceiveMessage(msg => {
    if (msg.command === 'jumpToTest') {
      vscode.commands.executeCommand('reporterplus.jumpToTest', msg.file, msg.line);
    }
  });
}
