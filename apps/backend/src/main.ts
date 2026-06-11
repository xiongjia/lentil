import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { setupPipes, setupDashboard, setupSwagger } from "./common/config";

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  setupPipes(app);
  setupDashboard(app);
  setupSwagger(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3990);

  await app.listen(port);
};

bootstrap();
