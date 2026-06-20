import { Controller, Get, Inject } from "@nestjs/common";
import { GeneralService } from "./general.service";

@Controller()
export class GeneralController {
  constructor(
    @Inject(GeneralService) private readonly generalService: GeneralService,
  ) {}

  @Get("health")
  health() {
    return this.generalService.health();
  }
}
