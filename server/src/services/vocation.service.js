/**
 * vocation.service.js
 * Career alignment utility — pure function, no DB calls.
 * Returns career oracle data based on the user's dream job and completed courses.
 */

const CAREER_PATHS = {
    "software engineer": {
        title: "Software Engineer",
        criticalPath: ["Algorithms", "Data Structures", "Operating Systems", "Networks"],
        skills: ["Problem Solving", "System Design", "Data Structures", "Algorithms"],
        matchKeywords: ["software", "engineer", "developer", "programmer", "fullstack", "backend", "frontend"]
    },
    "data scientist": {
        title: "Data Scientist",
        criticalPath: ["Intro to AI", "Databases", "Statistics", "Machine Learning"],
        skills: ["Python", "Statistics", "Machine Learning", "Data Analysis"],
        matchKeywords: ["data scientist", "data science", "ml", "machine learning", "analytics", "data analyst"]
    },
    "cybersecurity": {
        title: "Cybersecurity Engineer",
        criticalPath: ["Networks", "Operating Systems", "Security"],
        skills: ["Network Security", "Cryptography", "Ethical Hacking", "System Hardening"],
        matchKeywords: ["security", "cyber", "penetration", "infosec", "hacker", "soc"]
    },
    "devops": {
        title: "DevOps Engineer",
        criticalPath: ["Networks", "Operating Systems", "Cloud Computing"],
        skills: ["CI/CD", "Docker", "Kubernetes", "Linux", "Monitoring"],
        matchKeywords: ["devops", "cloud", "infrastructure", "sre", "platform", "kubernetes"]
    },
    "ai engineer": {
        title: "AI Engineer",
        criticalPath: ["Intro to AI", "Algorithms", "Data Structures", "Databases"],
        skills: ["Deep Learning", "Python", "Model Training", "Data Pipelines"],
        matchKeywords: ["ai", "artificial intelligence", "deep learning", "neural", "nlp", "llm"]
    }
};

const DEFAULT_CAREER = {
    title: "Software Engineer",
    criticalPath: ["Algorithms", "Data Structures", "Operating Systems"],
    skills: ["Problem Solving", "System Design", "Teamwork"],
    matchKeywords: []
};

/**
 * Match a dream_job string to a known career path.
 */
const matchCareer = (dreamJob) => {
    if (!dreamJob) return DEFAULT_CAREER;
    const lower = dreamJob.toLowerCase();
    for (const [, path] of Object.entries(CAREER_PATHS)) {
        if (path.matchKeywords.some(kw => lower.includes(kw))) {
            return path;
        }
    }
    return { ...DEFAULT_CAREER, title: dreamJob };
};

/**
 * Calculate alignment score based on how many critical courses are completed.
 */
const calcAlignment = (criticalPath, completedCourses) => {
    if (!criticalPath?.length || !completedCourses?.length) return 0;
    const completedNames = completedCourses.map(c => (c.name || c).toLowerCase());
    const matched = criticalPath.filter(req =>
        completedNames.some(name => name.includes(req.toLowerCase()))
    );
    return Math.round((matched.length / criticalPath.length) * 100);
};

/**
 * Main export — used by dashboard and knowledge map controllers.
 * @param {string} dreamJob - User's target career
 * @param {Array} completedCourses - Array of { name } objects from DB
 * @returns {{ title, alignment, criticalPath, skills, nextStep }}
 */
export const getCareerAlignment = (dreamJob, completedCourses = []) => {
    const career = matchCareer(dreamJob);
    const alignment = calcAlignment(career.criticalPath, completedCourses);

    const completedNames = completedCourses.map(c => (c.name || c).toLowerCase());
    const remainingPath = career.criticalPath.filter(req =>
        !completedNames.some(name => name.includes(req.toLowerCase()))
    );

    return {
        title: career.title,
        alignment,
        criticalPath: career.criticalPath,
        remainingPath,
        skills: career.skills,
        nextStep: remainingPath[0] || null
    };
};
