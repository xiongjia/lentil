import {
  DateTimeType,
  Entity,
  JsonType,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { v7 as uuidv7 } from "uuid";

@Entity({ tableName: "scrape_cache" })
export class ScrapeCacheEntity {
  @PrimaryKey({ type: "uuid" })
  id: string = uuidv7();

  @Property()
  datasourceId!: string;

  @Property()
  query!: string;

  @Property({ default: "running" })
  status!: "running" | "done" | "failed";

  @Property({ type: JsonType })
  columns!: string[];

  @Property({ type: JsonType })
  rows!: Record<string, unknown>[];

  @Property({ default: 0 })
  rowCount!: number;

  @Property({ nullable: true })
  error?: string;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
