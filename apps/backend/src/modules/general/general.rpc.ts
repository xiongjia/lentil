import { Controller, Get, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiExcludeEndpoint } from "@nestjs/swagger";
import { Implement, implement } from "@orpc/nest";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { contract } from "@lentil/rpc";

const openapiGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

@Controller("rpc")
export class GeneralRPC {
  constructor(private readonly config: ConfigService) {}

  @Implement(contract.general.health)
  health() {
    return implement(contract.general.health).handler(() => ({ status: "ok" }));
  }

  @Implement(contract.general.hello)
  hello() {
    return implement(contract.general.hello).handler(() => ({
      message: "Hello World",
    }));
  }

  @Get("spec")
  @ApiExcludeEndpoint()
  spec() {
    if (!this.config.get<boolean>("RPC_SPEC_ENABLED", true)) {
      throw new NotFoundException("RPC spec is disabled");
    }
    const scheme = this.config.get<string>("APP_SCHEME", "http");
    const host = this.config.get<string>("APP_HOST", "localhost");
    const port = this.config.get<number>("PORT", 3990);
    return openapiGenerator.generate(contract, {
      info: { title: "Lentil API", version: "1.0.0" },
      servers: [{ url: `${scheme}://${host}:${port}/rpc` }],
    });
  }
}
