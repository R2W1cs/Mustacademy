import 'dotenv/config';
import fetch from 'node-fetch';

async function testExercises() {
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
    const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
    const topicTitle = "OLTP vs OLAP Systems";

    console.log(`🚀 Testing exercise generation for: "${topicTitle}"`);
    console.log(`🤖 Using model: ${OLLAMA_MODEL}`);

    const prompt = `You are a CS professor. Create exercises for the topic "${topicTitle}".

Return a JSON object with this structure:
{
  "mcq": [
    { "q": "Question text?", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A" },
    { "q": "Question text?", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "C" },
    { "q": "Question text?", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "B" }
  ],
  "short_answer": [
    { "q": "Short answer question 1?", "hint": "Brief hint", "model_answer": "The concise correct answer." },
    { "q": "Short answer question 2?", "hint": "Brief hint", "model_answer": "The concise correct answer." }
  ],
  "challenge": {
    "title": "Real-World Challenge: ${topicTitle}",
    "scenario": "Describe a realistic professional scenario requiring ${topicTitle} knowledge.",
    "task": "What specific task must the student complete?",
    "solution_guide": "Key points the student's answer must hit."
  }
}

Create questions that test UNDERSTANDING not memorization. All questions must be specifically about "${topicTitle}". Return valid JSON only.`;

    try {
        const ollamaRes = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: false,
                format: 'json'
            })
        });

        if (!ollamaRes.ok) throw new Error(`Ollama HTTP ${ollamaRes.status}`);

        const data = await ollamaRes.json();
        const exercises = JSON.parse(data.response);

        console.log('✅ Exercises Generated Successfully!');
        console.log('\n--- MCQs ---');
        exercises.mcq.forEach((q, i) => {
            console.log(`${i + 1}. ${q.q}`);
            console.log(`   Options: ${q.options.join(', ')}`);
            console.log(`   Correct: ${q.answer}`);
        });

        console.log('\n--- Challenge ---');
        console.log(`Title: ${exercises.challenge.title}`);
        console.log(`Scenario: ${exercises.challenge.scenario.substring(0, 100)}...`);
        console.log(`Task: ${exercises.challenge.task}`);

    } catch (err) {
        console.error('❌ Test Failed:', err.message);
    }
}

testExercises();
