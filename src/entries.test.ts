import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function source(name: "client" | "server") {
  return readFile(new URL(`./${name}.ts`, import.meta.url), "utf8");
}

describe("@liteeagle226/nextjs entry boundaries", () => {
  it("keeps the browser entry behind a client directive and free of server dependencies", async () => {
    const client = await source("client");

    expect(client.trimStart().startsWith('"use client";')).toBe(true);
    expect(client).not.toContain("@liteeagle226/admission");
    expect(client).not.toContain('import "server-only"');
    expect(client).not.toContain('from "./server');
  });

  it("guards the admission entry as server-only", async () => {
    const server = await source("server");
    expect(server.trimStart().startsWith('import "server-only";')).toBe(true);
    expect(server).toContain('from "@liteeagle226/admission"');
  });

  it("publishes separate client and server subpaths", async () => {
    const manifest = JSON.parse(
      await readFile(new URL("../package.json", import.meta.url), "utf8"),
    ) as { exports: Record<string, { import: string; types: string }> };

    expect(manifest.exports["."].import).toBe("./dist/client.js");
    expect(manifest.exports["./client"].import).toBe("./dist/client.js");
    expect(manifest.exports["./server"].import).toBe("./dist/server.js");
    expect(manifest.exports["./server"].types).toBe("./dist/server.d.ts");
  });
});
