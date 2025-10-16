# PocketBase v0.30.0 Upgrade Notes

## Issue Summary
The Podman compose build was failing when upgrading to PocketBase v0.30.0 due to:
1. Invalid Go version (1.25.2 doesn't exist)
2. Breaking API changes in PocketBase v0.23+ that continued in v0.30.x

## Root Causes

### 1. Go Version Issue
- **Problem**: `go.mod` specified `go 1.25.2` and Dockerfile used `golang:1.25-alpine`
- **Fix**: Updated to `go 1.24.0` as required by PocketBase v0.30.0
- **Files Changed**:
  - `pocketbase/app/go.mod` (line 3)
  - `pocketbase/Dockerfile` (line 1)

### 2. PocketBase API Breaking Changes (v0.23+ to v0.30.x)
PocketBase v0.23.0 introduced major refactoring that removed the old `models`, `schema`, and `daos` packages in favor of a unified `core` package.

## Changes Made

### Migration File Updates (`pocketbase/app/migrations/migrations.go`)

#### Imports
**Before:**
```go
import (
    "github.com/pocketbase/dbx"
    "github.com/pocketbase/pocketbase/daos"
    "github.com/pocketbase/pocketbase/models"
    "github.com/pocketbase/pocketbase/models/schema"
)
```

**After:**
```go
import (
    "github.com/pocketbase/pocketbase/core"
    "github.com/pocketbase/pocketbase/tools/types"
)
```

#### Migration Registration
**Before:**
```go
m.Register(func(db dbx.Builder) error {
    dao := daos.New(db)
    // ...
}, func(db dbx.Builder) error {
    dao := daos.New(db)
    // ...
})
```

**After:**
```go
m.Register(func(app core.App) error {
    // Direct app access
    // ...
}, func(app core.App) error {
    // Direct app access
    // ...
})
```

#### Collection Creation
**Before:**
```go
collection := &models.Collection{
    Name:       "value_quarters",
    Type:       models.CollectionTypeBase,
    ListRule:   strPtr(""),
    Schema: schema.NewSchema(
        &schema.SchemaField{
            Name:     "quarter",
            Type:     schema.FieldTypeText,
            Required: true,
            Options:  &schema.TextOptions{},
        },
    ),
}
dao.SaveCollection(collection)
```

**After:**
```go
collection := core.NewBaseCollection("value_quarters")
collection.ListRule = types.Pointer("")
collection.Fields.Add(
    &core.TextField{
        Name:     "quarter",
        Required: true,
    },
)
app.Save(collection)
```

#### Record Creation
**Before:**
```go
record := models.NewRecord(collection)
record.SetId("main")
dao.SaveRecord(record)
```

**After:**
```go
record := core.NewRecord(collection)
record.Set("id", "maincounterid00")  // Must be 15+ chars, lowercase alphanumeric only
app.Save(record)
```

**Important**: PocketBase v0.30.x enforces:
- Minimum ID length: 15 characters
- ID pattern: `^[a-z0-9]+$` (lowercase letters and numbers only, no underscores or special chars)

#### Index Definition
**Before:**
```go
collection.Indexes = []string{
    "CREATE UNIQUE INDEX ...",
}
```

**After:**
```go
collection.Indexes = types.JSONArray[string]{
    "CREATE UNIQUE INDEX ...",
}
```

## Key API Changes in v0.30.x

1. **Unified Core Package**: `models`, `schema`, and `daos` merged into `core`
2. **Typed Field Constructors**: 
   - `core.TextField`, `core.NumberField`, etc.
   - Direct property assignment instead of options structs
3. **Simplified Operations**: 
   - `app.Save()` for both collections and records
   - `app.Delete()` for deletions
4. **Naming Conventions**: 
   - `JsonArray` → `JSONArray`
   - `SetId()` → `Set("id", value)`
5. **Helper Functions**: 
   - `types.Pointer()` for pointer creation

## Testing Results

✅ Go build successful
✅ Docker/Podman image build successful  
✅ Containers start without errors
✅ PocketBase server running at http://0.0.0.0:8090
✅ Migrations execute successfully
✅ Health checks passing

## Common Issues & Solutions

### Error: "id: Must be at least 15 character(s)"
**Cause**: Record IDs in PocketBase must be at least 15 characters long.
**Solution**: Use IDs with 15+ characters, e.g., `"maincounterid00"` instead of `"main"`

### Error: "id: Invalid value format"
**Cause**: IDs can only contain lowercase letters and numbers (pattern: `^[a-z0-9]+$`)
**Solution**: Remove underscores, hyphens, uppercase letters, or special characters from IDs
- ❌ `"main_counter_id"` (has underscores)
- ❌ `"MainCounterId00"` (has uppercase)
- ✅ `"maincounterid00"` (valid)

### Frontend 404/403 Errors After Upgrade
**Cause**: Frontend services reference old record IDs and collections lack public access rules
**Solution**: 
1. Update frontend service files to use new 15-char IDs
2. Update collection rules to allow public access where needed:
   ```go
   collection.CreateRule = types.Pointer("") // Allow public creation
   collection.UpdateRule = types.Pointer("") // Allow public updates
   ```

### Migration fails with "no required module provides package"
**Cause**: Dependencies not updated after changing PocketBase version
**Solution**: Run `go mod tidy` in the app directory

## References

- [PocketBase v0.30.0 Release Notes](https://github.com/pocketbase/pocketbase/releases/tag/v0.30.0)
- [PocketBase v0.23 Go Upgrade Guide](https://pocketbase.io/v023upgrade/go/)
- Minimum Go version: 1.24.0
- Default ID pattern: `^[a-z0-9]+$` (15+ chars)
