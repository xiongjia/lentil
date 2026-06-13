import { Controller, Get, Inject } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/core";
import { GeneralService } from "./general.service";
import { Hello } from "@lentil/db";

@Controller()
export class GeneralController {
  constructor(
    @Inject(GeneralService) private readonly generalService: GeneralService,
    private readonly em: EntityManager,
  ) {}

  @Get("health")
  health() {
    return this.generalService.health();
  }

  @Get("db/hello")
  async dbHello() {
    const existing = await this.em.findOne(Hello, { message: "Hello World" });
    if (existing) return existing;

    const hello = this.em.create(Hello, { message: "Hello World" });
    this.em.persist(hello);
    await this.em.flush();
    return hello;
  }
}
