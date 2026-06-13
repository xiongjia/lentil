import { Migration } from "@mikro-orm/migrations";

export class Migration001Init extends Migration {
  override async up(): Promise<void> {
    const isPostgres =
      this.driver.getPlatform().getConfig().get("driver")?.name ===
      "PostgreSqlDriver";

    if (isPostgres) {
      this.addSql(
        `create table "hello" ("id" serial primary key, "message" varchar not null);`,
      );
    } else {
      // SQLite / libsql
      this.addSql(
        `create table "hello" ("id" integer not null primary key autoincrement, "message" text not null);`,
      );
    }
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "hello";`);
  }
}
