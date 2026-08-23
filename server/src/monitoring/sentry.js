import * as Sentry from '@sentry/node';

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn || process.env.NODE_ENV === 'test') return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

export function sentryErrorHandler() {
  if (!process.env.SENTRY_DSN || process.env.NODE_ENV === 'test') {
    return (_err, _req, _res, next) => next();
  }
  return Sentry.expressErrorHandler();
}

export { Sentry };