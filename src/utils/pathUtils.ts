// Path resolution utilities
import * as vscode from 'vscode';

// Resolve a file path (absolute or relative to workspace)
export function resolveFilePath(
  file: string,
  workspace: vscode.WorkspaceFolder
): vscode.Uri {
  // Check if it's an absolute path
  if (file.startsWith('/') || /^[A-Za-z]:/.test(file)) {
    return vscode.Uri.file(file);
  }

  // Relative path - join with workspace root
  const normalizedPath = file.replace(/^\.\//, '');
  return vscode.Uri.joinPath(workspace.uri, normalizedPath);
}

// Find a file by name if exact path doesn't exist
export async function findFileByFilename(
  fileName: string,
  maxResults: number = 5
): Promise<vscode.Uri | null> {
  const foundFiles = await vscode.workspace.findFiles(
    `**/${fileName}`,
    '**/node_modules/**',
    maxResults
  );

  return foundFiles.length > 0 ? foundFiles[0] : null;
}
