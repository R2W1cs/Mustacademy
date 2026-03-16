import pool from '../src/config/db.js';

const checkTables = async () => {
    try {
        const assets = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scholarly_assets')");
        const contribs = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_contributions')");
        const stats = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_stats')");
        
        console.log(`scholarly_assets: ${assets.rows[0].exists}`);
        console.log(`user_contributions: ${contribs.rows[0].exists}`);
        console.log(`user_stats: ${stats.rows[0].exists}`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkTables();
