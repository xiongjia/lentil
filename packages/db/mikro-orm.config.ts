import { defineConfig } from "@mikro-orm/libsql";

export default defineConfig({
  dbName: process.env.DB_NAME || ".local/lentil.db",
  entities: ["./dist/entities"], // discovery via compiled output
  entitiesTs: ["./src/entities"], // dev: TS source
  migrations: {
    pathTs: "./migrations",
    snapshot: false,
  },
});
