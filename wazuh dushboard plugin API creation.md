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