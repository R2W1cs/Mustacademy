
import pool from "../config/db.js";

const debugIdentity = async () => {
    try {
        console.log("--- USERS ---");
        const users = await pool.query("SELECT id, name, email FROM users");
        console.log(JSON.stringify(users.rows, null, 2));

        console.log("\n--- VIDEOS ---");
        const videos = await pool.query("SELECT id, title, user_id, uploader_note FROM peer_videos");
        console.log(JSON.stringify(videos.rows, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugIdentity();
