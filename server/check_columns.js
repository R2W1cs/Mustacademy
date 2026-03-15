import pool from "./src/config/db.js";
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'peer_videos'")
    .then(r => console.log(JSON.stringify(r.rows.map(c => c.column_name), null, 2)))
    .catch(e => console.error(e))
    .finally(() => process.exit());
