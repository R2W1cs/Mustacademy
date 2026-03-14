import pool from "../config/db.js";

const runMigration = async () => {
    try {
        console.log("Starting topic content migration...");

        // Add content column if it doesn't exist
        await pool.query(`
            ALTER TABLE topics 
            ADD COLUMN IF NOT EXISTS content TEXT;
        `);
        console.log("Added 'content' column to topics table.");

        const SEED_CONTENT = [
            {
                title: 'Programming Fundamentals',
                content: `Programming is the way we talk to computers. Imagine it's like a recipe. 
                1. Variables: These are containers to store information (like the ingredients).
                2. Functions: These are specific instructions (like 'boil water').
                3. Loops: Doing something repeatedly until you're done.
                The key is logic. Computers are very fast but very literal.`
            },
            {
                title: 'Data Structures Basics',
                content: `Data structures are just different ways to organize information so we can find it quickly.
                - Arrays: Like a row of lockers. You know exactly where things are.
                - Lists: Like a paper chain. You follow one link to the next.
                - Trees: Like a family tree, used for searching hierarchy.
                Choosing the right structure depends on if you need to find stuff fast or add stuff fast.`
            },
            {
                title: 'Operating Systems',
                content: `Think of an OS like a traffic controller for your computer. 
                - It manages the CPU (the brain) so different apps don't fight.
                - It handles memory (where data lives temporarily).
                - It talks to hardware like your screen and keyboard.
                Common examples are Windows, macOS, and Linux.`
            },
            {
                title: 'Database Systems',
                content: `Databases are professional filing cabinets for data.
                - SQL: A language to ask questions like 'Give me all users who joined in 2024'.
                - Schema: The structure or 'blueprint' of your data.
                - Normalization: Organizing data so you don't repeat yourself unnecessarily.
                Relational databases (like PostgreSQL) use tables with rows and columns.`
            },
            {
                title: 'Probability Basics',
                content: `Probability is just a way to measure how likely something is to happen.
                - Range: It's always between 0 (impossible) and 1 (guaranteed).
                - Events: The things we're measuring (like rolling a 6 on a die).
                - Sample Space: All possible outcomes total.`
            }
        ];

        for (const item of SEED_CONTENT) {
            await pool.query(
                "UPDATE topics SET content = $1 WHERE title ILIKE $2",
                [item.content, `%${item.title}%`]
            );
            console.log(`Seeded content for topic: ${item.title}`);
        }

        console.log("Migration and seeding complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
};

runMigration();
