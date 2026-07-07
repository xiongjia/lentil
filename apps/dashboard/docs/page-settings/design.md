# Settings Page — Design Document

The Settings page lets users manage external data source configurations.
It provides a full CRUD interface backed by the `integration` RPC contract
defined in `packages/rpc/src/integration.ts`.

---

## Architecture Overview

```
┌───────────────────────┐     ┌───────────────────────┐     ┌──────────────────┐
│  Settings Page        │────▶│  RPC Client           │────▶│  Backend         │
│  (page orchestration) │     │  (apps/dashboard/     │     │  Integration     │
│                       │     │   src/lib/rpc.ts)     │     │  Service         │
│  ┌─────────────────┐  │     │                       │     │                  │
│  │ DatasourceList  │──┼────▶│  integration.list()   │────▶│  CRUD + Test     │
│  │                 │  │     │  integration.get()    │     │                  │
│  │ DatasourceForm  │──┼────▶│  integration.create() │────▶│  PostgreSQL      │
│  │ (Dialog)        │  │     │  integration.update() │     │  Driver          │
│  │                 │  │     │  integration.remove() │     │                  │
│  │ DatasourceDelete│──┼────▶│  integration.test()   │────▶│  Connection Test │
│  │ (AlertDialog)   │  │     │                       │     │                  │
│  └─────────────────┘  │     └───────────────────────┘     └──────────────────┘
└───────────────────────┘
```

**Component ownership**:

- `@lentil/ui` — Provides primitive UI components (`Table`, `Dialog`, `AlertDialog`, `Input`, `Button`, `Select`, `Card`)
- `apps/dashboard` — Business components (`DatasourceList`, `DatasourceForm`, `DatasourceDeleteDialog`) and page orchestration (`Settings`)

---

## RPC Contract (`packages/rpc/src/integration.ts`)

| Procedure | Method | Path                  | Input                                  | Output                            |
| --------- | ------ | --------------------- | -------------------------------------- | --------------------------------- |
| `list`    | POST   | `/integration/list`   | —                                      | `ExternalDataSource[]`            |
| `get`     | POST   | `/integration/get`    | `{ id: uuid }`                         | `ExternalDataSource`              |
| `create`  | POST   | `/integration/create` | `{ type, config, name, description? }` | `SaveDatasourceResult`            |
| `update`  | POST   | `/integration/update` | `{ id, name?, description?, config? }` | `SaveDatasourceResult`            |
| `remove`  | POST   | `/integration/remove` | `{ id: uuid }`                         | `void`                            |
| `test`    | POST   | `/integration/test`   | `{ type, config }`                     | `{ ok: boolean, error?: string }` |

### `ExternalDataSource` Schema

| Field         | Type               | Notes                                  |
| ------------- | ------------------ | -------------------------------------- |
| `id`          | `string (UUID v7)` | Primary key                            |
| `name`        | `string`           | Human-readable, e.g. `"production-pg"` |
| `description` | `string \| null`   | Optional notes                         |
| `type`        | `"postgresql"`     | Driver discriminator (union)           |
| `config`      | `object`           | Driver-specific connection parameters  |
| `enabled`     | `boolean`          | Whether the data source is active      |
| `createdAt`   | `Date`             | Row creation timestamp                 |
| `updatedAt`   | `Date`             | Row last-update timestamp              |

### `SaveDatasourceResult` Schema

Extends `ExternalDataSource` with a `connectionTest` field:

| Field            | Type                              | Notes                                                      |
| ---------------- | --------------------------------- | ---------------------------------------------------------- |
| `connectionTest` | `{ ok: boolean, error?: string }` | Result of the auto-run connection test after create/update |

### `CreateDatasourceInput` Schema

| Field         | Type           | Constraint      |
| ------------- | -------------- | --------------- |
| `type`        | `"postgresql"` | Discriminated   |
| `config`      | `object`       | Driver-specific |
| `name`        | `string`       | Unique          |
| `description` | `string`       | Optional        |

### `UpdateDatasourceInput` Schema

| Field         | Type            | Constraint                      |
| ------------- | --------------- | ------------------------------- |
| `id`          | `string (UUID)` | —                               |
| `name`        | `string`        | Optional, unique                |
| `description` | `string`        | Optional                        |
| `config`      | `object`        | Optional, partial driver config |

### Supported Drivers (Current)

| Type         | Config Fields                                          |
| ------------ | ------------------------------------------------------ |
| `postgresql` | `host`, `port`, `database`, `user`, `password`, `max?` |

---

## Component Tree

```
<Settings>                         ← page orchestration
  ├─ header (title + Add button)
  ├─ Test alert banner              ← ephemeral connection test result
  ├─ <DatasourceList>               ← data source table
  │    ├─ <Table>                   ← @lentil/ui Table
  │    │    └─ rows: Edit / Test Connection / Delete buttons
  │    └─ empty state
  ├─ <DatasourceForm>               ← create / edit dialog
  │    ├─ <Dialog>                  ← @lentil/ui Dialog
  │    ├─ <Input>                   ← name, description, host, port, etc.
  │    ├─ <Select>                  ← datasource type
  │    └─ action bar (Save / Cancel)
  └─ <DatasourceDeleteDialog>       ← delete confirmation
       └─ <AlertDialog>             ← @lentil/ui AlertDialog
```

---

## Component Details

### 1. `DatasourceList` (`apps/dashboard/src/components/datasource-list.tsx`)

**Props**:

| Prop         | Type                                        | Description                                            |
| ------------ | ------------------------------------------- | ------------------------------------------------------ |
| `refreshKey` | `number`                                    | Monotonically increasing key; bump to trigger re-fetch |
| `onEdit`     | `(ds: ExternalDataSource) => void`          | Opens the edit dialog for this ds                      |
| `onDelete`   | `(ds: ExternalDataSource) => void`          | Opens the delete confirmation                          |
| `onTest`     | `(ds: ExternalDataSource) => Promise<void>` | Runs a manual connection test                          |

**States**:

- **Loading**: Shows "Loading..." while fetching
- **Empty**: Shows "No data sources configured yet." centered message
- **Error**: Shows error message above the table
- **Data**: Renders a `<Table>` with rows showing name, type, enabled status, updatedAt, and action buttons

**Behavior**:

- Calls `rpc.integration.list()` on mount and whenever `refreshKey` changes
- The Test button calls `onTest(ds)` which triggers `rpc.integration.test()` and shows an alert banner
- Edit / Delete buttons delegate to parent callbacks

### 2. `DatasourceForm` (`apps/dashboard/src/components/datasource-form.tsx`)

**Props**:

| Prop           | Type                              | Description                                                    |
| -------------- | --------------------------------- | -------------------------------------------------------------- |
| `open`         | `boolean`                         | Dialog visibility                                              |
| `onOpenChange` | `(open: boolean) => void`         | Dialog close handler                                           |
| `onSaved`      | `() => void`                      | Callback after successful create/update; triggers list refresh |
| `datasource`   | `ExternalDataSource \| undefined` | `undefined` = create mode, defined = edit mode                 |

**Modes**:

- **Create** (`datasource === undefined`): Title "Add Data Source", all fields empty
- **Edit** (`datasource` defined): Title "Edit Data Source", fields pre-filled from existing record

**Behavior**:

- Type selector (`<select>`) — currently only `"postgresql"` is available
- Dynamic config fields based on selected type (e.g., host, port, database, user, password)
- On submit:
  1. Calls `rpc.integration.create()` or `rpc.integration.update()` depending on mode
  2. The response includes a `connectionTest` result
  3. If `connectionTest.ok === false`, shows the error inline and does NOT close the dialog — user can fix and retry
  4. If `connectionTest.ok === true`, shows a success message, calls `onSaved()`, and closes the dialog
- Cancel button closes the dialog without saving
- Loading state on submit button while the request is in flight

### 3. `DatasourceDeleteDialog` (`apps/dashboard/src/components/datasource-delete-dialog.tsx`)

**Props**:

| Prop           | Type                         | Description                         |
| -------------- | ---------------------------- | ----------------------------------- |
| `open`         | `boolean`                    | Dialog visibility                   |
| `onOpenChange` | `(open: boolean) => void`    | Dialog close handler                |
| `onDeleted`    | `() => void`                 | Callback after successful deletion  |
| `datasource`   | `ExternalDataSource \| null` | The data source to confirm deletion |

**Behavior**:

- Shows a confirmation message: `"Are you sure you want to delete \"{name}\"?"`
- Confirm button calls `rpc.integration.remove({ id })`
- On success: calls `onDeleted()`, closes dialog
- On failure: shows error message inline
- Cancel button closes without action

### 4. `Settings` Page (`apps/dashboard/src/pages/settings.tsx`)

**State Management**:

| State        | Type                                       | Purpose                                |
| ------------ | ------------------------------------------ | -------------------------------------- |
| `refreshKey` | `number`                                   | Forces DatasourceList to re-fetch      |
| `formOpen`   | `boolean`                                  | Create/Edit dialog visibility          |
| `editing`    | `ExternalDataSource \| undefined`          | Which ds to edit; `undefined` = create |
| `deleting`   | `ExternalDataSource \| null`               | Which ds to delete; `null` = no dialog |
| `testAlert`  | `{ ok: boolean, message: string } \| null` | Test result banner state               |

**Orchestration Flow**:

```
User clicks "Add Data Source" button
  → setEditing(undefined), setFormOpen(true)
  → DatasourceForm opens in Create mode

User clicks "Edit" on a row
  → setEditing(ds), setFormOpen(true)
  → DatasourceForm opens in Edit mode with pre-filled fields

User clicks "Test Connection" on a row
  → onTest(ds) calls rpc.integration.test({ type, config })
  → sets testAlert with success/failure message
  → Banner rendered above list

User clicks "Delete" on a row
  → setDeleting(ds)
  → DatasourceDeleteDialog opens

Form saves successfully
  → onSaved() bumps refreshKey
  → DatasourceList re-fetches

Delete completes
  → onDeleted() bumps refreshKey
  → DatasourceList re-fetches
```

---

## RPC Client (`apps/dashboard/src/lib/rpc.ts`)

The `RPCClient` interface mirrors the integration contract:

```typescript
interface RPCClient {
  integration: {
    list(): Promise<ExternalDataSource[]>;
    get(input: { id: string }): Promise<ExternalDataSource>;
    create(input: CreateDatasourceInput): Promise<SaveDatasourceResult>;
    update(input: UpdateDatasourceInput): Promise<SaveDatasourceResult>;
    remove(input: { id: string }): Promise<void>;
    test(input: {
      type: string;
      config: Record<string, unknown>;
    }): Promise<ConnectionTest>;
  };
}
```

Types are re-exported from `@lentil/rpc` for consumer convenience:

```typescript
export type {
  ExternalDataSource,
  SaveDatasourceResult,
  ConnectionTest,
  CreateDatasourceInput,
  UpdateDatasourceInput,
} from "@lentil/rpc";
```

---

## File Layout

```
apps/dashboard/src/
├── components/
│   ├── datasource-list.tsx            ← DatasourceList component
│   ├── datasource-list.test.tsx       ← DatasourceList tests
│   ├── datasource-form.tsx            ← DatasourceForm component
│   ├── datasource-form.test.tsx       ← DatasourceForm tests
│   ├── datasource-delete-dialog.tsx   ← DatasourceDeleteDialog component
│   └── ...
├── lib/
│   └── rpc.ts                        ← RPCClient interface (already extended)
└── pages/
    └── settings.tsx                   ← Page orchestration (rewritten)
    └── settings.test.tsx              ← Settings page tests (updated)
```

---

## Error Handling

| Scenario                         | Behavior                                                         |
| -------------------------------- | ---------------------------------------------------------------- |
| List fails to load               | Shows error message above table, empty state hidden              |
| Create/Update fails (network)    | Shows error in dialog footer, dialog stays open                  |
| Create/Update fails (connection) | Shows `connectionTest.error` in dialog footer, dialog stays open |
| Delete fails                     | Shows error inline in the AlertDialog, dialog stays open         |
| Test connection fails            | Shows red alert banner with error details                        |
| Test connection succeeds         | Shows green alert banner with success message                    |
| Empty state                      | Shows "No data sources configured yet." placeholder              |

---

## Test Coverage

| Test File                  | Tests | What's Covered                                         |
| -------------------------- | ----- | ------------------------------------------------------ |
| `datasource-list.test.tsx` | 4     | Renders rows, empty state, error state, action buttons |
| `datasource-form.test.tsx` | 4     | Create mode, edit mode, validation, save handler       |
| `settings.test.tsx`        | 7     | Page title, add/edit/delete flows, test connection     |
