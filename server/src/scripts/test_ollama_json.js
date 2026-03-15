import 'dotenv/config';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

const prompt = `You are a CS professor. Return a JSON object with EXACTLY these fields filled in about "OLTP vs OLAP":
{
  "content_markdown": "## 2️⃣ Conceptual Overview\\n\\nOLTP handles daily operations. OLAP handles analytics.",
  "status": "ok"
}
Return valid JSON only.`;

console.log('Testing Ollama with format:json mode...');
console.log('Model:', OLLAMA_MODEL, '| URL:', OLLAMA_URL);

try {
    const res = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
            format: 'json',
            options: { temperature: 0.2, num_predict: 200 }
        })
    });

    const data = await res.json();
    const parsed = JSON.parse(data.response);
    console.log('✅ JSON valid!');
    console.log('content_markdown preview:', parsed.content_markdown?.substring(0, 100));
    console.log('status:', parsed.status);
} catch (e) {
    console.error('❌ FAILED:', e.message);
}

process.exit(0);
