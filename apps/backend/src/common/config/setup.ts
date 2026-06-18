import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";

export const setup = (app: NestExpressApplication) => {
  const config = app.get(ConfigService);

  // CORS — allow dashboard dev server on different port
  app.enableCors({
    origin: config.get("CORS_ORIGIN", true),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
};
