import { contract } from "@lentil/rpc";
import { Controller } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { DatasourceConfigService } from "./datasource-config.service";
import { IntegrationService } from "./integration.service";

/**
 * oRPC endpoints for external data source config CRUD + connection test.
 *
 * All routes are mounted under /rpc (see `@Controller("rpc")`).
 * Each handler:
 * 1. Destructures input from the client,
 * 2. Delegates to the service layer (which returns DTOs),
 * 3. Maps the DTO through {@link rpc-mapper} to the exact shape
 *    expected by the oRPC contract's output schema.
 */
@Controller("rpc")
export class IntegrationRPC {
  constructor(
    private readonly configService: DatasourceConfigService,
    private readonly integration: IntegrationService,
  ) {}

  @Implement(contract.integration.list)
  async list() {
    return implement(contract.integration.list).handler(async () => {
      return await this.configService.list();
    });
  }

  @Implement(contract.integration.get)
  async get() {
    return implement(contract.integration.get).handler(
      async ({ input: { id } }) => {
        return await this.configService.get(id);
      },
    );
  }

  @Implement(contract.integration.create)
  async create() {
    return implement(contract.integration.create).handler(async ({ input }) => {
      const dto = await this.configService.create(input);
      return dto;
    });
  }

  @Implement(contract.integration.update)
  async update() {
    return implement(contract.integration.update).handler(
      async ({ input: { id, ...data } }) => {
        return await this.configService.update(id, data);
      },
    );
  }

  @Implement(contract.integration.remove)
  async remove() {
    return implement(contract.integration.remove).handler(
      async ({ input: { id } }) => {
        await this.configService.remove(id);
      },
    );
  }

  @Implement(contract.integration.test)
  async test() {
    return implement(contract.integration.test).handler(
      async ({ input: { type, config } }) => {
        const dto = await this.integration.testConnection(type, config);
        return dto;
      },
    );
  }
}
