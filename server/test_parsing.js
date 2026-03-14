import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

console.log("PDF Type:", typeof pdf);
console.log("PDF Keys:", Object.keys(pdf));

async function test() {
    console.log("Testing PDF parsing (Class-based)...");
    try {
        const dummyBuffer = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Title (Dummy) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF");
        const PDFParseClass = pdf.PDFParse || (pdf.default && pdf.default.PDFParse) || pdf;
        const parser = new PDFParseClass({ data: dummyBuffer });
        const data = await parser.getText();
        console.log("PDF Parse Success. Text Length:", data.text.length);
    } catch (e) {
        console.error("PDF Parse Fail:", e);
    }

    console.log("Testing DOCX parsing...");
    try {
        const dummyBuffer = Buffer.from(""); // Empty buffer for mammoth
        const result = await mammoth.extractRawText({ buffer: dummyBuffer });
        console.log("DOCX Parse Success:", result.value);
    } catch (e) {
        console.error("DOCX Parse Fail:", e.message);
    }
}

test();
