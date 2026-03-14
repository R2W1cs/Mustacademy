import { getTopicById } from './src/controllers/course.controller.js';
import { checkTopicAccess, submitQuizResult } from './src/controllers/progress.controller.js';

// Mock Response object
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.jsonData = data;
        return res;
    };
    return res;
};

async function testFixes() {
    console.log("--- Testing getTopicById ---");
    const req1 = { user: { id: 1 }, params: { id: "undefined" } };
    const res1 = mockRes();
    await getTopicById(req1, res1);
    console.log("Status:", res1.statusCode, "Data:", res1.jsonData);

    console.log("\n--- Testing checkTopicAccess ---");
    const req2 = { user: { id: 1 }, params: { topicId: "undefined" } };
    const res2 = mockRes();
    await checkTopicAccess(req2, res2);
    console.log("Status:", res2.statusCode, "Data:", res2.jsonData);

    console.log("\n--- Testing submitQuizResult ---");
    const req3 = { user: { id: 1 }, body: { topicId: "undefined", score: 80 } };
    const res3 = mockRes();
    await submitQuizResult(req3, res3);
    console.log("Status:", res3.statusCode, "Data:", res3.jsonData);
}

testFixes().catch(console.error);
