import { client } from "@gradio/client";
import dotenv from "dotenv";
dotenv.config();

const hfToken = process.env.HF_TOKEN;

async function test(space) {
    try {
        console.log(`Connecting to ${space}...`);
        const app = await client(space, { hf_token: hfToken });
        const apiInfo = await app.view_api();
        console.log(`--- ${space} ---`);
        console.log(JSON.stringify(apiInfo, null, 2));
    } catch (e) {
        console.error(`Error with ${space}:`, e.message);
    }
}
async function run() {
    await test("mrfakename/Kokoclone");
    await test("coqui/xtts");
}
run();
