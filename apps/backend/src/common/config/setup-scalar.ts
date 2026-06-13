import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { apiReference } from "@scalar/express-api-reference";

export const setupScalar = (app: NestExpressApplication) => {
  const config = app.get(ConfigService);
  const enabled = config.get<boolean>("RPC_SPEC_ENABLED", true);
  if (!enabled) return;

  app.use(
    "/reference",
    apiReference({
      spec: { url: "/rpc/spec" },
    }),
  );
};
