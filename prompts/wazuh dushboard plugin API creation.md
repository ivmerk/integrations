Need to make new API points in plugin Integarations.


POST /device  
Create a new device and return its generated UID.
Request body (JSON)
 Required:
- name (string)    
- connection (string, only “syslog” so far)
- groups_filter (string)
 Optional:    
- allowed_ips (CIDR/IP)
- rules_file (string)
- decoders_file (string)
Example request  
{  
"name": "Scopd DLP",  
"connection": “syslog”  
"groups_filter": “scopd”,  
"allowed_ips": "192.168.2.0/24",  
"rules_file": "scopd_rules.xml",  
"decoders_file": "scopd_decoders.xml"  
}
Success response body (JSON):  
{  
"uid": "01HZWK4A3H9Q2T8K8YV2Z9M1QK"  
}
Note. Plugin must to create UID and store object with uid in indexer


GET /device  
If a UID is provided, return that device, otherwise return all devices.

Request

- Optional query parameter:
- uid (string)

Examples:
- Get one device:
 GET /device?uid=01HZWK4A3H9Q2T8K8YV2Z9M1QK
- Get all devices:
GET /device


Success response body (single device)
{  
"uid": "01HZWK4A3H9Q2T8K8YV2Z9M1QK",  
"name": "Scopd DLP",  
"connection": "syslog",  
"groups_filter": "scopd",  
"allowed_ips": "192.168.2.0/24",  
"rules_file": "scopd_rules.xml",  
"decoders_file": "scopd_decoders.xml",  
"created_at": "2026-02-15T12:34:56Z"  
}

Success response body (all devices)  
[{  
"uid": "01HZWK4A3H9Q2T8K8YV2Z9M1QK",  
"name": "Scopd DLP",  
"connection": "syslog",  
"groups_filter": "scopd",  
"allowed_ips": "192.168.2.0/24",  
"rules_file": "scopd_rules.xml",  
"decoders_file": "scopd_decoders.xml",  
"created_at": "2026-02-15T12:34:56Z"  
},  
{  
"uid": "01HZWK7KQ1S8F1V0B6C9D2E3F4",  
"name": "A second device",  
"connection": "syslog",  
"groups_filter": "firewall",  
"allowed_ips": "10.10.0.0/16",  
"rules_file": null,  
"decoders_file": null,  
"created_at": "2026-02-15T13:01:10Z"  
}]
Note. Plugins server must to in Wazuh Indexer and take object by UID or all devices
DELETE /device?uid={uid}
Delete a device by UID.
Request
Required query parameter:


uid (string)


Example
DELETE /device?uid=01HZWK4A3H9Q2T8K8YV2Z9M1QK

















Test Cases
1. GET with non-existent uid
   Given there is no device with uid "NON_EXISTENT_UID" in the system.
   When I send GET /devices?uid=NON_EXISTENT_UID.
   Then the response status is 404 Not Found.
   And the response body indicates the device was not found (error message/code).

2. GET without uid (return all devices)
   Given the API is reachable.
   When I send GET /devices (no uid query parameter).
   Then the response status is 200 OK.
   And the response body is an empty list/array of devices.
   And each device includes at least: uid, name, connection, groups_filter, and optional fields when present.

3. POST with name missing
   Given a request body that omits name and includes valid connection="syslog" and valid groups_filter.
   When I send POST /devices with the body below.
   Then the response status is 400 Bad Request.
   And the response body explains that name is required.
   Example request body:
   {
   "connection": "syslog",
   "groups_filter": "scopd"
   }

4. POST with connection missing
   Given a request body that omits connection and includes valid name and valid groups_filter.
   When I send POST /devices with the body below.
   Then the response status is 400 Bad Request.
   And the response body explains that connection is required.
   Example request body:
   {
   "name": "Scopd DLP",
   "groups_filter": "scopd"
   }

5. POST with connection not equal to "syslog"
   Given a request body with valid name and groups_filter but connection has a non-syslog value.
   When I send POST /devices with the body below.
   Then the response status is 400 Bad Request.
   And the response body explains that connection is incorrect.
   Example request body:
   {
   "name": "Scopd DLP",
   "connection": "http",
   "groups_filter": "scopd"
   }

6. POST with groups_filter missing
   Given a request body that omits groups_filter and includes valid name and connection="syslog".
   When I send POST /devices with the body below.
   Then the response status is 400 Bad Request.
   And the response body explains that groups_filter is required.
   Example request body:
   {
   "name": "Scopd DLP",
   "connection": "syslog"
   }

7. POST with invalid allowed_ips
   Given a request body with required fields valid.
   And allowed_ips is provided but is not a valid IP or CIDR network.
   When I send POST /devices with the body below.
   Then the response status is 400 Bad Request.
   And the response body explains that allowed_ips must be a valid IP address or CIDR network.
   Example request body:
   {
   "name": "Scopd DLP",
   "connection": "syslog",
   "groups_filter": "scopd",
   "allowed_ips": "999.1.1.1"
   }

8. POST with non-existent rules_file
   Given a request body with required fields valid.
   And rules_file is provided but refers to a file that does not exist on the server.
   When I send POST /devices with the body below.
   Then the response status is 400 Bad Request (or 404, per your design).
   And the response body explains that rules_file does not exist / cannot be found.
   Example request body:
   {
   "name": "Scopd DLP",
   "connection": "syslog",
   "groups_filter": "scopd",
   "rules_file": "missing_rules.xml"
   }

9. POST with non-existent decoders_file
   Given a request body with required fields valid.
   And decoders_file is provided but refers to a file that does not exist on the server.
   When I send POST /devices with the body below.
   Then the response status is 400 Bad Request (or 404, per your design).
   And the response body explains that decoders_file does not exist / cannot be found.
   Example request body:
   {
   "name": "Scopd DLP",
   "connection": "syslog",
   "groups_filter": "scopd",
   "decoders_file": "missing_decoders.xml"
   }

10. POST (all correct) → GET → DELETE → GET
    Given allowed_ips is a valid IP/CIDR and rules_file and decoders_file exist on the server.
    When I send POST /devices with the body below.
    Then the response status is 201 Created (or 200 OK).
    And the response body contains a non-empty uid.
    And the device configuration file contains allowed-ips set to "192.168.2.0/24".
    And the rules_file "scopd_rules.xml" was copied to the server rules destination for this device.
    And the decoders_file "scopd_decoders.xml" was copied to the server decoders destination for this device.
    When I send GET /devices?uid=<uid_from_post>.
    Then the response status is 200 OK and the device matches the submitted fields.
    When I send DELETE /devices?uid=<uid_from_post>.
    Then the response indicates successful deletion (204 No Content or 200 OK).
    When I send GET /devices?uid=<uid_from_post> again.
    Then the response status is 404 Not Found.
    Example request body:
    {
    "name": "Scopd DLP",
    "connection": "syslog",
    "groups_filter": "scopd",
    "allowed_ips": "192.168.2.0/24",
    "rules_file": "scopd_rules.xml",
    "decoders_file": "scopd_decoders.xml"
    }

11. POST (correct, no allowed_ips) → GET → DELETE → GET
    Given rules_file and decoders_file exist on the server.
    When I send POST /devices with the body below (allowed_ips omitted).
    Then the response status is 201 Created (or 200 OK) and returns uid.
    And the device configuration file contains allowed-ips set to "0.0.0.0/0" (default when allowed_ips is omitted).
    And the rules_file "scopd_rules.xml" was copied to the server rules destination for this device.
    And the decoders_file "scopd_decoders.xml" was copied to the server decoders destination for this device.
    When I send GET /devices?uid=<uid_from_post>.
    Then the response status is 200 OK and allowed_ips is absent/null or equals "0.0.0.0/0" (per your schema).
    When I send DELETE /devices?uid=<uid_from_post>.
    Then the response indicates successful deletion.
    When I send GET /devices?uid=<uid_from_post> again.
    Then the response status is 404 Not Found.
    Example request body:
    {
    "name": "Scopd DLP",
    "connection": "syslog",
    "groups_filter": "scopd",
    "rules_file": "scopd_rules.xml",
    "decoders_file": "scopd_decoders.xml"
    }

12. POST (correct, no rules_file) → GET → DELETE → GET
    Given decoders_file exists on the server.
    When I send POST /devices with the body below (rules_file omitted).
    Then the response status is 201 Created (or 200 OK) and returns uid.
    And the device configuration file contains allowed-ips set to "192.168.2.0/24".
    And no rules_file was copied (no new per-device rules file is created).
    And the decoders_file "scopd_decoders.xml" was copied to the server decoders destination for this device.
    When I send GET /devices?uid=<uid_from_post>.
    Then the response status is 200 OK and rules_file is absent or null (per your schema).
    When I send DELETE /devices?uid=<uid_from_post>.
    Then the response indicates successful deletion.
    When I send GET /devices?uid=<uid_from_post> again.
    Then the response status is 404 Not Found.
    Example request body:
    {
    "name": "Scopd DLP",
    "connection": "syslog",
    "groups_filter": "scopd",
    "allowed_ips": "192.168.2.0/24",
    "decoders_file": "scopd_decoders.xml"
    }

13. POST (correct, no decoders_file) → GET → DELETE → GET
    Given rules_file exists on the server.
    When I send POST /devices with the body below (decoders_file omitted).
    Then the response status is 201 Created (or 200 OK) and returns uid.
    And the device configuration file contains allowed-ips set to "192.168.2.0/24".
    And the rules_file "scopd_rules.xml" was copied to the server rules destination for this device.
    And no decoders_file was copied (no new per-device decoders file is created).
    When I send GET /devices?uid=<uid_from_post>.
    Then the response status is 200 OK and decoders_file is absent or null (per your schema).
    When I send DELETE /devices?uid=<uid_from_post>.
    Then the response indicates successful deletion.
    When I send GET /devices?uid=<uid_from_post> again.
    Then the response status is 404 Not Found.
    Example request body:
    {
    "name": "Scopd DLP",
    "connection": "syslog",
    "groups_filter": "scopd",
    "allowed_ips": "192.168.2.0/24",
    "rules_file": "scopd_rules.xml"
    }

