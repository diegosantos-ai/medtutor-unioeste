import re

with open('geminiService.ts', 'r') as f:
    content = f.read()

# Substituir `action` pattern para rotas diretas
# A API antiga fazia: fetch('/api/ai', { body: { action: 'chat', payload: ... }})
# A API FastAPI tem: /api/chat/tutor, /api/study-plan, /api/summary

replacement = """
// Helper for backend API routing
async function callBackendApi(endpoint: string, payload: any) {
  const token = localStorage.getItem('medtutor_token');

  if (!navigator.onLine) {
    throw new Error('NETWORK_OFFLINE: Você está sem conexão com a internet. Verifique seu WiFi/Dados.');
  }

  try {
    const response = await fetchWithRetry(`/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload)
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

content = re.sub(
    r"async function callBackendApi\(action: string, payload: any\) \{[\s\S]*?throw error;\n  \}\n\}",
    replacement.strip(),
    content
)

content = content.replace("callBackendApi('chat', { query, profile, history })", "callBackendApi('/chat/tutor', { query, profile, history })")
content = content.replace("callBackendApi('plan', { profile })", "callBackendApi('/study-plan', profile)")
content = content.replace("callBackendApi('quizFromContext', { context, subject })", "callBackendApi('/chat/tutor', { query: `Gere um quiz com 5 questoes de multipla escolha sobre: ${context || subject || 'vestibular UNIOESTE'}. Retorne em formato JSON com os campos: question, options (array de strings), correctAnswer (indice 0-based), explanation.`, profile: { name: 'Estudante' }, history: [] })")
content = content.replace("callBackendApi('quiz', { subject, topic, level })", "callBackendApi('/chat/tutor', { query: `Gere um quiz com 5 questoes de multipla escolha sobre: ${subject} - ${topic} - ${level}. Retorne em formato JSON com os campos: question, options, correctAnswer, explanation.`, profile: { name: 'Estudante' }, history: [] })")
content = content.replace("callBackendApi('summary', { subject, topic })", "callBackendApi('/summary', { subject, topic })")

with open('geminiService.ts', 'w') as f:
    f.write(content)
