# Quick Setup: Create PocketBase Collections via API

PocketBase applies our migrations automatically when the container starts, so the `value_quarters` and `counters` collections (with seed data) are provisioned for you. The steps below are kept for troubleshooting or manual recreation.

## Option 1: Via Admin UI

1. Go to http://localhost:8090/_/
2. Login with admin credentials
3. Create the collections as described in POCKETBASE_SETUP.md

## Option 2: Via API (Manual)

Run these commands from your terminal:

### 1. Login to get admin token

```bash
# Replace with your admin email/password
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="yourpassword"

# Get admin token
TOKEN=$(curl -s -X POST http://localhost:8090/api/admins/auth-with-password \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  | grep -o '"token":"[^\"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
```

### 2. Create counters collection

```bash
curl -X POST http://localhost:8090/api/collections \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "counters",
    "type": "base",
    "schema": [
      {
        "name": "value",
        "type": "number",
        "required": true,
        "options": {
          "min": null,
          "max": null
        }
      }
    ],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": null
  }'
```

### 3. Create value_quarters collection

```bash
curl -X POST http://localhost:8090/api/collections \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "value_quarters",
    "type": "base",
    "schema": [
      {
        "name": "quarter",
        "type": "text",
        "required": true,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "name": "value",
        "type": "number",
        "required": true,
        "options": {
          "min": null,
          "max": null
        }
      }
    ],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": null,
    "indexes": [
      "CREATE UNIQUE INDEX idx_value_quarters_quarter ON value_quarters (quarter)"
    ]
  }'
```

### 4. Seed data manually (optional)

```bash
# Example: insert a single counter record with id "main"
curl -X POST http://localhost:8090/api/collections/counters/records \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"main", "value": 0}'

# Example: insert a quarterly value
curl -X POST http://localhost:8090/api/collections/value_quarters/records \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quarter": "1999Q1", "value": 123456}'
```
