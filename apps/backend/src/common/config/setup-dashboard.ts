import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import * as path from "node:path";
import { Request, Response } from "express";

export const setupDashboard = (app: NestExpressApplication) => {
  const configService = app.get(ConfigService);

  const staticDir = configService.get<string>(
    "DASHBOARD_STATIC_DIR",
    "../dashboard/dist",
  );
  const baseUrl = configService.get<string>(
    "DASHBOARD_BASE_URL",
    "/dashboard/",
  );
  const resolvedStaticDir = path.resolve(staticDir);

  app.useStaticAssets(resolvedStaticDir, { prefix: baseUrl });

  // SPA fallback: serve index.html for dashboard client-side routes
  app.use(baseUrl, (_req: Request, res: Response) => {
    res.sendFile(path.join(resolvedStaticDir, "index.html"));
  });
};
