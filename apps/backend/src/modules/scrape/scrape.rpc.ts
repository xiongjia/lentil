import { contract } from "@lentil/rpc";
import { Controller } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { ScrapeService } from "./scrape.service";

/**
 * oRPC endpoints for scrape cache CRUD + execution.
 *
 * All routes are mounted under /rpc (see `@Controller("rpc")`).
 */
@Controller("rpc")
export class ScrapeRPC {
  constructor(private readonly scrapeService: ScrapeService) {}

  @Implement(contract.scrape.execute)
  execute() {
    return implement(contract.scrape.execute).handler(async ({ input }) => {
      return await this.scrapeService.execute(input);
    });
  }

  @Implement(contract.scrape.list)
  list() {
    return implement(contract.scrape.list).handler(async () => {
      return await this.scrapeService.list();
    });
  }

  @Implement(contract.scrape.get)
  get() {
    return implement(contract.scrape.get).handler(async ({ input: { id } }) => {
      return await this.scrapeService.get(id);
    });
  }

  @Implement(contract.scrape.remove)
  remove() {
    return implement(contract.scrape.remove).handler(
      async ({ input: { id } }) => {
        await this.scrapeService.remove(id);
      },
    );
  }
}
