-- Generated from live Neon schema dump. Idempotent.
-- Do not edit by hand; regenerate with dumpLiveSchema + generateSchemaSnapshot.

DO $$ BEGIN
  CREATE TYPE "topic_difficulty" AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Expert');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE SEQUENCE IF NOT EXISTS "asset_hiding_id_seq";
CREATE SEQUENCE IF NOT EXISTS "asset_reviews_id_seq";
CREATE SEQUENCE IF NOT EXISTS "career_paths_id_seq";
CREATE SEQUENCE IF NOT EXISTS "career_roadmaps_id_seq";
CREATE SEQUENCE IF NOT EXISTS "chat_messages_id_seq";
CREATE SEQUENCE IF NOT EXISTS "chat_rooms_id_seq";
CREATE SEQUENCE IF NOT EXISTS "cheatsheets_id_seq";
CREATE SEQUENCE IF NOT EXISTS "courses_id_seq";
CREATE SEQUENCE IF NOT EXISTS "creator_projects_id_seq";
CREATE SEQUENCE IF NOT EXISTS "daily_goals_id_seq";
CREATE SEQUENCE IF NOT EXISTS "forum_comments_id_seq";
CREATE SEQUENCE IF NOT EXISTS "forum_threads_id_seq";
CREATE SEQUENCE IF NOT EXISTS "forum_upvotes_id_seq";
CREATE SEQUENCE IF NOT EXISTS "goal_submissions_id_seq";
CREATE SEQUENCE IF NOT EXISTS "learning_paths_id_seq";
CREATE SEQUENCE IF NOT EXISTS "lexicon_terms_id_seq";
CREATE SEQUENCE IF NOT EXISTS "market_news_id_seq";
CREATE SEQUENCE IF NOT EXISTS "masterclass_episodes_id_seq";
CREATE SEQUENCE IF NOT EXISTS "modules_id_seq";
CREATE SEQUENCE IF NOT EXISTS "notifications_id_seq";
CREATE SEQUENCE IF NOT EXISTS "password_resets_id_seq";
CREATE SEQUENCE IF NOT EXISTS "peer_videos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "project_requests_id_seq";
CREATE SEQUENCE IF NOT EXISTS "project_tasks_id_seq";
CREATE SEQUENCE IF NOT EXISTS "project_weekly_reports_id_seq";
CREATE SEQUENCE IF NOT EXISTS "projects_id_seq";
CREATE SEQUENCE IF NOT EXISTS "refresh_tokens_id_seq";
CREATE SEQUENCE IF NOT EXISTS "resources_id_seq";
CREATE SEQUENCE IF NOT EXISTS "scholarly_assets_id_seq";
CREATE SEQUENCE IF NOT EXISTS "semesters_id_seq";
CREATE SEQUENCE IF NOT EXISTS "skills_id_seq";
CREATE SEQUENCE IF NOT EXISTS "squad_messages_id_seq";
CREATE SEQUENCE IF NOT EXISTS "synaptic_messages_id_seq";
CREATE SEQUENCE IF NOT EXISTS "topic_resources_id_seq";
CREATE SEQUENCE IF NOT EXISTS "topics_id_seq";
CREATE SEQUENCE IF NOT EXISTS "user_badges_id_seq";
CREATE SEQUENCE IF NOT EXISTS "user_contributions_id_seq";
CREATE SEQUENCE IF NOT EXISTS "user_courses_id_seq";
CREATE SEQUENCE IF NOT EXISTS "user_topic_notes_id_seq";
CREATE SEQUENCE IF NOT EXISTS "users_id_seq";
CREATE SEQUENCE IF NOT EXISTS "video_feedback_id_seq";
CREATE SEQUENCE IF NOT EXISTS "video_reactions_id_seq";
CREATE SEQUENCE IF NOT EXISTS "years_id_seq";

CREATE TABLE IF NOT EXISTS "users" (
  "id" INTEGER NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(150) NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" VARCHAR(20) DEFAULT 'student'::character varying,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "year" INTEGER,
  "semester" INTEGER,
  "avatar_url" TEXT,
  "bio" TEXT,
  "passion" TEXT,
  "status" TEXT DEFAULT 'online'::text,
  "streak_current" INTEGER DEFAULT 0,
  "streak_last_active_date" DATE,
  "current_asc" INTEGER DEFAULT 0,
  "last_active_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "dream_job" TEXT,
  "target_company" TEXT,
  "technical_pillar" TEXT,
  "elo_rating" INTEGER DEFAULT 1200,
  "plan" VARCHAR(20) DEFAULT 'free'::character varying,
  "token_version" INTEGER NOT NULL DEFAULT 0,
  "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
  "locked_until" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "scholarly_assets" (
  "id" INTEGER NOT NULL DEFAULT nextval('scholarly_assets_id_seq'::regclass),
  "user_id" INTEGER,
  "title" VARCHAR(255) NOT NULL,
  "file_url" TEXT NOT NULL,
  "asset_type" VARCHAR(50) NOT NULL,
  "subject_area" VARCHAR(100),
  "status" VARCHAR(20) DEFAULT 'pending'::character varying,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "is_hidden" BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS "asset_hiding" (
  "id" INTEGER NOT NULL DEFAULT nextval('asset_hiding_id_seq'::regclass),
  "asset_id" INTEGER,
  "user_id" INTEGER,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "asset_reviews" (
  "id" INTEGER NOT NULL DEFAULT nextval('asset_reviews_id_seq'::regclass),
  "asset_id" INTEGER,
  "reviewer_id" INTEGER,
  "rating" INTEGER,
  "comment" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "career_paths" (
  "id" INTEGER NOT NULL DEFAULT nextval('career_paths_id_seq'::regclass),
  "name" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "career_roadmaps" (
  "id" INTEGER NOT NULL DEFAULT nextval('career_roadmaps_id_seq'::regclass),
  "user_id" INTEGER,
  "target_job" VARCHAR(255) NOT NULL,
  "architecture_json" JSONB,
  "roadmap_steps_json" JSONB,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "full_roadmap_json" JSONB,
  "career_key" VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS "chat_rooms" (
  "id" INTEGER NOT NULL DEFAULT nextval('chat_rooms_id_seq'::regclass),
  "name" VARCHAR(255) NOT NULL,
  "type" VARCHAR(50) DEFAULT 'public'::character varying,
  "admin_id" INTEGER,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "password" VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS "chat_members" (
  "room_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "is_voice_active" BOOLEAN DEFAULT false,
  "joined_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" INTEGER NOT NULL DEFAULT nextval('chat_messages_id_seq'::regclass),
  "room_id" INTEGER,
  "sender_id" INTEGER,
  "text" TEXT,
  "attachment_url" TEXT,
  "attachment_type" VARCHAR(50),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "user_id" INTEGER,
  "role" VARCHAR(50),
  "chat_type" VARCHAR(50),
  "message" TEXT,
  "conversation_id" UUID
);

CREATE TABLE IF NOT EXISTS "cheatsheets" (
  "id" INTEGER NOT NULL DEFAULT nextval('cheatsheets_id_seq'::regclass),
  "user_id" INTEGER,
  "title" VARCHAR(255) NOT NULL,
  "file_url" TEXT NOT NULL,
  "category" VARCHAR(100),
  "upvotes" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "semesters" (
  "id" INTEGER NOT NULL DEFAULT nextval('semesters_id_seq'::regclass),
  "year_number" INTEGER NOT NULL,
  "semester_number" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "years" (
  "id" INTEGER NOT NULL DEFAULT nextval('years_id_seq'::regclass),
  "year_number" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "courses" (
  "id" INTEGER NOT NULL DEFAULT nextval('courses_id_seq'::regclass),
  "name" VARCHAR(150) NOT NULL,
  "description" TEXT,
  "year_id" INTEGER,
  "semester_id" INTEGER
);

CREATE TABLE IF NOT EXISTS "course_career" (
  "course_id" INTEGER NOT NULL,
  "career_id" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "skills" (
  "id" INTEGER NOT NULL DEFAULT nextval('skills_id_seq'::regclass),
  "name" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "course_skills" (
  "course_id" INTEGER NOT NULL,
  "skill_id" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "creator_projects" (
  "id" INTEGER NOT NULL DEFAULT nextval('creator_projects_id_seq'::regclass),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "owner_id" INTEGER,
  "status" TEXT DEFAULT 'open'::text,
  "skills_required" text[],
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "github_repo" TEXT,
  "phase" VARCHAR(30) DEFAULT 'planning'::character varying
);

CREATE TABLE IF NOT EXISTS "daily_goals" (
  "id" INTEGER NOT NULL DEFAULT nextval('daily_goals_id_seq'::regclass),
  "user_id" INTEGER,
  "description" TEXT NOT NULL,
  "is_completed" BOOLEAN DEFAULT false,
  "deadline" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "difficulty" VARCHAR(10) DEFAULT 'medium'::character varying
);

CREATE TABLE IF NOT EXISTS "daily_plans" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "technique" VARCHAR(50) NOT NULL,
  "schedule" JSONB NOT NULL,
  "status" VARCHAR(20) DEFAULT 'active'::character varying,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "modules" (
  "id" INTEGER NOT NULL DEFAULT nextval('modules_id_seq'::regclass),
  "course_id" INTEGER,
  "title" VARCHAR(200) NOT NULL,
  "order_index" INTEGER
);

CREATE TABLE IF NOT EXISTS "topics" (
  "id" INTEGER NOT NULL DEFAULT nextval('topics_id_seq'::regclass),
  "course_id" INTEGER,
  "title" VARCHAR(200) NOT NULL,
  "importance_level" TEXT,
  "module_id" INTEGER,
  "content" TEXT,
  "first_principles" TEXT,
  "architectural_logic" TEXT,
  "forge_snippet" TEXT DEFAULT ''::text,
  "master_notes" TEXT DEFAULT ''::text,
  "forge_protocol" TEXT,
  "ethical_dilemma" JSONB,
  "difficulty" topic_difficulty NOT NULL DEFAULT 'Beginner'::topic_difficulty,
  "estimated_time_minutes" INTEGER NOT NULL DEFAULT 30,
  "learning_objectives" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "prerequisites" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "career_context" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "library_links" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "hall_of_shame" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "production_standard" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "last_reviewed_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "breadcrumb_path" TEXT,
  "estimated_time" VARCHAR(50) DEFAULT '1h 30m'::character varying,
  "historical_context" TEXT,
  "structural_breakdown" TEXT,
  "deep_dive" JSONB DEFAULT '{}'::jsonb,
  "applied_practice" JSONB DEFAULT '[]'::jsonb,
  "failure_analysis" TEXT,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "scholarly_references" JSONB DEFAULT '[]'::jsonb,
  "staff_engineer_note" TEXT,
  "content_markdown" TEXT,
  "content_easy_markdown" TEXT,
  "content_deep_markdown" TEXT,
  "song_url" TEXT,
  "song_lyrics" JSONB
);

CREATE TABLE IF NOT EXISTS "forum_threads" (
  "id" INTEGER NOT NULL DEFAULT nextval('forum_threads_id_seq'::regclass),
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "user_id" INTEGER,
  "topic_id" INTEGER,
  "type" TEXT DEFAULT 'discussion'::text,
  "status" TEXT DEFAULT 'active'::text,
  "last_activity_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "forum_comments" (
  "id" INTEGER NOT NULL DEFAULT nextval('forum_comments_id_seq'::regclass),
  "thread_id" INTEGER,
  "user_id" INTEGER,
  "content" TEXT NOT NULL,
  "parent_comment_id" INTEGER,
  "status" TEXT DEFAULT 'active'::text,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "forum_upvotes" (
  "id" INTEGER NOT NULL DEFAULT nextval('forum_upvotes_id_seq'::regclass),
  "user_id" INTEGER,
  "thread_id" INTEGER,
  "comment_id" INTEGER,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "goal_submissions" (
  "id" INTEGER NOT NULL DEFAULT nextval('goal_submissions_id_seq'::regclass),
  "goal_id" INTEGER,
  "user_id" INTEGER,
  "submission_text" TEXT NOT NULL,
  "ai_grade" INTEGER,
  "ai_feedback" TEXT,
  "submitted_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "interview_sessions" (
  "id" UUID NOT NULL,
  "user_id" INTEGER,
  "target_job" TEXT NOT NULL,
  "current_phase" TEXT DEFAULT 'INTRO'::text,
  "metadata" JSONB DEFAULT '{}'::jsonb,
  "is_completed" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "scorecard" JSONB,
  "mode" VARCHAR(50) DEFAULT 'STANDARD'::character varying
);

CREATE TABLE IF NOT EXISTS "learning_paths" (
  "id" INTEGER NOT NULL DEFAULT nextval('learning_paths_id_seq'::regclass),
  "name" VARCHAR(150) NOT NULL,
  "description" TEXT
);

CREATE TABLE IF NOT EXISTS "learning_path_courses" (
  "path_id" INTEGER NOT NULL,
  "course_id" INTEGER NOT NULL,
  "order_index" INTEGER
);

CREATE TABLE IF NOT EXISTS "lexicon_terms" (
  "id" INTEGER NOT NULL DEFAULT nextval('lexicon_terms_id_seq'::regclass),
  "term" TEXT NOT NULL,
  "definition" TEXT NOT NULL,
  "depth_level" INTEGER DEFAULT 1,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "market_news" (
  "id" INTEGER NOT NULL DEFAULT nextval('market_news_id_seq'::regclass),
  "title" VARCHAR(255) NOT NULL,
  "content_summary" TEXT NOT NULL,
  "source_url" TEXT,
  "source_name" VARCHAR(100),
  "company_name" VARCHAR(100),
  "job_title" VARCHAR(100),
  "category" VARCHAR(50),
  "location" VARCHAR(100) DEFAULT 'Worldwide'::character varying,
  "salary_value" INTEGER DEFAULT 0,
  "demand_growth" INTEGER DEFAULT 0,
  "salary_index" INTEGER DEFAULT 0,
  "skill_match" INTEGER DEFAULT 0,
  "impact_logic" TEXT,
  "expires_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "trend_context" TEXT,
  "verification_type" VARCHAR(50) DEFAULT 'Research'::character varying,
  "external_id" VARCHAR(255),
  "live_metrics" JSONB DEFAULT '{}'::jsonb,
  "is_live" BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS "masterclass_episodes" (
  "id" INTEGER NOT NULL DEFAULT nextval('masterclass_episodes_id_seq'::regclass),
  "title" VARCHAR(255) NOT NULL,
  "summary" TEXT NOT NULL,
  "segments" JSONB NOT NULL,
  "part_number" INTEGER NOT NULL,
  "thumbnail_url" TEXT,
  "published_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "video_url" TEXT,
  "chapter_number" INTEGER
);

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" INTEGER NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
  "user_id" INTEGER,
  "type" VARCHAR(50) NOT NULL,
  "message" TEXT NOT NULL,
  "related_id" INTEGER,
  "read" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "password_resets" (
  "id" INTEGER NOT NULL DEFAULT nextval('password_resets_id_seq'::regclass),
  "user_id" INTEGER NOT NULL,
  "token_hash" CHAR(64) NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "used_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "peer_videos" (
  "id" INTEGER NOT NULL DEFAULT nextval('peer_videos_id_seq'::regclass),
  "user_id" INTEGER,
  "course_id" INTEGER,
  "title" TEXT NOT NULL,
  "video_url" TEXT NOT NULL,
  "description" TEXT,
  "likes" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "uploader_note" TEXT,
  "is_public" BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS "project_requests" (
  "id" INTEGER NOT NULL DEFAULT nextval('project_requests_id_seq'::regclass),
  "project_id" INTEGER,
  "user_id" INTEGER,
  "status" TEXT DEFAULT 'pending'::text,
  "message" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "motivation" TEXT,
  "skills" TEXT,
  "contribution" TEXT
);

CREATE TABLE IF NOT EXISTS "project_tasks" (
  "id" INTEGER NOT NULL DEFAULT nextval('project_tasks_id_seq'::regclass),
  "project_id" INTEGER,
  "title" VARCHAR(300) NOT NULL,
  "status" VARCHAR(20) DEFAULT 'todo'::character varying,
  "assignee_id" INTEGER,
  "assignee_name" VARCHAR(255),
  "created_by" INTEGER,
  "created_by_name" VARCHAR(255),
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "project_weekly_reports" (
  "id" INTEGER NOT NULL DEFAULT nextval('project_weekly_reports_id_seq'::regclass),
  "project_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "user_name" VARCHAR(255) NOT NULL,
  "week_start" DATE NOT NULL,
  "what_done" TEXT NOT NULL DEFAULT ''::text,
  "what_next" TEXT NOT NULL DEFAULT ''::text,
  "blockers" TEXT,
  "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "projects" (
  "id" INTEGER NOT NULL DEFAULT nextval('projects_id_seq'::regclass),
  "course_id" INTEGER,
  "title" VARCHAR(200),
  "difficulty" VARCHAR(20),
  "description" TEXT
);

CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" INTEGER NOT NULL DEFAULT nextval('refresh_tokens_id_seq'::regclass),
  "user_id" INTEGER NOT NULL,
  "token_hash" CHAR(64) NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "revoked_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "resources" (
  "id" INTEGER NOT NULL DEFAULT nextval('resources_id_seq'::regclass),
  "course_id" INTEGER,
  "title" VARCHAR(200),
  "url" TEXT,
  "type" VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS "squad_messages" (
  "id" INTEGER NOT NULL DEFAULT nextval('squad_messages_id_seq'::regclass),
  "project_id" INTEGER,
  "user_id" INTEGER,
  "user_name" VARCHAR(255),
  "text" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "synaptic_messages" (
  "id" INTEGER NOT NULL DEFAULT nextval('synaptic_messages_id_seq'::regclass),
  "room_id" INTEGER,
  "sender_id" INTEGER,
  "text" TEXT NOT NULL,
  "attachment_url" TEXT,
  "attachment_type" VARCHAR(50),
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "topic_lexicon_map" (
  "topic_id" INTEGER NOT NULL,
  "lexicon_id" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "topic_resources" (
  "id" INTEGER NOT NULL DEFAULT nextval('topic_resources_id_seq'::regclass),
  "user_id" INTEGER,
  "topic_id" INTEGER,
  "title" TEXT NOT NULL,
  "file_type" VARCHAR(20) NOT NULL,
  "file_size" INTEGER,
  "extracted_text" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_badges" (
  "id" INTEGER NOT NULL DEFAULT nextval('user_badges_id_seq'::regclass),
  "user_id" INTEGER,
  "badge_key" TEXT NOT NULL,
  "earned_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_contributions" (
  "id" INTEGER NOT NULL DEFAULT nextval('user_contributions_id_seq'::regclass),
  "user_id" INTEGER,
  "action_type" TEXT NOT NULL,
  "points" INTEGER NOT NULL,
  "course_id" INTEGER,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_courses" (
  "id" INTEGER NOT NULL DEFAULT nextval('user_courses_id_seq'::regclass),
  "user_id" INTEGER,
  "course_id" INTEGER,
  "status" VARCHAR(20) DEFAULT 'planned'::character varying,
  "started_at" TIMESTAMP,
  "completed_at" TIMESTAMP,
  "grade" VARCHAR(2),
  "attempt" INTEGER NOT NULL DEFAULT 1,
  "academic_year" INTEGER,
  "semester" INTEGER,
  "notes" TEXT
);

CREATE TABLE IF NOT EXISTS "user_projects" (
  "user_id" INTEGER NOT NULL,
  "project_id" INTEGER NOT NULL,
  "status" VARCHAR(20),
  "github_link" TEXT
);

CREATE TABLE IF NOT EXISTS "user_skills" (
  "user_id" INTEGER NOT NULL,
  "skill_id" INTEGER NOT NULL,
  "level" INTEGER
);

CREATE TABLE IF NOT EXISTS "user_stats" (
  "user_id" INTEGER NOT NULL,
  "contribution_score" INTEGER DEFAULT 0,
  "level" TEXT DEFAULT 'New Member'::text,
  "current_asc" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "user_topic_notes" (
  "id" INTEGER NOT NULL DEFAULT nextval('user_topic_notes_id_seq'::regclass),
  "user_id" INTEGER,
  "topic_id" INTEGER,
  "content" TEXT,
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_topic_progress" (
  "user_id" INTEGER NOT NULL,
  "topic_id" INTEGER NOT NULL,
  "completed" BOOLEAN DEFAULT false,
  "quiz_score" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "video_feedback" (
  "id" INTEGER NOT NULL DEFAULT nextval('video_feedback_id_seq'::regclass),
  "video_id" INTEGER,
  "user_id" INTEGER,
  "feedback_text" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "rating" INTEGER
);

CREATE TABLE IF NOT EXISTS "video_reactions" (
  "id" INTEGER NOT NULL DEFAULT nextval('video_reactions_id_seq'::regclass),
  "video_id" INTEGER,
  "user_id" INTEGER,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('users_id_seq'::regclass);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" VARCHAR(150);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" VARCHAR(20) DEFAULT 'student'::character varying;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "year" INTEGER;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "semester" INTEGER;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passion" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'online'::text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "streak_current" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "streak_last_active_date" DATE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "current_asc" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_active_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "dream_job" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "target_company" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "technical_pillar" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "elo_rating" INTEGER DEFAULT 1200;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "plan" VARCHAR(20) DEFAULT 'free'::character varying;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "token_version" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "failed_login_attempts" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locked_until" TIMESTAMPTZ;

ALTER TABLE "scholarly_assets" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('scholarly_assets_id_seq'::regclass);
ALTER TABLE "scholarly_assets" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "scholarly_assets" ADD COLUMN IF NOT EXISTS "title" VARCHAR(255);
ALTER TABLE "scholarly_assets" ADD COLUMN IF NOT EXISTS "file_url" TEXT;
ALTER TABLE "scholarly_assets" ADD COLUMN IF NOT EXISTS "asset_type" VARCHAR(50);
ALTER TABLE "scholarly_assets" ADD COLUMN IF NOT EXISTS "subject_area" VARCHAR(100);
ALTER TABLE "scholarly_assets" ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) DEFAULT 'pending'::character varying;
ALTER TABLE "scholarly_assets" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "scholarly_assets" ADD COLUMN IF NOT EXISTS "is_hidden" BOOLEAN DEFAULT false;

ALTER TABLE "asset_hiding" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('asset_hiding_id_seq'::regclass);
ALTER TABLE "asset_hiding" ADD COLUMN IF NOT EXISTS "asset_id" INTEGER;
ALTER TABLE "asset_hiding" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "asset_hiding" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "asset_reviews" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('asset_reviews_id_seq'::regclass);
ALTER TABLE "asset_reviews" ADD COLUMN IF NOT EXISTS "asset_id" INTEGER;
ALTER TABLE "asset_reviews" ADD COLUMN IF NOT EXISTS "reviewer_id" INTEGER;
ALTER TABLE "asset_reviews" ADD COLUMN IF NOT EXISTS "rating" INTEGER;
ALTER TABLE "asset_reviews" ADD COLUMN IF NOT EXISTS "comment" TEXT;
ALTER TABLE "asset_reviews" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "career_paths" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('career_paths_id_seq'::regclass);
ALTER TABLE "career_paths" ADD COLUMN IF NOT EXISTS "name" VARCHAR(100);

ALTER TABLE "career_roadmaps" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('career_roadmaps_id_seq'::regclass);
ALTER TABLE "career_roadmaps" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "career_roadmaps" ADD COLUMN IF NOT EXISTS "target_job" VARCHAR(255);
ALTER TABLE "career_roadmaps" ADD COLUMN IF NOT EXISTS "architecture_json" JSONB;
ALTER TABLE "career_roadmaps" ADD COLUMN IF NOT EXISTS "roadmap_steps_json" JSONB;
ALTER TABLE "career_roadmaps" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "career_roadmaps" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "career_roadmaps" ADD COLUMN IF NOT EXISTS "full_roadmap_json" JSONB;
ALTER TABLE "career_roadmaps" ADD COLUMN IF NOT EXISTS "career_key" VARCHAR(255);

ALTER TABLE "chat_rooms" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('chat_rooms_id_seq'::regclass);
ALTER TABLE "chat_rooms" ADD COLUMN IF NOT EXISTS "name" VARCHAR(255);
ALTER TABLE "chat_rooms" ADD COLUMN IF NOT EXISTS "type" VARCHAR(50) DEFAULT 'public'::character varying;
ALTER TABLE "chat_rooms" ADD COLUMN IF NOT EXISTS "admin_id" INTEGER;
ALTER TABLE "chat_rooms" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "chat_rooms" ADD COLUMN IF NOT EXISTS "password" VARCHAR(255);

ALTER TABLE "chat_members" ADD COLUMN IF NOT EXISTS "room_id" INTEGER;
ALTER TABLE "chat_members" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "chat_members" ADD COLUMN IF NOT EXISTS "is_voice_active" BOOLEAN DEFAULT false;
ALTER TABLE "chat_members" ADD COLUMN IF NOT EXISTS "joined_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('chat_messages_id_seq'::regclass);
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "room_id" INTEGER;
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "sender_id" INTEGER;
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "text" TEXT;
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "attachment_url" TEXT;
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "attachment_type" VARCHAR(50);
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "role" VARCHAR(50);
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "chat_type" VARCHAR(50);
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "message" TEXT;
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "conversation_id" UUID;

ALTER TABLE "cheatsheets" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('cheatsheets_id_seq'::regclass);
ALTER TABLE "cheatsheets" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "cheatsheets" ADD COLUMN IF NOT EXISTS "title" VARCHAR(255);
ALTER TABLE "cheatsheets" ADD COLUMN IF NOT EXISTS "file_url" TEXT;
ALTER TABLE "cheatsheets" ADD COLUMN IF NOT EXISTS "category" VARCHAR(100);
ALTER TABLE "cheatsheets" ADD COLUMN IF NOT EXISTS "upvotes" INTEGER DEFAULT 0;
ALTER TABLE "cheatsheets" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "semesters" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('semesters_id_seq'::regclass);
ALTER TABLE "semesters" ADD COLUMN IF NOT EXISTS "year_number" INTEGER;
ALTER TABLE "semesters" ADD COLUMN IF NOT EXISTS "semester_number" INTEGER;

ALTER TABLE "years" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('years_id_seq'::regclass);
ALTER TABLE "years" ADD COLUMN IF NOT EXISTS "year_number" INTEGER;

ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('courses_id_seq'::regclass);
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "name" VARCHAR(150);
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "year_id" INTEGER;
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "semester_id" INTEGER;

ALTER TABLE "course_career" ADD COLUMN IF NOT EXISTS "course_id" INTEGER;
ALTER TABLE "course_career" ADD COLUMN IF NOT EXISTS "career_id" INTEGER;

ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('skills_id_seq'::regclass);
ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "name" VARCHAR(100);

ALTER TABLE "course_skills" ADD COLUMN IF NOT EXISTS "course_id" INTEGER;
ALTER TABLE "course_skills" ADD COLUMN IF NOT EXISTS "skill_id" INTEGER;

ALTER TABLE "creator_projects" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('creator_projects_id_seq'::regclass);
ALTER TABLE "creator_projects" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "creator_projects" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "creator_projects" ADD COLUMN IF NOT EXISTS "owner_id" INTEGER;
ALTER TABLE "creator_projects" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'open'::text;
ALTER TABLE "creator_projects" ADD COLUMN IF NOT EXISTS "skills_required" text[];
ALTER TABLE "creator_projects" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "creator_projects" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "creator_projects" ADD COLUMN IF NOT EXISTS "github_repo" TEXT;
ALTER TABLE "creator_projects" ADD COLUMN IF NOT EXISTS "phase" VARCHAR(30) DEFAULT 'planning'::character varying;

ALTER TABLE "daily_goals" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('daily_goals_id_seq'::regclass);
ALTER TABLE "daily_goals" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "daily_goals" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "daily_goals" ADD COLUMN IF NOT EXISTS "is_completed" BOOLEAN DEFAULT false;
ALTER TABLE "daily_goals" ADD COLUMN IF NOT EXISTS "deadline" TIMESTAMP;
ALTER TABLE "daily_goals" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "daily_goals" ADD COLUMN IF NOT EXISTS "difficulty" VARCHAR(10) DEFAULT 'medium'::character varying;

ALTER TABLE "daily_plans" ADD COLUMN IF NOT EXISTS "id" UUID DEFAULT gen_random_uuid();
ALTER TABLE "daily_plans" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
ALTER TABLE "daily_plans" ADD COLUMN IF NOT EXISTS "date" DATE DEFAULT CURRENT_DATE;
ALTER TABLE "daily_plans" ADD COLUMN IF NOT EXISTS "technique" VARCHAR(50);
ALTER TABLE "daily_plans" ADD COLUMN IF NOT EXISTS "schedule" JSONB;
ALTER TABLE "daily_plans" ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) DEFAULT 'active'::character varying;
ALTER TABLE "daily_plans" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT now();

ALTER TABLE "modules" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('modules_id_seq'::regclass);
ALTER TABLE "modules" ADD COLUMN IF NOT EXISTS "course_id" INTEGER;
ALTER TABLE "modules" ADD COLUMN IF NOT EXISTS "title" VARCHAR(200);
ALTER TABLE "modules" ADD COLUMN IF NOT EXISTS "order_index" INTEGER;

ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('topics_id_seq'::regclass);
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "course_id" INTEGER;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "title" VARCHAR(200);
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "importance_level" TEXT;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "module_id" INTEGER;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "first_principles" TEXT;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "architectural_logic" TEXT;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "forge_snippet" TEXT DEFAULT ''::text;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "master_notes" TEXT DEFAULT ''::text;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "forge_protocol" TEXT;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "ethical_dilemma" JSONB;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "difficulty" topic_difficulty DEFAULT 'Beginner'::topic_difficulty;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "estimated_time_minutes" INTEGER DEFAULT 30;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "learning_objectives" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "prerequisites" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "career_context" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "library_links" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "hall_of_shame" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "production_standard" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "last_reviewed_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "breadcrumb_path" TEXT;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "estimated_time" VARCHAR(50) DEFAULT '1h 30m'::character varying;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "historical_context" TEXT;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "structural_breakdown" TEXT;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "deep_dive" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "applied_practice" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "failure_analysis" TEXT;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "scholarly_references" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "staff_engineer_note" TEXT;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "content_markdown" TEXT;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "content_easy_markdown" TEXT;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "content_deep_markdown" TEXT;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "song_url" TEXT;
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "song_lyrics" JSONB;

ALTER TABLE "forum_threads" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('forum_threads_id_seq'::regclass);
ALTER TABLE "forum_threads" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "forum_threads" ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE "forum_threads" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "forum_threads" ADD COLUMN IF NOT EXISTS "topic_id" INTEGER;
ALTER TABLE "forum_threads" ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'discussion'::text;
ALTER TABLE "forum_threads" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'active'::text;
ALTER TABLE "forum_threads" ADD COLUMN IF NOT EXISTS "last_activity_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "forum_threads" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "forum_comments" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('forum_comments_id_seq'::regclass);
ALTER TABLE "forum_comments" ADD COLUMN IF NOT EXISTS "thread_id" INTEGER;
ALTER TABLE "forum_comments" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "forum_comments" ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE "forum_comments" ADD COLUMN IF NOT EXISTS "parent_comment_id" INTEGER;
ALTER TABLE "forum_comments" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'active'::text;
ALTER TABLE "forum_comments" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "forum_upvotes" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('forum_upvotes_id_seq'::regclass);
ALTER TABLE "forum_upvotes" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "forum_upvotes" ADD COLUMN IF NOT EXISTS "thread_id" INTEGER;
ALTER TABLE "forum_upvotes" ADD COLUMN IF NOT EXISTS "comment_id" INTEGER;
ALTER TABLE "forum_upvotes" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "goal_submissions" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('goal_submissions_id_seq'::regclass);
ALTER TABLE "goal_submissions" ADD COLUMN IF NOT EXISTS "goal_id" INTEGER;
ALTER TABLE "goal_submissions" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "goal_submissions" ADD COLUMN IF NOT EXISTS "submission_text" TEXT;
ALTER TABLE "goal_submissions" ADD COLUMN IF NOT EXISTS "ai_grade" INTEGER;
ALTER TABLE "goal_submissions" ADD COLUMN IF NOT EXISTS "ai_feedback" TEXT;
ALTER TABLE "goal_submissions" ADD COLUMN IF NOT EXISTS "submitted_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "id" UUID;
ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "target_job" TEXT;
ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "current_phase" TEXT DEFAULT 'INTRO'::text;
ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "metadata" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "is_completed" BOOLEAN DEFAULT false;
ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "scorecard" JSONB;
ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "mode" VARCHAR(50) DEFAULT 'STANDARD'::character varying;

ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('learning_paths_id_seq'::regclass);
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "name" VARCHAR(150);
ALTER TABLE "learning_paths" ADD COLUMN IF NOT EXISTS "description" TEXT;

ALTER TABLE "learning_path_courses" ADD COLUMN IF NOT EXISTS "path_id" INTEGER;
ALTER TABLE "learning_path_courses" ADD COLUMN IF NOT EXISTS "course_id" INTEGER;
ALTER TABLE "learning_path_courses" ADD COLUMN IF NOT EXISTS "order_index" INTEGER;

ALTER TABLE "lexicon_terms" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('lexicon_terms_id_seq'::regclass);
ALTER TABLE "lexicon_terms" ADD COLUMN IF NOT EXISTS "term" TEXT;
ALTER TABLE "lexicon_terms" ADD COLUMN IF NOT EXISTS "definition" TEXT;
ALTER TABLE "lexicon_terms" ADD COLUMN IF NOT EXISTS "depth_level" INTEGER DEFAULT 1;
ALTER TABLE "lexicon_terms" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "lexicon_terms" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('market_news_id_seq'::regclass);
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "title" VARCHAR(255);
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "content_summary" TEXT;
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "source_url" TEXT;
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "source_name" VARCHAR(100);
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "company_name" VARCHAR(100);
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "job_title" VARCHAR(100);
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "category" VARCHAR(50);
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "location" VARCHAR(100) DEFAULT 'Worldwide'::character varying;
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "salary_value" INTEGER DEFAULT 0;
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "demand_growth" INTEGER DEFAULT 0;
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "salary_index" INTEGER DEFAULT 0;
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "skill_match" INTEGER DEFAULT 0;
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "impact_logic" TEXT;
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMPTZ;
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "trend_context" TEXT;
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "verification_type" VARCHAR(50) DEFAULT 'Research'::character varying;
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "external_id" VARCHAR(255);
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "live_metrics" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE "market_news" ADD COLUMN IF NOT EXISTS "is_live" BOOLEAN DEFAULT false;

ALTER TABLE "masterclass_episodes" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('masterclass_episodes_id_seq'::regclass);
ALTER TABLE "masterclass_episodes" ADD COLUMN IF NOT EXISTS "title" VARCHAR(255);
ALTER TABLE "masterclass_episodes" ADD COLUMN IF NOT EXISTS "summary" TEXT;
ALTER TABLE "masterclass_episodes" ADD COLUMN IF NOT EXISTS "segments" JSONB;
ALTER TABLE "masterclass_episodes" ADD COLUMN IF NOT EXISTS "part_number" INTEGER;
ALTER TABLE "masterclass_episodes" ADD COLUMN IF NOT EXISTS "thumbnail_url" TEXT;
ALTER TABLE "masterclass_episodes" ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "masterclass_episodes" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "masterclass_episodes" ADD COLUMN IF NOT EXISTS "video_url" TEXT;
ALTER TABLE "masterclass_episodes" ADD COLUMN IF NOT EXISTS "chapter_number" INTEGER;

ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('notifications_id_seq'::regclass);
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "type" VARCHAR(50);
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "message" TEXT;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "related_id" INTEGER;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "read" BOOLEAN DEFAULT false;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "password_resets" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('password_resets_id_seq'::regclass);
ALTER TABLE "password_resets" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "password_resets" ADD COLUMN IF NOT EXISTS "token_hash" CHAR(64);
ALTER TABLE "password_resets" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMPTZ;
ALTER TABLE "password_resets" ADD COLUMN IF NOT EXISTS "used_at" TIMESTAMPTZ;
ALTER TABLE "password_resets" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT now();

ALTER TABLE "peer_videos" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('peer_videos_id_seq'::regclass);
ALTER TABLE "peer_videos" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "peer_videos" ADD COLUMN IF NOT EXISTS "course_id" INTEGER;
ALTER TABLE "peer_videos" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "peer_videos" ADD COLUMN IF NOT EXISTS "video_url" TEXT;
ALTER TABLE "peer_videos" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "peer_videos" ADD COLUMN IF NOT EXISTS "likes" INTEGER DEFAULT 0;
ALTER TABLE "peer_videos" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "peer_videos" ADD COLUMN IF NOT EXISTS "uploader_note" TEXT;
ALTER TABLE "peer_videos" ADD COLUMN IF NOT EXISTS "is_public" BOOLEAN DEFAULT true;

ALTER TABLE "project_requests" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('project_requests_id_seq'::regclass);
ALTER TABLE "project_requests" ADD COLUMN IF NOT EXISTS "project_id" INTEGER;
ALTER TABLE "project_requests" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "project_requests" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'pending'::text;
ALTER TABLE "project_requests" ADD COLUMN IF NOT EXISTS "message" TEXT;
ALTER TABLE "project_requests" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "project_requests" ADD COLUMN IF NOT EXISTS "motivation" TEXT;
ALTER TABLE "project_requests" ADD COLUMN IF NOT EXISTS "skills" TEXT;
ALTER TABLE "project_requests" ADD COLUMN IF NOT EXISTS "contribution" TEXT;

ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('project_tasks_id_seq'::regclass);
ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "project_id" INTEGER;
ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "title" VARCHAR(300);
ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) DEFAULT 'todo'::character varying;
ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "assignee_id" INTEGER;
ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "assignee_name" VARCHAR(255);
ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "created_by" INTEGER;
ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "created_by_name" VARCHAR(255);
ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT now();

ALTER TABLE "project_weekly_reports" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('project_weekly_reports_id_seq'::regclass);
ALTER TABLE "project_weekly_reports" ADD COLUMN IF NOT EXISTS "project_id" INTEGER;
ALTER TABLE "project_weekly_reports" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "project_weekly_reports" ADD COLUMN IF NOT EXISTS "user_name" VARCHAR(255);
ALTER TABLE "project_weekly_reports" ADD COLUMN IF NOT EXISTS "week_start" DATE;
ALTER TABLE "project_weekly_reports" ADD COLUMN IF NOT EXISTS "what_done" TEXT DEFAULT ''::text;
ALTER TABLE "project_weekly_reports" ADD COLUMN IF NOT EXISTS "what_next" TEXT DEFAULT ''::text;
ALTER TABLE "project_weekly_reports" ADD COLUMN IF NOT EXISTS "blockers" TEXT;
ALTER TABLE "project_weekly_reports" ADD COLUMN IF NOT EXISTS "submitted_at" TIMESTAMPTZ DEFAULT now();
ALTER TABLE "project_weekly_reports" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ DEFAULT now();

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('projects_id_seq'::regclass);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "course_id" INTEGER;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "title" VARCHAR(200);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "difficulty" VARCHAR(20);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "description" TEXT;

ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('refresh_tokens_id_seq'::regclass);
ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "token_hash" CHAR(64);
ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMPTZ;
ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "revoked_at" TIMESTAMPTZ;
ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT now();

ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('resources_id_seq'::regclass);
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "course_id" INTEGER;
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "title" VARCHAR(200);
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "url" TEXT;
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "type" VARCHAR(50);

ALTER TABLE "squad_messages" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('squad_messages_id_seq'::regclass);
ALTER TABLE "squad_messages" ADD COLUMN IF NOT EXISTS "project_id" INTEGER;
ALTER TABLE "squad_messages" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "squad_messages" ADD COLUMN IF NOT EXISTS "user_name" VARCHAR(255);
ALTER TABLE "squad_messages" ADD COLUMN IF NOT EXISTS "text" TEXT;
ALTER TABLE "squad_messages" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT now();

ALTER TABLE "synaptic_messages" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('synaptic_messages_id_seq'::regclass);
ALTER TABLE "synaptic_messages" ADD COLUMN IF NOT EXISTS "room_id" INTEGER;
ALTER TABLE "synaptic_messages" ADD COLUMN IF NOT EXISTS "sender_id" INTEGER;
ALTER TABLE "synaptic_messages" ADD COLUMN IF NOT EXISTS "text" TEXT;
ALTER TABLE "synaptic_messages" ADD COLUMN IF NOT EXISTS "attachment_url" TEXT;
ALTER TABLE "synaptic_messages" ADD COLUMN IF NOT EXISTS "attachment_type" VARCHAR(50);
ALTER TABLE "synaptic_messages" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "topic_lexicon_map" ADD COLUMN IF NOT EXISTS "topic_id" INTEGER;
ALTER TABLE "topic_lexicon_map" ADD COLUMN IF NOT EXISTS "lexicon_id" INTEGER;

ALTER TABLE "topic_resources" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('topic_resources_id_seq'::regclass);
ALTER TABLE "topic_resources" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "topic_resources" ADD COLUMN IF NOT EXISTS "topic_id" INTEGER;
ALTER TABLE "topic_resources" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "topic_resources" ADD COLUMN IF NOT EXISTS "file_type" VARCHAR(20);
ALTER TABLE "topic_resources" ADD COLUMN IF NOT EXISTS "file_size" INTEGER;
ALTER TABLE "topic_resources" ADD COLUMN IF NOT EXISTS "extracted_text" TEXT;
ALTER TABLE "topic_resources" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT now();

ALTER TABLE "user_badges" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('user_badges_id_seq'::regclass);
ALTER TABLE "user_badges" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "user_badges" ADD COLUMN IF NOT EXISTS "badge_key" TEXT;
ALTER TABLE "user_badges" ADD COLUMN IF NOT EXISTS "earned_at" TIMESTAMP DEFAULT now();

ALTER TABLE "user_contributions" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('user_contributions_id_seq'::regclass);
ALTER TABLE "user_contributions" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "user_contributions" ADD COLUMN IF NOT EXISTS "action_type" TEXT;
ALTER TABLE "user_contributions" ADD COLUMN IF NOT EXISTS "points" INTEGER;
ALTER TABLE "user_contributions" ADD COLUMN IF NOT EXISTS "course_id" INTEGER;
ALTER TABLE "user_contributions" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT now();

ALTER TABLE "user_courses" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('user_courses_id_seq'::regclass);
ALTER TABLE "user_courses" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "user_courses" ADD COLUMN IF NOT EXISTS "course_id" INTEGER;
ALTER TABLE "user_courses" ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) DEFAULT 'planned'::character varying;
ALTER TABLE "user_courses" ADD COLUMN IF NOT EXISTS "started_at" TIMESTAMP;
ALTER TABLE "user_courses" ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP;
ALTER TABLE "user_courses" ADD COLUMN IF NOT EXISTS "grade" VARCHAR(2);
ALTER TABLE "user_courses" ADD COLUMN IF NOT EXISTS "attempt" INTEGER DEFAULT 1;
ALTER TABLE "user_courses" ADD COLUMN IF NOT EXISTS "academic_year" INTEGER;
ALTER TABLE "user_courses" ADD COLUMN IF NOT EXISTS "semester" INTEGER;
ALTER TABLE "user_courses" ADD COLUMN IF NOT EXISTS "notes" TEXT;

ALTER TABLE "user_projects" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "user_projects" ADD COLUMN IF NOT EXISTS "project_id" INTEGER;
ALTER TABLE "user_projects" ADD COLUMN IF NOT EXISTS "status" VARCHAR(20);
ALTER TABLE "user_projects" ADD COLUMN IF NOT EXISTS "github_link" TEXT;

ALTER TABLE "user_skills" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "user_skills" ADD COLUMN IF NOT EXISTS "skill_id" INTEGER;
ALTER TABLE "user_skills" ADD COLUMN IF NOT EXISTS "level" INTEGER;

ALTER TABLE "user_stats" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "user_stats" ADD COLUMN IF NOT EXISTS "contribution_score" INTEGER DEFAULT 0;
ALTER TABLE "user_stats" ADD COLUMN IF NOT EXISTS "level" TEXT DEFAULT 'New Member'::text;
ALTER TABLE "user_stats" ADD COLUMN IF NOT EXISTS "current_asc" INTEGER DEFAULT 0;

ALTER TABLE "user_topic_notes" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('user_topic_notes_id_seq'::regclass);
ALTER TABLE "user_topic_notes" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "user_topic_notes" ADD COLUMN IF NOT EXISTS "topic_id" INTEGER;
ALTER TABLE "user_topic_notes" ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE "user_topic_notes" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT now();

ALTER TABLE "user_topic_progress" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "user_topic_progress" ADD COLUMN IF NOT EXISTS "topic_id" INTEGER;
ALTER TABLE "user_topic_progress" ADD COLUMN IF NOT EXISTS "completed" BOOLEAN DEFAULT false;
ALTER TABLE "user_topic_progress" ADD COLUMN IF NOT EXISTS "quiz_score" INTEGER DEFAULT 0;

ALTER TABLE "video_feedback" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('video_feedback_id_seq'::regclass);
ALTER TABLE "video_feedback" ADD COLUMN IF NOT EXISTS "video_id" INTEGER;
ALTER TABLE "video_feedback" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "video_feedback" ADD COLUMN IF NOT EXISTS "feedback_text" TEXT;
ALTER TABLE "video_feedback" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "video_feedback" ADD COLUMN IF NOT EXISTS "rating" INTEGER;

ALTER TABLE "video_reactions" ADD COLUMN IF NOT EXISTS "id" INTEGER DEFAULT nextval('video_reactions_id_seq'::regclass);
ALTER TABLE "video_reactions" ADD COLUMN IF NOT EXISTS "video_id" INTEGER;
ALTER TABLE "video_reactions" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
ALTER TABLE "video_reactions" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asset_hiding_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'asset_hiding' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "asset_hiding" ADD CONSTRAINT "asset_hiding_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asset_reviews_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'asset_reviews' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "asset_reviews" ADD CONSTRAINT "asset_reviews_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'career_paths_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'career_paths' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "career_paths" ADD CONSTRAINT "career_paths_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'career_roadmaps_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'career_roadmaps' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "career_roadmaps" ADD CONSTRAINT "career_roadmaps_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_members_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'chat_members' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_pkey" PRIMARY KEY (room_id, user_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'chat_messages' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_rooms_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'chat_rooms' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cheatsheets_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'cheatsheets' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "cheatsheets" ADD CONSTRAINT "cheatsheets_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_career_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'course_career' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "course_career" ADD CONSTRAINT "course_career_pkey" PRIMARY KEY (course_id, career_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_skills_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'course_skills' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "course_skills" ADD CONSTRAINT "course_skills_pkey" PRIMARY KEY (course_id, skill_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'courses' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "courses" ADD CONSTRAINT "courses_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'creator_projects_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'creator_projects' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "creator_projects" ADD CONSTRAINT "creator_projects_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_goals_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'daily_goals' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "daily_goals" ADD CONSTRAINT "daily_goals_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_plans_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'daily_plans' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "daily_plans" ADD CONSTRAINT "daily_plans_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forum_comments_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'forum_comments' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forum_threads_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'forum_threads' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forum_upvotes_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'forum_upvotes' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "forum_upvotes" ADD CONSTRAINT "forum_upvotes_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'goal_submissions_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'goal_submissions' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "goal_submissions" ADD CONSTRAINT "goal_submissions_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'interview_sessions_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'interview_sessions' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'learning_path_courses_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'learning_path_courses' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "learning_path_courses" ADD CONSTRAINT "learning_path_courses_pkey" PRIMARY KEY (path_id, course_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'learning_paths_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'learning_paths' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lexicon_terms_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'lexicon_terms' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "lexicon_terms" ADD CONSTRAINT "lexicon_terms_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'market_news_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'market_news' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "market_news" ADD CONSTRAINT "market_news_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'masterclass_episodes_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'masterclass_episodes' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "masterclass_episodes" ADD CONSTRAINT "masterclass_episodes_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'modules_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'modules' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "modules" ADD CONSTRAINT "modules_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'notifications' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "notifications" ADD CONSTRAINT "notifications_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'password_resets_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'password_resets' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'peer_videos_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'peer_videos' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "peer_videos" ADD CONSTRAINT "peer_videos_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_requests_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'project_requests' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "project_requests" ADD CONSTRAINT "project_requests_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_tasks_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'project_tasks' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_weekly_reports_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'project_weekly_reports' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "project_weekly_reports" ADD CONSTRAINT "project_weekly_reports_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'projects' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "projects" ADD CONSTRAINT "projects_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'refresh_tokens_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'refresh_tokens' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'resources_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'resources' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "resources" ADD CONSTRAINT "resources_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'scholarly_assets_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'scholarly_assets' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "scholarly_assets" ADD CONSTRAINT "scholarly_assets_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'semesters_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'semesters' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "semesters" ADD CONSTRAINT "semesters_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'skills_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'skills' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "skills" ADD CONSTRAINT "skills_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'squad_messages_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'squad_messages' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "squad_messages" ADD CONSTRAINT "squad_messages_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'synaptic_messages_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'synaptic_messages' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "synaptic_messages" ADD CONSTRAINT "synaptic_messages_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topic_lexicon_map_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'topic_lexicon_map' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "topic_lexicon_map" ADD CONSTRAINT "topic_lexicon_map_pkey" PRIMARY KEY (topic_id, lexicon_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topic_resources_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'topic_resources' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "topic_resources" ADD CONSTRAINT "topic_resources_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topics_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'topics' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "topics" ADD CONSTRAINT "topics_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_badges_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'user_badges' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_contributions_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'user_contributions' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_contributions" ADD CONSTRAINT "user_contributions_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_courses_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'user_courses' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_projects_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'user_projects' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_pkey" PRIMARY KEY (user_id, project_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_skills_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'user_skills' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_pkey" PRIMARY KEY (user_id, skill_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_stats_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'user_stats' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_pkey" PRIMARY KEY (user_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_topic_notes_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'user_topic_notes' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_topic_notes" ADD CONSTRAINT "user_topic_notes_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_topic_progress_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'user_topic_progress' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_pkey" PRIMARY KEY (user_id, topic_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'users' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "users" ADD CONSTRAINT "users_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'video_feedback_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'video_feedback' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "video_feedback" ADD CONSTRAINT "video_feedback_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'video_reactions_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'video_reactions' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "video_reactions" ADD CONSTRAINT "video_reactions_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'years_pkey'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'years' AND c.contype = 'p'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "years" ADD CONSTRAINT "years_pkey" PRIMARY KEY (id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asset_hiding_asset_id_user_id_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "asset_hiding" ADD CONSTRAINT "asset_hiding_asset_id_user_id_key" UNIQUE (asset_id, user_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asset_reviews_asset_id_reviewer_id_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "asset_reviews" ADD CONSTRAINT "asset_reviews_asset_id_reviewer_id_key" UNIQUE (asset_id, reviewer_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'career_paths_name_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "career_paths" ADD CONSTRAINT "career_paths_name_key" UNIQUE (name);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'career_roadmaps_user_id_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "career_roadmaps" ADD CONSTRAINT "career_roadmaps_user_id_key" UNIQUE (user_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_plans_user_id_date_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "daily_plans" ADD CONSTRAINT "daily_plans_user_id_date_key" UNIQUE (user_id, date);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'one_upvote_per_user_item'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "forum_upvotes" ADD CONSTRAINT "one_upvote_per_user_item" UNIQUE (user_id, thread_id, comment_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lexicon_terms_term_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "lexicon_terms" ADD CONSTRAINT "lexicon_terms_term_key" UNIQUE (term);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'market_news_external_id_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "market_news" ADD CONSTRAINT "market_news_external_id_key" UNIQUE (external_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'market_news_title_unique'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "market_news" ADD CONSTRAINT "market_news_title_unique" UNIQUE (title);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'password_resets_token_hash_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_token_hash_key" UNIQUE (token_hash);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_requests_project_id_user_id_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "project_requests" ADD CONSTRAINT "project_requests_project_id_user_id_key" UNIQUE (project_id, user_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_project_user_week'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "project_weekly_reports" ADD CONSTRAINT "uq_project_user_week" UNIQUE (project_id, user_id, week_start);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'refresh_tokens_token_hash_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_token_hash_key" UNIQUE (token_hash);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'semesters_year_number_semester_number_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "semesters" ADD CONSTRAINT "semesters_year_number_semester_number_key" UNIQUE (year_number, semester_number);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_year_semester'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "semesters" ADD CONSTRAINT "unique_year_semester" UNIQUE (year_number, semester_number);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'skills_name_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "skills" ADD CONSTRAINT "skills_name_key" UNIQUE (name);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_badges_user_id_badge_key_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_badge_key_key" UNIQUE (user_id, badge_key);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_topic_notes_user_id_topic_id_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_topic_notes" ADD CONSTRAINT "user_topic_notes_user_id_topic_id_key" UNIQUE (user_id, topic_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE (email);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'video_reactions_video_id_user_id_key'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "video_reactions" ADD CONSTRAINT "video_reactions_video_id_user_id_key" UNIQUE (video_id, user_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asset_reviews_rating_check'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "asset_reviews" ADD CONSTRAINT "asset_reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5)));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'goal_submissions_ai_grade_check'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "goal_submissions" ADD CONSTRAINT "goal_submissions_ai_grade_check" CHECK (((ai_grade >= 0) AND (ai_grade <= 100)));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_tasks_status_check'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_status_check" CHECK (((status)::text = ANY ((ARRAY['todo'::character varying, 'in_progress'::character varying, 'done'::character varying])::text[])));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_time_positive'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "topics" ADD CONSTRAINT "check_time_positive" CHECK ((estimated_time_minutes >= 0));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_courses_status_check'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_status_check" CHECK (((status)::text = ANY ((ARRAY['planned'::character varying, 'in_progress'::character varying, 'completed'::character varying])::text[])));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_skills_level_check'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_level_check" CHECK (((level >= 1) AND (level <= 5)));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'video_feedback_rating_check'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "video_feedback" ADD CONSTRAINT "video_feedback_rating_check" CHECK (((rating >= 1) AND (rating <= 5)));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'years_year_number_check'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "years" ADD CONSTRAINT "years_year_number_check" CHECK (((year_number >= 1) AND (year_number <= 3)));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asset_hiding_asset_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "asset_hiding" ADD CONSTRAINT "asset_hiding_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES scholarly_assets(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asset_hiding_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "asset_hiding" ADD CONSTRAINT "asset_hiding_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asset_reviews_asset_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "asset_reviews" ADD CONSTRAINT "asset_reviews_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES scholarly_assets(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asset_reviews_reviewer_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "asset_reviews" ADD CONSTRAINT "asset_reviews_reviewer_id_fkey" FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'career_roadmaps_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "career_roadmaps" ADD CONSTRAINT "career_roadmaps_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_members_room_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_room_id_fkey" FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_members_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_room_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_room_id_fkey" FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_sender_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES users(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_rooms_admin_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES users(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cheatsheets_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "cheatsheets" ADD CONSTRAINT "cheatsheets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_career_career_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "course_career" ADD CONSTRAINT "course_career_career_id_fkey" FOREIGN KEY (career_id) REFERENCES career_paths(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_career_course_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "course_career" ADD CONSTRAINT "course_career_course_id_fkey" FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_skills_course_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "course_skills" ADD CONSTRAINT "course_skills_course_id_fkey" FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_skills_skill_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "course_skills" ADD CONSTRAINT "course_skills_skill_id_fkey" FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_semester_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "courses" ADD CONSTRAINT "courses_semester_id_fkey" FOREIGN KEY (semester_id) REFERENCES semesters(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_year_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "courses" ADD CONSTRAINT "courses_year_id_fkey" FOREIGN KEY (year_id) REFERENCES years(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'creator_projects_owner_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "creator_projects" ADD CONSTRAINT "creator_projects_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_goals_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "daily_goals" ADD CONSTRAINT "daily_goals_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forum_comments_parent_comment_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_parent_comment_id_fkey" FOREIGN KEY (parent_comment_id) REFERENCES forum_comments(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forum_comments_thread_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forum_comments_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forum_threads_topic_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_topic_id_fkey" FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forum_threads_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forum_upvotes_comment_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "forum_upvotes" ADD CONSTRAINT "forum_upvotes_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES forum_comments(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forum_upvotes_thread_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "forum_upvotes" ADD CONSTRAINT "forum_upvotes_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forum_upvotes_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "forum_upvotes" ADD CONSTRAINT "forum_upvotes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'goal_submissions_goal_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "goal_submissions" ADD CONSTRAINT "goal_submissions_goal_id_fkey" FOREIGN KEY (goal_id) REFERENCES daily_goals(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'goal_submissions_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "goal_submissions" ADD CONSTRAINT "goal_submissions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'interview_sessions_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'learning_path_courses_course_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "learning_path_courses" ADD CONSTRAINT "learning_path_courses_course_id_fkey" FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'learning_path_courses_path_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "learning_path_courses" ADD CONSTRAINT "learning_path_courses_path_id_fkey" FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'modules_course_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "modules" ADD CONSTRAINT "modules_course_id_fkey" FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'password_resets_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'peer_videos_course_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "peer_videos" ADD CONSTRAINT "peer_videos_course_id_fkey" FOREIGN KEY (course_id) REFERENCES courses(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'peer_videos_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "peer_videos" ADD CONSTRAINT "peer_videos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_requests_project_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "project_requests" ADD CONSTRAINT "project_requests_project_id_fkey" FOREIGN KEY (project_id) REFERENCES creator_projects(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_requests_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "project_requests" ADD CONSTRAINT "project_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_tasks_assignee_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_assignee_id_fkey" FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_tasks_created_by_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_tasks_project_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_fkey" FOREIGN KEY (project_id) REFERENCES creator_projects(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_weekly_reports_project_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "project_weekly_reports" ADD CONSTRAINT "project_weekly_reports_project_id_fkey" FOREIGN KEY (project_id) REFERENCES creator_projects(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_weekly_reports_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "project_weekly_reports" ADD CONSTRAINT "project_weekly_reports_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_course_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "projects" ADD CONSTRAINT "projects_course_id_fkey" FOREIGN KEY (course_id) REFERENCES courses(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'refresh_tokens_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'resources_course_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "resources" ADD CONSTRAINT "resources_course_id_fkey" FOREIGN KEY (course_id) REFERENCES courses(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'scholarly_assets_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "scholarly_assets" ADD CONSTRAINT "scholarly_assets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'squad_messages_project_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "squad_messages" ADD CONSTRAINT "squad_messages_project_id_fkey" FOREIGN KEY (project_id) REFERENCES creator_projects(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'squad_messages_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "squad_messages" ADD CONSTRAINT "squad_messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'synaptic_messages_room_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "synaptic_messages" ADD CONSTRAINT "synaptic_messages_room_id_fkey" FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'synaptic_messages_sender_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "synaptic_messages" ADD CONSTRAINT "synaptic_messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topic_lexicon_map_lexicon_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "topic_lexicon_map" ADD CONSTRAINT "topic_lexicon_map_lexicon_id_fkey" FOREIGN KEY (lexicon_id) REFERENCES lexicon_terms(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topic_lexicon_map_topic_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "topic_lexicon_map" ADD CONSTRAINT "topic_lexicon_map_topic_id_fkey" FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topic_resources_topic_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "topic_resources" ADD CONSTRAINT "topic_resources_topic_id_fkey" FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topic_resources_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "topic_resources" ADD CONSTRAINT "topic_resources_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topics_course_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "topics" ADD CONSTRAINT "topics_course_id_fkey" FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topics_module_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "topics" ADD CONSTRAINT "topics_module_id_fkey" FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_badges_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_contributions_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_contributions" ADD CONSTRAINT "user_contributions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_courses_course_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_course_id_fkey" FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_courses_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_projects_project_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_projects_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_skills_skill_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_fkey" FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_skills_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_stats_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_topic_notes_topic_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_topic_notes" ADD CONSTRAINT "user_topic_notes_topic_id_fkey" FOREIGN KEY (topic_id) REFERENCES topics(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_topic_notes_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_topic_notes" ADD CONSTRAINT "user_topic_notes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_topic_progress_topic_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_topic_id_fkey" FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_topic_progress_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'video_feedback_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "video_feedback" ADD CONSTRAINT "video_feedback_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'video_feedback_video_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "video_feedback" ADD CONSTRAINT "video_feedback_video_id_fkey" FOREIGN KEY (video_id) REFERENCES peer_videos(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'video_reactions_user_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "video_reactions" ADD CONSTRAINT "video_reactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'video_reactions_video_id_fkey'
  ) THEN
    NULL;
  ELSE
    ALTER TABLE "video_reactions" ADD CONSTRAINT "video_reactions_video_id_fkey" FOREIGN KEY (video_id) REFERENCES peer_videos(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    IF SQLSTATE IN ('42P16', '42710', '23505') THEN NULL; ELSE RAISE; END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_career_roadmaps_career_key ON public.career_roadmaps USING btree (user_id, career_key);
CREATE INDEX IF NOT EXISTS idx_chat_members_room ON public.chat_members USING btree (room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON public.chat_messages USING btree (room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_thread ON public.forum_comments USING btree (thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_search ON public.forum_threads USING gin (to_tsvector('english'::regconfig, ((title || ' '::text) || content)));
CREATE INDEX IF NOT EXISTS idx_forum_threads_topic ON public.forum_threads USING btree (topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_user ON public.forum_threads USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_peer_videos_course ON public.peer_videos USING btree (course_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_project_week ON public.project_weekly_reports USING btree (project_id, week_start);
