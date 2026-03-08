export const workspace = {
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

export const Uri = {
  joinPath: (base: any, path: string) => ({
    fsPath: `${base.fsPath}/${path}`
  })
};