import * as path from "path";
import { readReportSync } from "../src/utils/reportReader";

describe("reportReader", () => {

  const passedReport = path.join(__dirname, "fixtures/passed_report.json");
  const failedReport = path.join(__dirname, "fixtures/failed_report.json");

  test("should parse summary correctly", () => {
    const report = readReportSync(passedReport);

    expect(report.summary.total).toBe(2);
    expect(report.summary.passed).toBe(2);
    expect(report.tests.length).toBe(2);
  });

  test("should detect failed tests", () => {
    const report = readReportSync(failedReport);

    expect(report.failedTests.length).toBe(1);
    expect(report.failedTests[0].status).toBe("failed");
  });

  test("should extract test name from nodeid", () => {
    const report = readReportSync(passedReport);

    const test = report.tests[0];

    expect(test.name).toBe("test_login_success");
  });

  test("should extract file path", () => {
    const report = readReportSync(passedReport);

    const test = report.tests[0];

    expect(test.file).toContain("tests/test_login.py");
  });

  test("should extract error message from stderr", () => {
    const report = readReportSync(failedReport);

    const failed = report.failedTests[0];

    expect(failed.errorMessage).toContain("AssertionError");
  });

});