
import https from 'https';
import { URL } from 'url';
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
  const url = new URL('https://0.0.0.0:55000/security/user/authenticate');

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
 * @param ruleContent - XML content of the rule to upload
 * @param ruleFileName - Name of the rule file (e.g., 'scopd_rule.xml')
 */
export async function uploadRuleToWazuhManager(
  token: string,
  ruleContent: string,
  ruleFileName: string = 'scopd_rule.xml'
): Promise<void> {
  const url = new URL(`/rules/files/${ruleFileName}`, 'https://localhost:55000');

  const fetchOptions: CustomRequestInit = {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    },
    body: ruleContent,
    agent: httpsAgent,
  };

  try {
    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload rule: ${response.status} - ${errorText}`);
    }

    console.log(`Successfully uploaded rule file: ${ruleFileName}`);
  } catch (error) {
    console.error('Wazuh authentication error:', error);
    throw error;
  }
}

