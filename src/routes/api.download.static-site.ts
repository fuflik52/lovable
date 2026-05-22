import { createFileRoute } from "@tanstack/react-router";
import JSZip from "jszip";
import fs from "fs";
import path from "path";

export const Route = createFileRoute('/api/download/static-site')({
  server: {
    handlers: {
      GET: async () => {
        const zip = new JSZip();
        const baseDir = path.resolve("static-site");

        async function addDir(dirPath: string, zipPath: string) {
          const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const zipFullPath = zipPath ? `${zipPath}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
              await addDir(fullPath, zipFullPath);
            } else {
              const content = await fs.promises.readFile(fullPath);
              zip.file(zipFullPath, content);
            }
          }
        }

        await addDir(baseDir, "");

        const buffer = await zip.generateAsync({ type: "nodebuffer" });
        const uint8 = new Uint8Array(buffer);

        return new Response(uint8, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": 'attachment; filename="static-site.zip"',
            "Content-Length": String(uint8.length),
          },
        });
      },
    },
  },
});
