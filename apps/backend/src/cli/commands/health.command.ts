import { Command, CommandRunner } from "nest-commander";
import { Inject } from "@nestjs/common";
import { GeneralService } from "../../modules/general/general.service";
import { APP_LOGGER } from "../../modules/providers";
import pino from "pino";

@Command({
  name: "health",
  description: "Check health status via GeneralService",
})
export class HealthCommand extends CommandRunner {
  constructor(
    private generalService: GeneralService,
    @Inject(APP_LOGGER) private logger: pino.Logger,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      const result = this.generalService.health();
      this.logger.info({ status: result.status }, "Health check completed");
    } catch {
      this.logger.error("Health check failed");
      process.exit(1);
    }
  }
}
