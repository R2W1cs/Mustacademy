import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        env: {
            JWT_SECRET: 'test-secret-key-for-tests-only',
            NODE_ENV: 'test',
            LOG_LEVEL: 'warn', // suppress info/debug logs during tests, keep errors + warnings
        },
        coverage: {
            reporter: ['text', 'html'],
            include: ['src/**/*.js'],
            exclude: ['src/config/**', 'src/lib/MultiplayerGameManager.js'],
        },
    },
});
