// BFF (Backend-For-Frontend) proxy + server-side Gemini fallback.
// Tries a configured backend first; if absent/unreachable, executes Gemini
// directly using the server-only GEMINI_API_KEY so the frontend never needs
// a public key.
import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
    runtime: 'nodejs',
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const HAS_GEMINI = !!GEMINI_API_KEY;

const SYSTEM_PROMPT = `Você é um Tutor de IA especializado no vestibular de Medicina da UNIOESTE.
Sua missão é ensinar, explicar e tirar dúvidas sobre Biologia, Química, Física, Matemática, Português, Literatura, Redação, História e Geografia.
- Responda em português brasileiro.
- Seja didático, use exemplos práticos e analogias.
- Corrija o aluno com gentileza.
- Cite dados e fórmulas quando fizer sentido.
- Ao final de explicações longas, ofereça um quiz de fixação.`;

function cleanJson(text: string) {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
}

async function callGemini(prompt: string) {
    if (!HAS_GEMINI) throw new Error('GEMINI_API_KEY não configurada no ambiente do deploy.');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
}

// Offline fallbacks to keep UX responsive when no backend/key is available.
function fallbackSummary(subject: string, topic: string) {
    return {
        text: JSON.stringify({
            title: `${topic} — visão rápida`,
            content: `${topic} em ${subject}: resumo breve indisponível no momento. Revise os principais conceitos, monte um mapa mental com 3-5 tópicos e resolva questões anteriores da UNIOESTE.`,
            keyPoints: [
                'Revise definições essenciais e termos-chave',
                'Identifique relações de causa e efeito entre conceitos',
                'Faça 2 questões da UNIOESTE sobre o tema para fixação'
            ],
            examples: [
                'Explique o conceito com suas próprias palavras em 3 frases',
                'Monte uma lista de 3 erros comuns e como evitá-los'
            ]
        })
    };
}

function fallbackQuiz(subject: string, topic: string) {
    const q = (stem: string, correct: number) => ({
        question: stem,
        options: [
            'Opção A',
            'Opção B',
            'Opção C',
            'Opção D'
        ],
        correctAnswer: correct,
        explanation: 'Conteúdo indisponível. Use este rascunho apenas como placeholder.'
    });
    return {
        text: JSON.stringify([
            q(`${subject}: conceito central de ${topic}?`, 0),
            q(`Exemplo prático que ilustra ${topic}?`, 1),
            q(`Erro comum ao estudar ${topic}?`, 2),
            q(`Dados ou fórmula associados a ${topic}?`, 3),
            q(`Aplicação de ${topic} na prova da UNIOESTE?`, 0),
        ])
    };
}

function fallbackPlan(profile: any) {
    const name = profile?.name || 'Estudante';
    const days = profile?.days || 7;
    const schedule = Array.from({ length: Math.min(days, 7) }).map((_, idx) => ({
        day: idx + 1,
        summary: 'Bloco de revisão e questões de provas anteriores.',
        tasks: [
            {
                id: `d${idx + 1}-bio`,
                subject: 'Biologia',
                topic: 'Revisão de fundamentos',
                duration: '40 min',
                objective: 'Mapear pontos fracos e anotar dúvidas.',
                type: 'resumo',
                completed: false
            },
            {
                id: `d${idx + 1}-quiz`,
                subject: 'Biologia',
                topic: 'Fixação rápida',
                duration: '20 min',
                objective: 'Responder 5 questões comentadas.',
                type: 'quiz',
                completed: false
            }
        ]
    }));
    return { text: JSON.stringify({ student: name, schedule }) };
}

function fallbackChat() {
    return {
        text: 'Oi! O motor de IA está offline no momento. Configure a variável de ambiente GEMINI_API_KEY ou o backend para respostas completas.'
    };
}

async function handleChat(body: any) {
    const { query, profile, history = [] } = body.payload || body;
    const historyLines = history
        .slice(-10)
        .map((h: any) => `${h.role === 'bot' ? 'Tutor' : 'Aluno'}: ${h.text}`)
        .join('\n');

    if (!HAS_GEMINI) return fallbackChat();

    const prompt = `${SYSTEM_PROMPT}

Aluno: ${profile?.name || 'Estudante'}
Contexto anterior:
${historyLines}

Pergunta atual: ${query}`;

    const text = await callGemini(prompt);
    return { text };
}

async function handleSummary(body: any) {
    const { subject, topic } = body.payload || body;
    if (!HAS_GEMINI) return fallbackSummary(subject, topic);

    const prompt = `Crie um resumo didático sobre ${topic} em ${subject} para o vestibular UNIOESTE.
Retorne JSON: { "title": string, "content": string, "keyPoints": [string], "examples": [string] }
Apenas o JSON, sem markdown.`;

    const text = await callGemini(prompt);
    const parsed = cleanJson(text);
    return { text: JSON.stringify(parsed) };
}

async function handleQuiz(body: any) {
    const payload = body.payload || body;
    if (!HAS_GEMINI) return fallbackQuiz(payload.subject || 'Disciplina', payload.topic || 'Tema');

    const prompt = `Gere 5 questões de múltipla escolha sobre ${payload.topic || payload.subject} em ${payload.subject || 'vestibular UNIOESTE'}.
Retorne JSON array com objetos: { "question": string, "options": [string x4], "correctAnswer": number (0-3), "explanation": string }
Apenas o JSON, sem markdown.`;
    const text = await callGemini(prompt);
    const parsed = cleanJson(text);
    return { text: JSON.stringify(parsed) };
}

async function handlePlan(body: any) {
    const { profile } = body.payload || body;
    if (!HAS_GEMINI) return fallbackPlan(profile);

    const prompt = `Crie um plano de estudos em JSON para o vestibular de Medicina da UNIOESTE.
Aluno: ${profile?.name || 'Estudante'}, Dias: ${profile?.days || 30}.
Retorne JSON com campo "schedule" sendo array de objetos:
{ "day": number, "tasks": [{ "id": string, "subject": string, "topic": string, "duration": string, "objective": string, "type": "teoria"|"video"|"quiz"|"resumo", "completed": false }], "summary": string }.
Apenas o JSON, sem markdown.`;
    const text = await callGemini(prompt);
    const parsed = cleanJson(text);
    return { text: JSON.stringify(parsed) };
}

async function tryBackend(endpoint: string, body: any) {
    if (!BACKEND_URL) throw new Error('BACKEND_URL não configurada.');

    const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body.payload || body)
    });

    if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        throw new Error(`Backend error: ${backendResponse.status} ${errorText}`);
    }

    return backendResponse.json();
}

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const payload = await request.json();
        const { action } = payload;

        // First, try configured backend if available
        if (BACKEND_URL) {
            try {
                let endpoint = '';
                switch (action) {
                    case 'plan':
                        endpoint = '/study-plan';
                        break;
                    case 'chat':
                        endpoint = '/chat/tutor';
                        break;
                    case 'summary':
                        endpoint = '/summary';
                        break;
                    case 'quiz':
                    case 'quizFromContext':
                        endpoint = '/chat/tutor';
                        payload.payload = payload.payload || {};
                        payload.payload.query = `Gere um quiz com 5 questoes de multipla escolha sobre: ${payload.payload?.context || payload.payload?.subject || 'vestibular UNIOESTE'}. Retorne em formato JSON com os campos: question, options (array de strings), correctAnswer (indice 0-based), explanation.`;
                        break;
                    default:
                        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
                }
                const data = await tryBackend(endpoint, payload);
                return new Response(JSON.stringify(data), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (err) {
                console.warn('Backend unavailable, falling back to Gemini:', err);
            }
        }

        // Gemini fallback (server-side, no public keys)
        let data;
        switch (action) {
            case 'plan':
                data = await handlePlan(payload);
                break;
            case 'chat':
                data = await handleChat(payload);
                break;
            case 'summary':
                data = await handleSummary(payload);
                break;
            case 'quiz':
            case 'quizFromContext':
                data = await handleQuiz(payload);
                break;
            default:
                return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("BFF Proxy Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
