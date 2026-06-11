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
        if (rules.minLength && String(value).length < rules.minLength) {
            errors.push(`${field} must be at least ${rules.minLength} characters`);
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RULES = {
    required: true,
    type: 'string',
    minLength: 8,
    pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
    patternMsg: 'Password must be at least 8 characters and include a letter and a number',
};

export const validateRegister = validate({
    name: { required: true, type: 'string', maxLength: 120 },
    email: { required: true, type: 'string', maxLength: 254, pattern: EMAIL_PATTERN, patternMsg: 'Invalid email format' },
    password: PASSWORD_RULES,
});

export const validateLogin = validate({
    email: { required: true, type: 'string', maxLength: 254, pattern: EMAIL_PATTERN, patternMsg: 'Invalid email format' },
    password: { required: true, type: 'string', maxLength: 128 },
});

export const validateForgotPassword = validate({
    email: { required: true, type: 'string', maxLength: 254, pattern: EMAIL_PATTERN, patternMsg: 'Invalid email format' },
});

export const validateResetPassword = validate({
    token: { required: true, type: 'string', maxLength: 128 },
    newPassword: PASSWORD_RULES,
});
