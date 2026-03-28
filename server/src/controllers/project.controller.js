import pool from '../config/db.js';

// Get all projects with owner names (paginated)
export const getAllProjects = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const offset = (page - 1) * limit;

    try {
        const [dataResult, countResult] = await Promise.all([
            pool.query(`
                SELECT p.*, u.name as owner_name
                FROM creator_projects p
                JOIN users u ON p.owner_id = u.id
                ORDER BY p.created_at DESC
                LIMIT $1 OFFSET $2
            `, [limit, offset]),
            pool.query('SELECT COUNT(*) FROM creator_projects')
        ]);

        const total = parseInt(countResult.rows[0].count);
        res.json({
            projects: dataResult.rows,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new project
export const createProject = async (req, res) => {
    const { title, description, skills_required, github_repo } = req.body;
    const owner_id = req.user.id;

    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }

    try {
        const result = await pool.query(`
            INSERT INTO creator_projects (title, description, owner_id, skills_required, github_repo)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [title, description, owner_id, skills_required || [], github_repo]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating project:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Submit a join request
export const requestToJoin = async (req, res) => {
    const { project_id, message, skills, motivation, contribution } = req.body;
    const user_id = req.user.id;

    try {
        // Check if project exists and user is not the owner
        const project = await pool.query('SELECT owner_id FROM creator_projects WHERE id = $1', [project_id]);
        if (project.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.rows[0].owner_id === user_id) {
            return res.status(400).json({ message: 'You cannot join your own project' });
        }

        const result = await pool.query(`
            INSERT INTO project_requests (project_id, user_id, message, skills, motivation, contribution)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [project_id, user_id, message, skills, motivation, contribution]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ message: 'Request already sent' });
        }
        console.error('Error joining project:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get requests for projects I own
export const getMyProjectRequests = async (req, res) => {
    const user_id = req.user.id;
    try {
        const result = await pool.query(`
            SELECT r.*, p.title as project_title, u.name as requester_name, u.email as requester_email
            FROM project_requests r
            JOIN creator_projects p ON r.project_id = p.id
            JOIN users u ON r.user_id = u.id
            WHERE p.owner_id = $1
            ORDER BY r.created_at DESC
        `, [user_id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching requests:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Handle a join request (Accept/Decline)
export const handleRequest = async (req, res) => {
    const { request_id } = req.params;
    const { status } = req.body; // 'accepted' or 'declined'
    const user_id = req.user.id;

    if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        // Verify ownership
        const ownershipCheck = await pool.query(`
            SELECT p.owner_id 
            FROM project_requests r
            JOIN creator_projects p ON r.project_id = p.id
            WHERE r.id = $1
        `, [request_id]);

        if (ownershipCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (ownershipCheck.rows[0].owner_id !== user_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(`
            UPDATE project_requests 
            SET status = $1 
            WHERE id = $2
            RETURNING *
        `, [status, request_id]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error handling request:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get my own projects
export const getMyProjects = async (req, res) => {
    const user_id = req.user.id;
    try {
        const result = await pool.query(`
            SELECT DISTINCT p.*, u.name as owner_name 
            FROM creator_projects p
            JOIN users u ON p.owner_id = u.id
            LEFT JOIN project_requests r ON p.id = r.project_id AND r.user_id = $1
            WHERE p.owner_id = $1 OR r.status = 'accepted'
            ORDER BY p.created_at DESC
        `, [user_id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching my projects/squads:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const updateProject = async (req, res) => {
    const { id } = req.params;
    const { title, description, skills_required, github_repo, status } = req.body;
    const user_id = req.user.id;

    try {
        // Ownership check
        const project = await pool.query('SELECT owner_id FROM creator_projects WHERE id = $1', [id]);
        if (project.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.rows[0].owner_id !== user_id) {
            return res.status(403).json({ message: 'Unauthorized: Only the creator can update the project' });
        }

        const result = await pool.query(`
            UPDATE creator_projects 
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                skills_required = COALESCE($3, skills_required),
                github_repo = COALESCE($4, github_repo),
                status = COALESCE($5, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *
        `, [title, description, skills_required, github_repo, status, id]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating project:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const getProjectMembers = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        // Verify ownership first
        const project = await pool.query('SELECT owner_id FROM creator_projects WHERE id = $1', [id]);
        if (project.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.rows[0].owner_id !== user_id) {
            return res.status(403).json({ message: 'Unauthorized: Only the creator can view the dashboard' });
        }

        const members = await pool.query(`
            SELECT u.id, u.name, u.email, r.skills, r.contribution, r.created_at as joined_at, r.status
            FROM project_requests r
            JOIN users u ON r.user_id = u.id
            WHERE r.project_id = $1 AND r.status = 'accepted'
            ORDER BY r.created_at ASC
        `, [id]);

        res.json(members.rows);
    } catch (err) {
        console.error('Error fetching project members:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const deleteProject = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const project = await pool.query('SELECT owner_id FROM creator_projects WHERE id = $1', [id]);
        if (project.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.rows[0].owner_id !== user_id) {
            return res.status(403).json({ message: 'Unauthorized: Only the creator can delete the project' });
        }

        await pool.query('DELETE FROM creator_projects WHERE id = $1', [id]);
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeMember = async (req, res) => {
    const { id, userId } = req.params;
    const owner_id = req.user.id;

    try {
        const project = await pool.query('SELECT owner_id FROM creator_projects WHERE id = $1', [id]);
        if (project.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.rows[0].owner_id !== owner_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await pool.query('DELETE FROM project_requests WHERE project_id = $1 AND user_id = $2', [id, userId]);
        res.json({ message: 'Member removed successfully' });
    } catch (err) {
        console.error('Error removing member:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getSquadMessages = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM squad_messages WHERE project_id = $1 ORDER BY created_at ASC LIMIT 100',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching squad messages:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const sendSquadMessage = async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    const user_id = req.user.id;
    const user_name = req.user.name || 'Squad Member';

    if (!text?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    try {
        const result = await pool.query(
            'INSERT INTO squad_messages (project_id, user_id, user_name, text) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, user_id, user_name, text.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error saving squad message:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/* ── Task Board ─────────────────────────────────────────────────────────── */

// Helper: verify user is project member or owner
const isProjectMember = async (projectId, userId) => {
    const [owner, member] = await Promise.all([
        pool.query('SELECT id FROM creator_projects WHERE id=$1 AND owner_id=$2', [projectId, userId]),
        pool.query("SELECT id FROM project_requests WHERE project_id=$1 AND user_id=$2 AND status='accepted'", [projectId, userId])
    ]);
    return owner.rows.length > 0 || member.rows.length > 0;
};

export const getTasks = async (req, res) => {
    const { id } = req.params;
    try {
        if (!await isProjectMember(id, req.user.id)) {
            return res.status(403).json({ message: 'Not a project member' });
        }
        const result = await pool.query(
            'SELECT * FROM project_tasks WHERE project_id=$1 ORDER BY created_at ASC',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createTask = async (req, res) => {
    const { id } = req.params;
    const { title, assignee_id, assignee_name } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Title is required' });

    try {
        if (!await isProjectMember(id, req.user.id)) {
            return res.status(403).json({ message: 'Not a project member' });
        }
        const result = await pool.query(
            `INSERT INTO project_tasks (project_id, title, status, assignee_id, assignee_name, created_by, created_by_name)
             VALUES ($1,$2,'todo',$3,$4,$5,$6) RETURNING *`,
            [id, title.trim(), assignee_id || null, assignee_name || null, req.user.id, req.user.name || 'Member']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateTask = async (req, res) => {
    const { id, taskId } = req.params;
    const { status, title, assignee_id, assignee_name } = req.body;
    const VALID_STATUSES = ['todo', 'in_progress', 'done'];

    try {
        if (!await isProjectMember(id, req.user.id)) {
            return res.status(403).json({ message: 'Not a project member' });
        }
        const task = await pool.query('SELECT * FROM project_tasks WHERE id=$1 AND project_id=$2', [taskId, id]);
        if (task.rows.length === 0) return res.status(404).json({ message: 'Task not found' });

        const updates = [];
        const values = [];
        let idx = 1;
        if (title !== undefined) { updates.push(`title=$${idx++}`); values.push(title.trim()); }
        if (status !== undefined && VALID_STATUSES.includes(status)) { updates.push(`status=$${idx++}`); values.push(status); }
        if (assignee_id !== undefined) { updates.push(`assignee_id=$${idx++}`); values.push(assignee_id); }
        if (assignee_name !== undefined) { updates.push(`assignee_name=$${idx++}`); values.push(assignee_name); }

        if (updates.length === 0) return res.status(400).json({ message: 'Nothing to update' });
        values.push(taskId);

        const result = await pool.query(
            `UPDATE project_tasks SET ${updates.join(',')} WHERE id=$${idx} RETURNING *`,
            values
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteTask = async (req, res) => {
    const { id, taskId } = req.params;
    try {
        if (!await isProjectMember(id, req.user.id)) {
            return res.status(403).json({ message: 'Not a project member' });
        }
        await pool.query('DELETE FROM project_tasks WHERE id=$1 AND project_id=$2', [taskId, id]);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/* ── Phase + Status + Member Role ───────────────────────────────────────── */

export const updateProjectPhase = async (req, res) => {
    const { id } = req.params;
    const { phase } = req.body;
    const VALID_PHASES = ['planning', 'building', 'testing', 'shipped'];
    if (!VALID_PHASES.includes(phase)) return res.status(400).json({ message: 'Invalid phase' });

    try {
        const project = await pool.query('SELECT owner_id FROM creator_projects WHERE id=$1', [id]);
        if (!project.rows.length) return res.status(404).json({ message: 'Not found' });
        if (project.rows[0].owner_id !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        const result = await pool.query('UPDATE creator_projects SET phase=$1 WHERE id=$2 RETURNING phase', [phase, id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating phase:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateProjectStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['open', 'closed'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    try {
        const project = await pool.query('SELECT owner_id FROM creator_projects WHERE id=$1', [id]);
        if (!project.rows.length) return res.status(404).json({ message: 'Not found' });
        if (project.rows[0].owner_id !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        const result = await pool.query('UPDATE creator_projects SET status=$1 WHERE id=$2 RETURNING status', [status, id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateMemberRole = async (req, res) => {
    const { id, userId } = req.params;
    const { role } = req.body;

    try {
        const project = await pool.query('SELECT owner_id FROM creator_projects WHERE id=$1', [id]);
        if (!project.rows.length) return res.status(404).json({ message: 'Not found' });
        if (project.rows[0].owner_id !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        await pool.query(
            "UPDATE project_requests SET role=$1 WHERE project_id=$2 AND user_id=$3 AND status='accepted'",
            [role, id, userId]
        );
        res.json({ message: 'Role updated' });
    } catch (err) {
        console.error('Error updating member role:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/* ── Weekly Reports ──────────────────────────────────────────────────────── */

const getWeekStart = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay() || 7; // Sunday=0 → treat as 7
    d.setDate(d.getDate() - (day - 1));
    return d.toISOString().slice(0, 10); // YYYY-MM-DD (Monday)
};

export const getReports = async (req, res) => {
    const { id } = req.params;
    if (!await isProjectMember(id, req.user.id)) {
        return res.status(403).json({ message: 'Not a project member' });
    }

    const weekStart = req.query.week
        ? getWeekStart(new Date(req.query.week))
        : getWeekStart();

    try {
        const [allMembersResult, reportsResult] = await Promise.all([
            pool.query(`
                SELECT u.id AS user_id, u.name AS user_name
                FROM creator_projects cp
                JOIN users u ON u.id = cp.owner_id
                WHERE cp.id = $1
                UNION
                SELECT u.id AS user_id, u.name AS user_name
                FROM project_requests pr
                JOIN users u ON u.id = pr.user_id
                WHERE pr.project_id = $1 AND pr.status = 'accepted'
            `, [id]),
            pool.query(
                'SELECT * FROM project_weekly_reports WHERE project_id=$1 AND week_start=$2',
                [id, weekStart]
            )
        ]);

        const reportsByUser = {};
        for (const r of reportsResult.rows) reportsByUser[r.user_id] = r;

        const roster = allMembersResult.rows.map(m => ({
            user_id:   m.user_id,
            user_name: m.user_name,
            week_start: weekStart,
            submitted:  !!reportsByUser[m.user_id],
            report:     reportsByUser[m.user_id] || null,
        }));

        res.json({ week_start: weekStart, roster });
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const submitReport = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    if (!await isProjectMember(id, userId)) {
        return res.status(403).json({ message: 'Not a project member' });
    }

    const { what_done, what_next, blockers } = req.body;
    if (!what_done?.trim() || !what_next?.trim()) {
        return res.status(400).json({ message: 'what_done and what_next are required' });
    }

    const weekStart = getWeekStart();

    try {
        const userResult = await pool.query('SELECT name FROM users WHERE id=$1', [userId]);
        if (!userResult.rows.length) return res.status(404).json({ message: 'User not found' });
        const userName = userResult.rows[0].name;

        const result = await pool.query(`
            INSERT INTO project_weekly_reports
                (project_id, user_id, user_name, week_start, what_done, what_next, blockers, submitted_at, updated_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
            ON CONFLICT ON CONSTRAINT uq_project_user_week
            DO UPDATE SET
                what_done  = EXCLUDED.what_done,
                what_next  = EXCLUDED.what_next,
                blockers   = EXCLUDED.blockers,
                updated_at = NOW()
            RETURNING *
        `, [id, userId, userName, weekStart,
            what_done.trim(), what_next.trim(), blockers?.trim() || null]);

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error submitting report:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
