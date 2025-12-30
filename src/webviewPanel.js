"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openReportWebview = openReportWebview;
var vscode = require("vscode");
var fs = require("fs");
function openReportWebview(extensionUri, reportPath) {
    var _a;
    var panel = vscode.window.createWebviewPanel('reporterplusReport', 'ReporterPlus Report', vscode.ViewColumn.One, {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'static'), ((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri) || extensionUri]
    });
    // Read the report HTML from disk and serve via webview
    try {
        var html = fs.readFileSync(reportPath, 'utf8');
        // If the HTML references local assets, you may need to rewrite paths to webview URIs.
        panel.webview.html = html;
    }
    catch (err) {
        panel.webview.html = "<html><body><h3>Could not open report</h3><pre>".concat(err, "</pre></body></html>");
    }
    // Example: handle clicks from the webview to jump to tests
    panel.webview.onDidReceiveMessage(function (msg) {
        if (msg.command === 'jumpToTest') {
            vscode.commands.executeCommand('reporterplus.jumpToTest', msg.file, msg.line);
        }
    });
}
