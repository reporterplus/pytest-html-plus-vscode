/**
 * Command handler for jumping to a test in the source code
 */
import * as vscode from 'vscode';
import { resolveFilePath, findFileByFilename } from '../utils/pathUtils';

export async function jumpToTest(file: string, line: number): Promise<void> {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  if (!file) {
    vscode.window.showErrorMessage('No file path provided');
    return;
  }

  try {
    let uri = resolveFilePath(file, workspace);

    // Check if file exists
    try {
      await vscode.workspace.fs.stat(uri);
    } catch (statError) {
      // File doesn't exist, try to find it by filename
      const fileName = file.split('/').pop() || file;
      const foundFile = await findFileByFilename(fileName, 5);

      if (foundFile) {
        uri = foundFile;
      } else {
        throw new Error(`File not found: ${file}`);
      }
    }

    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document, {
      preview: false,
      preserveFocus: false,
    });

    // Calculate position (convert 1-based to 0-based)
    const lineIndex = Math.max(0, (line || 1) - 1);
    const position = new vscode.Position(lineIndex, 0);

    // Set cursor and reveal
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(
      new vscode.Range(position, position),
      vscode.TextEditorRevealType.InCenterIfOutsideViewport
    );

    // Highlight the line briefly
    const decoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: new vscode.ThemeColor(
        'editor.findMatchHighlightBackground'
      ),
      isWholeLine: true,
    });

    editor.setDecorations(decoration, [new vscode.Range(position, position)]);

    // Remove highlight after a short delay
    setTimeout(() => {
      decoration.dispose();
    }, 2000);
  } catch (err: any) {
    const errorMessage = err.message || `Could not open file: ${file}`;
    vscode.window.showErrorMessage(errorMessage);
  }
}
