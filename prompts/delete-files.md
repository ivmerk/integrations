Make changes in DELETE '/api/integrations/device' to delete files scopd_rules.xml and scopd_decoders.xml from the manager .
Firstly, receive object from saved objects by id.
sample:
curl "http://localhost:5601/api/integrations/device?uid=01KHXBX27Z20500W0SA0MG0V0V" \
-H "osd-xsrf: true"
{"uid":"01KHXBX27Z20500W0SA0MG0V0V","name":"Scopd DLP","connection":"syslog","groups_filter":"scopd","allowed_ips":"192.168.2.0/24","rules_file":"scopd_rules.xml","decoders_file":"scopd_decoders.xml","created_at":"2026-02-20T11:10:33.215Z"}%
Secondly, login to Wazuh Manager.
Thirdly, delete files scopd_rules.xml and scopd_decoders.xml from the manager if they exist in object.
api below:
DELETE /rules/files/{filename}
DELETE /decoders/files/{filename}
Fourthly, update file ossec.conf.xml in the manager, remove tag <remote> which has attributes <connection> with value from object.
Fifthly, restart Wazuh Manager.
Sixthly, delete object from saved objects.
Seventhly, return response with status 200.

