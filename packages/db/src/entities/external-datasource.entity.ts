import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { v7 as uuidv7 } from "uuid";

@Entity({ tableName: "external_datasource" })
export class ExternalDataSource {
  @PrimaryKey({ type: "uuid" })
  id: string = uuidv7();

  @Property({ unique: true })
  name!: string;

  @Property({ nullable: true, length: 500 })
  description?: string;

  @Property()
  type!: string;

  @Property({ type: "json" })
  config!: Record<string, unknown>;

  @Property({ default: true })
  enabled!: boolean;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
