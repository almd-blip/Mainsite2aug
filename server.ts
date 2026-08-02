/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { handlePracticeEngineRequest } from "./src/api/practice-engine/route";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Endpoint for Second Thought Practice Engine (/api/practice-engine and /api/reflect)
  app.post(["/api/practice-engine", "/api/reflect"], async (req, res) => {
    const result = await handlePracticeEngineRequest(req.body);
    return res.status(result.status).json(result.body);
  });


  // Serve app via Vite in development, static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Second Thought Practice Engine Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
