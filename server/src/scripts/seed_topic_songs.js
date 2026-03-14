import 'dotenv/config';
import pool from '../config/db.js';

async function seedSongs() {
    try {
        console.log("Seeding Topic Songs (Active Learning)...");

        // Example Songs for OLAP/OLTP
        const songs = [
            {
                title: 'OLTP vs OLAP systems',
                url: '/audio/topics/olap.mp3',
                lyrics: [
                    { time: 0, text: "Welcome to the Synaptic Sync..." },
                    { time: 5, text: "Today we master the data divide." },
                    { time: 10, text: "OLTP: The Heart of the Transaction." },
                    { time: 15, text: "Fast, concurrent, row-by-row action." },
                    { time: 20, text: "Now shift to OLAP: The Analytical Mind." },
                    { time: 25, text: "Complex queries, patterns to find." },
                    { time: 30, text: "Data Warehouses, Big Data, the Core." },
                    { time: 35, text: "Unlocking insights like never before!" },
                    { time: 45, text: "[Melodic Reinforcement - Mastery Locked]" }
                ]
            },
            { title: '%OLAP%', url: '/audio/topics/olap.mp3' },
            { title: '%OLTP%', url: '/audio/topics/olap.mp3' }
        ];

        for (const song of songs) {
            const result = await pool.query(
                "UPDATE topics SET song_url = $1, song_lyrics = $2 WHERE title ILIKE $3 RETURNING id, title",
                [song.url, song.lyrics ? JSON.stringify(song.lyrics) : null, song.title]
            );

            if (result.rows.length > 0) {
                result.rows.forEach(row => {
                    console.log(`✅ Linked song & lyrics to Topic: "${row.title}" (ID: ${row.id})`);
                });
            } else {
                console.log(`⚠️ No topic found matching "${song.title}"`);
            }
        }

    } catch (err) {
        console.error("❌ Seeding failed:", err.message);
    } finally {
        process.exit(0);
    }
}

seedSongs();
