import re

with open('geminiService.ts', 'r') as f:
    content = f.read()

retry_logic = """
// Helper to implement exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: any, retries: number = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 || response.status >= 500) {
        // Log locally and retry on Rate Limit or Server Errors
        console.warn(`Attempt ${i + 1} failed with status ${response.status}. Retrying...`);
        if (i < retries - 1) {
           await sleep(Math.pow(2, i) * 1000); // 1s, 2s, 4s
           continue;
        }
      }
      return response; // might be ok or a 4xx error that we don't retry
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
  throw new Error("Maximum retries reached");
}

// Helper for backend API routing
async function callBackendApi(action: string, payload: any) {
  const token = localStorage.getItem('medtutor_token');

  if (!navigator.onLine) {
    throw new Error('NETWORK_OFFLINE: Você está sem conexão com a internet. Verifique seu WiFi/Dados.');
  }

  try {
    const response = await fetchWithRetry('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ action, payload })
    });

    if (!response.ok) {
      let errorBody;
      try { errorBody = await response.json(); } catch(e) {}
      throw new Error(`API_ERROR: ${errorBody?.error || response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('NETWORK_OFFLINE: O servidor não respondeu. Pode ser uma falha de conexão.');
    }
    throw error;
  }
}
"""

# Replace the existing callBackendApi
content = re.sub(
    r'// Helper for backend API routing[\s\S]*?return response\.json\(\);\n}',
    retry_logic.strip(),
    content
)

with open('geminiService.ts', 'w') as f:
    f.write(content)
