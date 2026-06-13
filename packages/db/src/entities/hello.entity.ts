import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Hello {
  @PrimaryKey()
  id!: number;

  @Property()
  message!: string;
}
