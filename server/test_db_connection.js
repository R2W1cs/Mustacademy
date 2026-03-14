import pool from './src/config/db.js';

const testConnection = async () => {
    try {
        console.log('🔍 Testing database connection...');

        // Test basic query
        const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✅ Database connection successful!');
        console.log('📅 Server time:', result.rows[0].current_time);
        console.log('🗄️  PostgreSQL version:', result.rows[0].pg_version.split(' ')[0]);

        // Test pool stats
        console.log('\n📊 Pool Stats:');
        console.log('   Total clients:', pool.totalCount);
        console.log('   Idle clients:', pool.idleCount);
        console.log('   Waiting clients:', pool.waitingCount);

        await pool.end();
        console.log('\n✅ Test completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('Stack:', err.stack);
        process.exit(1);
    }
};

testConnection();
