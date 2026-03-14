import pool from "../config/db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateTopicsForCourse = async (courseName, courseDescription) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are an expert curriculum designer. Generate exactly 8-12 essential learning topics for the course: "${courseName}".
        
Course Description: ${courseDescription || "A comprehensive course covering fundamental and advanced concepts."}

Requirements:
- Each topic should be a concise, specific learning objective (3-6 words)
- Topics should progress from foundational to advanced
- Focus on practical, industry-relevant skills
- Avoid generic topics like "Introduction" or "Conclusion"
- Return ONLY a JSON array of topic titles, nothing else

Example format:
["TCP/IP Protocol Stack", "DNS Resolution & Routing", "Network Security Fundamentals", "Firewall Configuration", "Intrusion Detection Systems", "VPN Architecture", "Packet Analysis Tools", "Network Troubleshooting"]

Generate topics for: ${courseName}`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Extract JSON array from response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error("Failed to extract JSON from AI response");
        }

        const topics = JSON.parse(jsonMatch[0]);
        return topics;
    } catch (error) {
        console.error(`❌ AI generation failed for ${courseName}:`, error.message);
        // Fallback to generic topics
        return [
            "Fundamental Concepts",
            "Core Principles",
            "Practical Applications",
            "Advanced Techniques",
            "Industry Best Practices",
            "Real-World Case Studies"
        ];
    }
};

const seedAllCourseTopics = async () => {
    try {
        console.log("🚀 Starting automated topic generation for all courses...\n");

        // Get all courses
        const coursesResult = await pool.query(
            "SELECT id, name, description FROM courses ORDER BY id"
        );
        const courses = coursesResult.rows;

        console.log(`📚 Found ${courses.length} courses\n`);

        for (const course of courses) {
            console.log(`\n🎯 Processing: ${course.name}`);

            // Check if topics already exist
            const existingTopics = await pool.query(
                "SELECT COUNT(*) as count FROM topics WHERE course_id = $1",
                [course.id]
            );

            const topicCount = parseInt(existingTopics.rows[0].count);

            if (topicCount >= 5) {
                console.log(`   ✅ Already has ${topicCount} topics - skipping`);
                continue;
            }

            // Generate topics using AI
            console.log(`   🤖 Generating topics with AI...`);
            const topics = await generateTopicsForCourse(course.name, course.description);

            // Insert topics
            let insertedCount = 0;
            for (const topicTitle of topics) {
                try {
                    await pool.query(
                        "INSERT INTO topics (title, course_id, importance_level) VALUES ($1, $2, $3)",
                        [topicTitle, course.id, "medium"]
                    );
                    insertedCount++;
                } catch (err) {
                    // Skip duplicates
                    if (!err.message.includes("duplicate")) {
                        console.error(`   ⚠️  Failed to insert topic: ${topicTitle}`);
                    }
                }
            }

            console.log(`   ✅ Added ${insertedCount} topics`);

            // Rate limiting to avoid API throttling
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log("\n\n🎉 Topic generation complete for all courses!");
        console.log("📊 Summary:");

        const summary = await pool.query(`
            SELECT 
                c.name,
                COUNT(t.id) as topic_count
            FROM courses c
            LEFT JOIN topics t ON c.id = t.course_id
            GROUP BY c.id, c.name
            ORDER BY c.name
        `);

        console.table(summary.rows);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await pool.end();
    }
};

seedAllCourseTopics();
