import 'dotenv/config';
import pool from '../config/db.js';

// Find and inject OLTP/OLAP content directly
const oltp_content = `## 1️⃣ Topic Header
**Topic:** OLTP vs OLAP Systems
**Course:** Database Systems
**Level:** Intermediate
**Prerequisites:** Relational databases, SQL basics
**Estimated Study Time:** 45 minutes

## 2️⃣ Conceptual Overview

OLTP and OLAP represent two fundamentally different database system designs built for different purposes.

**OLTP (Online Transaction Processing)** → Designed to run day-to-day business operations.

**OLAP (Online Analytical Processing)** → Designed to analyze data for decision-making.

They are not competitors. They serve different layers of an organization.

## 3️⃣ Real-World Context

Imagine an e-commerce company.

- When a customer buys a product → **OLTP** handles the transaction.
- When executives analyze yearly sales trends → **OLAP** is used.

Real companies:
- **Amazon** uses OLTP for orders.
- **Netflix** uses OLAP for user behavior analytics.

## 4️⃣ Architectural Difference

### 4.1 OLTP Architecture

Characteristics:
- Highly normalized tables (3NF)
- Many small insert/update/delete operations
- Thousands of concurrent users
- Millisecond response time required
- Current data only

Design goal: **Accuracy + Speed + Concurrency**

### 4.2 OLAP Architecture

Characteristics:
- Denormalized schema (Star/Snowflake)
- Read-heavy queries with aggregations (SUM, AVG, COUNT)
- Historical data spanning years
- Fewer users but complex, heavy queries

Design goal: **Insight + Aggregation + Trends**

## 5️⃣ Direct Comparison Table

| Feature | OLTP | OLAP |
|---------|------|------|
| Purpose | Run business | Analyze business |
| Data | Current | Historical |
| Queries | Short, simple | Complex, long |
| Users | Many (customers, staff) | Few (analysts, managers) |
| Schema | Normalized | Denormalized |
| Example | ATM transaction | Sales trend dashboard |

*If your topic page does not include a comparison table, students struggle to differentiate.*

## 6️⃣ Deep Conceptual Insight

**Why OLTP must be normalized?**

To:
- Avoid redundancy
- Maintain data integrity
- Prevent anomalies

**Why OLAP must be denormalized?**

To:
- Reduce joins
- Improve analytical query speed
- Simplify aggregations

This is the key intellectual understanding.

## 7️⃣ The Data Warehouse Layer

OLAP usually runs on a **Data Warehouse**.

Data flows like this:
1. OLTP systems generate transactional data
2. ETL (Extract, Transform, Load) processes extract and transform it
3. Data warehouse stores the integrated, historical data
4. BI tools analyze and visualize it

Examples of BI tools:
- **Power BI**
- **Tableau**
- **Looker**

## 8️⃣ Common Misconceptions

❌ OLAP replaces OLTP → **False.** They serve different layers.

❌ You should run analytics directly on OLTP → **Dangerous.** It degrades production performance.

❌ Data warehouse updates in real time → **Not usually.** ETL jobs typically run on a schedule.

Students must unlearn these.

## 9️⃣ Industry Perspective

Modern systems use:
- Cloud warehouses like **Snowflake**, **BigQuery**, **Redshift**
- Big data platforms like **Apache Hadoop** and **Apache Spark**

**Trend:** Hybrid systems (HTAP — Hybrid Transactional/Analytical Processing) try to combine both worlds — but trade-offs exist. Examples: TiDB, CockroachDB.

## 🔟 Case Study Scenario

**Scenario:** A bank wants:
- Instant transaction processing
- Fraud detection analytics
- Monthly regulatory reporting

**Correct architecture:**
- **OLTP** for live transactions (PostgreSQL / MySQL)
- **OLAP** for fraud analytics and reporting (Snowflake / BigQuery)
- **Data warehouse** for integrating both data streams

If a student can architect this mentally → they understand the topic.

## 1️⃣1️⃣ Interview-Style Questions

1. Why is normalization harmful in OLAP?
2. Can OLTP handle reporting queries? What are the risks?
3. What happens if analytics run on a production OLTP system?
4. Explain the difference between a star schema and a normalized schema.

## 1️⃣2️⃣ Summary

**OLTP** = Operational brain of the organization
**OLAP** = Analytical brain of the organization

They solve different problems.

The mistake beginners make: thinking they are alternatives instead of **complementary systems** that work at different layers.`;

// Find the OLTP/OLAP topic
const findResult = await pool.query(
    "SELECT id, title FROM topics WHERE title ILIKE '%OLTP%' OR title ILIKE '%OLAP%' LIMIT 5"
);

console.log('Found topics:', findResult.rows);

for (const topic of findResult.rows) {
    const updateResult = await pool.query(
        `UPDATE topics SET 
            content_markdown = $1,
            difficulty = 'Intermediate',
            estimated_time = '45 min',
            breadcrumb_path = 'CS > Database Systems > OLTP vs OLAP',
            historical_context = 'OLTP emerged in the 1970s with IBM mainframe systems. OLAP was formalized by E.F. Codd in 1993 to address the analytical needs that OLTP systems could not serve efficiently.',
            staff_engineer_note = 'In production, never run ad-hoc analytical queries on your OLTP database. Even a single complex GROUP BY on a large table can lock rows and degrade user-facing performance. Use read replicas or a dedicated data warehouse.',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2`,
        [oltp_content, topic.id]
    );
    console.log(`✅ Updated topic "${topic.title}" (ID: ${topic.id}), rows: ${updateResult.rowCount}`);
}

process.exit(0);
