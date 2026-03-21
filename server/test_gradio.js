import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

async function test() {
    try {
        const hfToken = process.env.HF_TOKEN;
        console.log("Testing HF token:", hfToken ? "Exists" : "Missing");
        
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/coqui/XTTS-v2",
            { inputs: "Hello, this is a test of the Hugging Face API." },
            { 
                headers: { 'Authorization': `Bearer ${hfToken}` },
                responseType: 'arraybuffer' 
            }
        );
        console.log("Status:", response.status);
        console.log("Length:", response.data.byteLength);
        fs.writeFileSync("out.flac", Buffer.from(response.data, 'binary'));
        console.log("Saved out.flac");
    } catch (e) {
        console.error("Error:", e.response ? e.response.status : e.message);
        if (e.response && e.response.data) {
            console.error("Data:", Buffer.from(e.response.data).toString('utf-8'));
        }
    }
}
test();
