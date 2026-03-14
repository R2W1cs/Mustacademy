import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from "../config/db.js";

// Setup environment loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const migrateMarketTransparency = async () => {
    try {
        console.log('🚀 Enhancing Market Intelligence Transparency...');

        await pool.query(`
            ALTER TABLE market_news 
            ADD COLUMN IF NOT EXISTS trend_context TEXT,
            ADD COLUMN IF NOT EXISTS verification_type VARCHAR(50) DEFAULT 'Research'
        `);
        console.log('✅ Added trend_context and verification_type columns.');

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Transparency migration failed:', err);
        if (pool) await pool.end();
        process.exit(1);
    }
};

migrateMarketTransparency();
