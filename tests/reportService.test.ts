import { ReportService } from "../src/services/reportService";
import * as fs from "fs";

jest.mock("vscode", () => ({
  workspace: {
    getConfiguration: () => ({
      get: () => [
        "/reports/run1.json",
        "/reports/run2.json"
      ],
      update: jest.fn()
    }),
    workspaceFolders: [
      { uri: { fsPath: "/workspace" } }
    ]
  },

  ConfigurationTarget: {
    Workspace: 1
  },

  Uri: {
    joinPath: (...args: any[]) => ({
      fsPath: args.join("/")
    })
  }
}));
jest.mock("fs", () => ({
  existsSync: jest.fn(),
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

  test("should return first valid report when active not set", async () => {
    jest.spyOn(fs, "existsSync").mockReturnValue(true);

    const service = new ReportService();
    const path = await service.resolveReportPath();

    expect(path).toContain("run1.json");
});
  test("should return null when no valid reports exist", async () => {
  jest.spyOn(fs, "existsSync").mockReturnValue(false);

  const service = new ReportService();
  const path = await service.resolveReportPath();

  expect(path).toBeNull();
});

});