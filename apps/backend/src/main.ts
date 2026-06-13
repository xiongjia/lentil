import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { setupPipes, setupDashboard, setupSwagger } from "./common/config";
import { writePidFile } from "./common/utils";

const bootstrap = async () => {
  // Create the NestJS application with Express platform
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Apply global middleware and configuration
  setupPipes(app);
  setupDashboard(app);
  setupSwagger(app);

  // Start listening
  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3990);

  // Write PID file for process management (pnpm stop)
  const pidDir = configService.get<string>("PID_DIR", ".local");
  writePidFile(pidDir);

  await app.listen(port);
};

// Handle startup failures (e.g. DB migration errors)
bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
