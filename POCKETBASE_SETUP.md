# PocketBase Setup Instructions for Counter Feature

## Collections Provisioned Automatically

PocketBase now runs our embedded Go application (in `pocketbase/app/`) which applies migrations on startup. Those migrations:

- create a `value_quarters` collection with a unique index on `quarter`
- populate every quarter from `1999Q1` through `2025Q4`
- create a `counters` collection and insert a default record with id `main`

You only need the manual steps below if you intentionally want to recreate the schema from the UI.

### 1. counters Collection

Access PocketBase admin UI at `http://localhost:8090/_/` and create a new collection:

**Collection Name**: `counters`
**Collection Type**: Base Collection

**Fields**:
1. `value`
   - Type: Number
   - Options: Required, Default value: 0

Create a single record with id `main` and `value = 0` if you need to bootstrap data manually.

---

### 2. value_quarters Collection

**Collection Name**: `value_quarters`
**Collection Type**: Base Collection

**Fields**:
1. `quarter`
   - Type: Text
   - Options: Required, Unique

2. `value`
   - Type: Number
   - Options: Required

Create a unique index over `quarter` (e.g. `CREATE UNIQUE INDEX idx_value_quarters_quarter ON value_quarters (quarter)`) to prevent duplicate entries.

**API Rules** (for MVP):
- List/View rule: `@request.auth.id != "" || @request.auth.id = ""` (Allow all)
- Create rule: `@request.auth.id != "" || @request.auth.id = ""` (Allow all)
- Update rule: `@request.auth.id != "" || @request.auth.id = ""` (Allow all)
- Delete rule: Leave empty (no deletions)

---

## Initial Data

### Create Counter Record

In the `counters` collection, create one record:
- `id`: "main"
- `value`: 0

### Seed Chart Data

In the `chart_data` collection, create these records:

| quarter  | value |
|----------|-------|
| Q1 2023  | 42    |
| Q2 2023  | 58    |
| Q3 2023  | 51    |
| Q4 2023  | 73    |
| Q1 2024  | 67    |
| Q2 2024  | 82    |
| Q3 2024  | 75    |
| Q4 2024  | 91    |

---

## Verification

After setup, verify:

1. Navigate to `http://localhost:8090/api/collections/counters/records`
   - Should see one record with id="main"

2. Navigate to `http://localhost:8090/api/collections/chart_data/records`
   - Should see 8 quarterly records

3. Both collections should be accessible without authentication errors (for MVP)
