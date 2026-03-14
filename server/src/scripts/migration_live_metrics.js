import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from "../config/db.js";

// Setup environment loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const migrateLiveMetrics = async () => {
    try {
        console.log('🚀 Evolving schema for Live Pulse Metrics...');

        await pool.query(`
            ALTER TABLE market_news 
            ADD COLUMN IF NOT EXISTS external_id VARCHAR(255) UNIQUE,
            ADD COLUMN IF NOT EXISTS live_metrics JSONB DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false
        `);
        console.log('✅ Added external_id, live_metrics, and is_live columns.');

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Live metrics migration failed:', err);
        if (pool) await pool.end();
        process.exit(1);
    }
};

migrateLiveMetrics();
