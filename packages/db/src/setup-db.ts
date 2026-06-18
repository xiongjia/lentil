import type { Options } from "@mikro-orm/core";
import { ConfigService } from "@nestjs/config";
import * as path from "node:path";
import "@mikro-orm/migrations"; // auto-registers Migrator extension
import { Migrator } from "@mikro-orm/migrations";
import { Hello } from "./entities/hello.entity.js";

// __dirname is …/dist or …/src depending on dev vs compiled.
// Aboslute paths avoid CWD differences.
// __dirname = …/dist/src → pkgRoot = …/
const pkgRoot = path.resolve(__dirname, "..", "..");
const migrationsDir = path.resolve(pkgRoot, "dist", "migrations");

export const getMikroOrmConfig = (config: ConfigService): Options => {
  const dbType = config.get<string>("DB_TYPE", "libsql");

  const base = {
    entities: [Hello],
    extensions: [Migrator],
    migrations: {
      path: migrationsDir,
      snapshot: false,
    },
  };

  if (dbType === "postgresql") {
    return {
      ...base,
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- MikroORM driver must be loaded dynamically for optional PG dependency
      driver: require("@mikro-orm/postgresql").PostgreSqlDriver,
      host: config.get("DB_HOST", "localhost"),
      port: config.get("DB_PORT", 5432),
      user: config.get("DB_USER", "postgres"),
      password: config.get("DB_PASSWORD", "postgres"),
      dbName: config.get("DB_NAME", "lentil"),
    };
  }

  // default: SQLite via libsql
  return {
    ...base,
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- libsql driver loaded dynamically
    driver: require("@mikro-orm/libsql").LibSqlDriver,
    dbName: config.get("DB_NAME", ".local/lentil.db"),
  };
};
