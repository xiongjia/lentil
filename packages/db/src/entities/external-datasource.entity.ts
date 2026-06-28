import {
  DateTimeType,
  Entity,
  JsonType,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { v7 as uuidv7 } from "uuid";

@Entity({ tableName: "external_datasource" })
export class ExternalDataSourceEntity {
  @PrimaryKey({ type: "uuid" })
  id: string = uuidv7();

  @Property({ unique: true })
  name!: string;

  @Property({ nullable: true, length: 500 })
  description?: string;

  @Property()
  type!: string;

  @Property({ type: JsonType })
  config!: Record<string, unknown>;

  @Property({ default: true })
  enabled!: boolean;

  @Property({ type: DateTimeType })
  createdAt: Date = new Date();

  @Property({ type: DateTimeType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
