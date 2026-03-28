import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_DIR = path.join(__dirname, '..', 'knowledge_base');

// Sanitize filename — allow letters, digits, spaces, hyphens, underscores only
const sanitizeName = (name) => {
    if (!name || typeof name !== 'string') return null;
    const clean = name.trim().replace(/\.md$/i, '');
    if (/[^a-zA-Z0-9 \-_()]/.test(clean) || clean.includes('..') || clean.includes('/') || clean.includes('\\')) {
        return null;
    }
    return clean;
};

export const listKBFiles = (req, res) => {
    try {
        if (!fs.existsSync(KB_DIR)) return res.json([]);
        const files = fs.readdirSync(KB_DIR)
            .filter(f => f.endsWith('.md') || !f.includes('.'))
            .map(f => {
                const stat = fs.statSync(path.join(KB_DIR, f));
                return {
                    name: f.replace(/\.md$/i, ''),
                    modified: stat.mtime,
                    size: stat.size,
                };
            })
            .sort((a, b) => b.modified - a.modified);
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: 'Failed to list files' });
    }
};

export const readKBFile = (req, res) => {
    const name = sanitizeName(req.params.name);
    if (!name) return res.status(400).json({ error: 'Invalid filename' });

    // Try exact match first, then without extension
    let filePath = path.join(KB_DIR, `${name}.md`);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(KB_DIR, name);
    }
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.json({ name, content });
    } catch (err) {
        res.status(500).json({ error: 'Failed to read file' });
    }
};

export const writeKBFile = (req, res) => {
    const name = sanitizeName(req.params.name);
    if (!name) return res.status(400).json({ error: 'Invalid filename' });

    const { content } = req.body;
    if (typeof content !== 'string') return res.status(400).json({ error: 'content must be a string' });

    try {
        if (!fs.existsSync(KB_DIR)) fs.mkdirSync(KB_DIR, { recursive: true });
        fs.writeFileSync(path.join(KB_DIR, `${name}.md`), content, 'utf8');
        res.json({ message: 'Saved', name });
    } catch (err) {
        res.status(500).json({ error: 'Failed to write file' });
    }
};

export const deleteKBFile = (req, res) => {
    const name = sanitizeName(req.params.name);
    if (!name) return res.status(400).json({ error: 'Invalid filename' });

    let filePath = path.join(KB_DIR, `${name}.md`);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(KB_DIR, name);
    }
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

    try {
        fs.unlinkSync(filePath);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete file' });
    }
};
