import * as vscode from 'vscode';

export class ReporterDiagnostics {
  private dc = vscode.languages.createDiagnosticCollection('reporterplus');

  public updateDiagnostics(fileUri: vscode.Uri, problems: Array<{line:number, message:string}>) {
    const diagnostics: vscode.Diagnostic[] = problems.map(p => {
      const range = new vscode.Range(p.line - 1, 0, p.line - 1, 1000);
      return new vscode.Diagnostic(range, p.message, vscode.DiagnosticSeverity.Error);
    });
    this.dc.set(fileUri, diagnostics);
  }

  dispose() { this.dc.clear(); this.dc.dispose(); }
}
