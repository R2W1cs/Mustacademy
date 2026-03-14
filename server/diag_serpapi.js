import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.SERPAPI_KEY;
console.log('Testing SerpApi with Key:', key ? key.substring(0, 8) + '...' : 'MISSING');

try {
    const res = await axios.get('https://serpapi.com/search', {
        params: {
            engine: 'google_news',
            q: 'computer science research 2026',
            api_key: key
        }
    });
    console.log('STATUS:', res.status);
    console.log('SEARCH METADATA:', res.data.search_metadata);
    console.log('NEWS COUNT:', res.data.news_results?.length || 0);
} catch (err) {
    console.error('DIAGNOSTIC FAILED:', err.message);
}
