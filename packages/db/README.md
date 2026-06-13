# @lentil/db

Shared database package — entities, migrations, and MikroORM configuration.

## Tech Stack

- **ORM**: MikroORM 6.x
- **Dev driver**: libsql (SQLite, WASM, no native compilation)
- **Production driver**: PostgreSQL
- **CLI**: @mikro-orm/cli

## Structure

```
packages/db/
  mikro-orm.config.ts      # CLI config (reads env directly)
  migrations/              # Migration files (NNN-description.ts)
  src/
    entities/
      hello.entity.ts
    setup-db.ts            # Shared config factory
    database.module.ts     # NestJS @Global module
    index.ts               # Barrel export
  tsconfig.json            # CLI tsconfig
  tsconfig.build.json      # Build tsconfig (extends @lentil/config)
```

## Usage

Import entities and module from `@lentil/db`:

```typescript
import { Hello, DatabaseModule } from "@lentil/db";
```

## Migrations

Migrations are manually maintained in `migrations/` with the naming convention `NNN-description.ts`. Each migration exports `up()` and `down()` methods with multi-database SQL.

### Creating a new migration

Create a file in `migrations/` with the next sequence number:

```
migrations/
  001-init.ts
  002-add-user.ts
  003-add-orders.ts
```

### Applying migrations

```sh
cd packages/db
npx mikro-orm migration:up
```

Migrations are also applied automatically when the backend starts via `orm.migrator.up()` in `AppModule.onModuleInit()`.

## Commands

```sh
pnpm build                # Compile TypeScript to dist/
pnpm migration:up         # Apply pending migrations
pnpm migration:create     # Generate migration from entity diff (rarely used)
```
