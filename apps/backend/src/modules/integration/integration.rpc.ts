import { Controller } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { contract } from "@lentil/rpc";
import { DatasourceConfigService } from "./datasource-config.service";
import { IntegrationService } from "./integration.service";

/**
 * oRPC endpoints for external data source config CRUD + connection test.
 *
 * All routes are mounted under /rpc (see @Controller("rpc")).
 * This controller only destructures input and delegates to services.
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
      return this.configService.list();
    });
  }

  @Implement(contract.integration.get)
  async get() {
    return implement(contract.integration.get).handler(async ({ input: { id } }) => {
      return this.configService.get(id);
    });
  }

  @Implement(contract.integration.create)
  async create() {
    return implement(contract.integration.create).handler(async ({ input }) => {
      return this.configService.create(input);
    });
  }

  @Implement(contract.integration.update)
  async update() {
    return implement(contract.integration.update).handler(async ({ input: { id, ...data } }) => {
      return this.configService.update(id, data);
    });
  }

  @Implement(contract.integration.remove)
  async remove() {
    return implement(contract.integration.remove).handler(async ({ input: { id } }) => {
      await this.configService.remove(id);
    });
  }

  @Implement(contract.integration.test)
  async test() {
    return implement(contract.integration.test).handler(async ({ input: { type, config } }) => {
      return this.integration.testConnection(type, config);
    });
  }
}
