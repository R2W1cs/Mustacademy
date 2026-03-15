import pool from '../config/db.js';

async function seedEvolution() {
    try {
        console.log("--- Seeding Evolution of Data Warehousing ---");

        // 1. Find the Course
        const courseRes = await pool.query("SELECT id FROM courses WHERE name ILIKE '%CS 336%' OR name ILIKE '%Data warehousing & management%' LIMIT 1");
        
        if (courseRes.rows.length === 0) {
            console.error("Course CS 336 not found. Please run seed_curriculum.js first.");
            process.exit(1);
        }

        const courseId = courseRes.rows[0].id;

        const topics = [
            {
                title: "Evolution of Data Warehousing: From Silos to Fabric",
                importance: "Critical",
                content_easy: `# The History of Data
Understand how we moved from isolated files to global data fabrics and AI-driven intelligence.`,
                content_deep: `### 🏛️ The Origins: The Era of Silos (1970s - 1980s)
Before the "Warehouse" existed, data lived in isolated **Operational Silos**. Marketing had their files, Finance had theirs. Correlating data meant manual, error-prone exports.

### 🎯 The Birth: 1990 & The Two Giants
The modern Data Warehouse was codified in 1990. Two competing philosophies emerged:
1. **Bill Inmon (Top-Down):** The "Father of DW". He advocated for a centralized, normalized Enterprise Data Warehouse (EDW) that serves as the single source of truth.
2. **Ralph Kimball (Bottom-Up):** He introduced **Dimensional Modeling** (Star Schemas). He focused on usability and building "Data Marts" first.

### 🚀 The Evolution: Scaling the Signal
- **2000s: The Appliance Era:** Hardware-software bundles like **Netezza** and **Teradata** allowed companies to query terabytes in seconds.
- **2010s: The Cloud Revolution:** **Snowflake**, **BigQuery**, and **Redshift** decoupled storage from compute, allowing infinite scale without managing servers.
- **2015+: The Data Lakehouse:** Merging the flexibility of "Data Lakes" (Hadoop/Spark) with the performance of "Warehouses".

### 🤖 The Present: AI & The Data Fabric
Today, the Warehouse isn't just for reports—it's for **Training AI**. 
- **Vector Search:** Modern warehouses now store "embeddings" to power LLMs.
- **Zero-ETL:** Moving data across systems without writing code.
- **Generative BI:** Using AI to turn natural language ("What was our revenue in March?") into SQL instantly.`
            },
            {
                title: "AI-Powered Data Management & Modern Trends",
                importance: "High",
                content_easy: `# AI in Data Engineering
How Artificial Intelligence is taking over the manual work of managing data pipelines.`,
                content_deep: `### 🧠 Automating the Pipeline
Modern Data Warehousing is moving towards **Autonomous Systems**:
1. **Automated Data Quality:** ML models that detect "anomalous" data entries before they reach your dashboard.
2. **Predictive Scaling:** The Warehouse automatically grows its compute power *before* a heavy query hits, based on historical patterns.
3. **Semantic Layer AI:** LLMs act as the bridge between raw data and business users, allowing non-technical staff to perform complex analysis through chat.

### 🛠️ Vector Databases & LLMs
The most critical shift is the integration of **Vector Engines** (like pgvector or Snowflake Cortex). This allows the Warehouse to store the "meaning" of text, images, and video, making it the primary engine for Retrieval Augmented Generation (RAG).`
            }
        ];

        for (const t of topics) {
            // Check if topic exists
            const check = await pool.query("SELECT id FROM topics WHERE title = $1 AND course_id = $2", [t.title, courseId]);
            if (check.rows.length > 0) {
                console.log(`Updating topic: ${t.title}`);
                await pool.query(
                    "UPDATE topics SET content_easy_markdown = $1, content_deep_markdown = $2, importance_level = $3 WHERE id = $4",
                    [t.content_easy, t.content_deep, t.importance, check.rows[0].id]
                );
            } else {
                console.log(`Inserting new topic: ${t.title}`);
                await pool.query(
                    "INSERT INTO topics (title, content_easy_markdown, content_deep_markdown, importance_level, course_id) VALUES ($1, $2, $3, $4, $5)",
                    [t.title, t.content_easy, t.content_deep, t.importance, courseId]
                );
            }
        }

        console.log("Seeding Success!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
}

seedEvolution();
