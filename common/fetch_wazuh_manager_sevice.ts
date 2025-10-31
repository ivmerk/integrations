import {CONFIGURATION_FILES_PATH, SCOPD_RULES_CONTENT} from './constants';
import https from 'https';
import {WAZUH_MANAGER_URL} from "./constants";
import { readFileContent } from './file_utils';
import fetch from 'node-fetch';

// Extend the RequestInit type to include the agent property
interface CustomRequestInit extends RequestInit {
  agent?: https.Agent;
}

// Create an agent that doesn't reject self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export async function authenticateWazuh(): Promise<string> {
  console.log('Calling Wazuh authentication endpoint...');
  const url = `${WAZUH_MANAGER_URL}/security/user/authenticate`;

  const fetchOptions: CustomRequestInit = {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from('wazuh:wazuh').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    agent: httpsAgent,
  };

  try {
    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    return data.data.token;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Authentication failed: ${errorMessage}`);
  }
}

/**
 * Uploads an XML rule file to Wazuh Manager
 * @param token - Authentication token from Wazuh API
 * @param ruleFileName - Name of the rule file (e.g., 'scopd_rule.xml')
 */
export async function uploadRuleToWazuhManager(
  token: string,
  ruleFileName: string = 'scopd_rules.xml'
): Promise<void> {
  let xmlContent: string;

    const filePath = `${CONFIGURATION_FILES_PATH}${ruleFileName}`;
    console.log(`Reading rule file from: ${filePath}`);
    xmlContent = await readFileContent(filePath);

  const url = `${WAZUH_MANAGER_URL}/rules/files/${ruleFileName}`;
  const bodyBuffer = Buffer.from(xmlContent, 'utf-8');

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': bodyBuffer.length.toString(),
    },
    body: bodyBuffer,
    agent: httpsAgent,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`❌ Upload failed: ${response.status} ${errorText}`);
  }

  console.log(`✅ Successfully uploaded ${ruleFileName} (${bodyBuffer.length} bytes)`);
}

export async function uploadDecoderToWazuhManager(
  token: string,
  decoderFileName: string
) {

  let xmlContent: string;

  const filePath = `${CONFIGURATION_FILES_PATH}${decoderFileName}`;
  console.log(`Reading rule file from: ${filePath}`);
  xmlContent = await readFileContent(filePath);
  const url = `${WAZUH_MANAGER_URL}/decoders/files/${decoderFileName}`;

  const bodyBuffer = Buffer.from(xmlContent, 'utf-8');

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': bodyBuffer.length.toString(),
    },
    body: bodyBuffer,
    agent: httpsAgent,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`❌ Upload failed: ${response.status} ${errorText}`);
  }

  console.log(`✅ Successfully uploaded ${decoderFileName} (${bodyBuffer.length} bytes)`);
}

export async function uploadGroupsAgentConfig(token: string,  agentConfFileName: string) {

  let xmlContent: string;

  const filePath = `${CONFIGURATION_FILES_PATH}${agentConfFileName}`;
  console.log(`Reading rule file from: ${filePath}`);
  xmlContent = await readFileContent(filePath);
  const url = `${WAZUH_MANAGER_URL}/groups/default/configuration`;

  const bodyBuffer = Buffer.from(xmlContent, 'utf-8');

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/xml',
      'Content-Length': bodyBuffer.length.toString(),
    },
    body: bodyBuffer,
    agent: httpsAgent,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`❌ Upload failed: ${response.status} ${errorText}`);
  }

  console.log(`✅ Successfully uploaded ${agentConfFileName} (${bodyBuffer.length} bytes)`);
}
//not completed
export async function getAgentConfFromWazuhManager(token: string, agentConfFileName: string) {

  const url = `${WAZUH_MANAGER_URL}/agents/${agentConfFileName}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    agent: httpsAgent,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`❌ Upload failed: ${response.status} ${errorText}`);
  }
  const testConf = response.body;

  console.log(`✅ Successfully received ${agentConfFileName}`);

  return testConf;
}

export async function uploadAgentConfToWazuhManager(token: string, agentConfContent: string, agentConfFileName: string) {

  const url = `${WAZUH_MANAGER_URL}/agents/${agentConfFileName}`;

  const bodyBuffer = Buffer.from(agentConfContent, 'utf-8');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': bodyBuffer.length.toString(),
    },
    body: bodyBuffer,
    agent: httpsAgent,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`❌ Upload failed: ${response.status} ${errorText}`);
  }

  console.log(`✅ Successfully uploaded ${agentConfFileName} (${bodyBuffer.length} bytes)`);
}

export async function restartWazuhManager(token: string) {
  const url = `${WAZUH_MANAGER_URL}/manager/restart`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    agent: httpsAgent,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`❌ Restart failed: ${response.status} ${errorText}`);
  }

  console.log('✅ Successfully restarted Wazuh Manager');
}

//POST {protocol}://{host}:{port}/agents
