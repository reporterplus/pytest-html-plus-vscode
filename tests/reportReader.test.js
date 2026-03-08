"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const reportReader_1 = require("../src/utils/reportReader");
describe("reportReader", () => {
    const passedReport = path.join(__dirname, "fixtures/passed_report.json");
    const failedReport = path.join(__dirname, "fixtures/failed_report.json");
    test("should parse summary correctly", () => {
        const report = (0, reportReader_1.readReportSync)(passedReport);
        expect(report.summary.total).toBe(2);
        expect(report.summary.passed).toBe(2);
        expect(report.tests.length).toBe(2);
    });
    test("should detect failed tests", () => {
        const report = (0, reportReader_1.readReportSync)(failedReport);
        expect(report.failedTests.length).toBe(1);
        expect(report.failedTests[0].status).toBe("failed");
    });
    test("should extract test name from nodeid", () => {
        const report = (0, reportReader_1.readReportSync)(passedReport);
        const test = report.tests[0];
        expect(test.name).toBe("test_login_success");
    });
    test("should extract file path", () => {
        const report = (0, reportReader_1.readReportSync)(passedReport);
        const test = report.tests[0];
        expect(test.file).toContain("tests/test_login.py");
    });
    test("should extract error message from stderr", () => {
        const report = (0, reportReader_1.readReportSync)(failedReport);
        const failed = report.failedTests[0];
        expect(failed.errorMessage).toContain("AssertionError");
    });
});
//# sourceMappingURL=reportReader.test.js.map