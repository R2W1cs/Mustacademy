import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    chatWithMentor, chatWithMentorStream, getGoals, completeGoal, submitWork,
    generateQuiz, submitQuiz,
    generateDailyPlan, getDailyPlan, deleteDailyPlan, completeSession,
    startInterview, chatWithInterviewer, generateFiller, generateLibraryLecture, verifyLibraryAnswer, interactWithProfessor,
    synthesizeTopic, createMission, generateTopicExercises,
    generateTopicPodcast, askPodcastQuestion, generatePodcastSpeech,
    getMasterclassEpisodes, getMasterclassEpisode,
    getChatSessions, getSessionMessages
} from "../controllers/ai.controller.js";


const router = express.Router();

router.post("/chat", protect, chatWithMentor);
router.post("/chat/stream", protect, chatWithMentorStream);
router.get("/chat/sessions", protect, getChatSessions);
router.get("/chat/session/:conversationId", protect, getSessionMessages);
router.get("/goals", protect, getGoals);

router.post("/complete", protect, completeGoal);
router.post("/submit", protect, submitWork);
router.post("/quiz/generate", protect, generateQuiz);
router.post("/quiz/submit", protect, submitQuiz);
router.post("/daily-plan/generate", protect, generateDailyPlan);
router.get("/daily-plan/today", protect, getDailyPlan);
router.delete("/daily-plan/:date", protect, deleteDailyPlan);
router.post("/daily-plan/session-complete", protect, completeSession);

// Interview Prep Routes
router.post("/interview/start", protect, startInterview);
router.post("/interview/chat", protect, chatWithInterviewer);
router.get("/interview/filler", protect, generateFiller);
router.post("/library/lecture", protect, generateLibraryLecture);
router.post("/library/verify", protect, verifyLibraryAnswer);
router.post("/library/interact", protect, interactWithProfessor);
router.post("/topics/synthesize", protect, synthesizeTopic);
router.post("/topics/exercises", protect, generateTopicExercises);
router.post("/topics/podcast", protect, generateTopicPodcast);
router.post("/topics/podcast/question", protect, askPodcastQuestion);
router.post("/podcast/speech", protect, generatePodcastSpeech);
router.get("/podcast/speech", generatePodcastSpeech); // Allow GET for direct streaming
router.get("/masterclass/all", protect, getMasterclassEpisodes);
router.get("/masterclass/:id", protect, getMasterclassEpisode);
router.post("/create-mission", protect, createMission);


export default router;
