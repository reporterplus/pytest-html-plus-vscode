import * as vscode from "vscode";
import { findReportFile } from "../utils/reportReader";

export async function configureReportPath(sidebarProvider: any): Promise<void> {
  const workspace = vscode.workspace.workspaceFolders?.[0];

  if (!workspace) {
    vscode.window.showErrorMessage("No workspace folder open");
    return;
  }

  const choice = await vscode.window.showQuickPick(
    [
      {
        label: "$(folder-opened) Browse reports...",
        description: "Select one or more report JSON files",
        action: "browse",
      },
      {
        label: "$(edit) Enter path manually",
        description: "Type the path to the report file",
        action: "manual",
      },
      {
        label: "$(search) Auto-detect",
        description: "Search for report files in the workspace",
        action: "auto",
      },
    ],
    {
      placeHolder: "How would you like to configure reports?",
    }
  );

  if (!choice) return;

  let paths: string[] = [];

  // -------------------------
  // Browse reports
  // -------------------------
  if (choice.action === "browse") {
    const fileUris = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: true,
      openLabel: "Select Report Files",
      filters: {
        "JSON files": ["json"],
        "All files": ["*"],
      },
      defaultUri: workspace.uri,
    });

    if (!fileUris || fileUris.length === 0) return;

    const newPaths = fileUris.map((f) => f.fsPath);

    const config = vscode.workspace.getConfiguration("reporterplus");
    const existing = config.get<string[]>("reportJsonPaths") || [];

    paths = [...new Set([...existing, ...newPaths])];
  }

  // -------------------------
  // Manual path input
  // -------------------------
  else if (choice.action === "manual") {
    const input = await vscode.window.showInputBox({
      prompt: "Enter path to the report JSON file",
      placeHolder: "reports/final_report.json or /absolute/path/report.json",
      validateInput: (value) => {
        if (!value.trim()) return "Path cannot be empty";
        return null;
      },
    });

    if (!input) return;

    let pathToResolve = input.trim();

    if (!pathToResolve.endsWith(".json")) {
      pathToResolve = pathToResolve.replace(/\/?$/, "/final_report.json");
    }

    if (!pathToResolve.startsWith("/") && !/^[A-Za-z]:/.test(pathToResolve)) {
      pathToResolve = vscode.Uri.joinPath(workspace.uri, pathToResolve).fsPath;
    }

    paths = [pathToResolve];
  }

  // -------------------------
  // Auto detect
  // -------------------------
  else if (choice.action === "auto") {
    const detected = await findReportFile(workspace.uri);

    if (!detected) {
      vscode.window.showWarningMessage(
        "No pytest report files found in the workspace."
      );
      return;
    }

    paths = [detected];
  }

  if (paths.length === 0) return;

  await vscode.workspace
  .getConfiguration("reporterplus")
  .update("reportJsonPaths", paths, vscode.ConfigurationTarget.Workspace);

  vscode.window.showInformationMessage(
    `${paths.length} report(s) configured`
  );

  sidebarProvider?.refresh();
}