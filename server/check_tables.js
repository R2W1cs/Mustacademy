import pool from "./src/config/db.js";
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    .then(r => console.log(JSON.stringify(r.rows, null, 2)))
    .catch(e => console.error(e))
    .finally(() => process.exit());
