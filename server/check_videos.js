import pool from "./src/config/db.js";
pool.query("SELECT * FROM peer_videos")
    .then(r => console.log(JSON.stringify(r.rows, null, 2)))
    .catch(e => console.error(e))
    .finally(() => process.exit());
