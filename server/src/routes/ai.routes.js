import express from "express";
import { protect, requirePremium } from "../middleware/auth.middleware.js";
import { aiLimiter, heavyAiLimiter } from "../middleware/rateLimiter.js";
import {
    chatWithMentor, chatWithMentorStream, getGoals, completeGoal, submitWork,
    generateQuiz, submitQuiz,
    generateDailyPlan, getDailyPlan, deleteDailyPlan, completeSession,
    startInterview, chatWithInterviewer, generateFiller, getInterviewHistory, generateLibraryLecture, verifyLibraryAnswer, interactWithProfessor,
    synthesizeTopic, createMission, generateTopicExercises,
    generateTopicPodcast, askPodcastQuestion, generatePodcastSpeech, generateInteractivePodcast, generateNovaLesson,
    getMasterclassEpisodes, getMasterclassEpisode,
    getChatSessions, getSessionMessages,
    analyzeProject
} from "../controllers/ai.controller.js";


const router = express.Router();

router.post("/chat", protect, aiLimiter, chatWithMentor);
router.post("/chat/stream", protect, aiLimiter, chatWithMentorStream);
router.get("/chat/sessions", protect, getChatSessions);
router.get("/chat/session/:conversationId", protect, getSessionMessages);
router.get("/goals", protect, getGoals);

router.post("/complete", protect, completeGoal);
router.post("/submit", protect, submitWork);
router.post("/quiz/generate", protect, aiLimiter, generateQuiz);
router.post("/quiz/submit", protect, submitQuiz);
router.post("/daily-plan/generate", protect, aiLimiter, generateDailyPlan);
router.get("/daily-plan/today", protect, getDailyPlan);
router.delete("/daily-plan/:date", protect, deleteDailyPlan);
router.post("/daily-plan/session-complete", protect, completeSession);

// Interview Prep Routes
router.post("/interview/start", protect, aiLimiter, startInterview);
router.post("/interview/chat", protect, aiLimiter, chatWithInterviewer);
router.get("/interview/history", protect, getInterviewHistory);
router.get("/interview/filler", protect, generateFiller);
router.post("/library/lecture", protect, aiLimiter, generateLibraryLecture);
router.post("/library/verify", protect, aiLimiter, verifyLibraryAnswer);
router.post("/library/interact", protect, aiLimiter, interactWithProfessor);
router.post("/topics/synthesize", protect, heavyAiLimiter, synthesizeTopic);
router.post("/topics/exercises", protect, aiLimiter, generateTopicExercises);
router.post("/topics/podcast", protect, requirePremium, heavyAiLimiter, generateTopicPodcast);
router.post("/topics/podcast/question", protect, aiLimiter, askPodcastQuestion);
router.post("/interactive-podcast", protect, requirePremium, aiLimiter, generateInteractivePodcast);
router.post("/nova-lesson", protect, requirePremium, aiLimiter, generateNovaLesson);
router.post("/podcast/speech", protect, generatePodcastSpeech);
router.get("/podcast/speech", generatePodcastSpeech); // Allow GET for direct audio streaming
router.get("/masterclass/all", protect, getMasterclassEpisodes);
router.get("/masterclass/episode/:id", protect, getMasterclassEpisode);
router.post("/create-mission", protect, aiLimiter, createMission);
router.post("/projects/analyze", protect, aiLimiter, analyzeProject);

export default router;
