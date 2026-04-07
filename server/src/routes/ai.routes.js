import express from "express";
import { protect, requirePremium } from "../middleware/auth.middleware.js";
import { aiLimiter, heavyAiLimiter } from "../middleware/rateLimiter.js";

// Domain controllers (split from the original monolithic ai.controller.js)
import { chatWithMentor, chatWithMentorStream, getChatSessions, getSessionMessages, generateFiller } from "../controllers/mentor.controller.js";
import { startInterview, chatWithInterviewer, getInterviewHistory } from "../controllers/boardroom.controller.js";
import { synthesizeTopic, generateTopicExercises, verifyLibraryAnswer, analyzeProject } from "../controllers/synthesis.controller.js";
import {
    generateLibraryLecture, interactWithProfessor,
    generateTopicPodcast, askPodcastQuestion, generatePodcastSpeech,
    generateMasterclassEpisode, getMasterclassEpisodes, getMasterclassEpisode,
    generateInteractivePodcast, generateNovaLesson,
} from "../controllers/podcast.controller.js";
import { submitWork, getGoals, completeGoal, createMission, generateQuiz, submitQuiz, generateDailyPlan, completeSession, getDailyPlan, deleteDailyPlan } from "../controllers/plan.controller.js";
import { getJobStatus } from "../utils/jobQueue.js";

const router = express.Router();

// Job status polling (synthesis, masterclass)
router.get("/jobs/:jobId", protect, async (req, res) => {
    const status = await getJobStatus(req.params.jobId);
    res.json(status);
});

// Mentor chat
router.post("/chat", protect, aiLimiter, chatWithMentor);
router.post("/chat/stream", protect, aiLimiter, chatWithMentorStream);
router.get("/chat/sessions", protect, getChatSessions);
router.get("/chat/session/:conversationId", protect, getSessionMessages);

// Goals & missions
router.get("/goals", protect, getGoals);
router.post("/complete", protect, completeGoal);
router.post("/submit", protect, submitWork);
router.post("/create-mission", protect, aiLimiter, createMission);

// Quiz
router.post("/quiz/generate", protect, aiLimiter, generateQuiz);
router.post("/quiz/submit", protect, submitQuiz);

// Daily plan
router.post("/daily-plan/generate", protect, aiLimiter, generateDailyPlan);
router.get("/daily-plan/today", protect, getDailyPlan);
router.delete("/daily-plan/:date", protect, deleteDailyPlan);
router.post("/daily-plan/session-complete", protect, completeSession);

// Interview prep
router.post("/interview/start", protect, aiLimiter, startInterview);
router.post("/interview/chat", protect, aiLimiter, chatWithInterviewer);
router.get("/interview/history", protect, getInterviewHistory);
router.get("/interview/filler", protect, generateFiller);

// Library (lectures, professor interaction)
router.post("/library/lecture", protect, aiLimiter, generateLibraryLecture);
router.post("/library/verify", protect, aiLimiter, verifyLibraryAnswer);
router.post("/library/interact", protect, aiLimiter, interactWithProfessor);

// Topic synthesis & exercises
router.post("/topics/synthesize", protect, heavyAiLimiter, synthesizeTopic);
router.post("/topics/exercises", protect, aiLimiter, generateTopicExercises);

// Podcasts & audio content
router.post("/topics/podcast", protect, requirePremium, heavyAiLimiter, generateTopicPodcast);
router.post("/topics/podcast/question", protect, aiLimiter, askPodcastQuestion);
router.post("/interactive-podcast", protect, requirePremium, aiLimiter, generateInteractivePodcast);
router.post("/nova-lesson", protect, requirePremium, aiLimiter, generateNovaLesson);
router.post("/podcast/speech", protect, generatePodcastSpeech);
router.get("/podcast/speech", generatePodcastSpeech);

// Masterclass
router.post("/masterclass/generate", protect, requirePremium, heavyAiLimiter, generateMasterclassEpisode);
router.get("/masterclass/all", protect, getMasterclassEpisodes);
router.get("/masterclass/episode/:id", protect, getMasterclassEpisode);

// Project analysis
router.post("/projects/analyze", protect, aiLimiter, analyzeProject);

export default router;
