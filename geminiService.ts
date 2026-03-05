import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile, WeeklyPlan, QuizItem, ContentResource, DifficultyLevel, Message } from "./types";

// Gemini API direct call (works without backend)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

function getGeminiClient() {
  if (!API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY não configurada. Configure a variável de ambiente.');
  }
  return new GoogleGenerativeAI(API_KEY);
}

const SYSTEM_PROMPT = `Você é um Tutor de IA especializado no vestibular de Medicina da UNIOESTE.
Sua missão é ensinar, explicar e tirar dúvidas sobre as matérias do vestibular: Biologia, Química, Física, Matemática, Português, Literatura, Redação, História e Geografia.
- Responda sempre em português brasileiro.
- Seja didático, use exemplos práticos e analogias quando necessário.
- Se o aluno errar, corrija de forma construtiva.
- Quando explicar ciências, cite dados e fórmulas relevantes.
- Ao final de cada explicação longa, ofereça-se para fazer um quiz de fixação.
- Mantenha o foco no conteúdo do vestibular UNIOESTE.`;

async function callGemini(prompt: string, history: Message[] = []): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Build chat history
  const chatHistory = history.slice(-10).map(msg => ({
    role: msg.role === 'bot' ? 'model' : 'user',
    parts: [{ text: msg.text }],
  }));

  const chat = model.startChat({
    history: chatHistory,
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await chat.sendMessage(prompt);
  return result.response.text();
}

// Fallback helper for when backend API is needed
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
    // Try Gemini direct first
    if (API_KEY) {
      const contextualQuery = `[Aluno: ${profile.name || 'Estudante'}]\n\n${query}`;
      const text = await callGemini(contextualQuery, history);
      return { text };
    }
    // Fallback to backend
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
    // Fallback: generate plan via Gemini directly
    if (API_KEY) {
      const prompt = `Crie um plano de estudos em JSON para o vestibular de Medicina da UNIOESTE.
Aluno: ${profile.name}, Dias: ${(profile as any).days || 30}.
Retorne um JSON com campo "schedule" sendo array de objetos: {day, tasks: [{id, subject, topic, duration, objective, type, completed: false}], summary}.
Apenas o JSON, sem markdown.`;
      const text = await callGemini(prompt);
      const clean = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(clean);
    }
    throw error;
  }
};

export const generateLargeQuizFromContext = async (
  context: string,
  subject: string
): Promise<QuizItem[]> => {
  const prompt = `Gere 5 questões de múltipla escolha sobre: ${subject}
Contexto: ${context}
Retorne JSON array com objetos: {question, options: [string x4], correctAnswer: number (0-3), explanation}
Apenas o JSON, sem markdown.`;

  try {
    if (API_KEY) {
      const text = await callGemini(prompt);
      const clean = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(clean);
    }
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
  const prompt = `Gere 5 questões ${level} de múltipla escolha sobre ${topic} em ${subject} para o vestibular UNIOESTE.
Retorne JSON array com objetos: {question, options: [string x4], correctAnswer: number (0-3), explanation}
Apenas o JSON, sem markdown.`;

  try {
    if (API_KEY) {
      const text = await callGemini(prompt);
      const clean = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(clean);
    }
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
  const prompt = `Crie um resumo didático sobre ${topic} em ${subject} para o vestibular UNIOESTE.
Retorne JSON: {title, content, keyPoints: [string], examples: [string]}
Apenas o JSON, sem markdown.`;

  try {
    if (API_KEY) {
      const text = await callGemini(prompt);
      const clean = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(clean);
    }
    const data = await callBackendApi('summary', { subject, topic });
    return JSON.parse(data.text);
  } catch (error) {
    console.error('Summary generation error:', error);
    throw error;
  }
};
