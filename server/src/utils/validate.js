/**
 * Lightweight validation middleware — no external dependencies.
 * Usage: validate({ fieldName: { required, type, maxLength, pattern } })
 */
export const validate = (schema) => (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
        const value = req.body[field];
        const empty = value === undefined || value === null || value === '';

        if (rules.required && empty) {
            errors.push(`${field} is required`);
            continue;
        }
        if (empty) continue;

        if (rules.type === 'string' && typeof value !== 'string') {
            errors.push(`${field} must be a string`);
            continue;
        }
        if (rules.maxLength && String(value).length > rules.maxLength) {
            errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
        if (rules.pattern && !rules.pattern.test(String(value))) {
            errors.push(rules.patternMsg || `${field} format is invalid`);
        }
    }

    if (errors.length) {
        return res.status(400).json({ message: errors[0], errors });
    }
    next();
};
