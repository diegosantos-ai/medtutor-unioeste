import { apiClient } from '../components/api/apiClient';

const SESSION_KEY = 'medtutor_session_id';
const SESSION_DATA_KEY = 'medtutor_session_data';

function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

export function getSessionData(): any {
  const data = localStorage.getItem(SESSION_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

export function setSessionData(data: any): void {
  localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(data));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_DATA_KEY);
  localStorage.removeItem('medtutor_token');
  localStorage.removeItem('medtutor_chat_history');
}

export async function initializeSession(name: string): Promise<{ sessionId: string; token: string }> {
  const sessionId = getOrCreateSessionId();
  
  // Create or login user with session-based email
  const email = `${sessionId}@medtutor.local`;
  const password = sessionId; // Use session ID as password
  
  let token: string;
  
  try {
    // Try to login first
    const loginResponse = await apiClient.post<{ access_token: string }>('/auth/login', {
      email,
      password
    });
    token = loginResponse.access_token;
  } catch {
    // If login fails, register
    const registerResponse = await apiClient.post<{ access_token: string }>('/auth/register', {
      email,
      password,
      name
    });
    token = registerResponse.access_token;
  }
  
  // Set token for future requests
  apiClient.setToken(token);
  
  // Save session data
  setSessionData({
    sessionId,
    name,
    createdAt: new Date().toISOString()
  });
  
  return { sessionId, token };
}

export function getCurrentSession(): { sessionId: string; name: string } | null {
  const data = getSessionData();
  if (data && data.sessionId) {
    return {
      sessionId: data.sessionId,
      name: data.name || 'Aluno'
    };
  }
  return null;
}
