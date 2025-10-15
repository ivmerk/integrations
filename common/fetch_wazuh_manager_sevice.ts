
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
  try {
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

    let response;
    try {
      response = await fetch(url.toString(), fetchOptions);
    } catch (error) {
      console.error('Fetch error:', error);
      throw new Error(`Failed to connect to Wazuh API: ${error.message}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    return data.data.token;
  } catch (error) {
    console.error('Wazuh authentication error:', error);
    throw error;
  }
}

