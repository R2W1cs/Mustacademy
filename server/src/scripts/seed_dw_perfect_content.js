import pool from '../config/db.js';

async function seedPerfectDW() {
    try {
        console.log("--- Injecting PERFECT Curriculum: Evolution of Data Warehousing ---");

        // 1. Find the Course
        const courseRes = await pool.query("SELECT id FROM courses WHERE name ILIKE '%CS 336%' OR name ILIKE '%Data warehousing & management%' LIMIT 1");
        
        if (courseRes.rows.length === 0) {
            console.error("Course CS 336 not found.");
            process.exit(1);
        }

        const courseId = courseRes.rows[0].id;

        const topic = {
            title: "Evolution of Data Warehousing: From Silos to Fabric",
            importance: "Critical",
            content_easy: `# 🏛️ The Evolution of Data Warehousing

### 🌟 The Big Picture
Imagine a massive library where every book is written in a different language and scattered across different rooms. That was the state of business data in the 1980s. **Data Warehousing** is the science of bringing all those "books" together, translating them into a single language, and organizing them so a business can actually make smart decisions.

### 📍 The Journey in 3 Steps
1.  **Isolated Silos (1970s)**: Every department (Sales, HR, Finance) had its own private data. They couldn't talk to each other.
2.  **The Central Library (1990s-2000s)**: We built "Warehouses"—centralized hubs where data was cleaned and stored for historical reporting.
3.  **The Cloud Intelligence (Now)**: Today, warehouses are in the cloud (like **Snowflake** or **BigQuery**). They don't just store data; they power AI and provide answers in real-time.

> [!TIP]
> **The Goal**: Move from "What happened last month?" to "What will happen next month?" using AI-driven analytics.

***

### 📂 How it Works (The Bento View)
*   **Sources**: Where data originates (Apps, IoT, Social Media).
*   **ETL (The Translator)**: **E**xtract, **T**ransform, **L**oad. It cleans the data.
*   **The Warehouse**: The "Single Source of Truth".
*   **BI (The Dashboard)**: Where managers see the results.

***

### ❌ Myths vs. ✅ Facts
*   ❌ **Myth**: A Data Warehouse is just a big database.
*   ✅ **Fact**: Databases handle **Transactions** (orders, clicks); Warehouses handle **Analysis** (trends, correlations).
`,
            content_deep: `### 🎯 The Architectural Genesis
The concept of the Data Warehouse (DW) emerged from the need to separate **OLTP** (Online Transactional Processing) from **OLAP** (Online Analytical Processing).

#### 🏛️ The Inmon vs. Kimball Feud
The industry was founded on two competing philosophies that still define modern architecture:
1.  **Bill Inmon (The Corporate Data Warehouse)**:
    *   **Philosophy**: Top-Down.
    *   **Structure**: Normalized (3NF). Data is meticulously cleaned and integrated before entering the hub.
    *   **Pros**: Extreme consistency, "Single Source of Truth".
2.  **Ralph Kimball (The Dimensional Star Schema)**:
    *   **Philosophy**: Bottom-Up.
    *   **Structure**: De-normalized (**Star Schemas**). Focuses on "Data Marts" tailored to business users.
    *   **Pros**: High performance, faster implementation, user-friendly.

***

### 🚀 The Cloud-Native Revolution
The transition from on-premise appliances (like **Teradata**) to the Cloud (like **Snowflake**) introduced **Decoupled Architecture**:
*   **Storage and Compute Separation**: You can scale your processing power instantly to run a massive query and then scale it back down to save costs.
*   **The Data Lakehouse**: The holy grail of modern management. It combines the structured reliability of a Warehouse with the raw, elastic scale of a **Data Lake** (S3/Hadoop).

***

### 🤖 The AI Era: Beyond Reporting
Modern warehouses are no longer just storage bins; they are **Inference Engines**:
1.  **Vector Integration**: Storing high-dimensional embeddings (Vector Search) directly alongside rows to power RAG (Retrieval-Augmented Generation) for LLMs.
2.  **Zero-ETL**: Using "Data Sharing" to eliminate the messy, brittle ETL pipelines of the past. Data is queried in-place without moving it.
3.  **Semantic AI Layer**: LLMs are now being used to bridge the SQL gap, allowing users to ask "Rank our top regions by churn risk" and getting a live chart instantly.

> [!IMPORTANT]
> **Axiom**: In the age of AI, data is the "Oil", but the Warehouse is the "Refinery". Without the refinery, the oil is just a mess.

### 🛠️ Production Trade-offs
| Feature | Traditional Warehouse | Modern Lakehouse |
| :--- | :--- | :--- |
| **Data Type** | Structured (only) | Structured + Unstructured |
| **Cost** | Fixed / High | Elastic / Usage-based |
| **Latency** | Batch (Daily/Hourly) | Streaming / Real-time |
| **Primary Goal** | Business Reporting | AI/ML + Reporting |
`
        };

        // Update topic
        const res = await pool.query(
            `UPDATE topics 
             SET content_easy_markdown = $1, 
                 content_deep_markdown = $2, 
                 importance_level = $3,
                 staff_engineer_note = $4,
                 historical_context = $5
             WHERE title ILIKE '%Evolution of Data Warehousing%' AND course_id = $6
             RETURNING id`,
            [
                topic.content_easy, 
                topic.content_deep, 
                topic.importance,
                "Mastery of this topic is the foundation of architectural intuition. Understand Inmon vs Kimball, or you will fail at system design.",
                "1970s Silos -> 1990s Inmon/Kimball -> 2010s Cloud -> 2024 AI Lakehouse.",
                courseId
            ]
        );

        if (res.rows.length > 0) {
            console.log(`✅ PERFECT CONTENT INJECTED: (ID: ${res.rows[0].id})`);
        } else {
            console.error("❌ Topic not found for update.");
        }

        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
}

seedPerfectDW();
