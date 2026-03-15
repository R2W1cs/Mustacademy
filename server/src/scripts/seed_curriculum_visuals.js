import pool from '../config/db.js';

async function seedVisuals() {
    try {
        console.log("--- Enriching Curriculum with Visuals ---");

        // 1. Data Warehouse Visuals
        const dwRes = await pool.query("SELECT id, content_deep_markdown FROM topics WHERE title ILIKE '%Evolution of Data Warehousing%' LIMIT 1");
        if (dwRes.rows.length > 0) {
            let content = dwRes.rows[0].content_deep_markdown;
            const visual = `
### 🖼️ Modern Data Warehouse Architecture
![Data Warehouse Architecture](/uploads/curriculum/data_warehouse_architecture.png)
*(High-Level Flow: Sources -> ETL -> Warehouse -> Data Marts -> BI)*
`;
            if (!content.includes('data_warehouse_architecture.png')) {
                content = content.replace('### 🚀 The Evolution', visual + '\n### 🚀 The Evolution');
                await pool.query("UPDATE topics SET content_deep_markdown = $1 WHERE id = $2", [content, dwRes.rows[0].id]);
                console.log("Injected DW Architecture visual.");
            }
        }

        // 2. AI Foundations: ML vs Rules
        const aiFoundRes = await pool.query("SELECT id, content_deep_markdown FROM topics WHERE title ILIKE '%Theoretical Foundations of Artificial Intelligence%' LIMIT 1");
        if (aiFoundRes.rows.length > 0) {
            let content = aiFoundRes.rows[0].content_deep_markdown;
            const mermaidML = `
### 🧠 Machine Learning vs. Rule-Based Systems
\`\`\`mermaid
graph LR
    subgraph "Rule-Based (Traditional)"
        RA[Data] --> RB[Rules/Human Logic]
        RB --> RC[Program]
        RC --> RD[Result]
    end
    subgraph "Machine Learning"
        MA[Data] --> MB[Results/Labels]
        MB --> MC[Training/Learning]
        MC --> MD[Model]
    end
\`\`\`
`;
            if (!content.includes('graph LR')) {
                content = content + "\n" + mermaidML;
                await pool.query("UPDATE topics SET content_deep_markdown = $1 WHERE id = $2", [content, aiFoundRes.rows[0].id]);
                console.log("Injected ML vs Rules visual.");
            }
        }

        // 3. ML Algorithms: Decision Trees & Random Forest
        const mlAlgoRes = await pool.query("SELECT id, content_deep_markdown FROM topics WHERE title ILIKE '%Machine Learning Algorithms%' LIMIT 1");
        if (mlAlgoRes.rows.length > 0) {
            let content = mlAlgoRes.rows[0].content_deep_markdown;
            const mermaidRF = `
### 🌲 From Decision Trees to Random Forest
\`\`\`mermaid
graph TD
    Data[Dataset] --> Tree1[Decision Tree 1]
    Data --> Tree2[Decision Tree 2]
    Data --> TreeN[Decision Tree N]
    
    Tree1 --> V1[Result 1]
    Tree2 --> V2[Result 2]
    TreeN --> VN[Result N]
    
    V1 --> Vote{Majority Vote}
    V2 --> Vote
    VN --> Vote
    
    Vote --> Final[Final Prediction]
\`\`\`
*(A Random Forest combines multiple weak trees to create a strong, stable model)*
`;
            if (!content.includes('graph TD')) {
                content = content.replace('### 4.2 Deep Learning', mermaidRF + '\n### 4.2 Deep Learning');
                await pool.query("UPDATE topics SET content_deep_markdown = $1 WHERE id = $2", [content, mlAlgoRes.rows[0].id]);
                console.log("Injected Random Forest visual.");
            }
        }

        // 4. Knowledge Representation: First-Order Logic
        const krRes = await pool.query("SELECT id, content_deep_markdown FROM topics WHERE title ILIKE '%Knowledge Representation in AI%' LIMIT 1");
        if (krRes.rows.length > 0) {
            let content = krRes.rows[0].content_deep_markdown;
            const mermaidFOL = `
### 🌐 Logical Structures (Semantic Networks)
\`\`\`mermaid
graph BT
    Socrates[Socrates] -- is-a --> Man[Man]
    Man -- is-a --> Mortal[Mortal]
    Mortal -- property --> "Can Die"
    
    subgraph "Rule (FORALL x)"
        RA[Man(x)] --> RB[Mortal(x)]
    end
\`\`\`
*(Representing complex relationships through logic gates and semantic graphs)*
`;
            if (!content.includes('graph BT')) {
                content = content + "\n" + mermaidFOL;
                await pool.query("UPDATE topics SET content_deep_markdown = $1 WHERE id = $2", [content, krRes.rows[0].id]);
                console.log("Injected FOL visual.");
            }
        }

        console.log("Visual Seeding Success!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
}

seedVisuals();
