import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const configService = app.get(ConfigService);
  const apiDocsEnabled = configService.get<boolean>("API_DOCS_ENABLED", true);
  if (apiDocsEnabled) {
    const config = new DocumentBuilder()
      .setTitle("Lentil API")
      .setDescription("Lentil backend API")
      .setVersion("1.0")
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
  }

  const port = configService.get<number>("PORT", 3850);

  await app.listen(port);
};

bootstrap();
