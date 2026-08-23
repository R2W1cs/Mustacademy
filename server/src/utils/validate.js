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
        if (rules.type === 'integer') {
            const n = Number(value);
            if (!Number.isInteger(n)) {
                errors.push(`${field} must be an integer`);
                continue;
            }
            req.body[field] = n;
        }
        if (rules.type === 'number') {
            const n = Number(value);
            if (Number.isNaN(n)) {
                errors.push(`${field} must be a number`);
                continue;
            }
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

const FORUM_TYPES = /^(discussion|question|resource|announcement)$/;

export const validateCreateThread = validate({
    title: { required: true, type: 'string', minLength: 3, maxLength: 200 },
    content: { required: true, type: 'string', minLength: 1, maxLength: 10000 },
    topicId: { required: false, type: 'integer' },
    type: { required: false, type: 'string', pattern: FORUM_TYPES, patternMsg: 'Invalid thread type' },
});

export const validateCreateComment = validate({
    threadId: { required: true, type: 'integer' },
    content: { required: true, type: 'string', minLength: 1, maxLength: 5000 },
    parentCommentId: { required: false, type: 'integer' },
});

export const validateToggleUpvote = (req, res, next) => {
    if (!req.body.threadId && !req.body.comment_id) {
        return res.status(400).json({ message: 'threadId or comment_id is required' });
    }
    return validate({
        threadId: { required: false, type: 'integer' },
        comment_id: { required: false, type: 'integer' },
    })(req, res, next);
};

export const validateUpdateProfile = validate({
    avatar_url: { required: false, type: 'string', maxLength: 400000 },
    bio: { required: false, type: 'string', maxLength: 1000 },
    passion: { required: false, type: 'string', maxLength: 200 },
    year: { required: false, type: 'integer' },
    semester: { required: false, type: 'integer' },
    status: { required: false, type: 'string', maxLength: 32 },
    dream_job: { required: false, type: 'string', maxLength: 120 },
    target_company: { required: false, type: 'string', maxLength: 120 },
    technical_pillar: { required: false, type: 'string', maxLength: 120 },
});

export const validateVideoUpload = validate({
    courseId: { required: true, type: 'integer' },
    title: { required: true, type: 'string', minLength: 1, maxLength: 200 },
    description: { required: false, type: 'string', maxLength: 2000 },
});

export const validateVideoFeedback = validate({
    feedback: { required: true, type: 'string', minLength: 1, maxLength: 2000 },
    rating: { required: false, type: 'integer' },
});
