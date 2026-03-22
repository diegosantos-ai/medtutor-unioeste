import { UserProfile, WeeklyPlan, QuizItem, ContentResource, DifficultyLevel, Message } from "./types";

// Helper for backend API routing
async function callBackendApi(action: string, payload: any) {
  const token = localStorage.getItem('medtutor_token');
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ action, payload })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const getTutorResponse = async (
  query: string,
  profile: UserProfile,
  history: Message[]
): Promise<{ text: string; sources?: any[] }> => {
  try {
    const data = await callBackendApi('chat', { query, profile, history });
    return { text: data.text, sources: data.sources };
  } catch (error) {
    console.error('Tutor response error:', error);
    throw error;
  }
};

export const generateStudyPlan = async (profile: UserProfile): Promise<WeeklyPlan> => {
  try {
    const data = await callBackendApi('plan', { profile });
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
    const data = await callBackendApi('quizFromContext', { context, subject });
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
    const data = await callBackendApi('quiz', { subject, topic, level });
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
    const data = await callBackendApi('summary', { subject, topic });
    return JSON.parse(data.text);
  } catch (error) {
    console.error('Summary generation error:', error);
    throw error;
  }
};
