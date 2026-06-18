import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { apiReference } from "@scalar/express-api-reference";

export const setupApiDoc = (app: NestExpressApplication) => {
  const config = app.get(ConfigService);

  // Swagger UI — OpenAPI docs for REST endpoints
  if (config.get<boolean>("API_DOCS_ENABLED", true)) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Lentil API")
      .setDescription("Lentil backend API")
      .setVersion("1.0")
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document);
  }

  // Scalar API Reference — oRPC spec viewer
  if (config.get<boolean>("RPC_SPEC_ENABLED", true)) {
    app.use(
      "/reference",
      apiReference({
        spec: { url: "/rpc/spec" },
      }),
    );
  }
};
