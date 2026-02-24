
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
    runtime: 'edge', // Optional: Use Edge runtime if preferred, or remove for Node.js
};

// Initialize Gemini Client (Server-side)
// Note: In Vercel, use process.env.GEMINI_API_KEY (not VITE_)
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey });

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { action, payload } = await request.json();

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Server API Key not configured' }), { status: 500 });
        }

        let responseText = '';
        let sources = undefined;

        const modelName = 'gemini-2.0-flash'; // Usage of a newer/faster model for serverless

        switch (action) {
            case 'plan':
                const { profile } = payload;
                const planResponse = await ai.models.generateContent({
                    model: modelName,
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
                responseText = planResponse.text || '{}';
                break;

            case 'chat':
                const { query, profile: chatProfile, history } = payload;
                const chatHistory = history.map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }));

                const chatResponse = await ai.models.generateContent({
                    model: modelName,
                    contents: [
                        ...chatHistory,
                        // System prompt injected as user message context or system instruction if supported
                        { role: 'user', parts: [{ text: `Tutor IA para Medicina UNIOESTE. Aluna: ${chatProfile.name}. Estilo: ${chatProfile.learningStyle}. Pergunta: ${query}. Forneça explicações didáticas. NÃO use markdown exagerado.` }] }
                    ],
                    config: {
                        // tools: [{ googleSearch: {} }] // Removed for Edge compatibility unless paid tier
                    }
                });
                responseText = chatResponse.text || "Desculpe, erro ao processar.";
                sources = chatResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
                break;

            case 'quizFromContext':
                const { context, subject } = payload;
                const quizCtxResponse = await ai.models.generateContent({
                    model: modelName,
                    contents: `Com base neste contexto: "${context}", gere 20 questões de múltipla escolha para UNIOESTE sobre ${subject}. Retorne JSON.`,
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
                responseText = quizCtxResponse.text || '[]';
                break;

            case 'quiz': // Small quiz
                const { subject: qSub, topic: qTop, level } = payload;
                const quizResponse = await ai.models.generateContent({
                    model: modelName,
                    contents: `Gere 5 questões sobre "${qTop}" em "${qSub}" (Nível ${level}) para UNIOESTE Medicina.`,
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
                responseText = quizResponse.text || '[]';
                break;

            case 'summary':
                const { subject: sSub, topic: sTop } = payload;
                const summaryResponse = await ai.models.generateContent({
                    model: modelName,
                    contents: `Crie um guia de estudo sobre "${sTop}" em "${sSub}" para UNIOESTE. Formato JSON.`,
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
                responseText = summaryResponse.text || '{}';
                break;

            default:
                return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
        }

        return new Response(JSON.stringify({ text: responseText, sources }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
