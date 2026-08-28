/**
 * Drop unused legacy tables (strong delete candidates).
 * Preserves AI mentor chat_messages; only removes abandoned campus-lounge tables
 * and unused curriculum catalog tables (all empty or lounge stubs).
 */
export const up = (pgm) => {
  pgm.sql(`
    -- Detach topics from unused modules hierarchy (CASCADE would wipe topics)
    ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_module_id_fkey;
    ALTER TABLE topics DROP COLUMN IF EXISTS module_id;

    -- Detach AI chat_messages from abandoned lounge rooms (keep all message rows)
    ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_room_id_fkey;

    -- Children first, then parents
    DROP TABLE IF EXISTS topic_lexicon_map CASCADE;
    DROP TABLE IF EXISTS learning_path_courses CASCADE;
    DROP TABLE IF EXISTS course_skills CASCADE;
    DROP TABLE IF EXISTS user_skills CASCADE;
    DROP TABLE IF EXISTS user_projects CASCADE;
    DROP TABLE IF EXISTS synaptic_messages CASCADE;
    DROP TABLE IF EXISTS chat_members CASCADE;

    DROP TABLE IF EXISTS cheatsheets CASCADE;
    DROP TABLE IF EXISTS learning_paths CASCADE;
    DROP TABLE IF EXISTS lexicon_terms CASCADE;
    DROP TABLE IF EXISTS skills CASCADE;
    DROP TABLE IF EXISTS projects CASCADE;
    DROP TABLE IF EXISTS resources CASCADE;
    DROP TABLE IF EXISTS modules CASCADE;
    DROP TABLE IF EXISTS chat_rooms CASCADE;
  `);
};

export const down = () => {
  // Irreversible data/schema cleanup — restore from backup if needed.
};
