import { ReportService } from "../src/services/reportService";

jest.mock("vscode", () => ({
  workspace: {
    getConfiguration: () => ({
      get: () => [
        "/reports/run1.json",
        "/reports/run2.json"
      ]
    }),
    workspaceFolders: [
      { uri: { fsPath: "/workspace" } }
    ]
  }
}));

describe("ReportService", () => {

  test("should return configured report paths", () => {
    const service = new ReportService();

    const paths = service.getAllReportPaths();

    expect(paths.length).toBe(2);
  });

  test("should set active report", () => {
    const service = new ReportService();

    service.setActiveReport("/reports/run2.json");

    expect((service as any).activeReportPath).toBe("/reports/run2.json");
  });

  test("resolveReportPath should return first report when active not set", async () => {
    const service = new ReportService();

    const path = await service.resolveReportPath();

    expect(path).toContain("run1.json");
  });

});