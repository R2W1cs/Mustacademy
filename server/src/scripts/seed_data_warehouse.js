import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../../server/.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function seedDataWarehouse() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const semesterId = 5;
        const courseName = "Advanced Data Warehousing & BI";

        // Cleanup existing Course/Topics
        const courseCheck = await client.query("SELECT id FROM courses WHERE name = $1 AND semester_id = $2", [courseName, semesterId]);
        let courseId;

        if (courseCheck.rows.length > 0) {
            courseId = courseCheck.rows[0].id;
            await client.query("DELETE FROM topics WHERE course_id = $1", [courseId]);
        } else {
            const courseRes = await client.query(
                "INSERT INTO courses (name, semester_id, year_id) VALUES ($1, $2, $3) RETURNING id",
                [courseName, semesterId, 3]
            );
            courseId = courseRes.rows[0].id;
        }

        const topics = [
            {
                title: "Enterprise Data Warehouse Architecture: End-to-End Flow",
                content_easy: "# The Big Picture\nUnderstanding the multi-layered path data takes from raw sources to executive dashboards.",
                content_deep: "# Architectural Engineering\nAnalyzing the Flow: Source -> Staging -> Enterprise Warehouse -> Data Marts -> Semantic Layer. Deep dive into decoupling and scalability.",
                importance: "Critical"
            },
            {
                title: "Fundamental Architectures: OLTP vs OLAP",
                content_easy: "# Operational vs Analytical Processing\nUnderstanding the difference between high-frequency transactions (OLTP) and complex business intelligence (OLAP).",
                content_deep: "# Computational Engines\nComparing row-based B-Tree indexing (OLTP) with Columnar Projection and Compression (OLAP).",
                importance: "Critical"
            },
            {
                title: "High-Fidelity ETL Pipeline Orchestration",
                content_easy: "# The ETL Pipeline\nExtracting raw sources, transforming schemas, and loading to the Warehouse.",
                content_deep: "# Pipeline Engineering\nChange Data Capture, Atomicity, and Back-Pressure management in complex data flows.",
                importance: "Critical"
            },
            {
                title: "Dimensional Modeling: Star & Snowflake Schemas",
                content_easy: "# Database Design for Analytics\nHow to structure data for maximum query performance using Fact and Dimension tables.",
                content_deep: "# Denormalization Complexity\nJoin optimization, Surrogate Keys, and Slow Change Dimensions (SCD) Types 1-4.",
                importance: "Critical"
            },
            {
                title: "Distributed Analytical Environments: Data Marts",
                content_easy: "# Departmental Data Hubs\nSubsets of the Enterprise Warehouse designed specifically for Sales, Finance, or HR.",
                content_deep: "# Kimball Bus Architecture\nDesigning conformed dimensions to allow across-mart reporting while maintaining departmental autonomy.",
                importance: "High"
            }
        ];

        for (const t of topics) {
            await client.query(
                "INSERT INTO topics (title, content_easy_markdown, content_deep_markdown, importance_level, course_id) VALUES ($1, $2, $3, $4, $5)",
                [t.title, t.content_easy, t.content_deep, t.importance, courseId]
            );
        }

        await client.query('COMMIT');
        console.log("Seeding successful with unique visual mappings!");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Seeding failed:", e);
    } finally {
        client.release();
        pool.end();
    }
}

seedDataWarehouse();
