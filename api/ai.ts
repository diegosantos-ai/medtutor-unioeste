// BFF (Backend-For-Frontend) proxy.
// Proxies requests from the React frontend to the FastAPI backend.
export const config = {
    runtime: 'edge',
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8096/api";

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const payload = await request.json();
        const { action } = payload;

        const body = { ...payload };
        delete body.action;

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
                body.payload = body.payload || {};
                body.payload.query = `Gere um quiz com 5 questoes de multipla escolha sobre: ${body.payload?.context || body.payload?.subject || 'vestibular UNIOESTE'}. Retorne em formato JSON com os campos: question, options (array de strings), correctAnswer (indice 0-based), explanation.`;
                break;
            default:
                return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
        }

        const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body.payload || body)
        });

        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            throw new Error(`Backend error: ${backendResponse.status} ${errorText}`);
        }

        const data = await backendResponse.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("BFF Proxy Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
