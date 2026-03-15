import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require"
});

async function check() {
    try {
        console.log("Searching for 412 in ALL tables...");
        const tablesRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        for (const t of tablesRes.rows) {
            const table = t.table_name;
            const columnsRes = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
            for (const c of columnsRes.rows) {
                const col = c.column_name;
                try {
                    const findRes = await pool.query(`SELECT COUNT(*) FROM "${table}" WHERE "${col}"::text = '412'`);
                    if (parseInt(findRes.rows[0].count) > 0) {
                        console.log(`FOUND 412 in table "${table}", column "${col}" (${findRes.rows[0].count} occurrences)`);

                        // Show samples
                        const sampleRes = await pool.query(`SELECT * FROM "${table}" WHERE "${col}"::text = '412' LIMIT 3`);
                        console.log(JSON.stringify(sampleRes.rows, null, 2));
                    }
                } catch (e) { }
            }
        }

        console.log("\nSearching for 'CS 412' in ALL tables...");
        for (const t of tablesRes.rows) {
            const table = t.table_name;
            const columnsRes = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
            for (const c of columnsRes.rows) {
                const col = c.column_name;
                try {
                    const findRes = await pool.query(`SELECT COUNT(*) FROM "${table}" WHERE "${col}"::text ILIKE '%CS 412%'`);
                    if (parseInt(findRes.rows[0].count) > 0) {
                        console.log(`FOUND 'CS 412' in table "${table}", column "${col}" (${findRes.rows[0].count} occurrences)`);
                    }
                } catch (e) { }
            }
        }

        await pool.end();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
