import { Migration } from "@mikro-orm/migrations";

export class Migration001Init extends Migration {
  override async up(): Promise<void> {
    const isPostgres = this.getKnex().client.config.client === "pg";

    if (isPostgres) {
      this.addSql(`
        CREATE TABLE IF NOT EXISTS "external_datasource" (
          "id" UUID NOT NULL,
          "name" VARCHAR NOT NULL,
          "description" VARCHAR(500) NULL,
          "type" VARCHAR NOT NULL,
          "config" JSONB NOT NULL,
          "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
          "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "external_datasource_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "external_datasource_name_unique" UNIQUE ("name")
        );
      `);
    } else {
      // SQLite / libsql — unixepoch() returns seconds; multiply for milliseconds.
      this.addSql(`
        CREATE TABLE IF NOT EXISTS "external_datasource" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL UNIQUE,
          "description" TEXT NULL,
          "type" TEXT NOT NULL,
          "config" TEXT NOT NULL DEFAULT '{}',
          "enabled" INTEGER NOT NULL DEFAULT 1,
          "created_at" BIGINT NOT NULL DEFAULT (unixepoch('now') * 1000),
          "updated_at" BIGINT NOT NULL DEFAULT (unixepoch('now') * 1000)
        );
      `);
    }
  }

  override async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "external_datasource";');
  }
}
