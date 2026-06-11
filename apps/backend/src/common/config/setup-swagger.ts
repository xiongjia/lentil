import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

export const setupSwagger = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const enabled = configService.get<boolean>("API_DOCS_ENABLED", true);
  if (!enabled) return;

  const config = new DocumentBuilder()
    .setTitle("Lentil API")
    .setDescription("Lentil backend API")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);
};
