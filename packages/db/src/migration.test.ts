import { describe, it, expect, beforeAll } from "vitest";
import { MikroORM } from "@mikro-orm/core";
import { LibSqlDriver } from "@mikro-orm/libsql";
import { Migrator } from "@mikro-orm/migrations";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { Hello } from "./entities/hello.entity";

describe("migration", () => {
  let orm: MikroORM;

  beforeAll(async () => {
    orm = await MikroORM.init<LibSqlDriver>({
      driver: LibSqlDriver,
      dbName: ":memory:",
      entities: [Hello],
      extensions: [Migrator],
      migrations: {
        path: "./migrations",
      },
      metadataProvider: TsMorphMetadataProvider,
    });
  });

  it("applies 001-init migration", async () => {
    const migrator = orm.migrator;
    await migrator.up();

    const pending = await migrator.getPendingMigrations();
    expect(pending).toHaveLength(0);

    // Verify the hello table was created
    const tables = await orm.em
      .getConnection()
      .execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='hello'",
      );
    expect(tables).toHaveLength(1);

    // Verify mikro_orm_migrations table exists
    const migTables = await orm.em
      .getConnection()
      .execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='mikro_orm_migrations'",
      );
    expect(migTables).toHaveLength(1);

    await orm.close();
  });
});
