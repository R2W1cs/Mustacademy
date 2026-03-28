/**
 * Wraps an async Express route handler so any thrown error is forwarded to
 * the global error middleware instead of becoming an unhandled rejection.
 *
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
