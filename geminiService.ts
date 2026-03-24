import { UserProfile, WeeklyPlan, QuizItem, ContentResource, DifficultyLevel, Message } from "./types";

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

export const getTutorResponse = async (
  query: string,
  profile: UserProfile,
  history: Message[]
): Promise<{ text: string; sources?: any[] }> => {
  try {
    const data = await callBackendApi('/chat/tutor', { query, profile, history });
    return { text: data.text, sources: data.sources };
  } catch (error) {
    console.error('Tutor response error:', error);
    throw error;
  }
};

export const generateStudyPlan = async (profile: UserProfile): Promise<WeeklyPlan> => {
  try {
    const data = await callBackendApi('/study-plan', profile);
    return JSON.parse(data.text);
  } catch (error) {
    console.error('Study plan error:', error);
    throw error;
  }
};

export const generateLargeQuizFromContext = async (
  context: string,
  subject: string
): Promise<QuizItem[]> => {
  try {
    const data = await callBackendApi('/chat/tutor', { query: `Gere um quiz com 5 questoes de multipla escolha sobre: ${context || subject || 'vestibular UNIOESTE'}. Retorne em formato JSON com os campos: question, options (array de strings), correctAnswer (indice 0-based), explanation.`, profile: { name: 'Estudante' }, history: [] });
    return JSON.parse(data.text);
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw error;
  }
};

export const generateQuiz = async (
  subject: string,
  topic: string,
  level: DifficultyLevel = 'Intermediário'
): Promise<QuizItem[]> => {
  try {
    const data = await callBackendApi('/chat/tutor', { query: `Gere um quiz com 5 questoes de multipla escolha sobre: ${subject} - ${topic} - ${level}. Retorne em formato JSON com os campos: question, options, correctAnswer, explanation.`, profile: { name: 'Estudante' }, history: [] });
    return JSON.parse(data.text);
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw error;
  }
};

export const generateSummary = async (
  subject: string,
  topic: string
): Promise<ContentResource> => {
  try {
    const data = await callBackendApi('/summary', { subject, topic });
    // Backend returns { text: { title, subject, content, prerequisites, examples, externalLinks } }
    const content = data.text;
    
    // If backend returns error structure, throw with readable message
    if (content && content.ok === false) {
      throw new Error(content.message || 'Erro ao gerar conteúdo de estudo.');
    }
    
    // Return the content as-is (matches ContentResource type)
    return content;
  } catch (error) {
    console.error('Summary generation error:', error);
    throw error;
  }
};
