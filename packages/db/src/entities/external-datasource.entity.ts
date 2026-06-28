import {
  Entity,
  EntityProperty,
  JsonType,
  Platform,
  PrimaryKey,
  Property,
  Type,
} from "@mikro-orm/core";
import { v7 as uuidv7 } from "uuid";

/**
 * Custom MikroORM type that stores dates as epoch-millisecond integers.
 *
 * MikroORM v6's built-in {@link DateTimeType} is an identity pass-through —
 * it does not convert between JS `Date` and its database representation.
 * This type explicitly converts:
 *
 * - **JS → DB**: `Date.getTime()` → integer milliseconds
 * - **DB → JS**: `new Date(+value)` → `Date` (coerces string values from
 *   SQLite TEXT columns)
 *
 * Using an integer column avoids the Invalid Date problem that occurs in
 * Node.js v24 when `new Date("1782381141378")` is called with a numeric string.
 */
class TimestampType extends Type<Date, number> {
  convertToDatabaseValue(
    value: Date | undefined,
    _platform: Platform,
  ): number {
    if (!value) return 0;
    return value.getTime();
  }

  convertToJSValue(
    value: number | string | undefined,
    _platform: Platform,
  ): Date {
    if (value == null || value === "") return new Date(0);
    // Coerce to number — SQLite TEXT columns return strings
    return new Date(+value);
  }

  getColumnType(_prop: EntityProperty, _platform: Platform): string {
    return "integer";
  }
}

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

  @Property({ type: TimestampType })
  createdAt: Date = new Date();

  @Property({ type: TimestampType, onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
