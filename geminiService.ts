
import { UserProfile, WeeklyPlan, QuizItem, ContentResource, DifficultyLevel, Message } from "./types";

// Helper function to call the Vercel API
async function callAiApi(action: string, payload: any) {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
}

export const generateStudyPlan = async (profile: UserProfile): Promise<WeeklyPlan> => {
  const data = await callAiApi('plan', { profile });
  return JSON.parse(data.text);
};

export const getTutorResponse = async (query: string, profile: UserProfile, history: Message[]): Promise<{ text: string, sources?: any[] }> => {
  const data = await callAiApi('chat', { query, profile, history });
  return {
    text: data.text,
    sources: data.sources
  };
};

export const generateLargeQuizFromContext = async (context: string, subject: string): Promise<QuizItem[]> => {
  const data = await callAiApi('quizFromContext', { context, subject });
  return JSON.parse(data.text);
};

export const generateQuiz = async (subject: string, topic: string, level: DifficultyLevel = 'Intermediário'): Promise<QuizItem[]> => {
  const data = await callAiApi('quiz', { subject, topic, level });
  return JSON.parse(data.text);
};

export const generateSummary = async (subject: string, topic: string): Promise<ContentResource> => {
  const data = await callAiApi('summary', { subject, topic });
  return JSON.parse(data.text);
};
