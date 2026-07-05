import { Migration } from "@mikro-orm/migrations";

export class Migration002ScrapeCache extends Migration {
  override async up(): Promise<void> {
    const isPostgres = this.getKnex().client.config.client === "pg";

    if (isPostgres) {
      this.addSql(`
        CREATE TABLE IF NOT EXISTS "scrape_cache" (
          "id" UUID NOT NULL,
          "datasource_id" VARCHAR NOT NULL,
          "query" TEXT NOT NULL,
          "status" VARCHAR NOT NULL DEFAULT 'running',
          "columns" JSONB NOT NULL DEFAULT '[]',
          "rows" JSONB NOT NULL DEFAULT '[]',
          "row_count" INTEGER NOT NULL DEFAULT 0,
          "error" TEXT NULL,
          "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "scrape_cache_pkey" PRIMARY KEY ("id")
        );
      `);
    } else {
      // SQLite / libsql
      this.addSql(`
        CREATE TABLE IF NOT EXISTS "scrape_cache" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "datasource_id" TEXT NOT NULL,
          "query" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'running',
          "columns" TEXT NOT NULL DEFAULT '[]',
          "rows" TEXT NOT NULL DEFAULT '[]',
          "row_count" INTEGER NOT NULL DEFAULT 0,
          "error" TEXT NULL,
          "created_at" BIGINT NOT NULL DEFAULT (unixepoch('now') * 1000),
          "updated_at" BIGINT NOT NULL DEFAULT (unixepoch('now') * 1000)
        );
      `);
    }
  }

  override async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "scrape_cache";');
  }
}
