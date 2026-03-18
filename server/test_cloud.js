import pool from './src/config/db.js';

async function test() {
  const userId = 3;
  const skillsRes = await pool.query(`
    SELECT t.title as topic, c.name as course,
    COALESCE(utp.completed, false) as completed,
    COALESCE(utp.quiz_score, 0) as score
    FROM user_courses uc
    JOIN courses c ON uc.course_id = c.id
    JOIN topics t ON c.id = t.course_id
    LEFT JOIN user_topic_progress utp ON t.id = utp.topic_id AND utp.user_id = $1
    WHERE uc.user_id = $1
  `, [userId]);

  const generalCategories = ['Algorithms', 'Data Structures', 'System Design', 'Databases', 'Networking', 'Security', 'Web', 'Mobile', 'AI', 'Cloud'];
  let generalSkillsMap = generalCategories.map(skill => ({ skill, value: 0, total: 0 }));

  skillsRes.rows.forEach(row => {
    const textToSearch = (row.topic + ' ' + row.course).toLowerCase();
    generalSkillsMap.forEach(gs => {
      if (textToSearch.includes(gs.skill.toLowerCase())) {
        gs.total += 1;
        const topicProficency = (row.completed ? 50 : 0) + (row.score * 0.5);
        gs.value += topicProficency;
      }
    });
  });

  console.log('--- ALL MATCHES FOR CLOUD ---');
  console.log(skillsRes.rows.filter(r => (r.topic + ' ' + r.course).toLowerCase().includes('cloud')));

  let generalSkills = generalSkillsMap
    .filter(gs => gs.total > 0)
    .map(gs => ({
      skill: gs.skill,
      valueRaw: gs.value,
      total: gs.total,
      value: Math.round((gs.value / gs.total) * 100)
    }))
    .sort((a, b) => b.value - a.value);

  console.log('--- GENERAL SKILLS OUTPUT ---');
  console.log(generalSkills);
  process.exit(0);
}
test().catch(console.error);
