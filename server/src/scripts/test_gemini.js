import 'dotenv/config';

const key = process.env.GEMINI_API_KEY;
console.log('GEMINI_API_KEY present:', !!key);
if (!key) { console.error('No key found!'); process.exit(1); }

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${key}`;

const body = {
    contents: [{ parts: [{ text: 'Return exactly this JSON: {"content_markdown": "# Hello\\n\\nThis is a test.", "status": "ok"}' }] }],
    generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 500,
        responseMimeType: "application/json"
    }
};

console.log('Calling Gemini...');
try {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log('Status:', res.status);

    if (!res.ok) {
        console.error('API Error:', JSON.stringify(data.error));
        process.exit(1);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Raw text from Gemini:', text);

    if (text) {
        const parsed = JSON.parse(text);
        console.log('✅ Parsed content_markdown:', parsed.content_markdown?.substring(0, 100));
    } else {
        console.log('Full response:', JSON.stringify(data, null, 2));
    }
} catch (e) {
    console.error('FATAL:', e.message);
}

process.exit(0);
