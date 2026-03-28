const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const isProd = process.env.NODE_ENV === 'production';
const currentLevel = LEVELS[process.env.LOG_LEVEL] ?? (isProd ? LEVELS.info : LEVELS.debug);

const format = (level, msg, meta) => {
    const ts = new Date().toISOString();
    if (isProd) {
        const entry = { ts, level, msg };
        if (meta && Object.keys(meta).length) entry.meta = meta;
        return JSON.stringify(entry);
    }
    const metaStr = meta && Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    return `[${ts}] ${level.toUpperCase().padEnd(5)} ${msg}${metaStr}`;
};

const log = (level, msg, meta = {}) => {
    if (LEVELS[level] <= currentLevel) {
        const out = format(level, msg, meta);
        if (level === 'error') process.stderr.write(out + '\n');
        else process.stdout.write(out + '\n');
    }
};

const logger = {
    info:  (msg, meta) => log('info',  msg, meta),
    warn:  (msg, meta) => log('warn',  msg, meta),
    error: (msg, meta) => log('error', msg, meta),
    debug: (msg, meta) => log('debug', msg, meta),
};

export default logger;
