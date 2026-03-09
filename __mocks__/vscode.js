"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uri = exports.workspace = void 0;
exports.workspace = {
    getConfiguration: () => ({
        get: () => [],
        update: jest.fn()
    }),
    workspaceFolders: [
        {
            uri: {
                fsPath: "/workspace"
            }
        }
    ],
    findFiles: jest.fn(async () => [])
};
exports.Uri = {
    joinPath: (base, path) => ({
        fsPath: `${base.fsPath}/${path}`
    })
};
//# sourceMappingURL=vscode.js.map