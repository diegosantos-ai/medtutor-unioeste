
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, WeeklyPlan, QuizItem, ContentResource, DifficultyLevel, Message } from "./types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const generateStudyPlan = async (profile: UserProfile): Promise<WeeklyPlan> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Gere um cronograma de estudos semanal adaptativo e equilibrado para uma estudante de Medicina da UNIOESTE Beltrão. 
    Contexto da estudante: 
    - Horas diárias: ${profile.dailyHours}h
    - Dificuldades: ${profile.difficulties.join(', ')}
    - Estilo: ${profile.learningStyle}
    
    Diretrizes:
    1. Pesos altíssimos em Biologia, Química e Física.
    2. Estrutura: Teoria -> Exercícios -> Revisão Espaçada.
    3. Cada tarefa deve ter um "objective" (meta clara) e um "id" único.
    
    Retorne um JSON seguindo exatamente o schema fornecido.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          weekId: { type: Type.NUMBER },
          schedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                tasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      subject: { type: Type.STRING },
                      topic: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      objective: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ['theory', 'exercises', 'review', 'simulated'] },
                      completed: { type: Type.BOOLEAN }
                    },
                    required: ["id", "subject", "topic", "duration", "objective", "type", "completed"]
                  }
                }
              },
              required: ["day", "tasks"]
            }
          }
        },
        required: ["weekId", "schedule"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as WeeklyPlan;
};

export const getTutorResponse = async (query: string, profile: UserProfile, history: Message[]): Promise<{ text: string, sources?: any[] }> => {
  const chatHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      ...chatHistory,
      { role: 'user', parts: [{ text: `Tutor IA para Medicina UNIOESTE. Aluna: ${profile.name}. Estilo: ${profile.learningStyle}. Pergunta: ${query}. Forneça explicações didáticas. NÃO use markdown exagerado, use quebras de linha claras e pontuação para facilitar a leitura.` }] }
    ],
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return {
    text: response.text || "Desculpe, não consegui processar sua dúvida.",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

export const generateLargeQuizFromContext = async (context: string, subject: string): Promise<QuizItem[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Com base neste contexto de estudo: "${context}", gere uma lista de 20 questões de múltipla escolha para o vestibular de Medicina da UNIOESTE sobre ${subject}.
    As questões devem variar entre fácil, médio e difícil. 
    Retorne em JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]') as QuizItem[];
};

export const generateQuiz = async (subject: string, topic: string, level: DifficultyLevel = 'Intermediário'): Promise<QuizItem[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Gere 5 questões de múltipla escolha sobre "${topic}" em "${subject}" (Nível ${level}) para UNIOESTE Medicina.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]') as QuizItem[];
};

export const generateSummary = async (subject: string, topic: string): Promise<ContentResource> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Crie um guia de estudo estruturado (Trilha) sobre "${topic}" em "${subject}" para UNIOESTE. 
    IMPORTANTE: O texto deve ser formatado para leitura agradável, use blocos de texto claros.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subject: { type: Type.STRING },
          content: { type: Type.STRING },
          prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
          examples: { type: Type.ARRAY, items: { type: Type.STRING } },
          externalLinks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING }
              }
            }
          }
        },
        required: ["title", "subject", "content", "prerequisites", "examples", "externalLinks"]
      }
    }
  });
  return JSON.parse(response.text || '{}') as ContentResource;
};
