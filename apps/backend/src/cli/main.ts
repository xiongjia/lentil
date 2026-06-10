#!/usr/bin/env node
import { CommandFactory } from "nest-commander";
import { CliModule } from "./cli.module";

const bootstrap = async () => {
  await CommandFactory.run(CliModule);
};

bootstrap();
