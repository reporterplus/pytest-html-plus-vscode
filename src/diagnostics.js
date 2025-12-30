"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporterDiagnostics = void 0;
var vscode = require("vscode");
var ReporterDiagnostics = /** @class */ (function () {
    function ReporterDiagnostics() {
        this.dc = vscode.languages.createDiagnosticCollection('reporterplus');
    }
    ReporterDiagnostics.prototype.updateDiagnostics = function (fileUri, problems) {
        var diagnostics = problems.map(function (p) {
            var range = new vscode.Range(p.line - 1, 0, p.line - 1, 1000);
            return new vscode.Diagnostic(range, p.message, vscode.DiagnosticSeverity.Error);
        });
        this.dc.set(fileUri, diagnostics);
    };
    ReporterDiagnostics.prototype.dispose = function () { this.dc.clear(); this.dc.dispose(); };
    return ReporterDiagnostics;
}());
exports.ReporterDiagnostics = ReporterDiagnostics;
