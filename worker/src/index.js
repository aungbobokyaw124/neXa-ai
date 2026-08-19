export default {
    async fetch(request, env, ctx) {
        // CORS Headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);

        if (url.pathname === '/api/chat' && request.method === 'POST') {
            try {
                if (!env.GEMINI_API_KEY) {
                    return Response.json({ success: false, error: 'AI service not configured.' }, { status: 500, headers: corsHeaders });
                }

                const body = await request.json();
                const { messages } = body;

                if (!Array.isArray(messages) || messages.length === 0) {
                    return Response.json({ success: false, error: 'Invalid request format.' }, { status: 400, headers: corsHeaders });
                }

                // Format messages for Gemini API
                const contents = messages.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));

                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

                const geminiResponse = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents,
                        systemInstruction: {
                            parts: [{ text: "You are neXa AI, a helpful, accurate, direct, and professional AI assistant built by neXa." }]
                        }
                    })
                });

                const data = await geminiResponse.json();

                if (!geminiResponse.ok) {
                    return Response.json({ success: false, error: data.error?.message || 'Unable to contact AI service.' }, { status: 502, headers: corsHeaders });
                }

                const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!reply) {
                    return Response.json({ success: false, error: 'Empty response received from AI.' }, { status: 502, headers: corsHeaders });
                }

                return Response.json({ success: true, message: reply }, { headers: corsHeaders });

            } catch (err) {
                return Response.json({ success: false, error: 'Internal server error.' }, { status: 500, headers: corsHeaders });
            }
        }

        return new Response('Not Found', { status: 404, headers: corsHeaders });
    }
};
