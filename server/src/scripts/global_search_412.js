import pool from "../config/db.js";

const searchAll = async () => {
    try {
        const tablesRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        for (const t of tablesRes.rows) {
            const table = t.table_name;
            const columnsRes = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
            for (const c of columnsRes.rows) {
                const col = c.column_name;
                try {
                    const findRes = await pool.query(`SELECT 1 FROM "${table}" WHERE "${col}"::text = '412' LIMIT 1`);
                    if (findRes.rows.length > 0) {
                        console.log(`FOUND 412 in table "${table}", column "${col}"`);
                    }
                } catch (e) { }
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

searchAll();
