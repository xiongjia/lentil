import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MikroORM } from "@mikro-orm/core";
import { LibSqlDriver } from "@mikro-orm/libsql";
import { Migrator } from "@mikro-orm/migrations";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { Hello } from "./hello.entity";

describe("hello entity", () => {
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
    await orm.migrator.up();
  });

  it("creates and reads a Hello row", async () => {
    const em = orm.em.fork();

    const hello = em.create(Hello, { message: "Hello World" });
    em.persist(hello);
    await em.flush();

    const found = await em.findOne(Hello, { message: "Hello World" });
    expect(found).not.toBeNull();
    expect(found!.message).toBe("Hello World");
  });

  it("inserts and returns test data", async () => {
    const em = orm.em.fork();

    const hello = em.create(Hello, { message: "Hello World" });
    em.persist(hello);
    await em.flush();

    const found = await em.findOne(Hello, { message: "Hello World" });
    expect(found).not.toBeNull();
    expect(found!.message).toBe("Hello World");
    expect(found!.id).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await orm.close();
  });
});
