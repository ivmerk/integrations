# Device API Testing Guide

## 1. Start the dashboard in dev mode

```bash
cd /Users/ivanmerkulov/myProjects/wazuh-dashboard
yarn start
```

This runs OpenSearch Dashboards on `localhost:5601` (default). Make sure OpenSearch itself is also running.

## 2. Test with curl

### Create a device (POST)

```bash
curl -X POST http://localhost:5601/api/integrations/device \
  -H "Content-Type: application/json" \
  -H "osd-xsrf: true" \
  -d '{
    "name": "Scopd DLP",
    "connection": "syslog",
    "groups_filter": "scopd",
    "allowed_ips": "192.168.2.0/24",
    "rules_file": "scopd_rules.xml",
    "decoders_file": "scopd_decoders.xml"
  }'
```

Expected: `{"uid":"01J..."}` with status 200.

### Get all devices (GET)

```bash
curl http://localhost:5601/api/integrations/device \
  -H "osd-xsrf: true"
```

Expected: array of all devices.

### Get one device by UID (GET)

```bash
curl "http://localhost:5601/api/integrations/device?uid=<UID_FROM_POST>" \
  -H "osd-xsrf: true"
```

Expected: single device object with all fields + `created_at`.

### Delete a device by UID (DELETE)

```bash
curl -X DELETE "http://localhost:5601/api/integrations/device?uid=<UID_FROM_POST>" \
  -H "osd-xsrf: true"
```

Expected: `{"message":"Device with uid=<UID> deleted"}` with status 200.

### Verify deletion (GET after DELETE)

```bash
curl "http://localhost:5601/api/integrations/device?uid=<UID_FROM_POST>" \
  -H "osd-xsrf: true"
```

Expected: 404 — "Device with uid=... not found".

## 3. Test from Dev Tools console

Navigate to Dev Tools (`localhost:5601/app/dev_tools#/console`) and run:

```
POST /api/integrations/device
{"name":"Test Device","connection":"syslog","groups_filter":"test"}

GET /api/integrations/device

DELETE /api/integrations/device?uid=<UID_FROM_POST>
```

## 4. Edge cases to verify

| Test | Expected result |
|---|---|
| POST without required field (e.g. no `name`) | 400 — schema validation error |
| POST with only required fields (no optional) | 200 — `allowed_ips`, `rules_file`, `decoders_file` stored as `null` |
| GET with non-existent UID | 404 — "Device with uid=... not found" |
| GET all when no devices created yet | 200 — empty array `[]` |
| DELETE with valid UID | 200 — `{"message":"Device with uid=... deleted"}` |
| DELETE with non-existent UID | 404 — "Device with uid=... not found" |
| GET after DELETE with same UID | 404 — device no longer exists |

## Note

If you have auth enabled, add `-u admin:admin` (or your credentials) to curl commands. The `osd-xsrf: true` header is required by OpenSearch Dashboards to prevent CSRF on non-GET requests.
